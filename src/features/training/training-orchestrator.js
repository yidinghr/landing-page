// training-orchestrator.js — routes user/system actions to state + engine calls
// Owns action handlers, phase transitions, and engine sequencing.

import { PHASES, BETTING_PHASES, DEALING_PHASES, ROLE_SWITCH_PHASES } from './phase-machine.js';
import {
  addLogEntry, addProcedureErrors, applyInsuranceConfig, applyRules, applyTablePrefs,
  clearInsuranceDraft, clearInsuranceDrafts, clearLog, clearNpcRequestQueue,
  confirmSettlementProcedure, incrementCatches, incrementRound, markChangeAcknowledged,
  markCommissionCollected, resetChipTracking, resetRound, resetSession,
  resetSettlementProcedure, setActiveSeatId, setAutoAfterInsurance, setBCards,
  setInsuranceDraft, setNpcBetsApplied, setPCards, setPayouts, setPhase, setResult,
  setRole, setSeats, setSelectedChip, setSettlement, setShoe, setWrongPayoutDrill,
  updateLatestLogProcedure
} from './training-state.js';

import { bankerDraws, handTotal, isNatural, playerDraws, resolveRound } from './engines/baccarat-engine.js';
import { cardValue, dealOne, initShoe } from './engines/shoe-engine.js';
import {
  clampInsuranceAmount, getEligibleInsuranceSeats, insuranceBaseBet,
  insuranceMaxBet, shouldOfferInsurance
} from './engines/insurance-engine.js';
import { clearBets, createSeats, creditSeat, debitSeat, getSeat, setBet, setInsuranceDecision, ZONES } from './engines/seat-engine.js';
import { settleRound } from './engines/settlement-engine.js';
import { seedWrongPayout } from './scenarios/wrong-payout.js';
import { applyShoePreset, SHOE_PRESETS } from './scenarios/shoe-presets.js';
import { npcAutoBet, npcResolveInsuranceForSeats } from './npc/npc-behavior.js';
import {
  DEFAULT_INSURANCE, DEFAULT_RULES, DEFAULT_TABLE_PREFS,
  saveInsuranceConfig, saveRules, saveTablePrefs
} from './config/config-manager.js';

function clampSeatId(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.floor(n)));
}

function clampCutPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.min(80, Math.max(20, Math.round(n)));
}

function emptyBets() {
  return ZONES.reduce(function (bets, zone) {
    bets[zone] = 0;
    return bets;
  }, {});
}

function emptyInsurance() {
  return { offered: false, accepted: false, amount: 0, outcome: 'na', payout: 0 };
}

function resetRoundSeats(seats) {
  return seats.map(function (seat) {
    return Object.assign({}, seat, { bets: emptyBets(), insurance: emptyInsurance() });
  });
}

function normalizeTablePrefs(prefs) {
  const merged = Object.assign({}, DEFAULT_TABLE_PREFS, prefs || {});
  return Object.assign({}, merged, {
    activeSeatId: clampSeatId(merged.activeSeatId),
    manualCutPct: clampCutPct(merged.manualCutPct),
    shoePreset: SHOE_PRESETS[merged.shoePreset] ? merged.shoePreset : DEFAULT_TABLE_PREFS.shoePreset,
    role: ['dealer', 'customer', 'insurance'].includes(merged.role) ? merged.role : DEFAULT_TABLE_PREFS.role
  });
}

export function createOrchestrator({
  getState,
  setState,
  onRender,
  onFeedback,
  onConfirm,
  onPrompt,
  onNewShoe
}) {
  const feedback = onFeedback || function () {};
  const confirmAction = onConfirm || function () { return true; };
  const promptValue = onPrompt || function () { return null; };

  function update(next) {
    setState(next);
    onRender();
  }

  function activeSeat(state) {
    return getSeat(state.seats, state.activeSeatId);
  }

  function createConfiguredShoe(state, options = {}) {
    let tablePrefs = normalizeTablePrefs(state.tablePrefs);
    let cutPct = clampCutPct(tablePrefs.manualCutPct);

    if (options.promptForCut && tablePrefs.manualCutEnabled && state.role === 'dealer') {
      const answer = promptValue('Place cut card at % of shoe (20-80).', String(cutPct));
      if (answer === null) return null;
      cutPct = clampCutPct(answer);
      tablePrefs = Object.assign({}, tablePrefs, { manualCutPct: cutPct });
      saveTablePrefs(tablePrefs);
    }

    const shoe = initShoe(tablePrefs.manualCutEnabled ? { cutAtRatio: cutPct / 100 } : {});
    return { shoe: applyShoePreset(shoe, tablePrefs.shoePreset), tablePrefs };
  }

  function ensureNpcBets(state) {
    if (state.npcBetsApplied) return state;
    const seats = npcAutoBet(state.seats, state.activeSeatId, state.shoe, {
      includeActiveSeat: state.role !== 'customer'
    });
    let next = setSeats(state, seats);
    return setNpcBetsApplied(next, true);
  }

  function insuranceOfferSeats(state) {
    return state.seats.filter(function (seat) {
      return Boolean(seat.insurance && seat.insurance.offered);
    });
  }

  function pendingInsuranceSeats(state) {
    return insuranceOfferSeats(state).filter(function (seat) {
      return seat.insurance && seat.insurance.outcome === 'pending';
    });
  }

  function isHumanInsuranceSeat(state, seatId) {
    if (state.insuranceConfig.staffControlled) return state.role === 'insurance';
    if (state.role === 'insurance') return true;
    if (state.role === 'customer') return Number(seatId) === Number(state.activeSeatId);
    return false;
  }

  function canResolveInsuranceSeat(state, seatId) {
    return state.phase === PHASES.INSURANCE && isHumanInsuranceSeat(state, seatId);
  }

  function humanPendingInsuranceSeats(state) {
    return pendingInsuranceSeats(state).filter(function (seat) {
      return canResolveInsuranceSeat(state, seat.id);
    });
  }

  function markInsuranceOffers(state, eligibleSeats) {
    return eligibleSeats.reduce(function (next, seat) {
      const baseBet = insuranceBaseBet(seat, next.insuranceConfig);
      return setSeats(next, setInsuranceDecision(next.seats, seat.id, {
        offered: true,
        accepted: false,
        amount: 0,
        outcome: 'pending',
        payout: 0,
        baseBet,
        maxAmount: insuranceMaxBet(baseBet, next.insuranceConfig)
      }));
    }, state);
  }

  function resolveNpcPendingInsurance(state) {
    const seatIds = pendingInsuranceSeats(state)
      .filter(function (seat) { return !isHumanInsuranceSeat(state, seat.id); })
      .map(function (seat) { return seat.id; });
    if (!seatIds.length) return state;

    const result = npcResolveInsuranceForSeats(
      state.seats,
      seatIds,
      state.insuranceConfig,
      state.tablePrefs.insuranceNpcMode
    );

    let next = setSeats(state, result.seats);
    result.decisions.forEach(function (decision) {
      next = decision.amount > 0
        ? setInsuranceDraft(next, decision.seatId, decision.amount)
        : clearInsuranceDraft(next, decision.seatId);
    });
    return next;
  }

  function routeDrawPhase(state) {
    const pTotal = handTotal(state.pCards);
    const bTotal = handTotal(state.bCards);
    if (isNatural(pTotal) || isNatural(bTotal)) return setPhase(state, PHASES.REVEAL);
    if (playerDraws(pTotal)) return setPhase(state, PHASES.DRAW_P3);
    if (bankerDraws(bTotal, false, null)) return setPhase(state, PHASES.DRAW_B3);
    return setPhase(state, PHASES.REVEAL);
  }

  function continueAfterInsurance(state) {
    let next = resolveNpcPendingInsurance(state);
    next = clearInsuranceDrafts(next);
    if (next.autoAfterInsurance) {
      next = setAutoAfterInsurance(next, false);
      return autoDrawToReveal(next);
    }
    return routeDrawPhase(next);
  }

  function maybeOfferInsurance(state) {
    const bankerTotal = handTotal(state.bCards);
    const eligibleSeats = getEligibleInsuranceSeats(state.seats, state.insuranceConfig);
    const totalEligibleBase = eligibleSeats.reduce(function (sum, seat) {
      return sum + insuranceBaseBet(seat, state.insuranceConfig);
    }, 0);

    if (!shouldOfferInsurance(bankerTotal, totalEligibleBase, state.insuranceConfig)) {
      return routeDrawPhase(state);
    }

    let next = clearInsuranceDrafts(state);
    next = markInsuranceOffers(next, eligibleSeats);
    next = setPhase(next, PHASES.INSURANCE);
    if (!humanPendingInsuranceSeats(next).length) {
      return continueAfterInsurance(next);
    }
    return next;
  }

  function routeAfterP3(state) {
    const p3 = state.pCards[2];
    const p3Value = p3 ? cardValue(p3.rank) : null;
    return setPhase(state, bankerDraws(handTotal(state.bCards), true, p3Value) ? PHASES.DRAW_B3 : PHASES.REVEAL);
  }

  function dealOneForPhase(state) {
    if (!state.shoe) return null;
    const dealt = dealOne(state.shoe);
    if (!dealt.card) return null;

    let next = setShoe(state, dealt.shoe);
    switch (state.phase) {
      case PHASES.DEAL_1:
        next = setPCards(next, [dealt.card]);
        return setPhase(next, PHASES.DEAL_2);
      case PHASES.DEAL_2:
        next = setBCards(next, [dealt.card]);
        return setPhase(next, PHASES.DEAL_3);
      case PHASES.DEAL_3:
        next = setPCards(next, [next.pCards[0], dealt.card]);
        return setPhase(next, PHASES.DEAL_4);
      case PHASES.DEAL_4:
        next = setBCards(next, [next.bCards[0], dealt.card]);
        return maybeOfferInsurance(next);
      case PHASES.DRAW_P3:
        next = setPCards(next, next.pCards.concat(dealt.card));
        return routeAfterP3(next);
      case PHASES.DRAW_B3:
        next = setBCards(next, next.bCards.concat(dealt.card));
        return setPhase(next, PHASES.REVEAL);
      default:
        return state;
    }
  }

  function drawOne(state, side) {
    const dealt = dealOne(state.shoe);
    if (!dealt.card) return { state, ok: false };
    let next = setShoe(state, dealt.shoe);
    next = side === 'player'
      ? setPCards(next, next.pCards.concat(dealt.card))
      : setBCards(next, next.bCards.concat(dealt.card));
    return { state: next, ok: true };
  }

  function dealOpeningFour(state) {
    let next = state;
    const dealt = [];
    for (let i = 0; i < 4; i += 1) {
      const one = dealOne(next.shoe);
      if (!one.card) return { state: next, ok: false };
      dealt.push(one.card);
      next = setShoe(next, one.shoe);
    }
    next = setPCards(next, [dealt[0], dealt[2]]);
    next = setBCards(next, [dealt[1], dealt[3]]);
    return { state: next, ok: true };
  }

  function resolveRevealState(state) {
    let next = incrementRound(state);
    const result = resolveRound(next.pCards, next.bCards);
    next = setResult(next, result);

    let settlement = settleRound(next.seats, result, next.rules, next.insuranceConfig);
    if (next.tablePrefs.wrongPayoutEnabled) settlement = seedWrongPayout(settlement);
    next = setSettlement(next, settlement);
    next = resetSettlementProcedure(next);

    settlement.seats.forEach(function (row) {
      if (row.creditAmount > 0) next = setSeats(next, creditSeat(next.seats, row.seatId, row.creditAmount));
      if (row.insurance) next = setSeats(next, setInsuranceDecision(next.seats, row.seatId, row.insurance));
    });

    const activeRow = settlement.seats.find(function (row) {
      return Number(row.seatId) === Number(next.activeSeatId);
    });
    let payouts = activeRow ? Object.assign({}, activeRow.payouts) : null;
    if (activeRow && activeRow.insurance && activeRow.insurance.accepted) {
      payouts = payouts || { net: 0 };
      payouts.insurance = activeRow.insurance.payout;
      payouts.insuranceBet = activeRow.insurance.amount;
    }
    next = setPayouts(next, payouts);

    const insuranceSeatIds = settlement.seats
      .filter(function (row) { return row.insurance && row.insurance.accepted; })
      .map(function (row) { return row.seatId; });
    const wrongPayoutRow = settlement.seats.find(function (row) {
      return row.wrongPayout && row.wrongPayout.seeded;
    });

    next = addLogEntry(next, {
      round: next.roundNum,
      winner: result.winner,
      pTotal: result.pTotal,
      bTotal: result.bTotal,
      natural: result.pNatural || result.bNatural,
      pPair: result.pPair,
      bPair: result.bPair,
      luckySix: result.luckySix,
      insurance: insuranceSeatIds.length > 0,
      insuranceSeats: insuranceSeatIds,
      wrongPayoutSeat: wrongPayoutRow ? wrongPayoutRow.seatId : null,
      procedureErrors: 0,
      procedureCatches: 0,
      net: activeRow ? activeRow.net : null
    });
    next = setWrongPayoutDrill(next, wrongPayoutRow || null);
    return setPhase(next, PHASES.SETTLEMENT);
  }

  function autoDrawToReveal(state) {
    let next = state;
    const pInit = handTotal(next.pCards);
    const bInit = handTotal(next.bCards);
    if (!isNatural(pInit) && !isNatural(bInit)) {
      if (playerDraws(pInit)) {
        const pDraw = drawOne(next, 'player');
        if (!pDraw.ok) return next;
        next = pDraw.state;
      }
      const pThird = next.pCards[2] ? cardValue(next.pCards[2].rank) : null;
      if (bankerDraws(handTotal(next.bCards), Boolean(next.pCards[2]), pThird)) {
        const bDraw = drawOne(next, 'banker');
        if (!bDraw.ok) return next;
        next = bDraw.state;
      }
    }
    return resolveRevealState(setPhase(next, PHASES.REVEAL));
  }

  function settlementProcedureErrors(state) {
    if (!state.settlement) return [];
    const proc = state.settlementProcedure;
    const errors = [];
    state.settlement.seats.forEach(function (row) {
      if (row.commission > 0 && !proc.collectedCommissions[row.seatId]) {
        errors.push({ seatId: row.seatId, type: 'commission' });
      }
      if (row.change && row.change.required && !proc.acknowledgedChange[row.seatId]) {
        errors.push({ seatId: row.seatId, type: 'change' });
      }
      if (row.wrongPayout && row.wrongPayout.seeded && !row.wrongPayout.caught) {
        errors.push({ seatId: row.seatId, type: 'wrong-payout' });
      }
    });
    return errors;
  }

  function resetAfterSettlement(state) {
    let next = resetRound(state);
    next = resetSettlementProcedure(next);
    next = resetChipTracking(next);
    next = clearNpcRequestQueue(next);
    next = setSeats(next, resetRoundSeats(next.seats));
    return setPhase(next, PHASES.IDLE);
  }

  function handleNewShoe(options = {}) {
    const state = getState();
    const shouldConfirm = options.confirm !== false;
    if (shouldConfirm && !confirmAction('Start a new shoe? Session log will be cleared.')) return;

    const configured = createConfiguredShoe(state, { promptForCut: options.promptForCut !== false });
    if (!configured) return;

    let next = applyTablePrefs(state, configured.tablePrefs);
    next = setActiveSeatId(next, configured.tablePrefs.activeSeatId);
    next = setRole(next, configured.tablePrefs.role || next.role);
    next = resetSession(next, configured.shoe, createSeats());
    update(next);
    if (options.notify !== false && onNewShoe) onNewShoe(next);
  }

  function handleCloseBets() {
    const state = getState();
    if (!BETTING_PHASES.has(state.phase)) return;
    update(setPhase(ensureNpcBets(state), PHASES.DEAL_1));
  }

  function handleCardDrop(targetZone) {
    void targetZone;
    const state = getState();
    if (!DEALING_PHASES.has(state.phase)) return;
    const next = dealOneForPhase(state);
    if (!next) {
      feedback('Shoe exhausted. Please start a new shoe.', 'error');
      return;
    }
    update(next);
  }

  function handleDeal() {
    let state = getState();
    if (BETTING_PHASES.has(state.phase)) {
      state = setPhase(ensureNpcBets(state), PHASES.DEAL_1);
    }
    if (!DEALING_PHASES.has(state.phase)) return;

    const next = dealOneForPhase(state);
    if (!next) {
      feedback('Shoe exhausted. Please start a new shoe.', 'error');
      return;
    }
    update(next);
  }

  function handleAutoDeal() {
    let state = getState();
    if (!BETTING_PHASES.has(state.phase)) return;
    state = resetSettlementProcedure(resetRound(state));
    state = setAutoAfterInsurance(state, true);
    state = ensureNpcBets(state);

    const opening = dealOpeningFour(state);
    if (!opening.ok) {
      update(setAutoAfterInsurance(opening.state, false));
      feedback('Shoe exhausted. Please start a new shoe.', 'error');
      return;
    }

    let next = maybeOfferInsurance(opening.state);
    if (next.phase !== PHASES.INSURANCE) {
      next = setAutoAfterInsurance(autoDrawToReveal(next), false);
    }
    update(next);
  }

  function handleInsuranceDecision(seatId = getState().activeSeatId, decision, amount) {
    let state = getState();
    const id = clampSeatId(seatId);
    if (!canResolveInsuranceSeat(state, id)) return;

    if (decision === 'selectPercent') {
      const seat = getSeat(state.seats, id);
      const raw = Math.floor(insuranceBaseBet(seat, state.insuranceConfig) * Number(amount || 0) / 100);
      update(setInsuranceDraft(state, id, clampInsuranceAmount(seat, raw, state.insuranceConfig)));
      return;
    }

    if (decision === 'selectMax') {
      const seat = getSeat(state.seats, id);
      const base = insuranceBaseBet(seat, state.insuranceConfig);
      update(setInsuranceDraft(state, id, clampInsuranceAmount(seat, insuranceMaxBet(base, state.insuranceConfig), state.insuranceConfig)));
      return;
    }

    if (decision === 'decline') {
      state = clearInsuranceDraft(state, id);
      state = setSeats(state, setInsuranceDecision(state.seats, id, {
        offered: true, accepted: false, amount: 0, outcome: 'declined', payout: 0
      }));
    } else {
      const seat = getSeat(state.seats, id);
      const draft = amount === undefined ? Number(state.insuranceDrafts[id] || 0) : Number(amount || 0);
      const insuredAmount = clampInsuranceAmount(seat, draft, state.insuranceConfig);
      if (insuredAmount > 0) state = setSeats(state, debitSeat(state.seats, id, insuredAmount));
      state = setSeats(state, setInsuranceDecision(state.seats, id, {
        offered: true,
        accepted: insuredAmount > 0,
        amount: insuredAmount,
        outcome: insuredAmount > 0 ? 'accepted' : 'declined',
        payout: 0
      }));
      state = clearInsuranceDraft(state, id);
    }

    update(humanPendingInsuranceSeats(state).length ? state : continueAfterInsurance(state));
  }

  function handleReveal() {
    const state = getState();
    if (state.phase !== PHASES.REVEAL) return;
    update(resolveRevealState(state));
  }

  function handleFlipCard(cardKey) {
    void cardKey;
  }

  function handleCollectCommission(seatId) {
    const state = getState();
    if (state.phase !== PHASES.SETTLEMENT || state.role !== 'dealer') return;
    update(markCommissionCollected(state, seatId));
  }

  function handleAcknowledgeChange(seatId) {
    const state = getState();
    if (state.phase !== PHASES.SETTLEMENT || state.role !== 'dealer') return;
    update(markChangeAcknowledged(state, seatId));
  }

  function handleCorrectWrongPayout(seatId) {
    const state = getState();
    if (state.phase !== PHASES.SETTLEMENT || state.role !== 'dealer' || !state.settlement) return;

    let caught = false;
    const settlement = Object.assign({}, state.settlement, {
      seats: state.settlement.seats.map(function (row) {
        if (Number(row.seatId) !== Number(seatId) || !row.wrongPayout || row.wrongPayout.caught) return row;
        caught = true;
        return Object.assign({}, row, {
          wrongPayout: Object.assign({}, row.wrongPayout, { caught: true })
        });
      })
    });
    if (!caught) return;

    let next = setSettlement(state, settlement);
    next = incrementCatches(next);
    next = updateLatestLogProcedure(next, 0);
    update(next);
  }

  function handleChipDrop(seatId, amount, direction) {
    void seatId; void amount; void direction;
  }

  function handleNextRound() {
    let state = getState();
    if (state.phase !== PHASES.SETTLEMENT && state.phase !== PHASES.ROUND_END) return;

    if (state.role === 'dealer' && state.settlement) {
      const errors = settlementProcedureErrors(state);
      if (errors.length) {
        state = addProcedureErrors(state, errors.length);
        state = updateLatestLogProcedure(state, errors.length);
      }
      state = confirmSettlementProcedure(state);
    }

    update(resetAfterSettlement(state));
  }

  function handlePlaceBet(zone) {
    let state = getState();
    if (state.role !== 'customer' || !BETTING_PHASES.has(state.phase) || ZONES.indexOf(zone) < 0) return;
    if (!state.selectedChip) {
      feedback('chip-required', 'warning');
      return;
    }
    if (activeSeat(state).balance < state.selectedChip) return;

    let seats = debitSeat(state.seats, state.activeSeatId, state.selectedChip);
    seats = setBet(seats, state.activeSeatId, zone, state.selectedChip);
    state = setSeats(state, seats);
    state = setPayouts(state, null);
    state = setSettlement(state, null);
    state = resetSettlementProcedure(state);
    update(ensureNpcBets(state));
  }

  function handleClearBets() {
    let state = getState();
    if (state.role !== 'customer' || !BETTING_PHASES.has(state.phase)) return;
    state = setSeats(state, clearBets(state.seats, state.activeSeatId));
    state = setPayouts(state, null);
    state = setSettlement(state, null);
    update(resetSettlementProcedure(state));
  }

  function handleSelectChip(value) {
    const state = getState();
    if (state.role !== 'customer' || !BETTING_PHASES.has(state.phase)) return;
    update(setSelectedChip(state, state.selectedChip === value ? null : value));
  }

  function handleSubmitBets() {
    const state = getState();
    if (state.phase === PHASES.SETTLEMENT) {
      handleNextRound();
      return;
    }
    if (state.role !== 'customer' || !BETTING_PHASES.has(state.phase)) return;
    handleAutoDeal();
  }

  function handleRoleSwitch(newRole) {
    let state = getState();
    if (!ROLE_SWITCH_PHASES.has(state.phase) || !['dealer', 'customer', 'insurance'].includes(newRole)) return;
    let tablePrefs = Object.assign({}, state.tablePrefs, { role: newRole });
    tablePrefs = normalizeTablePrefs(tablePrefs);
    saveTablePrefs(tablePrefs);
    state = applyTablePrefs(state, tablePrefs);
    state = setRole(state, newRole);
    update(state);
  }

  function handleApplySettings(payload, maybeInsurance, maybePrefs) {
    let state = getState();
    const rules = payload && payload.rules ? payload.rules : payload;
    const insurance = payload && payload.insuranceConfig ? payload.insuranceConfig : maybeInsurance;
    const prefs = payload && payload.tablePrefs ? payload.tablePrefs : maybePrefs;

    if (rules) {
      saveRules(rules);
      state = applyRules(state, rules);
    }
    if (insurance) {
      saveInsuranceConfig(insurance);
      state = applyInsuranceConfig(state, insurance);
    }
    if (prefs) {
      const tablePrefs = normalizeTablePrefs(prefs);
      saveTablePrefs(tablePrefs);
      state = applyTablePrefs(state, tablePrefs);
      state = setActiveSeatId(state, tablePrefs.activeSeatId);
      state = setRole(state, tablePrefs.role || state.role);
    }
    update(state);
  }

  function handleResetSettings() {
    handleApplySettings({
      rules: Object.assign({}, DEFAULT_RULES),
      insuranceConfig: Object.assign({}, DEFAULT_INSURANCE),
      tablePrefs: Object.assign({}, DEFAULT_TABLE_PREFS)
    });
  }

  function handleNpcRequestsGenerated(requests) {
    void requests;
  }

  return {
    newShoe: handleNewShoe,
    closeBets: handleCloseBets,
    cardDrop: handleCardDrop,
    deal: handleDeal,
    autoDeal: handleAutoDeal,
    insurance: handleInsuranceDecision,
    reveal: handleReveal,
    flipCard: handleFlipCard,
    collectCommission: handleCollectCommission,
    acknowledgeChange: handleAcknowledgeChange,
    correctWrongPayout: handleCorrectWrongPayout,
    chipDrop: handleChipDrop,
    nextRound: handleNextRound,
    placeBet: handlePlaceBet,
    clearBets: handleClearBets,
    selectChip: handleSelectChip,
    submitBets: handleSubmitBets,
    switchRole: handleRoleSwitch,
    applySettings: handleApplySettings,
    resetSettings: handleResetSettings,
    npcRequests: handleNpcRequestsGenerated
  };
}

import { handTotal, isNatural, playerDraws, bankerDraws, resolveRound } from './engines/baccarat-engine.js';
import { dealOne, initShoe, shoeRemaining, cardValue, SUIT_SYMBOL } from './engines/shoe-engine.js';
import { betTotal } from './engines/payout-engine.js';
import {
  clampInsuranceAmount,
  getEligibleInsuranceSeats,
  insuranceBaseBet,
  insuranceMaxBet,
  shouldOfferInsurance
} from './engines/insurance-engine.js';
import {
  DEFAULT_INSURANCE,
  DEFAULT_RULES,
  DEFAULT_TABLE_PREFS,
  INSURANCE_PRESETS,
  RULE_PRESETS,
  getInsuranceConfig,
  getRules,
  getTablePrefs,
  saveInsuranceConfig,
  saveRules,
  saveTablePrefs
} from './config/config-manager.js';
import { createDealerController } from './controllers/dealer-controller.js';
import { createCustomerController } from './controllers/customer-controller.js';
import { createInsuranceController } from './controllers/insurance-controller.js';
import {
  ZONES,
  clearBets,
  createSeats,
  creditSeat,
  debitSeat,
  getSeat,
  setBet,
  setInsuranceDecision
} from './engines/seat-engine.js';
import { settleRound } from './engines/settlement-engine.js';
import { npcAutoBet, npcResolveInsuranceForSeats } from './npc/npc-behavior.js';
import {
  renderBalance,
  renderBetZones,
  renderChipTray,
  renderDetail,
  renderHands,
  renderLog,
  renderPayoutSummary,
  renderResult,
  renderSeats,
  renderShoe,
  renderStats
} from './ui/table-renderer.js';
import { renderSettlementBoard } from './ui/settlement-renderer.js';
import { createSettingsPanel } from './ui/settings-panel.js';

const CHIPS = [
  { value: 1000000, label: '1M', cls: 'tr-chip--1m' },
  { value: 500000, label: '500K', cls: 'tr-chip--500k' },
  { value: 100000, label: '100K', cls: 'tr-chip--100k' },
  { value: 50000, label: '50K', cls: 'tr-chip--50k' },
  { value: 10000, label: '10K', cls: 'tr-chip--10k' },
  { value: 5000, label: '5K', cls: 'tr-chip--5k' },
  { value: 1000, label: '1K', cls: 'tr-chip--1k' },
  { value: 500, label: '500', cls: 'tr-chip--500' },
  { value: 100, label: '100', cls: 'tr-chip--100' },
  { value: 25, label: '25', cls: 'tr-chip--25' },
  { value: 5, label: '5', cls: 'tr-chip--5' }
];

const DEAL_LABELS = {
  idle: 'DEAL',
  betting: 'DEAL',
  'deal-1': 'Deal P1',
  'deal-2': 'Deal B1',
  'deal-3': 'Deal P2',
  'deal-4': 'Deal B2',
  'draw-p3': 'Deal P3',
  'draw-b3': 'Deal B3',
  reveal: 'Reveal Ready',
  settlement: 'SETTLED',
  'round-end': 'SETTLED'
};

const DEAL_PHASES = ['idle', 'betting', 'deal-1', 'deal-2', 'deal-3', 'deal-4', 'draw-p3', 'draw-b3'];

let shoe = null;
let pCards = [];
let bCards = [];
let result = null;
let roundNum = 0;
let log = [];
let phase = 'idle';

let rules = {};
let insuranceConfig = {};
let tablePrefs = {};
let seats = createSeats();
let activeSeatId = 1;
let selectedChip = null;
let payouts = null;
let settlement = null;
let role = 'dealer';
let insuranceDrafts = {};
let npcBetsApplied = false;
let autoAfterInsurance = false;
let burnTimer = 0;
let dealerController = null;
let customerController = null;
let insuranceController = null;
let settingsPanel = null;

const el = {
  shoeRem: document.getElementById('shoeRem'),
  shoeTotal: document.getElementById('shoeTotal'),
  shoeFill: document.getElementById('shoeFill'),
  shoeWarn: document.getElementById('shoeWarn'),
  burnNotice: document.getElementById('burnNotice'),
  btnSettings: document.getElementById('btnSettings'),
  settingsRoot: document.getElementById('settingsRoot'),
  pCards: document.getElementById('pCards'),
  bCards: document.getElementById('bCards'),
  pScore: document.getElementById('pScore'),
  bScore: document.getElementById('bScore'),
  resultBox: document.getElementById('resultBox'),
  roundDetail: document.getElementById('roundDetail'),
  sessionLog: document.getElementById('sessionLog'),
  btnCloseBets: document.getElementById('btnCloseBets'),
  btnDeal: document.getElementById('btnDeal'),
  btnAutoDeal: document.getElementById('btnAutoDeal'),
  btnReveal: document.getElementById('btnReveal'),
  btnNext: document.getElementById('btnNext'),
  btnShoe: document.getElementById('btnShoe'),
  balanceAmt: document.getElementById('balanceAmt'),
  totalBetAmt: document.getElementById('totalBetAmt'),
  payoutSummary: document.getElementById('payoutSummary'),
  chipTray: document.getElementById('chipTray'),
  betZones: document.getElementById('betZones'),
  btnSubmitBets: document.getElementById('btnSubmitBets'),
  seatsRow: document.getElementById('seatsRow'),
  settlementBoard: document.getElementById('settlementBoard'),
  btnClearBets: document.getElementById('btnClearBets'),
  rulesName: document.getElementById('rulesName'),
  statsPanel: document.getElementById('statsPanel'),
  insurancePanel: document.getElementById('insurancePanel'),
  insBankerScore: document.getElementById('insBankerScore'),
  insPlayerBet: document.getElementById('insPlayerBet'),
  insMaxBet: document.getElementById('insMaxBet'),
  insEligibleCount: document.getElementById('insEligibleCount'),
  insuranceSeatRows: document.getElementById('insuranceSeatRows'),
  insCurrentBet: document.getElementById('insCurrentBet'),
  btnInsDecline: document.getElementById('btnInsDecline'),
  btnIns25: document.getElementById('btnIns25'),
  btnIns50: document.getElementById('btnIns50'),
  btnInsConfirm: document.getElementById('btnInsConfirm'),
  btnInsuranceNpcRound: document.getElementById('btnInsuranceNpcRound')
};

function activeSeat() {
  return getSeat(seats, activeSeatId);
}

function activeBets() {
  return activeSeat().bets;
}

function activeBalance() {
  return activeSeat().balance;
}

function fmtMoney(value) {
  return Number(value || 0).toLocaleString();
}

function getInsuranceDraft(seatId) {
  return Number(insuranceDrafts[seatId] || 0);
}

function setInsuranceDraft(seatId, amount) {
  insuranceDrafts = {
    ...insuranceDrafts,
    [seatId]: Number(amount || 0)
  };
}

function clearInsuranceDraft(seatId) {
  const next = { ...insuranceDrafts };
  delete next[seatId];
  insuranceDrafts = next;
}

function resetInsuranceDrafts() {
  insuranceDrafts = {};
}

function isIdlePhase() {
  return phase === 'idle' || phase === 'betting';
}

function canSwitchRole() {
  return isIdlePhase();
}

function clampSeatId(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.floor(n)));
}

function emptyBets() {
  return ZONES.reduce(function (bets, zone) {
    bets[zone] = 0;
    return bets;
  }, {});
}

function emptyInsurance() {
  return {
    offered: false,
    accepted: false,
    amount: 0,
    outcome: 'na',
    payout: 0
  };
}

function resetRoundSeats(nextSeats) {
  return nextSeats.map(function (seat) {
    return Object.assign({}, seat, {
      bets: emptyBets(),
      insurance: emptyInsurance()
    });
  });
}

function formatBurnNotice() {
  if (!shoe || !shoe.burnCard) return '';
  return 'Burn card: ' + shoe.burnCard.rank + SUIT_SYMBOL[shoe.burnCard.suit] + ' - Burned ' + shoe.burnCount + ' cards';
}

function showBurnNotice() {
  if (!el.burnNotice) return;
  clearTimeout(burnTimer);
  el.burnNotice.textContent = formatBurnNotice();
  el.burnNotice.hidden = false;
  burnTimer = setTimeout(function () {
    el.burnNotice.hidden = true;
  }, 3000);
}

function renderRole() {
  document.querySelectorAll('.tr-role-btn').forEach(function (btn) {
    btn.classList.toggle('is-active', btn.getAttribute('data-role') === role);
    btn.disabled = !canSwitchRole() && btn.getAttribute('data-role') !== role;
  });
  document.body.setAttribute('data-role', role);
  document.body.setAttribute('data-phase', phase);
  document.body.setAttribute('data-auto-deal', tablePrefs.autoDealEnabled ? 'enabled' : 'disabled');

  const roleSelector = document.querySelector('.tr-role-selector');
  if (roleSelector) {
    roleSelector.classList.toggle('is-locked', !canSwitchRole());
  }
}

function insuranceOfferSeats() {
  return seats.filter(function (seat) {
    return Boolean(seat.insurance && seat.insurance.offered);
  });
}

function pendingInsuranceSeats() {
  return insuranceOfferSeats().filter(function (seat) {
    return seat.insurance && seat.insurance.outcome === 'pending';
  });
}

function isHumanInsuranceSeat(seatId) {
  if (insuranceConfig.staffControlled) {
    return role === 'insurance';
  }
  if (role === 'insurance') return true;
  if (role === 'customer') {
    return Number(seatId) === Number(activeSeatId);
  }
  return false;
}

function canResolveInsuranceSeat(seatId) {
  return phase === 'insurance' && isHumanInsuranceSeat(seatId);
}

function hasPendingInsurance() {
  return pendingInsuranceSeats().length > 0;
}

function renderInsurancePanel() {
  if (!el.insurancePanel) return;
  const bTotal = handTotal(bCards);
  const rowSeats = insuranceOfferSeats();
  const summarySeats = rowSeats.length ? rowSeats : getEligibleInsuranceSeats(seats, insuranceConfig);
  const totalBase = summarySeats.reduce(function (sum, seat) {
    return sum + insuranceBaseBet(seat, insuranceConfig);
  }, 0);
  const totalMax = summarySeats.reduce(function (sum, seat) {
    return sum + insuranceMaxBet(insuranceBaseBet(seat, insuranceConfig), insuranceConfig);
  }, 0);
  const pendingSeats = pendingInsuranceSeats();
  const acceptedSeats = rowSeats.filter(function (seat) {
    return seat.insurance && seat.insurance.accepted;
  });
  const activeBase = insuranceBaseBet(activeSeat(), insuranceConfig);
  const activeMax = insuranceMaxBet(activeBase, insuranceConfig);
  const activeDraft = getInsuranceDraft(activeSeatId);
  const canResolve = insuranceController ? insuranceController.canResolve() : phase === 'insurance';

  if (el.insBankerScore) el.insBankerScore.textContent = bTotal;
  if (el.insPlayerBet) el.insPlayerBet.textContent = totalBase > 0 ? fmtMoney(totalBase) : '-';
  if (el.insMaxBet) el.insMaxBet.textContent = totalMax > 0 ? fmtMoney(totalMax) : '-';
  if (el.insEligibleCount) el.insEligibleCount.textContent = String(summarySeats.length);
  if (el.insCurrentBet) {
    el.insCurrentBet.innerHTML = 'Pending: <strong>' + pendingSeats.length + '</strong> · Accepted: <strong>' + acceptedSeats.length + '</strong>';
  }

  const pct25 = clampInsuranceAmount(activeSeat(), Math.floor(activeBase * 0.25), insuranceConfig);
  const pct50 = clampInsuranceAmount(activeSeat(), Math.floor(activeBase * 0.5), insuranceConfig);

  if (el.btnIns25) {
    el.btnIns25.textContent = '25% (' + fmtMoney(pct25) + ')';
    el.btnIns25.classList.toggle('is-selected', activeDraft === pct25 && pct25 > 0);
    el.btnIns25.disabled = !canResolve || !canResolveInsuranceSeat(activeSeatId) || pct25 === 0;
  }
  if (el.btnIns50) {
    el.btnIns50.textContent = '50% (' + fmtMoney(pct50) + ')';
    el.btnIns50.classList.toggle('is-selected', activeDraft === pct50 && pct50 > 0);
    el.btnIns50.disabled = !canResolve || !canResolveInsuranceSeat(activeSeatId) || pct50 === 0;
  }
  if (el.btnInsDecline) el.btnInsDecline.disabled = !canResolve || !canResolveInsuranceSeat(activeSeatId);
  if (el.btnInsConfirm) el.btnInsConfirm.disabled = !canResolve || !canResolveInsuranceSeat(activeSeatId);
  if (el.btnInsuranceNpcRound) {
    el.btnInsuranceNpcRound.textContent = phase === 'settlement' ? 'Next Round' : 'Start NPC Round';
    el.btnInsuranceNpcRound.hidden = role !== 'insurance' || phase === 'insurance' || (!isIdlePhase() && phase !== 'settlement');
    el.btnInsuranceNpcRound.disabled = role !== 'insurance' || (!isIdlePhase() && phase !== 'settlement');
  }

  el.insurancePanel.classList.toggle('is-multi', rowSeats.length > 0);
  if (el.insuranceSeatRows) {
    if (!rowSeats.length) {
      el.insuranceSeatRows.innerHTML = '<p class="tr-ins-empty">No active insurance offer.</p>';
      return;
    }

    el.insuranceSeatRows.innerHTML = rowSeats.map(function (seat) {
      const decision = seat.insurance || {};
      const baseBet = Number(decision.baseBet || insuranceBaseBet(seat, insuranceConfig));
      const maxBet = Number(decision.maxAmount || insuranceMaxBet(baseBet, insuranceConfig));
      const draft = getInsuranceDraft(seat.id);
      const pending = decision.outcome === 'pending';
      const rowCanResolve = pending && canResolveInsuranceSeat(seat.id);
      const pct25Amount = clampInsuranceAmount(seat, Math.floor(baseBet * 0.25), insuranceConfig);
      const pct50Amount = clampInsuranceAmount(seat, Math.floor(baseBet * 0.5), insuranceConfig);
      const selected25 = draft === pct25Amount && pct25Amount > 0 ? ' is-selected' : '';
      const selected50 = draft === pct50Amount && pct50Amount > 0 ? ' is-selected' : '';
      const selectedMax = draft === maxBet && maxBet > 0 ? ' is-selected' : '';
      const disabled = rowCanResolve ? '' : ' disabled';
      const statusClass = pending
        ? 'tr-ins-seat-status--pending'
        : decision.accepted ? 'tr-ins-seat-status--accepted' : 'tr-ins-seat-status--declined';
      const statusText = pending
        ? 'Pending'
        : decision.accepted ? 'Accepted ' + fmtMoney(decision.amount) : 'Declined';

      return [
        '<div class="tr-ins-seat-row" data-seat-id="' + seat.id + '">',
        '<div class="tr-ins-seat-main">',
        '<strong>Seat ' + seat.id + '</strong>',
        '<span class="tr-ins-seat-status ' + statusClass + '">' + statusText + '</span>',
        '</div>',
        '<div class="tr-ins-seat-meta">',
        '<span>Base <strong>' + fmtMoney(baseBet) + '</strong></span>',
        '<span>Max <strong>' + fmtMoney(maxBet) + '</strong></span>',
        '<span>Draft <strong>' + fmtMoney(draft) + '</strong></span>',
        '</div>',
        '<div class="tr-ins-seat-actions">',
        '<button type="button" class="tr-btn tr-btn--ghost tr-btn--xs" data-ins-action="decline" data-seat-id="' + seat.id + '"' + disabled + '>Decline</button>',
        '<button type="button" class="tr-ins-opt-btn' + selected25 + '" data-ins-action="pct" data-ins-pct="25" data-seat-id="' + seat.id + '"' + (rowCanResolve && pct25Amount > 0 ? '' : ' disabled') + '>25%</button>',
        '<button type="button" class="tr-ins-opt-btn' + selected50 + '" data-ins-action="pct" data-ins-pct="50" data-seat-id="' + seat.id + '"' + (rowCanResolve && pct50Amount > 0 ? '' : ' disabled') + '>50%</button>',
        '<button type="button" class="tr-ins-opt-btn' + selectedMax + '" data-ins-action="max" data-seat-id="' + seat.id + '"' + (rowCanResolve && maxBet > 0 ? '' : ' disabled') + '>Max</button>',
        '<button type="button" class="tr-btn tr-btn--ins-confirm tr-btn--xs" data-ins-action="confirm" data-seat-id="' + seat.id + '"' + disabled + '>Confirm</button>',
        '</div>',
        '</div>'
      ].join('');
    }).join('');
  }
}

function renderControls() {
  const rem = shoe ? shoeRemaining(shoe) : 0;
  const dealAllowed = DEAL_PHASES.indexOf(phase) >= 0 && rem > 0 && phase !== 'insurance';
  const idle = phase === 'idle' || phase === 'betting';
  const isDealer = role === 'dealer';
  const isCustomer = role === 'customer';
  const isInsurance = role === 'insurance';

  if (el.btnDeal) {
    el.btnDeal.textContent = rem < 6 && idle ? 'Shoe Empty' : (DEAL_LABELS[phase] || 'DEAL');
    el.btnDeal.disabled = !isDealer || !dealAllowed || (idle && rem < 6);
  }
  if (el.btnCloseBets) el.btnCloseBets.disabled = !isDealer || !idle;
  if (el.btnAutoDeal) {
    el.btnAutoDeal.hidden = !tablePrefs.autoDealEnabled;
    el.btnAutoDeal.disabled = !isDealer || !idle || rem < 6;
  }
  if (el.btnReveal) el.btnReveal.disabled = !isDealer || phase !== 'reveal';
  if (el.btnNext) el.btnNext.disabled = !isDealer || (phase !== 'settlement' && phase !== 'round-end');
  if (el.btnClearBets) el.btnClearBets.disabled = !isCustomer || !idle;
  if (el.btnSubmitBets) {
    el.btnSubmitBets.textContent = phase === 'settlement' ? 'Next Round' : 'Submit Bets';
    el.btnSubmitBets.disabled = !isCustomer || (!idle && phase !== 'settlement');
  }
  if (el.betZones) el.betZones.classList.toggle('zones-locked', !idle);
  if (el.insurancePanel) el.insurancePanel.hidden = !isInsurance && phase !== 'insurance';
}

function setPhase(nextPhase) {
  phase = nextPhase;
  renderControls();
}

function renderAll() {
  const seat = activeSeat();
  renderShoe(el, shoe);
  renderHands(el, pCards, bCards);
  renderResult(el.resultBox, result);
  renderDetail(el.roundDetail, {
    result: result,
    pCards: pCards,
    bCards: bCards,
    roundNum: roundNum,
    payouts: payouts
  });
  renderLog(el.sessionLog, log);
  renderBalance(el.balanceAmt, el.rulesName, seat.balance, rules);
  renderChipTray(el.chipTray, CHIPS, selectedChip, seat.balance);
  renderBetZones(el.betZones, seat.bets, payouts, el.totalBetAmt);
  renderSeats(el.seatsRow, seats, activeSeatId, settlement);
  renderPayoutSummary(el.payoutSummary, payouts);
  renderStats(el.statsPanel, shoe, log);
  renderSettlementBoard(el.settlementBoard, settlement);
  renderInsurancePanel();
  renderRole();
  renderControls();
}

function getSettingsState() {
  return {
    rules: rules,
    insuranceConfig: insuranceConfig,
    tablePrefs: tablePrefs
  };
}

function applySettings(next) {
  rules = next.rules;
  insuranceConfig = next.insuranceConfig;
  tablePrefs = {
    ...DEFAULT_TABLE_PREFS,
    ...next.tablePrefs,
    activeSeatId: clampSeatId(next.tablePrefs.activeSeatId)
  };
  activeSeatId = tablePrefs.activeSeatId;
  role = tablePrefs.role || role;
  saveRules(rules);
  saveInsuranceConfig(insuranceConfig);
  saveTablePrefs(tablePrefs);
  renderAll();
}

function resetSettings() {
  rules = { ...DEFAULT_RULES };
  insuranceConfig = { ...DEFAULT_INSURANCE };
  tablePrefs = { ...DEFAULT_TABLE_PREFS };
  activeSeatId = tablePrefs.activeSeatId;
  role = tablePrefs.role;
  saveRules(rules);
  saveInsuranceConfig(insuranceConfig);
  saveTablePrefs(tablePrefs);
  renderAll();
}

function initRoleControllers() {
  dealerController = createDealerController({
    getRole: function () { return role; },
    getPhase: function () { return phase; },
    actions: {
      closeBets: closeBets,
      deal: dealCurrentPhase,
      autoDeal: doAutoDeal,
      reveal: revealRound,
      nextRound: doNext,
      newShoe: doNewShoe
    }
  });

  customerController = createCustomerController({
    getRole: function () { return role; },
    getPhase: function () { return phase; },
    actions: {
      selectChip: selectChipValue,
      placeBet: placeActiveSeatBet,
      clearBets: clearActiveSeatBets,
      submitBets: submitCustomerBets
    }
  });

  insuranceController = createInsuranceController({
    getRole: function () { return role; },
    getPhase: function () { return phase; },
    canResolveInsurance: canHumanResolveInsurance,
    actions: {
      decline: declineInsurance,
      selectPercent: selectInsurancePercent,
      selectMax: selectInsuranceMax,
      confirm: confirmInsurance
    }
  });
}

function ensureNpcBets() {
  if (npcBetsApplied) return;
  seats = npcAutoBet(seats, activeSeatId, shoe, {
    includeActiveSeat: role !== 'customer'
  });
  npcBetsApplied = true;
}

function onRoleClick(e) {
  const btn = e.target.closest('.tr-role-btn');
  if (!btn) return;
  const nextRole = btn.getAttribute('data-role');
  if (!nextRole) return;
  if (!canSwitchRole() && nextRole !== role) return;
  role = nextRole;
  tablePrefs = { ...tablePrefs, role: role };
  saveTablePrefs(tablePrefs);
  renderAll();
}

function selectChipValue(val) {
  selectedChip = selectedChip === val ? null : val;
  renderChipTray(el.chipTray, CHIPS, selectedChip, activeBalance());
}

function placeActiveSeatBet(zone) {
  if (!selectedChip) {
    el.chipTray.classList.add('chip-tray-nudge');
    setTimeout(function () { el.chipTray.classList.remove('chip-tray-nudge'); }, 600);
    return;
  }
  if (activeBalance() < selectedChip) return;

  seats = debitSeat(seats, activeSeatId, selectedChip);
  seats = setBet(seats, activeSeatId, zone, selectedChip);
  payouts = null;
  settlement = null;
  ensureNpcBets();
  renderAll();
}

function clearActiveSeatBets() {
  seats = clearBets(seats, activeSeatId);
  payouts = null;
  settlement = null;
  renderAll();
}

function submitCustomerBets() {
  ensureNpcBets();
  runNpcDealerRound();
}

function onChipClick(e) {
  const btn = e.target.closest('[data-chip]');
  if (!btn || btn.disabled) return;
  const val = parseInt(btn.getAttribute('data-chip'), 10);
  customerController.selectChip(val);
}

function onZoneClick(e) {
  const zone = e.currentTarget.getAttribute('data-zone');
  if (!zone || ZONES.indexOf(zone) < 0) return;
  customerController.placeBet(zone);
}

function onClearBets() {
  customerController.clearBets();
}

function onSubmitBets() {
  if (phase === 'settlement') {
    doNext();
    return;
  }
  customerController.submitBets();
}

function closeBets() {
  if (phase !== 'idle' && phase !== 'betting') return;
  ensureNpcBets();
  setPhase('deal-1');
  renderAll();
}

function takeCard() {
  const dealt = dealOne(shoe);
  if (!dealt.card) {
    alert('Shoe exhausted. Please start a new shoe.');
    return null;
  }
  shoe = dealt.shoe;
  return dealt.card;
}

function routeDrawPhase() {
  const pInit = handTotal(pCards);
  const bInit = handTotal(bCards);
  const natural = isNatural(pInit) || isNatural(bInit);

  if (natural) {
    setPhase('reveal');
    return;
  }
  if (playerDraws(pInit)) {
    setPhase('draw-p3');
    return;
  }
  if (bankerDraws(bInit, false, null)) {
    setPhase('draw-b3');
    return;
  }
  setPhase('reveal');
}

function canHumanResolveInsurance() {
  return pendingInsuranceSeats().some(function (seat) {
    return canResolveInsuranceSeat(seat.id);
  });
}

function applyNpcInsuranceDecision(seatIds) {
  const result = npcResolveInsuranceForSeats(
    seats,
    seatIds,
    insuranceConfig,
    tablePrefs.insuranceNpcMode
  );
  seats = result.seats;
  result.decisions.forEach(function (decision) {
    if (decision.amount > 0) {
      setInsuranceDraft(decision.seatId, decision.amount);
    } else {
      clearInsuranceDraft(decision.seatId);
    }
  });
}

function markInsuranceOffers(eligibleSeats) {
  eligibleSeats.forEach(function (seat) {
    const baseBet = insuranceBaseBet(seat, insuranceConfig);
    seats = setInsuranceDecision(seats, seat.id, {
      offered: true,
      accepted: false,
      amount: 0,
      outcome: 'pending',
      payout: 0,
      baseBet: baseBet,
      maxAmount: insuranceMaxBet(baseBet, insuranceConfig)
    });
  });
}

function resolveNpcPendingInsurance() {
  const npcSeatIds = pendingInsuranceSeats()
    .filter(function (seat) {
      return !isHumanInsuranceSeat(seat.id);
    })
    .map(function (seat) {
      return seat.id;
    });

  applyNpcInsuranceDecision(npcSeatIds);
}

function maybeOfferInsurance() {
  const bInit = handTotal(bCards);
  const eligibleSeats = getEligibleInsuranceSeats(seats, insuranceConfig);
  const totalEligibleBase = eligibleSeats.reduce(function (sum, seat) {
    return sum + insuranceBaseBet(seat, insuranceConfig);
  }, 0);

  if (!shouldOfferInsurance(bInit, totalEligibleBase, insuranceConfig)) {
    routeDrawPhase();
    return false;
  }

  resetInsuranceDrafts();
  markInsuranceOffers(eligibleSeats);
  resolveNpcPendingInsurance();

  if (!hasPendingInsurance()) {
    routeDrawPhase();
    return false;
  }

  setPhase('insurance');
  return true;
}

function dealCurrentPhase() {
  if (phase === 'idle' || phase === 'betting') {
    closeBets();
  }

  if (phase === 'deal-1') {
    const card = takeCard();
    if (!card) return;
    pCards = [card];
    setPhase('deal-2');
  } else if (phase === 'deal-2') {
    const card = takeCard();
    if (!card) return;
    bCards = [card];
    setPhase('deal-3');
  } else if (phase === 'deal-3') {
    const card = takeCard();
    if (!card) return;
    pCards = [pCards[0], card];
    setPhase('deal-4');
  } else if (phase === 'deal-4') {
    const card = takeCard();
    if (!card) return;
    bCards = [bCards[0], card];
    maybeOfferInsurance();
  } else if (phase === 'draw-p3') {
    const card = takeCard();
    if (!card) return;
    pCards = pCards.concat(card);
    const pThird = cardValue(card.rank);
    if (bankerDraws(handTotal(bCards), true, pThird)) {
      setPhase('draw-b3');
    } else {
      setPhase('reveal');
    }
  } else if (phase === 'draw-b3') {
    const card = takeCard();
    if (!card) return;
    bCards = bCards.concat(card);
    setPhase('reveal');
  }

  renderAll();
}

function autoDrawToReveal() {
  const pInit = handTotal(pCards);
  const bInit = handTotal(bCards);
  const natural = isNatural(pInit) || isNatural(bInit);

  if (!natural) {
    if (playerDraws(pInit)) {
      const card = takeCard();
      if (card) pCards = pCards.concat(card);
    }

    const pThird = pCards[2] ? cardValue(pCards[2].rank) : null;
    if (bankerDraws(handTotal(bCards), Boolean(pCards[2]), pThird)) {
      const card = takeCard();
      if (card) bCards = bCards.concat(card);
    }
  }

  setPhase('reveal');
  revealRound();
}

function dealOpeningFour() {
  const dealt = [];
  for (let i = 0; i < 4; i++) {
    const card = takeCard();
    if (!card) return false;
    dealt.push(card);
  }

  pCards = [dealt[0], dealt[2]];
  bCards = [dealt[1], dealt[3]];
  return true;
}

function doAutoDeal() {
  if (phase !== 'idle' && phase !== 'betting') return;
  ensureNpcBets();
  pCards = [];
  bCards = [];
  result = null;
  payouts = null;
  settlement = null;
  resetInsuranceDrafts();
  autoAfterInsurance = true;

  if (!dealOpeningFour()) {
    autoAfterInsurance = false;
    renderAll();
    return;
  }

  if (maybeOfferInsurance()) {
    renderAll();
    return;
  }

  autoDrawToReveal();
}

function runNpcDealerRound() {
  if (!isIdlePhase()) return;
  doAutoDeal();
}

function continueAfterInsurance() {
  resetInsuranceDrafts();
  if (autoAfterInsurance) {
    autoAfterInsurance = false;
    autoDrawToReveal();
    return;
  }

  routeDrawPhase();
  renderAll();
}

function finishInsuranceDecision() {
  if (hasPendingInsurance()) {
    renderAll();
    return;
  }
  continueAfterInsurance();
}

function declineInsurance(seatId = activeSeatId) {
  clearInsuranceDraft(seatId);
  seats = setInsuranceDecision(seats, seatId, {
    offered: true,
    accepted: false,
    amount: 0,
    outcome: 'declined',
    payout: 0
  });
  finishInsuranceDecision();
}

function selectInsurancePercent(pct, seatId = activeSeatId) {
  const seat = getSeat(seats, seatId);
  const baseBet = insuranceBaseBet(seat, insuranceConfig);
  const raw = Math.floor(baseBet * pct / 100);
  setInsuranceDraft(seatId, clampInsuranceAmount(seat, raw, insuranceConfig));
  renderInsurancePanel();
}

function selectInsuranceMax(seatId = activeSeatId) {
  const seat = getSeat(seats, seatId);
  const baseBet = insuranceBaseBet(seat, insuranceConfig);
  setInsuranceDraft(seatId, clampInsuranceAmount(seat, insuranceMaxBet(baseBet, insuranceConfig), insuranceConfig));
  renderInsurancePanel();
}

function confirmInsurance(seatId = activeSeatId) {
  const seat = getSeat(seats, seatId);
  const amount = clampInsuranceAmount(seat, getInsuranceDraft(seatId), insuranceConfig);
  if (amount > 0) {
    seats = debitSeat(seats, seatId, amount);
  }
  seats = setInsuranceDecision(seats, seatId, {
    offered: true,
    accepted: amount > 0,
    amount: amount,
    outcome: amount > 0 ? 'accepted' : 'declined',
    payout: 0
  });
  clearInsuranceDraft(seatId);
  finishInsuranceDecision();
}

function onInsDecline() {
  insuranceController.decline();
}

function onInsActionClick(e) {
  const btn = e.target.closest('[data-ins-action], [data-ins-pct]');
  if (!btn || btn.disabled) return;
  const seatId = btn.getAttribute('data-seat-id')
    ? clampSeatId(btn.getAttribute('data-seat-id'))
    : activeSeatId;
  const action = btn.getAttribute('data-ins-action') || 'pct';

  if (action === 'decline') {
    insuranceController.decline(seatId);
    return;
  }
  if (action === 'confirm') {
    insuranceController.confirm(seatId);
    return;
  }
  if (action === 'max') {
    insuranceController.selectMax(seatId);
    return;
  }

  const pct = parseInt(btn.getAttribute('data-ins-pct'), 10);
  insuranceController.selectPercent(pct, seatId);
}

function onInsConfirm() {
  insuranceController.confirm();
}

function onInsuranceNpcRound() {
  if (phase === 'settlement') {
    doNext();
    return;
  }
  runNpcDealerRound();
}

function revealRound() {
  if (phase !== 'reveal' && phase !== 'settlement') return;
  if (phase === 'settlement') return;

  roundNum++;
  result = resolveRound(pCards, bCards);
  settlement = settleRound(seats, result, rules, insuranceConfig);

  settlement.seats.forEach(function (row) {
    if (row.creditAmount > 0) {
      seats = creditSeat(seats, row.seatId, row.creditAmount);
    }
    if (row.insurance) {
      seats = setInsuranceDecision(seats, row.seatId, row.insurance);
    }
  });

  const activeRow = settlement.seats.find(function (row) {
    return row.seatId === activeSeatId;
  });
  payouts = activeRow ? Object.assign({}, activeRow.payouts) : null;
  if (activeRow && activeRow.insurance && activeRow.insurance.accepted) {
    payouts = payouts || { net: 0 };
    payouts.insurance = activeRow.insurance.payout;
    payouts.insuranceBet = activeRow.insurance.amount;
  }
  const insuranceSeatIds = settlement.seats.filter(function (row) {
    return row.insurance && row.insurance.accepted;
  }).map(function (row) {
    return row.seatId;
  });

  log.unshift({
    round: roundNum,
    winner: result.winner,
    pTotal: result.pTotal,
    bTotal: result.bTotal,
    natural: result.pNatural || result.bNatural,
    pPair: result.pPair,
    bPair: result.bPair,
    luckySix: result.luckySix,
    insurance: insuranceSeatIds.length > 0,
    insuranceSeats: insuranceSeatIds,
    net: activeRow ? activeRow.net : null
  });
  if (log.length > 60) log.pop();

  setPhase('settlement');
  renderAll();
}

function doNext() {
  seats = resetRoundSeats(seats);
  pCards = [];
  bCards = [];
  result = null;
  payouts = null;
  settlement = null;
  resetInsuranceDrafts();
  npcBetsApplied = false;
  autoAfterInsurance = false;
  setPhase('idle');
  renderAll();
}

function doNewShoe() {
  if (!confirm('Start a new shoe? Session log will be cleared.')) return;
  shoe = initShoe();
  seats = createSeats();
  pCards = [];
  bCards = [];
  result = null;
  roundNum = 0;
  log = [];
  payouts = null;
  settlement = null;
  resetInsuranceDrafts();
  npcBetsApplied = false;
  autoAfterInsurance = false;
  setPhase('idle');
  renderAll();
  showBurnNotice();
}

// --- Init ---
export function init() {
  const authStore = window.YiDingAuthStore || null;
  if (!authStore || !authStore.getCurrentAccount()) {
    window.location.replace('/index.html');
    return;
  }

  rules = getRules();
  insuranceConfig = getInsuranceConfig();
  tablePrefs = getTablePrefs();
  activeSeatId = clampSeatId(tablePrefs.activeSeatId);
  role = tablePrefs.role || 'dealer';
  shoe = initShoe();
  seats = createSeats();
  initRoleControllers();
  settingsPanel = createSettingsPanel({
    host: el.settingsRoot,
    openButton: el.btnSettings,
    getState: getSettingsState,
    onSave: applySettings,
    onReset: resetSettings,
    rulePresets: RULE_PRESETS,
    insurancePresets: INSURANCE_PRESETS
  });

  renderChipTray(el.chipTray, CHIPS, selectedChip, activeBalance());
  setPhase('idle');
  renderAll();

  document.querySelectorAll('[data-zone]').forEach(function (zoneEl) {
    zoneEl.addEventListener('click', onZoneClick);
  });

  el.chipTray.addEventListener('click', onChipClick);
  el.btnDeal.addEventListener('click', function () { dealerController.deal(); });
  el.btnNext.addEventListener('click', function () { dealerController.nextRound(); });
  el.btnShoe.addEventListener('click', function () { dealerController.newShoe(); });
  if (el.btnCloseBets) el.btnCloseBets.addEventListener('click', function () { dealerController.closeBets(); });
  if (el.btnAutoDeal) el.btnAutoDeal.addEventListener('click', function () { dealerController.autoDeal(); });
  if (el.btnReveal) el.btnReveal.addEventListener('click', function () { dealerController.reveal(); });
  if (el.btnClearBets) el.btnClearBets.addEventListener('click', onClearBets);
  if (el.btnSubmitBets) el.btnSubmitBets.addEventListener('click', onSubmitBets);

  if (el.btnInsDecline) el.btnInsDecline.addEventListener('click', onInsDecline);
  if (el.btnInsConfirm) el.btnInsConfirm.addEventListener('click', onInsConfirm);
  if (el.btnInsuranceNpcRound) el.btnInsuranceNpcRound.addEventListener('click', onInsuranceNpcRound);
  if (el.insurancePanel) el.insurancePanel.addEventListener('click', onInsActionClick);

  const roleSelector = document.querySelector('.tr-role-selector');
  if (roleSelector) roleSelector.addEventListener('click', onRoleClick);
}

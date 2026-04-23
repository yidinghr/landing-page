import { handTotal } from './engines/baccarat-engine.js';
import { shoeRemaining, SUIT_SYMBOL } from './engines/shoe-engine.js';
import { clampInsuranceAmount, getEligibleInsuranceSeats, insuranceBaseBet, insuranceMaxBet } from './engines/insurance-engine.js';
import { getSeat } from './engines/seat-engine.js';
import { DEFAULT_TABLE_PREFS, INSURANCE_PRESETS, RULE_PRESETS, getInsuranceConfig, getRules, getTablePrefs } from './config/config-manager.js';
import { SHOE_PRESETS } from './scenarios/shoe-presets.js';
import { createState } from './training-state.js';
import { createOrchestrator } from './training-orchestrator.js';
import { PHASES } from './phase-machine.js';
import { renderBalance, renderBetZones, renderChipTray, renderDetail, renderHands, renderLog, renderPayoutSummary, renderResult, renderSeats, renderShoe, renderStats } from './ui/table-renderer.js';
import { renderSettlementBoard } from './ui/settlement-renderer.js';
import { renderAllRoads } from './ui/result-boards-renderer.js';
import { createSettingsPanel } from './ui/settings-panel.js';

const CHIPS = [[1000000, '1M', 'tr-chip--1m'], [500000, '500K', 'tr-chip--500k'], [100000, '100K', 'tr-chip--100k'], [50000, '50K', 'tr-chip--50k'], [10000, '10K', 'tr-chip--10k'], [5000, '5K', 'tr-chip--5k'], [1000, '1K', 'tr-chip--1k'], [500, '500', 'tr-chip--500'], [100, '100', 'tr-chip--100'], [25, '25', 'tr-chip--25'], [5, '5', 'tr-chip--5']].map(([value, label, cls]) => ({ value, label, cls }));
const DEAL_LABELS = { idle: 'DEAL', betting: 'DEAL', 'deal-1': 'Deal P1', 'deal-2': 'Deal B1', 'deal-3': 'Deal P2', 'deal-4': 'Deal B2', 'draw-p3': 'Deal P3', 'draw-b3': 'Deal B3', reveal: 'Reveal Ready', settlement: 'SETTLED', 'round-end': 'SETTLED' };
const DEAL_PHASES = new Set([PHASES.IDLE, PHASES.BETTING, PHASES.DEAL_1, PHASES.DEAL_2, PHASES.DEAL_3, PHASES.DEAL_4, PHASES.DRAW_P3, PHASES.DRAW_B3]);

let _state = createState(), settingsPanel = null, burnTimer = 0;
const getState = () => _state, setState = (next) => { _state = next; };

const byId = (id) => document.getElementById(id);
const el = [
  'shoeFill', 'shoeWarn', 'burnNotice', 'btnSettings', 'settingsRoot', 'pCards', 'bCards', 'pScore', 'bScore', 'resultBox', 'roundDetail',
  'btnCloseBets', 'btnDeal', 'btnAutoDeal', 'btnReveal', 'btnNext', 'btnShoe', 'balanceAmt', 'totalBetAmt', 'payoutSummary', 'btnSubmitBets',
  'settlementBoard', 'btnClearBets', 'rulesName', 'statsPanel', 'insurancePanel', 'insBankerScore', 'insPlayerBet', 'insMaxBet', 'insEligibleCount',
  'insuranceSeatRows', 'insCurrentBet', 'btnInsDecline', 'btnIns25', 'btnIns50', 'btnInsConfirm', 'btnInsuranceNpcRound'
].reduce((acc, id) => (acc[id] = byId(id), acc), {});
Object.assign(el, Object.fromEntries([
  ['chipTray', 'tr-chip-tray'], ['cardSource', 'tr-card-source'], ['feedbackPanel', 'tr-feedback-panel'], ['bankerArea', 'tr-banker-area'], ['playerArea', 'tr-player-area'], ['betMatrix', 'tr-bet-matrix'], ['controlsBar', 'tr-controls-bar'],
  ['overlayPanel', 'tr-overlay-panel'], ['liveProb', 'tr-live-prob'], ['cardCounter', 'tr-card-counter'], ['sessionLog', 'tr-session-log'], ['shoeCount', 'tr-shoe-count'], ['roadBead', 'tr-road-bead'], ['roadBig', 'tr-road-big'], ['roadEye', 'tr-road-eye'], ['roadSmall', 'tr-road-small']
].map(([key, id]) => [key, byId(id)])));

const orchestrator = createOrchestrator({
  getState, setState, onRender: renderAll, onFeedback: showFeedback,
  onConfirm: (msg) => window.confirm(msg),
  onPrompt: (msg, value) => window.prompt(msg, value),
  onNewShoe: showBurnNotice
});

const clampSeatId = (id) => {
  const n = Number(id);
  return Number.isFinite(n) ? Math.min(5, Math.max(1, Math.floor(n))) : 1;
};

const fmtMoney = (value) => Number(value || 0).toLocaleString();
const activeSeat = (state) => getSeat(state.seats, state.activeSeatId);
const getDraft = (state, seatId) => Number(state.insuranceDrafts[seatId] || 0);
const isIdlePhase = (phase) => phase === PHASES.IDLE || phase === PHASES.BETTING;

function canResolveInsuranceSeat(state, seatId) {
  if (state.phase !== PHASES.INSURANCE) return false;
  if (state.insuranceConfig.staffControlled) return state.role === 'insurance';
  if (state.role === 'insurance') return true;
  return state.role === 'customer' && Number(seatId) === Number(state.activeSeatId);
}

function formatBurnNotice(state) {
  const shoe = state.shoe;
  if (!shoe || !shoe.burnCard) return '';
  const parts = ['Burn card: ' + shoe.burnCard.rank + SUIT_SYMBOL[shoe.burnCard.suit], 'Burned ' + shoe.burnCount + ' cards'];
  if (state.tablePrefs.manualCutEnabled && shoe.cutAtRatio) parts.push('Cut ' + Math.round(shoe.cutAtRatio * 100) + '%');
  if (shoe.presetId && shoe.presetId !== 'random') parts.push('Preset ' + ((SHOE_PRESETS[shoe.presetId] || {}).name || shoe.presetId));
  return parts.join(' | ');
}

function showBurnNotice(state = getState()) {
  if (!el.burnNotice) return;
  clearTimeout(burnTimer);
  el.burnNotice.textContent = formatBurnNotice(state);
  el.burnNotice.hidden = false;
  burnTimer = setTimeout(function () { el.burnNotice.hidden = true; }, 3000);
}

function showFeedback(msg, severity) {
  if (msg === 'chip-required' && el.chipTray) {
    el.chipTray.classList.add('chip-tray-nudge');
    setTimeout(function () { el.chipTray.classList.remove('chip-tray-nudge'); }, 600);
    return;
  }
  if (severity === 'error') window.alert(msg);
}

function renderRole(state) {
  document.querySelectorAll('.tr-role-btn').forEach(function (btn) {
    const role = btn.getAttribute('data-role');
    btn.classList.toggle('is-active', role === state.role);
    btn.disabled = !isIdlePhase(state.phase) && role !== state.role;
  });
  document.body.setAttribute('data-role', state.role);
  document.body.setAttribute('data-phase', state.phase);
  document.body.setAttribute('data-auto-deal', state.tablePrefs.autoDealEnabled ? 'enabled' : 'disabled');
  document.body.setAttribute('data-squeeze', state.tablePrefs.squeezeEnabled ? 'enabled' : 'disabled');
  const roleSelector = document.querySelector('.tr-role-selector');
  if (roleSelector) roleSelector.classList.toggle('is-locked', !isIdlePhase(state.phase));
}

function renderControls(state) {
  const rem = state.shoe ? shoeRemaining(state.shoe) : 0;
  const idle = isIdlePhase(state.phase);
  const isDealer = state.role === 'dealer';
  const isCustomer = state.role === 'customer';
  const isInsurance = state.role === 'insurance';
  const dealAllowed = DEAL_PHASES.has(state.phase) && rem > 0 && state.phase !== PHASES.INSURANCE;
  if (el.btnDeal) {
    el.btnDeal.textContent = rem < 6 && idle ? 'Shoe Empty' : (DEAL_LABELS[state.phase] || 'DEAL');
    el.btnDeal.disabled = !isDealer || !dealAllowed || (idle && rem < 6);
  }
  if (el.btnCloseBets) el.btnCloseBets.disabled = !isDealer || !idle;
  if (el.btnAutoDeal) {
    el.btnAutoDeal.hidden = !state.tablePrefs.autoDealEnabled;
    el.btnAutoDeal.disabled = !isDealer || !idle || rem < 6;
  }
  if (el.btnReveal) el.btnReveal.disabled = !isDealer || state.phase !== PHASES.REVEAL;
  if (el.btnNext) {
    el.btnNext.textContent = state.phase === PHASES.SETTLEMENT ? 'Confirm Round' : 'Next Round';
    el.btnNext.disabled = !isDealer || (state.phase !== PHASES.SETTLEMENT && state.phase !== PHASES.ROUND_END);
  }
  if (el.btnClearBets) el.btnClearBets.disabled = !isCustomer || !idle;
  if (el.btnSubmitBets) {
    el.btnSubmitBets.textContent = state.phase === PHASES.SETTLEMENT ? 'Next Round' : 'Submit Bets';
    el.btnSubmitBets.disabled = !isCustomer || (!idle && state.phase !== PHASES.SETTLEMENT);
  }
  if (el.betMatrix) el.betMatrix.classList.toggle('zones-locked', !idle);
  if (el.insurancePanel) el.insurancePanel.hidden = !isInsurance && state.phase !== PHASES.INSURANCE;
}

function renderInsurancePanel(state) {
  if (!el.insurancePanel) return;
  const rowSeats = state.seats.filter((seat) => seat.insurance && seat.insurance.offered);
  const summarySeats = rowSeats.length ? rowSeats : getEligibleInsuranceSeats(state.seats, state.insuranceConfig);
  const totalBase = summarySeats.reduce((sum, seat) => sum + insuranceBaseBet(seat, state.insuranceConfig), 0);
  const totalMax = summarySeats.reduce((sum, seat) => sum + insuranceMaxBet(insuranceBaseBet(seat, state.insuranceConfig), state.insuranceConfig), 0);
  const pending = rowSeats.filter((seat) => seat.insurance && seat.insurance.outcome === 'pending');
  const accepted = rowSeats.filter((seat) => seat.insurance && seat.insurance.accepted);
  const seat = activeSeat(state);
  const activeBase = insuranceBaseBet(seat, state.insuranceConfig);
  const pct25 = clampInsuranceAmount(seat, Math.floor(activeBase * 0.25), state.insuranceConfig);
  const pct50 = clampInsuranceAmount(seat, Math.floor(activeBase * 0.5), state.insuranceConfig);
  const activeDraft = getDraft(state, state.activeSeatId);
  const canResolveActive = canResolveInsuranceSeat(state, state.activeSeatId);
  if (el.insBankerScore) el.insBankerScore.textContent = handTotal(state.bCards);
  if (el.insPlayerBet) el.insPlayerBet.textContent = totalBase > 0 ? fmtMoney(totalBase) : '-';
  if (el.insMaxBet) el.insMaxBet.textContent = totalMax > 0 ? fmtMoney(totalMax) : '-';
  if (el.insEligibleCount) el.insEligibleCount.textContent = String(summarySeats.length);
  if (el.insCurrentBet) el.insCurrentBet.innerHTML = 'Pending: <strong>' + pending.length + '</strong> · Accepted: <strong>' + accepted.length + '</strong>';
  if (el.btnIns25) {
    el.btnIns25.textContent = '25% (' + fmtMoney(pct25) + ')';
    el.btnIns25.classList.toggle('is-selected', activeDraft === pct25 && pct25 > 0);
    el.btnIns25.disabled = !canResolveActive || pct25 === 0;
  }
  if (el.btnIns50) {
    el.btnIns50.textContent = '50% (' + fmtMoney(pct50) + ')';
    el.btnIns50.classList.toggle('is-selected', activeDraft === pct50 && pct50 > 0);
    el.btnIns50.disabled = !canResolveActive || pct50 === 0;
  }
  if (el.btnInsDecline) el.btnInsDecline.disabled = !canResolveActive;
  if (el.btnInsConfirm) el.btnInsConfirm.disabled = !canResolveActive;
  if (el.btnInsuranceNpcRound) {
    el.btnInsuranceNpcRound.textContent = state.phase === PHASES.SETTLEMENT ? 'Next Round' : 'Start NPC Round';
    el.btnInsuranceNpcRound.hidden = state.role !== 'insurance' || state.phase === PHASES.INSURANCE || (!isIdlePhase(state.phase) && state.phase !== PHASES.SETTLEMENT);
    el.btnInsuranceNpcRound.disabled = state.role !== 'insurance' || (!isIdlePhase(state.phase) && state.phase !== PHASES.SETTLEMENT);
  }
  el.insurancePanel.classList.toggle('is-multi', rowSeats.length > 0);
  if (!el.insuranceSeatRows) return;
  if (!rowSeats.length) {
    el.insuranceSeatRows.innerHTML = '<p class="tr-ins-empty">No active insurance offer.</p>';
    return;
  }
  el.insuranceSeatRows.innerHTML = rowSeats.map(function (rowSeat) {
    const decision = rowSeat.insurance || {};
    const base = Number(decision.baseBet || insuranceBaseBet(rowSeat, state.insuranceConfig));
    const max = Number(decision.maxAmount || insuranceMaxBet(base, state.insuranceConfig));
    const draft = getDraft(state, rowSeat.id);
    const canResolve = decision.outcome === 'pending' && canResolveInsuranceSeat(state, rowSeat.id);
    const amount25 = clampInsuranceAmount(rowSeat, Math.floor(base * 0.25), state.insuranceConfig);
    const amount50 = clampInsuranceAmount(rowSeat, Math.floor(base * 0.5), state.insuranceConfig);
    const statusClass = decision.outcome === 'pending' ? 'tr-ins-seat-status--pending' : decision.accepted ? 'tr-ins-seat-status--accepted' : 'tr-ins-seat-status--declined';
    const statusText = decision.outcome === 'pending' ? 'Pending' : decision.accepted ? 'Accepted ' + fmtMoney(decision.amount) : 'Declined';
    const disabled = canResolve ? '' : ' disabled';
    return '<div class="tr-ins-seat-row" data-seat-id="' + rowSeat.id + '"><div class="tr-ins-seat-main"><strong>Seat ' + rowSeat.id + '</strong><span class="tr-ins-seat-status ' + statusClass + '">' + statusText + '</span></div><div class="tr-ins-seat-meta"><span>Base <strong>' + fmtMoney(base) + '</strong></span><span>Max <strong>' + fmtMoney(max) + '</strong></span><span>Draft <strong>' + fmtMoney(draft) + '</strong></span></div><div class="tr-ins-seat-actions"><button type="button" class="tr-btn tr-btn--ghost tr-btn--xs" data-ins-action="decline" data-seat-id="' + rowSeat.id + '"' + disabled + '>Decline</button><button type="button" class="tr-ins-opt-btn' + (draft === amount25 && amount25 > 0 ? ' is-selected' : '') + '" data-ins-action="pct" data-ins-pct="25" data-seat-id="' + rowSeat.id + '"' + (canResolve && amount25 > 0 ? '' : ' disabled') + '>25%</button><button type="button" class="tr-ins-opt-btn' + (draft === amount50 && amount50 > 0 ? ' is-selected' : '') + '" data-ins-action="pct" data-ins-pct="50" data-seat-id="' + rowSeat.id + '"' + (canResolve && amount50 > 0 ? '' : ' disabled') + '>50%</button><button type="button" class="tr-ins-opt-btn' + (draft === max && max > 0 ? ' is-selected' : '') + '" data-ins-action="max" data-seat-id="' + rowSeat.id + '"' + (canResolve && max > 0 ? '' : ' disabled') + '>Max</button><button type="button" class="tr-btn tr-btn--ins-confirm tr-btn--xs" data-ins-action="confirm" data-seat-id="' + rowSeat.id + '"' + disabled + '>Confirm</button></div></div>';
  }).join('');
}

function renderAll() {
  const state = getState();
  if (!state.seats.length) return;
  const seat = activeSeat(state);
  if (el.overlayPanel) el.overlayPanel.style.display = (state.phase === PHASES.SETTLEMENT || state.phase === PHASES.INSURANCE) ? 'flex' : 'none';
  renderShoe(el, state.shoe);
  renderHands(el, state.pCards, state.bCards, { role: state.role, phase: state.phase, squeezeEnabled: state.tablePrefs.squeezeEnabled });
  renderResult(el.resultBox, state.result);
  renderDetail(el.roundDetail, { result: state.result, pCards: state.pCards, bCards: state.bCards, roundNum: state.roundNum, payouts: state.payouts });
  renderLog(el.sessionLog, state.log);
  renderAllRoads({ bead: el.roadBead, bigRoad: el.roadBig, bigEye: el.roadEye, smallRoad: el.roadSmall }, state.log);
  renderBalance(el.balanceAmt, el.rulesName, seat.balance, state.rules);
  renderChipTray(el.chipTray, CHIPS, state.selectedChip, seat.balance);
  renderSeats(el.betMatrix, state.seats, state.activeSeatId, state.settlement);
  renderBetZones(el.betMatrix, seat.bets, state.payouts, el.totalBetAmt, state.activeSeatId);
  renderPayoutSummary(el.payoutSummary, state.payouts);
  renderStats(el.statsPanel, state.shoe, state.log, state.procedureStats, state.tablePrefs);
  renderSettlementBoard(el.settlementBoard, state.settlement, {
    canUseDealerActions: state.role === 'dealer' && state.phase === PHASES.SETTLEMENT,
    collectedCommissions: state.settlementProcedure.collectedCommissions,
    acknowledgedChange: state.settlementProcedure.acknowledgedChange
  });
  renderInsurancePanel(state);
  renderRole(state);
  renderControls(state);
}

function attachEvents() {
  if (el.betMatrix) el.betMatrix.addEventListener('click', (e) => {
    const zoneEl = e.target.closest('[data-zone]');
    if (zoneEl) orchestrator.placeBet(zoneEl.getAttribute('data-zone'));
  });
  if (el.chipTray) el.chipTray.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-chip]');
    if (btn && !btn.disabled) orchestrator.selectChip(parseInt(btn.getAttribute('data-chip'), 10));
  });
  if (el.btnDeal) el.btnDeal.addEventListener('click', () => orchestrator.deal());
  if (el.btnNext) el.btnNext.addEventListener('click', () => orchestrator.nextRound());
  if (el.btnShoe) el.btnShoe.addEventListener('click', () => orchestrator.newShoe());
  if (el.btnCloseBets) el.btnCloseBets.addEventListener('click', () => orchestrator.closeBets());
  if (el.btnAutoDeal) el.btnAutoDeal.addEventListener('click', () => orchestrator.autoDeal());
  if (el.btnReveal) el.btnReveal.addEventListener('click', () => orchestrator.reveal());
  if (el.btnClearBets) el.btnClearBets.addEventListener('click', () => orchestrator.clearBets());
  if (el.btnSubmitBets) el.btnSubmitBets.addEventListener('click', () => orchestrator.submitBets());
  if (el.btnSettings) el.btnSettings.addEventListener('click', () => settingsPanel.open());
  if (el.settlementBoard) el.settlementBoard.addEventListener('click', onSettlementActionClick);
  if (el.btnInsDecline) el.btnInsDecline.addEventListener('click', () => orchestrator.insurance(getState().activeSeatId, 'decline'));
  if (el.btnInsConfirm) el.btnInsConfirm.addEventListener('click', () => orchestrator.insurance(getState().activeSeatId, 'confirm'));
  if (el.btnInsuranceNpcRound) el.btnInsuranceNpcRound.addEventListener('click', () => getState().phase === PHASES.SETTLEMENT ? orchestrator.nextRound() : orchestrator.autoDeal());
  if (el.insurancePanel) el.insurancePanel.addEventListener('click', onInsuranceActionClick);
  const roleSelector = document.querySelector('.tr-role-selector');
  if (roleSelector) roleSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.tr-role-btn');
    if (btn) orchestrator.switchRole(btn.getAttribute('data-role'));
  });
}

function onInsuranceActionClick(e) {
  const btn = e.target.closest('[data-ins-action], [data-ins-pct]');
  if (!btn || btn.disabled) return;
  const seatId = btn.getAttribute('data-seat-id') ? clampSeatId(btn.getAttribute('data-seat-id')) : getState().activeSeatId;
  const action = btn.getAttribute('data-ins-action') || 'pct';
  if (action === 'decline') orchestrator.insurance(seatId, 'decline');
  else if (action === 'confirm') orchestrator.insurance(seatId, 'confirm');
  else if (action === 'max') orchestrator.insurance(seatId, 'selectMax');
  else orchestrator.insurance(seatId, 'selectPercent', parseInt(btn.getAttribute('data-ins-pct'), 10));
}

function onSettlementActionClick(e) {
  const btn = e.target.closest('[data-settle-action]');
  if (!btn || btn.disabled) return;
  const seatId = clampSeatId(btn.getAttribute('data-seat-id'));
  const action = btn.getAttribute('data-settle-action');
  if (action === 'collect-commission') orchestrator.collectCommission(seatId);
  else if (action === 'ack-change') orchestrator.acknowledgeChange(seatId);
  else if (action === 'correct-payout') orchestrator.correctWrongPayout(seatId);
}

export function init() {
  const authStore = window.YiDingAuthStore || null;
  if (!authStore || !authStore.getCurrentAccount()) {
    window.location.replace('/index.html');
    return;
  }
  const prefs = getTablePrefs();
  _state = createState({
    rules: getRules(),
    insuranceConfig: getInsuranceConfig(),
    tablePrefs: prefs,
    activeSeatId: clampSeatId(prefs.activeSeatId),
    role: prefs.role || DEFAULT_TABLE_PREFS.role
  });
  settingsPanel = createSettingsPanel({
    host: el.settingsRoot,
    openButton: null,
    getState: () => ({ rules: getState().rules, insuranceConfig: getState().insuranceConfig, tablePrefs: getState().tablePrefs }),
    onSave: orchestrator.applySettings,
    onReset: orchestrator.resetSettings,
    rulePresets: RULE_PRESETS,
    insurancePresets: INSURANCE_PRESETS,
    shoePresets: SHOE_PRESETS
  });
  orchestrator.newShoe({ confirm: false, promptForCut: false, notify: false });
  attachEvents();
}

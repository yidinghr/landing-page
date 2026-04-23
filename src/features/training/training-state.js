// training-state.js — single source of truth for all mutable training state
// Pure state module: no DOM, no rendering, no engine calls
// Owns: state shape definition + immutable-style mutation helpers
// Does NOT own: rendering, event listeners, game logic decisions
// TODO[Phase1]: implement createState() and all mutation functions below

import { PHASES } from './phase-machine.js';
import { DEFAULT_RULES, DEFAULT_INSURANCE, DEFAULT_TABLE_PREFS } from './config/config-manager.js';

// ---------------------------------------------------------------------------
// State shape reference (do not mutate directly — use mutation functions below)
// ---------------------------------------------------------------------------
// {
//   phase:          string (PHASES enum value)
//   shoe:           object | null (from shoe-engine.initShoe)
//   pCards:         card[]        (player hand, 0-3 cards)
//   bCards:         card[]        (banker hand, 0-3 cards)
//   result:         object | null (from baccarat-engine.resolveRound)
//   roundNum:       number
//   log:            object[]      (newest-first, max 60 entries)
//   seats:          object[]      (from seat-engine.createSeats, length 5)
//   activeSeatId:   number        (1-5)
//   selectedChip:   number | null (chip denomination currently selected)
//   rules:          object        (current rule config)
//   insuranceConfig: object       (current insurance config)
//   tablePrefs:     object        (role, autoDealEnabled, etc.)
//   role:           string        ('dealer' | 'customer' | 'insurance')
//   payouts:        object | null (payout breakdown for active seat)
//   settlement:     object | null (full 5-seat settlement from settlement-engine)
//   settlementProcedure: object   (tracks dealer procedure: collected, acknowledged, catches)
//   procedureStats: object        ({ errors: number, catches: number })
//   npcBetsApplied: boolean       (prevents duplicate NPC bets in a round)
//   autoAfterInsurance: boolean   (auto-deal resumes after human insurance)
//   insuranceDrafts: object       ({ [seatId]: amount })
//   chipsPaidBySeat:  object      ({ [seatId]: number }) — Phase9
//   chipsCollectedBySeat: object  ({ [seatId]: number }) — Phase9
//   revealQueue:    object[]      — Phase8: ordered flip/squeeze actions
//   npcRequestQueue: object[]     — Phase10: NPC requests for current round
//   wrongPayoutDrill: object | null — from wrong-payout.js
// }

export function createState(overrides = {}) {
  // TODO[Phase1]: merge overrides into default state and return
  // Default state values are shown below — implement the merge
  const defaults = {
    phase:           PHASES.IDLE,
    shoe:            null,
    pCards:          [],
    bCards:          [],
    result:          null,
    roundNum:        0,
    log:             [],
    seats:           [],
    activeSeatId:    1,
    selectedChip:    null,
    rules:           Object.assign({}, DEFAULT_RULES),
    insuranceConfig: Object.assign({}, DEFAULT_INSURANCE),
    tablePrefs:      Object.assign({}, DEFAULT_TABLE_PREFS),
    role:            'dealer',
    payouts:         null,
    settlement:      null,
    settlementProcedure: {
      collectedCommissions: {},
      acknowledgedChange:   {},
      catchesThisRound:     0,
      confirmed:            false
    },
    procedureStats:  { errors: 0, catches: 0 },
    npcBetsApplied:  false,
    autoAfterInsurance: false,
    insuranceDrafts: {},
    chipsPaidBySeat:      {},
    chipsCollectedBySeat: {},
    revealQueue:     [],
    npcRequestQueue: [],
    wrongPayoutDrill: null
  };

  return Object.assign({}, defaults, overrides);
}

// ---------------------------------------------------------------------------
// Mutation helpers — each returns a NEW state object (do not mutate in place)
// ---------------------------------------------------------------------------

export function setPhase(state, phase) {
  // TODO[Phase1]: return { ...state, phase }
  return Object.assign({}, state, { phase });
}

export function setShoe(state, shoe) {
  // TODO[Phase1]: return new state with updated shoe
  return Object.assign({}, state, { shoe });
}

export function setPCards(state, pCards) {
  return Object.assign({}, state, { pCards });
}

export function setBCards(state, bCards) {
  return Object.assign({}, state, { bCards });
}

export function setResult(state, result) {
  return Object.assign({}, state, { result });
}

export function setSeats(state, seats) {
  return Object.assign({}, state, { seats });
}

export function setSettlement(state, settlement) {
  return Object.assign({}, state, { settlement });
}

export function setPayouts(state, payouts) {
  return Object.assign({}, state, { payouts });
}

export function setRole(state, role) {
  return Object.assign({}, state, { role });
}

export function setSelectedChip(state, value) {
  return Object.assign({}, state, { selectedChip: value });
}

export function setActiveSeatId(state, id) {
  return Object.assign({}, state, { activeSeatId: id });
}

export function addLogEntry(state, entry) {
  // TODO[Phase1]: prepend entry, cap at 60, return new state
  const log = [entry, ...state.log].slice(0, 60);
  return Object.assign({}, state, { log });
}

export function clearLog(state) {
  return Object.assign({}, state, { log: [] });
}

export function incrementRound(state) {
  return Object.assign({}, state, { roundNum: state.roundNum + 1 });
}

export function setRoundNum(state, roundNum) {
  return Object.assign({}, state, { roundNum });
}

export function setInsuranceDraft(state, seatId, amount) {
  // TODO[Phase1]: return new state with insuranceDrafts[seatId] = amount
  const drafts = Object.assign({}, state.insuranceDrafts, { [seatId]: amount });
  return Object.assign({}, state, { insuranceDrafts: drafts });
}

export function clearInsuranceDraft(state, seatId) {
  const drafts = Object.assign({}, state.insuranceDrafts);
  delete drafts[seatId];
  return Object.assign({}, state, { insuranceDrafts: drafts });
}

export function clearInsuranceDrafts(state) {
  return Object.assign({}, state, { insuranceDrafts: {} });
}

export function markCommissionCollected(state, seatId) {
  // TODO[Phase1]: set settlementProcedure.collectedCommissions[seatId] = true
  const proc = Object.assign({}, state.settlementProcedure, {
    collectedCommissions: Object.assign({}, state.settlementProcedure.collectedCommissions, { [seatId]: true })
  });
  return Object.assign({}, state, { settlementProcedure: proc });
}

export function markChangeAcknowledged(state, seatId) {
  const proc = Object.assign({}, state.settlementProcedure, {
    acknowledgedChange: Object.assign({}, state.settlementProcedure.acknowledgedChange, { [seatId]: true })
  });
  return Object.assign({}, state, { settlementProcedure: proc });
}

export function incrementCatches(state) {
  const proc = Object.assign({}, state.settlementProcedure, {
    catchesThisRound: state.settlementProcedure.catchesThisRound + 1
  });
  const stats = Object.assign({}, state.procedureStats, { catches: state.procedureStats.catches + 1 });
  return Object.assign({}, state, { settlementProcedure: proc, procedureStats: stats });
}

export function incrementErrors(state) {
  const stats = Object.assign({}, state.procedureStats, { errors: state.procedureStats.errors + 1 });
  return Object.assign({}, state, { procedureStats: stats });
}

export function addProcedureErrors(state, count) {
  const stats = Object.assign({}, state.procedureStats, {
    errors: state.procedureStats.errors + Number(count || 0)
  });
  return Object.assign({}, state, { procedureStats: stats });
}

export function resetSettlementProcedure(state) {
  return Object.assign({}, state, {
    settlementProcedure: { collectedCommissions: {}, acknowledgedChange: {}, catchesThisRound: 0, confirmed: false }
  });
}

export function confirmSettlementProcedure(state) {
  const proc = Object.assign({}, state.settlementProcedure, { confirmed: true });
  return Object.assign({}, state, { settlementProcedure: proc });
}

export function setWrongPayoutDrill(state, drill) {
  return Object.assign({}, state, { wrongPayoutDrill: drill });
}

// Phase8: reveal queue
export function setRevealQueue(state, queue) {
  return Object.assign({}, state, { revealQueue: queue });
}

export function dequeueRevealItem(state) {
  // TODO[Phase8]: remove first item from revealQueue
  const [, ...rest] = state.revealQueue;
  return Object.assign({}, state, { revealQueue: rest });
}

// Phase9: chip payment tracking
export function addChipPaid(state, seatId, amount) {
  const current = state.chipsPaidBySeat[seatId] || 0;
  const updated = Object.assign({}, state.chipsPaidBySeat, { [seatId]: current + amount });
  return Object.assign({}, state, { chipsPaidBySeat: updated });
}

export function addChipCollected(state, seatId, amount) {
  const current = state.chipsCollectedBySeat[seatId] || 0;
  const updated = Object.assign({}, state.chipsCollectedBySeat, { [seatId]: current + amount });
  return Object.assign({}, state, { chipsCollectedBySeat: updated });
}

export function resetChipTracking(state) {
  return Object.assign({}, state, { chipsPaidBySeat: {}, chipsCollectedBySeat: {} });
}

export function setNpcBetsApplied(state, value) {
  return Object.assign({}, state, { npcBetsApplied: Boolean(value) });
}

export function setAutoAfterInsurance(state, value) {
  return Object.assign({}, state, { autoAfterInsurance: Boolean(value) });
}

// Phase10: NPC request queue
export function setNpcRequestQueue(state, queue) {
  return Object.assign({}, state, { npcRequestQueue: queue });
}

export function clearNpcRequestQueue(state) {
  return Object.assign({}, state, { npcRequestQueue: [] });
}

export function applyRules(state, rules) {
  return Object.assign({}, state, { rules });
}

export function applyInsuranceConfig(state, insuranceConfig) {
  return Object.assign({}, state, { insuranceConfig });
}

export function applyTablePrefs(state, tablePrefs) {
  return Object.assign({}, state, { tablePrefs });
}

export function updateLatestLogProcedure(state, errorCount) {
  if (!state.log.length) return state;
  const [head, ...tail] = state.log;
  const updated = Object.assign({}, head, {
    procedureErrors: (head.procedureErrors || 0) + Number(errorCount || 0),
    procedureCatches: state.settlementProcedure.catchesThisRound
  });
  return Object.assign({}, state, { log: [updated, ...tail] });
}

export function resetSession(state, shoe, seats) {
  return Object.assign({}, state, {
    phase:           PHASES.IDLE,
    shoe:            shoe,
    pCards:          [],
    bCards:          [],
    result:          null,
    roundNum:        0,
    log:             [],
    seats:           seats,
    payouts:         null,
    settlement:      null,
    settlementProcedure: { collectedCommissions: {}, acknowledgedChange: {}, catchesThisRound: 0, confirmed: false },
    procedureStats:  { errors: 0, catches: 0 },
    npcBetsApplied:  false,
    autoAfterInsurance: false,
    insuranceDrafts: {},
    chipsPaidBySeat: {},
    chipsCollectedBySeat: {},
    revealQueue:     [],
    npcRequestQueue: [],
    wrongPayoutDrill: null
  });
}

// Full round reset (keeps shoe, log, procedureStats, rules)
export function resetRound(state) {
  // TODO[Phase1]: clear cards, result, payouts, settlement, insurance drafts,
  //               chip tracking, reveal/npc queues — keep shoe, log, seats balances, rules
  return Object.assign({}, state, {
    pCards:          [],
    bCards:          [],
    result:          null,
    payouts:         null,
    settlement:      null,
    insuranceDrafts: {},
    revealQueue:     [],
    npcRequestQueue: [],
    wrongPayoutDrill: null,
    chipsPaidBySeat:      {},
    chipsCollectedBySeat: {},
    npcBetsApplied: false,
    autoAfterInsurance: false
  });
}

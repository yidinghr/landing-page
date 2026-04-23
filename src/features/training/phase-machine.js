// phase-machine.js — owns phase enum and valid transition map
// Pure module: no DOM, no state mutation, no imports needed
// TODO[Phase1]: this file is complete as-is — no implementation needed

export const PHASES = Object.freeze({
  IDLE:        'idle',
  BETTING:     'betting',
  DEAL_1:      'deal-1',
  DEAL_2:      'deal-2',
  DEAL_3:      'deal-3',
  DEAL_4:      'deal-4',
  INSURANCE:   'insurance',
  DRAW_P3:     'draw-p3',
  DRAW_B3:     'draw-b3',
  REVEAL:      'reveal',
  SETTLEMENT:  'settlement',
  ROUND_END:   'round-end'
});

// Map: from phase → array of phases it may transition to
// Used by training-orchestrator to guard illegal phase jumps
const VALID_TRANSITIONS = Object.freeze({
  [PHASES.IDLE]:       [PHASES.BETTING],
  [PHASES.BETTING]:    [PHASES.DEAL_1, PHASES.IDLE],
  [PHASES.DEAL_1]:     [PHASES.DEAL_2],
  [PHASES.DEAL_2]:     [PHASES.DEAL_3],
  [PHASES.DEAL_3]:     [PHASES.DEAL_4],
  [PHASES.DEAL_4]:     [PHASES.INSURANCE, PHASES.DRAW_P3, PHASES.DRAW_B3, PHASES.REVEAL],
  [PHASES.INSURANCE]:  [PHASES.DRAW_P3, PHASES.DRAW_B3, PHASES.REVEAL],
  [PHASES.DRAW_P3]:    [PHASES.DRAW_B3, PHASES.REVEAL],
  [PHASES.DRAW_B3]:    [PHASES.REVEAL],
  [PHASES.REVEAL]:     [PHASES.SETTLEMENT],
  [PHASES.SETTLEMENT]: [PHASES.ROUND_END],
  [PHASES.ROUND_END]:  [PHASES.IDLE]
});

// Phases in which the dealer may deal a card (drag from card source is active)
export const DEALING_PHASES = new Set([
  PHASES.DEAL_1, PHASES.DEAL_2, PHASES.DEAL_3, PHASES.DEAL_4,
  PHASES.DRAW_P3, PHASES.DRAW_B3
]);

// Phases in which customer betting is allowed
export const BETTING_PHASES = new Set([PHASES.IDLE, PHASES.BETTING]);

// Phases in which role switching is allowed
export const ROLE_SWITCH_PHASES = new Set([PHASES.IDLE, PHASES.BETTING]);

export function canTransitionTo(fromPhase, toPhase) {
  const allowed = VALID_TRANSITIONS[fromPhase];
  return Array.isArray(allowed) && allowed.includes(toPhase);
}

// Returns the set of named action types valid in the given phase
// Action types: 'deal' | 'closeBets' | 'reveal' | 'nextRound' | 'newShoe'
//               'placeBet' | 'clearBets' | 'submitBets'
//               'resolveInsurance' | 'settleChips'
export function validActionsInPhase(phase) {
  switch (phase) {
    case PHASES.IDLE:
      return new Set(['newShoe', 'placeBet', 'switchRole']);
    case PHASES.BETTING:
      return new Set(['closeBets', 'placeBet', 'clearBets', 'newShoe', 'switchRole']);
    case PHASES.DEAL_1:
    case PHASES.DEAL_2:
    case PHASES.DEAL_3:
    case PHASES.DEAL_4:
    case PHASES.DRAW_P3:
    case PHASES.DRAW_B3:
      return new Set(['deal']);
    case PHASES.INSURANCE:
      return new Set(['resolveInsurance']);
    case PHASES.REVEAL:
      return new Set(['flipCard', 'reveal']);
    case PHASES.SETTLEMENT:
      return new Set(['settleChips', 'collectCommission', 'correctWrongPayout', 'nextRound']);
    case PHASES.ROUND_END:
      return new Set(['nextRound']);
    default:
      return new Set();
  }
}

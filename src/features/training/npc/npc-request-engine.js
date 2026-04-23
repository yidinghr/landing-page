// npc-request-engine.js — generates context-aware NPC customer requests per round
// Pure module: no DOM, no state mutation, uses randomness for variety
// Does NOT own: bet logic (see npc-behavior.js), state, rendering
// TODO[Phase10]: implement generateRoundRequests and all helpers

// ---------------------------------------------------------------------------
// Request type catalogue
// ---------------------------------------------------------------------------
export const NPC_REQUEST_TYPES = Object.freeze({
  SQUEEZE_P1:         'squeeze-p1',
  SQUEEZE_P2:         'squeeze-p2',
  SQUEEZE_B1:         'squeeze-b1',
  SQUEEZE_B2:         'squeeze-b2',
  FLIP_PLAYER_FIRST:  'flip-player-first',
  FLIP_BANKER_FIRST:  'flip-banker-first',
  FLIP_ALL_TOGETHER:  'flip-all-together',
  HOLD_MY_CARD:       'hold-my-card',
  WAIT_A_MOMENT:      'wait-a-moment'
});

// Human-readable labels (for speech bubble display)
export const REQUEST_LABELS = {
  [NPC_REQUEST_TYPES.SQUEEZE_P1]:        'Squeeze P lá 1!',
  [NPC_REQUEST_TYPES.SQUEEZE_P2]:        'Squeeze P lá 2~',
  [NPC_REQUEST_TYPES.SQUEEZE_B1]:        'Squeeze B lá 1!',
  [NPC_REQUEST_TYPES.SQUEEZE_B2]:        'Squeeze B lá 2',
  [NPC_REQUEST_TYPES.FLIP_PLAYER_FIRST]: 'Player trước!',
  [NPC_REQUEST_TYPES.FLIP_BANKER_FIRST]: 'Banker trước đi',
  [NPC_REQUEST_TYPES.FLIP_ALL_TOGETHER]: 'Lật luôn hai bên!',
  [NPC_REQUEST_TYPES.HOLD_MY_CARD]:      'Đưa bài cho tui cầm',
  [NPC_REQUEST_TYPES.WAIT_A_MOMENT]:     'Khoan khoan...'
};

// Which request types feed into the reveal queue (require dealer action in reveal flow)
export const REVEAL_FLOW_REQUESTS = new Set([
  NPC_REQUEST_TYPES.SQUEEZE_P1,
  NPC_REQUEST_TYPES.SQUEEZE_P2,
  NPC_REQUEST_TYPES.SQUEEZE_B1,
  NPC_REQUEST_TYPES.SQUEEZE_B2,
  NPC_REQUEST_TYPES.FLIP_PLAYER_FIRST,
  NPC_REQUEST_TYPES.FLIP_BANKER_FIRST,
  NPC_REQUEST_TYPES.FLIP_ALL_TOGETHER
]);

// ---------------------------------------------------------------------------
// Difficulty profiles
// ---------------------------------------------------------------------------
const DIFFICULTY_PROFILES = {
  easy:   { maxRequests: 1, requestChance: 0.3, types: [NPC_REQUEST_TYPES.FLIP_PLAYER_FIRST, NPC_REQUEST_TYPES.FLIP_BANKER_FIRST] },
  medium: { maxRequests: 2, requestChance: 0.55, types: [
    NPC_REQUEST_TYPES.FLIP_PLAYER_FIRST, NPC_REQUEST_TYPES.FLIP_BANKER_FIRST,
    NPC_REQUEST_TYPES.SQUEEZE_P1, NPC_REQUEST_TYPES.SQUEEZE_B1
  ]},
  hard:   { maxRequests: 3, requestChance: 0.80, types: Object.values(NPC_REQUEST_TYPES) },
  expert: { maxRequests: 4, requestChance: 0.95, types: Object.values(NPC_REQUEST_TYPES) }
};

// ---------------------------------------------------------------------------
// Seat personality seeds
// Each shoe gets a fresh personality set (seeded in training-state on newShoe)
// ---------------------------------------------------------------------------

/**
 * Generate personality profiles for all 5 seats.
 * Called once per shoe. Store result in training-state.
 *
 * @returns {object[]} personalities - [{ seatId, requestFrequency, preferredType, patience }]
 */
export function generateSeatPersonalities() {
  // TODO[Phase10]: implement
  return [1, 2, 3, 4, 5].map(function (id) {
    const types = Object.values(NPC_REQUEST_TYPES);
    return {
      seatId:           id,
      // Seat 1 = VIP: always high frequency
      requestFrequency: id === 1 ? 0.8 : 0.2 + Math.random() * 0.5,
      preferredType:    types[Math.floor(Math.random() * types.length)],
      patience:         Math.floor(3 + Math.random() * 8) // 3-10 seconds
    };
  });
}

// ---------------------------------------------------------------------------
// Anti-repetition helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a (seatId, requestType) pair is blocked by anti-repetition rules.
 *
 * @param {number} seatId
 * @param {string} requestType
 * @param {object[]} previousRequests - Last 3 rounds of requests: [{ seatId, type }[]]
 * @returns {boolean} true if this request should be suppressed
 */
export function isBlockedByAntiRepetition(seatId, requestType, previousRequests) {
  // TODO[Phase10]: implement
  // Rule 1: same (seatId, requestType) not in consecutive 2 rounds
  // Rule 2: same requestType across ANY seat not 3x in a row
  // previousRequests: array of per-round arrays (up to 3 rounds back)

  if (!previousRequests || previousRequests.length === 0) return false;

  // Rule 1: same seat + same type in last round
  const lastRound = previousRequests[0] || [];
  const sameInLast = lastRound.some(function (r) {
    return r.seatId === seatId && r.type === requestType;
  });
  if (sameInLast) return true;

  // Rule 2: same type in all of last 3 rounds (across any seat)
  const last3 = previousRequests.slice(0, 3);
  const typeAppearedInAll = last3.length >= 3 && last3.every(function (round) {
    return round.some(function (r) { return r.type === requestType; });
  });
  if (typeAppearedInAll) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Generates NPC requests for the current round.
 * Called after deal-4 is complete.
 *
 * @param {object[]} seats             - Current seat states
 * @param {string} phase               - Should be 'deal-4' or 'insurance'
 * @param {number} roundNum            - Current round number
 * @param {string} difficulty          - 'easy'|'medium'|'hard'|'expert'
 * @param {object[][]} previousRequests - Anti-repetition history (last 3 rounds)
 * @param {object[]} [personalities]   - Seat personality profiles (from generateSeatPersonalities)
 * @returns {object[]} requests - [{ seatId, type, label, requestedBy: 'npc' }]
 */
export function generateRoundRequests(seats, phase, roundNum, difficulty, previousRequests, personalities) {
  // TODO[Phase10]: implement
  // For each seat with a bet:
  //   1. Check personality.requestFrequency against random roll
  //   2. Filter available types by difficulty profile
  //   3. Filter types blocked by anti-repetition
  //   4. Pick one type (prefer personality.preferredType if not blocked)
  //   5. Contextual rules (see below)
  //   6. Add to result if under maxRequests cap

  void phase; void roundNum;

  const profile = DIFFICULTY_PROFILES[difficulty] || DIFFICULTY_PROFILES.medium;
  const requests = [];

  if (!Array.isArray(seats)) return requests;

  for (const seat of seats) {
    if (requests.length >= profile.maxRequests) break;

    const totalBet = Object.values(seat.bets || {}).reduce(function (s, v) { return s + (v || 0); }, 0);
    if (totalBet <= 0) continue;

    const personality = personalities && personalities.find(function (p) { return p.seatId === seat.id; });
    const freq = personality ? personality.requestFrequency : 0.4;

    if (Math.random() > freq * profile.requestChance) continue;

    // Filter available types
    const eligible = profile.types.filter(function (type) {
      // Contextual: pair bet → prefer squeeze
      if (type.startsWith('squeeze') && !(seat.bets.playerPair || seat.bets.bankerPair) && totalBet < 50000) return false;
      // Contextual: tie bet → prefer flip-all
      if (type === NPC_REQUEST_TYPES.FLIP_ALL_TOGETHER && !seat.bets.tie) return Math.random() < 0.3;
      // Anti-repetition
      if (isBlockedByAntiRepetition(seat.id, type, previousRequests)) return false;
      return true;
    });

    if (eligible.length === 0) continue;

    // Prefer personality type if available
    const preferred = personality && eligible.includes(personality.preferredType)
      ? personality.preferredType
      : eligible[Math.floor(Math.random() * eligible.length)];

    requests.push({
      seatId:      seat.id,
      type:        preferred,
      label:       REQUEST_LABELS[preferred] || preferred,
      requestedBy: 'npc'
    });
  }

  return requests;
}

// reveal-flow-manager.js — manages the ordered card flip / squeeze sequence
// Owns: reveal action queue, customer + NPC request integration, flip state tracking
// Does NOT own: game state mutation, baccarat rules, rendering
// TODO[Phase8]: implement all functions below

// ---------------------------------------------------------------------------
// Reveal action types
// ---------------------------------------------------------------------------
export const REVEAL_ACTIONS = Object.freeze({
  FLIP_P1:  'flip-p1',
  FLIP_P2:  'flip-p2',
  FLIP_P3:  'flip-p3',
  FLIP_B1:  'flip-b1',
  FLIP_B2:  'flip-b2',
  FLIP_B3:  'flip-b3',
  FLIP_ALL: 'flip-all'   // simultaneous reveal — no ordered queue needed
});

// Card face state tracking per round
// Managed externally in training-state.js but shape defined here
// { p1: bool, p2: bool, p3: bool, b1: bool, b2: bool, b3: bool }
export function createFaceState() {
  return { p1: false, p2: false, p3: false, b1: false, b2: false, b3: false };
}

// ---------------------------------------------------------------------------
// Queue builder
// ---------------------------------------------------------------------------

/**
 * Builds an ordered reveal queue from NPC requests + customer requests.
 * Called after all deal phases are complete, before REVEAL phase.
 *
 * @param {object[]} npcRequests      - From npc-request-engine.generateRoundRequests
 * @param {object[]} customerRequests - From customer request panel submissions
 * @param {string[]} existingCards    - Which card keys exist: ['p1','p2','b1','b2','p3'?,b3'?]
 * @returns {object[]} Ordered queue of { action, requestedBy, seatId }
 */
export function buildRevealQueue(npcRequests, customerRequests, existingCards) {
  // TODO[Phase8]: implement
  // Logic:
  // 1. Customer requests take precedence over NPC requests (customer is the human)
  // 2. Merge without duplicates (same action from multiple sources = one queue entry)
  // 3. If no requests → return empty queue (default single reveal)
  // 4. If 'flip-all' requested → return [{ action: REVEAL_ACTIONS.FLIP_ALL }]
  // 5. Filter out actions for cards that don't exist (e.g., p3 if no 3rd card dealt)
  // 6. Ensure correct ordering: p1/p2 then b1/b2 then p3/b3 (or as requested)

  const validCards = new Set(existingCards);
  const queue = [];
  const seen  = new Set();

  const allRequests = [...customerRequests, ...npcRequests]; // customer first

  for (const req of allRequests) {
    if (req.type === 'flip-all') {
      return [{ action: REVEAL_ACTIONS.FLIP_ALL, requestedBy: req.requestedBy, seatId: req.seatId }];
    }

    const actionKey = _requestTypeToAction(req.type);
    if (!actionKey) continue;

    const cardKey = _actionToCardKey(actionKey);
    if (cardKey && !validCards.has(cardKey)) continue;  // card doesn't exist this round
    if (seen.has(actionKey)) continue;                  // deduplicate

    seen.add(actionKey);
    queue.push({ action: actionKey, requestedBy: req.requestedBy, seatId: req.seatId });
  }

  return queue;
}

function _requestTypeToAction(requestType) {
  const map = {
    'flip-player-first': REVEAL_ACTIONS.FLIP_P1,
    'flip-banker-first': REVEAL_ACTIONS.FLIP_B1,
    'squeeze-p1':        REVEAL_ACTIONS.FLIP_P1,
    'squeeze-p2':        REVEAL_ACTIONS.FLIP_P2,
    'squeeze-b1':        REVEAL_ACTIONS.FLIP_B1,
    'squeeze-b2':        REVEAL_ACTIONS.FLIP_B2,
    'flip-all-together': REVEAL_ACTIONS.FLIP_ALL
  };
  return map[requestType] || null;
}

function _actionToCardKey(action) {
  const map = {
    [REVEAL_ACTIONS.FLIP_P1]: 'p1',
    [REVEAL_ACTIONS.FLIP_P2]: 'p2',
    [REVEAL_ACTIONS.FLIP_P3]: 'p3',
    [REVEAL_ACTIONS.FLIP_B1]: 'b1',
    [REVEAL_ACTIONS.FLIP_B2]: 'b2',
    [REVEAL_ACTIONS.FLIP_B3]: 'b3'
  };
  return map[action] || null;
}

// ---------------------------------------------------------------------------
// Queue processor
// ---------------------------------------------------------------------------

/**
 * Checks whether a dealer flip action matches the current queue head.
 *
 * @param {object[]} queue     - Current reveal queue (from state.revealQueue)
 * @param {string} cardKey     - Card the dealer attempted to flip: 'p1'|'p2'|...|'b3'
 * @returns {{ allowed: boolean, expected: string|null, message: string|null }}
 */
export function validateFlipAction(queue, cardKey) {
  // TODO[Phase8]: implement
  // If queue is empty → any flip is allowed (standard free reveal)
  // If queue has items → only the first item's card is allowed next
  // If wrong card attempted → return { allowed: false, expected, message }

  if (queue.length === 0) return { allowed: true, expected: null, message: null };

  const expected = _actionToCardKey(queue[0].action);
  if (expected === cardKey) return { allowed: true, expected: null, message: null };

  return {
    allowed:  false,
    expected: expected,
    message:  `Khách yêu cầu lật ${_cardKeyLabel(expected)} trước. Lật ${_cardKeyLabel(cardKey)} sau.`
  };
}

function _cardKeyLabel(key) {
  const labels = {
    p1: 'Player lá 1', p2: 'Player lá 2', p3: 'Player lá 3',
    b1: 'Banker lá 1', b2: 'Banker lá 2', b3: 'Banker lá 3'
  };
  return labels[key] || key;
}

/**
 * Returns true when all cards in the queue have been flipped.
 * An empty queue is considered complete (reveals immediately).
 */
export function isRevealComplete(queue, faceState) {
  // TODO[Phase8]: implement
  if (queue.length === 0) return true;
  // Check all queued actions have been satisfied
  return queue.every(function (item) {
    const cardKey = _actionToCardKey(item.action);
    return cardKey ? faceState[cardKey] : true;
  });
}

/**
 * Applies a flip to faceState. Returns new faceState object (immutable).
 */
export function applyFlip(faceState, cardKey) {
  // TODO[Phase8]: return { ...faceState, [cardKey]: true }
  return Object.assign({}, faceState, { [cardKey]: true });
}

/**
 * Returns true if ALL existing cards are face-up.
 * Used to auto-trigger revealRound after final flip.
 */
export function allCardsRevealed(faceState, existingCards) {
  return existingCards.every(function (key) { return faceState[key]; });
}

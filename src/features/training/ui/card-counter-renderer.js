// card-counter-renderer.js — displays removed cards by rank and live probability
// Owns: card counter grid rendering + probability bar rendering
// Does NOT own: shoe state, probability calculation
// TODO[Phase5]: implement all functions below

import { RANKS } from '../engines/shoe-engine.js';

// Total cards per rank in an 8-deck shoe (4 suits × 8 decks)
const CARDS_PER_RANK = 32;

// Display label for each rank
const RANK_LABELS = {
  'A': 'A', '2': '2', '3': '3', '4': '4', '5': '5',
  '6': '6', '7': '7', '8': '8', '9': '9',
  '10': '10', 'J': 'J', 'Q': 'Q', 'K': 'K'
};

// ---------------------------------------------------------------------------
// Card counter
// ---------------------------------------------------------------------------

/**
 * Counts removed cards (dealt so far) by rank from shoe state.
 * Uses shoe.cards[0..shoe.pos-1] — cards already dealt.
 *
 * @param {object} shoe - from shoe-engine.initShoe + dealOne calls
 * @returns {object} { [rank]: removedCount }
 */
export function buildRemovedCardCounts(shoe) {
  // TODO[Phase5]: implement
  // Iterate shoe.cards from index shoe.burnCount to shoe.pos - 1
  // Count occurrences of each rank
  // Return object keyed by rank

  const counts = RANKS.reduce(function (acc, rank) {
    acc[rank] = 0;
    return acc;
  }, {});

  if (!shoe || !shoe.cards) return counts;

  // Start from burnCount to skip burned cards
  const start = shoe.burnCount || 0;
  for (let i = start; i < shoe.pos; i++) {
    const rank = shoe.cards[i].rank;
    if (counts[rank] !== undefined) counts[rank]++;
  }

  return counts;
}

/**
 * Returns remaining count per rank (total - removed).
 * @param {object} removedCounts - from buildRemovedCardCounts
 * @returns {object} { [rank]: remaining }
 */
export function buildRemainingCardCounts(removedCounts) {
  return RANKS.reduce(function (acc, rank) {
    acc[rank] = CARDS_PER_RANK - (removedCounts[rank] || 0);
    return acc;
  }, {});
}

/**
 * Determines color severity for a remaining count.
 * @param {number} remaining
 * @returns {string} CSS color class or inline color string
 */
function remainingColor(remaining) {
  // TODO[Phase5]: tune thresholds if needed
  if (remaining === 0)  return '#ef4444'; // red — exhausted
  if (remaining <= 8)   return '#f97316'; // orange — very low
  if (remaining <= 16)  return '#eab308'; // yellow — half gone
  return '#6b7280';                        // gray — normal
}

/**
 * Renders the card counter grid into a host element.
 * Displays 13 rank columns, each showing rank label + remaining count.
 *
 * @param {HTMLElement} host  - Container element (#tr-card-counter)
 * @param {object} shoe       - Current shoe state
 */
export function renderCardCounter(host, shoe) {
  // TODO[Phase5]: implement
  // Layout: CSS grid with 13 equal columns
  // Each column: rank label (top) + remaining count (bottom, colored)
  // Full re-render on each call (small enough to be fast)

  if (!host) return;

  const removed   = buildRemovedCardCounts(shoe);
  const remaining = buildRemainingCardCounts(removed);

  const cells = RANKS.map(function (rank) {
    const rem   = remaining[rank];
    const color = remainingColor(rem);
    return (
      '<div class="tr-card-count-cell" title="' + rank + ': ' + rem + ' còn lại">' +
        '<span class="tr-card-count-rank">' + RANK_LABELS[rank] + '</span>' +
        '<span class="tr-card-count-rem" style="color:' + color + '">' + rem + '</span>' +
      '</div>'
    );
  });

  host.innerHTML = '<div class="tr-card-counter-grid">' + cells.join('') + '</div>';
}

// ---------------------------------------------------------------------------
// Live probability bar
// ---------------------------------------------------------------------------

/**
 * Renders the 6-item live probability bar.
 * Called after every card is dealt (Phase5 + Phase6 integration).
 *
 * @param {HTMLElement} host  - Container element (#tr-live-prob)
 * @param {object} probs      - from prob-engine.probFromShoe:
 *                              { banker, player, tie, bankerPair, playerPair, luckySix }
 */
export function renderLiveProb(host, probs) {
  // TODO[Phase5]: implement
  // Layout: 6 horizontal items in one row
  // Each item: label + percentage
  // Banker = blue, Player = red, Tie = green, pairs = smaller text

  if (!host || !probs) return;

  function pct(n) {
    const value = Number(n || 0) * 100;
    return value.toFixed(2) + '%';
  }

  host.innerHTML = [
    '<div class="tr-prob-card tr-prob--player"><span>PLAYER</span><strong>' + pct(probs.player) + '</strong></div>',
    '<div class="tr-prob-card tr-prob--banker"><span>BANKER</span><strong>' + pct(probs.banker) + '</strong></div>',
    '<div class="tr-prob-card tr-prob--tie"><span>TIE</span><strong>' + pct(probs.tie) + '</strong></div>',
    '<div class="tr-prob-card tr-prob--pair"><span>P PAIR</span><strong>' + pct(probs.playerPair) + '</strong></div>',
    '<div class="tr-prob-card tr-prob--pair"><span>B PAIR</span><strong>' + pct(probs.bankerPair) + '</strong></div>',
    '<div class="tr-prob-card tr-prob--lucky"><span>LUCKY 6</span><strong>' + pct(probs.luckySix) + '</strong></div>'
  ].join('');
}

// ---------------------------------------------------------------------------
// Feedback panel
// ---------------------------------------------------------------------------

let _feedbackTimer = null;
const FEEDBACK_LIMIT = 6;

/**
 * Renders a procedural feedback message in the training feedback panel.
 * Auto-clears after timeoutMs milliseconds.
 *
 * @param {HTMLElement} host        - Container element (#tr-feedback-panel)
 * @param {string} message          - Message text
 * @param {'error'|'warning'|'info'} severity
 * @param {number} [timeoutMs=5000]
 */
export function renderFeedback(host, message, severity, timeoutMs) {
  // TODO[Phase7]: implement
  if (!host) return;
  if (_feedbackTimer) { clearTimeout(_feedbackTimer); _feedbackTimer = null; }

  const ms = timeoutMs || 5000;
  host.className = 'tr-feedback-panel tr-feedback--' + (severity || 'info');
  const item = document.createElement('div');
  item.className = 'tr-feedback-item tr-feedback-item--' + (severity || 'info');
  item.textContent = message;
  host.prepend(item);
  Array.from(host.querySelectorAll('.tr-feedback-item')).slice(FEEDBACK_LIMIT).forEach(function (node) {
    node.remove();
  });
  host.style.display = 'block';

  _feedbackTimer = setTimeout(function () {
    _feedbackTimer = null;
  }, ms);
}

export function clearFeedback(host) {
  if (!host) return;
  if (_feedbackTimer) { clearTimeout(_feedbackTimer); _feedbackTimer = null; }
  host.style.display = 'none';
  host.innerHTML = '';
}

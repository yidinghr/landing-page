// npc-speech-renderer.js — renders NPC speech bubbles above bet-matrix seat columns
// Owns: bubble DOM creation/update/removal on #tr-bet-matrix seat columns
// Does NOT own: NPC request logic, state, drag, or CSS redesign
// Phase10: minimal implementation — no animations required

/**
 * Injects a one-time <style> block so the renderer owns its own visual rules
 * without touching training.css.
 */
let _styleInjected = false;
function ensureStyles() {
  if (_styleInjected) return;
  _styleInjected = true;
  const style = document.createElement('style');
  style.textContent = [
    '.tr-npc-bubble {',
    '  position: absolute;',
    '  bottom: calc(100% + 6px);',
    '  left: 50%;',
    '  transform: translateX(-50%);',
    '  background: rgba(20, 20, 40, 0.92);',
    '  border: 1px solid rgba(200, 160, 74, 0.6);',
    '  border-radius: 8px;',
    '  padding: 4px 8px;',
    '  font-size: 11px;',
    '  color: #f5dfa0;',
    '  white-space: nowrap;',
    '  pointer-events: none;',
    '  z-index: 50;',
    '  animation: tr-bubble-in 0.2s ease;',
    '}',
    '.tr-npc-bubble::after {',
    '  content: "";',
    '  position: absolute;',
    '  top: 100%;',
    '  left: 50%;',
    '  transform: translateX(-50%);',
    '  border: 5px solid transparent;',
    '  border-top-color: rgba(200, 160, 74, 0.6);',
    '}',
    '@keyframes tr-bubble-in {',
    '  from { opacity: 0; transform: translateX(-50%) translateY(4px); }',
    '  to   { opacity: 1; transform: translateX(-50%) translateY(0); }',
    '}',
    // Seat cells need position:relative for the absolute bubble
    '.tr-matrix-cell[data-seat] { position: relative; }'
  ].join('\n');
  document.head.appendChild(style);
}

/**
 * Clears all existing NPC speech bubbles from the bet matrix.
 * @param {HTMLElement} matrixEl — #tr-bet-matrix
 */
function clearBubbles(matrixEl) {
  if (!matrixEl) return;
  matrixEl.querySelectorAll('.tr-npc-bubble').forEach(function (el) {
    if (el.parentNode) el.parentNode.removeChild(el);
  });
}

/**
 * Renders NPC speech bubbles above the appropriate seat columns in the bet matrix.
 *
 * Strategy: find `.tr-matrix-cell[data-seat="N"]` cells — use the first
 * (top-most in DOM order, i.e. playerPair row) as the anchor and append an
 * absolutely-positioned bubble to it.
 *
 * One bubble per seat — if a seat has multiple requests, only the first is shown.
 *
 * @param {HTMLElement|null} matrixEl       — #tr-bet-matrix container
 * @param {object[]}         npcRequestQueue — from state.npcRequestQueue
 */
export function renderNpcSpeechBubbles(matrixEl, npcRequestQueue) {
  if (!matrixEl) return;

  ensureStyles();
  clearBubbles(matrixEl);

  if (!Array.isArray(npcRequestQueue) || npcRequestQueue.length === 0) return;

  // One bubble per seat — deduplicate by seatId
  const seen = Object.create(null);
  npcRequestQueue.forEach(function (req) {
    if (req && req.seatId != null && !seen[req.seatId]) {
      seen[req.seatId] = req;
    }
  });

  Object.values(seen).forEach(function (req) {
    // Anchor to the top-most cell for this seat in the matrix
    const anchor = matrixEl.querySelector('.tr-matrix-cell[data-seat="' + req.seatId + '"]');
    if (!anchor) return;

    const bubble = document.createElement('div');
    bubble.className = 'tr-npc-bubble';
    bubble.setAttribute('data-npc-seat', String(req.seatId));
    bubble.textContent = req.label || req.type || '?';
    anchor.appendChild(bubble);
  });
}

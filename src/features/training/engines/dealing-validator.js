// dealing-validator.js — validates dealer card drop against expected baccarat procedure
// Pure module: no DOM, no state mutation, no side effects
// Returns { valid, errorCode, message } for every card drop attempt
// TODO[Phase7]: implement validateCardDrop with all error codes below

import { handTotal, isNatural, playerDraws, bankerDraws } from './baccarat-engine.js';
import { cardValue } from './shoe-engine.js';

// ---------------------------------------------------------------------------
// Error code catalogue
// ---------------------------------------------------------------------------
export const DEAL_ERRORS = Object.freeze({
  WRONG_ZONE_DEAL1:   'WRONG_ZONE_DEAL1',
  WRONG_ZONE_DEAL2:   'WRONG_ZONE_DEAL2',
  WRONG_ZONE_DEAL3:   'WRONG_ZONE_DEAL3',
  WRONG_ZONE_DEAL4:   'WRONG_ZONE_DEAL4',
  NATURAL_STOP_P3:    'NATURAL_STOP_P3',
  NO_DRAW_P3:         'NO_DRAW_P3',
  WRONG_ZONE_P3:      'WRONG_ZONE_P3',
  BANKER_NO_DRAW:     'BANKER_NO_DRAW',
  WRONG_ZONE_B3:      'WRONG_ZONE_B3',
  TOO_MANY_CARDS_P:   'TOO_MANY_CARDS_P',
  TOO_MANY_CARDS_B:   'TOO_MANY_CARDS_B'
});

// Human-readable messages for each error code
// Messages must explain the procedural reason, not just what is wrong
const MESSAGES = {
  [DEAL_ERRORS.WRONG_ZONE_DEAL1]:
    'Lá 1 phải đưa cho Player trước. Thứ tự chuẩn: Player → Banker → Player → Banker.',
  [DEAL_ERRORS.WRONG_ZONE_DEAL2]:
    'Lá 2 phải đưa cho Banker. Thứ tự chuẩn: Player → Banker → Player → Banker.',
  [DEAL_ERRORS.WRONG_ZONE_DEAL3]:
    'Lá 3 phải đưa cho Player. Thứ tự chuẩn: Player → Banker → Player → Banker.',
  [DEAL_ERRORS.WRONG_ZONE_DEAL4]:
    'Lá 4 phải đưa cho Banker. Thứ tự chuẩn: Player → Banker → Player → Banker.',
  [DEAL_ERRORS.NATURAL_STOP_P3]:
    'Không được phát lá thứ 3 — một hoặc cả hai tay đều có Natural (8 hoặc 9 từ 2 lá đầu). Phải lật bài ngay.',
  [DEAL_ERRORS.NO_DRAW_P3]:
    'Player không rút lá thứ 3 — tổng {total} điểm (6 hoặc 7 là Stand). Phải chuyển sang đánh giá Banker.',
  [DEAL_ERRORS.WRONG_ZONE_P3]:
    'Lá thứ 3 của Player phải đặt vào ô Player, không phải Banker.',
  [DEAL_ERRORS.BANKER_NO_DRAW]:
    'Banker không rút lá thứ 3 theo luật bài — Banker tổng {bTotal} với lá P3 = {p3val}. Phải lật bài (Reveal).',
  [DEAL_ERRORS.WRONG_ZONE_B3]:
    'Lá thứ 3 của Banker phải đặt vào ô Banker, không phải Player.',
  [DEAL_ERRORS.TOO_MANY_CARDS_P]:
    'Player đã có đủ 3 lá bài. Không thể phát thêm cho Player.',
  [DEAL_ERRORS.TOO_MANY_CARDS_B]:
    'Banker đã có đủ 3 lá bài. Không thể phát thêm cho Banker.'
};

function formatMessage(code, ctx = {}) {
  let msg = MESSAGES[code] || code;
  Object.keys(ctx).forEach(function (key) {
    msg = msg.replace('{' + key + '}', ctx[key]);
  });
  return msg;
}

function ok() { return { valid: true, errorCode: null, message: null }; }
function err(code, ctx) { return { valid: false, errorCode: code, message: formatMessage(code, ctx) }; }

// ---------------------------------------------------------------------------
// Main validator
// ---------------------------------------------------------------------------

/**
 * Validates whether a card drop to targetZone is procedurally correct.
 *
 * @param {string} phase         - Current PHASES value (e.g. 'deal-1', 'draw-p3')
 * @param {string} targetZone    - Drop target: 'player' | 'banker'
 * @param {object[]} pCards      - Current player hand cards
 * @param {object[]} bCards      - Current banker hand cards
 * @param {object|null} _result  - Round result if already resolved (null during dealing)
 * @returns {{ valid: boolean, errorCode: string|null, message: string|null }}
 */
export function validateCardDrop(phase, targetZone, pCards, bCards, _result) {
  // TODO[Phase7]: implement each case below
  // Each case must:
  // 1. Check if targetZone is correct for this phase
  // 2. Check if dealing is even allowed (natural stop, too many cards, etc.)
  // 3. Return ok() on success or err(DEAL_ERRORS.XXX, context) on failure

  switch (phase) {
    case 'deal-1':
      // TODO[Phase7]: lá 1 must go to player
      if (targetZone !== 'player') return err(DEAL_ERRORS.WRONG_ZONE_DEAL1);
      return ok();

    case 'deal-2':
      // TODO[Phase7]: lá 2 must go to banker
      if (targetZone !== 'banker') return err(DEAL_ERRORS.WRONG_ZONE_DEAL2);
      return ok();

    case 'deal-3':
      // TODO[Phase7]: lá 3 must go to player
      if (targetZone !== 'player') return err(DEAL_ERRORS.WRONG_ZONE_DEAL3);
      return ok();

    case 'deal-4':
      // TODO[Phase7]: lá 4 must go to banker
      if (targetZone !== 'banker') return err(DEAL_ERRORS.WRONG_ZONE_DEAL4);
      return ok();

    case 'draw-p3': {
      // TODO[Phase7]:
      // 1. Check if either hand is natural → NATURAL_STOP_P3
      // 2. Check if player should draw (playerDraws) → if not, NO_DRAW_P3 with total
      // 3. Check targetZone === 'player' → if not, WRONG_ZONE_P3
      const pTotal = handTotal(pCards);
      const bTotal = handTotal(bCards);
      if (isNatural(pTotal) || isNatural(bTotal)) return err(DEAL_ERRORS.NATURAL_STOP_P3);
      if (!playerDraws(pTotal)) return err(DEAL_ERRORS.NO_DRAW_P3, { total: pTotal });
      if (pCards.length >= 3) return err(DEAL_ERRORS.TOO_MANY_CARDS_P);
      if (targetZone !== 'player') return err(DEAL_ERRORS.WRONG_ZONE_P3);
      return ok();
    }

    case 'draw-b3': {
      // TODO[Phase7]:
      // 1. Check bCards.length < 3 → if already 3, TOO_MANY_CARDS_B
      // 2. Determine if banker should draw (bankerDraws with player 3rd card context)
      //    If player drew 3rd: use pCards[2].rank value
      //    If player did NOT draw (only 2 cards): use bankerDraws(bTotal, false, null)
      //    If banker should NOT draw → BANKER_NO_DRAW
      // 3. Check targetZone === 'banker' → if not, WRONG_ZONE_B3
      if (bCards.length >= 3) return err(DEAL_ERRORS.TOO_MANY_CARDS_B);
      const bTotal = handTotal(bCards);
      const playerDrewThird = pCards.length === 3;
      const p3val = playerDrewThird ? cardValue(pCards[2].rank) : null;
      if (!bankerDraws(bTotal, playerDrewThird, p3val)) {
        return err(DEAL_ERRORS.BANKER_NO_DRAW, { bTotal, p3val: p3val ?? '—' });
      }
      if (targetZone !== 'banker') return err(DEAL_ERRORS.WRONG_ZONE_B3);
      return ok();
    }

    default:
      // Dealing not expected in this phase — should be caught by phase guard upstream
      return err('INVALID_PHASE', {});
  }
}

// payout-validator.js — validates chip amounts during manual dealer payment
// Pure module: no DOM, no state mutation
// Used in Phase9 (chip drag-and-drop settlement)
// TODO[Phase9]: implement all functions below

// Chip denomination unit — amounts must be multiples of this
// Match the existing chip tray denominations in training-controller.js
export const CHIP_UNIT = 5000;

/**
 * Validates how much the dealer has paid to a winning seat so far.
 *
 * @param {number} seatId           - Seat being paid (1-5, for error messages)
 * @param {number} paidSoFar        - Total chips dragged to this seat so far
 * @param {number} expectedPayout   - Amount the seat should receive (net of commission)
 * @returns {{ correct: boolean, remaining: number, overpaid: number, message: string|null }}
 */
export function validatePaidAmount(seatId, paidSoFar, expectedPayout) {
  // TODO[Phase9]: implement
  // correct = paidSoFar === expectedPayout
  // remaining = expectedPayout - paidSoFar (if > 0)
  // overpaid = paidSoFar - expectedPayout (if > 0)
  // message = null if correct, descriptive string if not
  void seatId;

  const remaining = Math.max(0, expectedPayout - paidSoFar);
  const overpaid  = Math.max(0, paidSoFar - expectedPayout);
  const correct   = remaining === 0 && overpaid === 0;

  return {
    correct,
    remaining,
    overpaid,
    message: correct
      ? null
      : overpaid > 0
        ? `Seat ${seatId}: Thừa ${overpaid.toLocaleString()} — cần thu lại.`
        : `Seat ${seatId}: Còn thiếu ${remaining.toLocaleString()}.`
  };
}

/**
 * Validates how much the dealer has collected from a losing seat so far.
 *
 * @param {number} seatId           - Seat being collected from (1-5)
 * @param {number} collectedSoFar   - Total chips dragged from seat to tray so far
 * @param {number} expectedDebt     - Total bet amount that must be collected
 * @returns {{ correct: boolean, remaining: number, message: string|null }}
 */
export function validateCollectedAmount(seatId, collectedSoFar, expectedDebt) {
  // TODO[Phase9]: implement
  void seatId;

  const remaining = Math.max(0, expectedDebt - collectedSoFar);
  const correct   = remaining === 0;

  return {
    correct,
    remaining,
    message: correct
      ? null
      : `Seat ${seatId}: Chưa thu đủ — còn ${remaining.toLocaleString()} cần thu về tray.`
  };
}

/**
 * Validates that a chip denomination is valid (matches an existing chip in the tray).
 *
 * @param {number} denomination   - Denomination being dragged
 * @param {number[]} validChips   - Array of valid chip denominations
 * @returns {boolean}
 */
export function isValidDenomination(denomination, validChips) {
  // TODO[Phase9]: implement — check denomination exists in validChips array
  return validChips.includes(denomination);
}

/**
 * Given expected payout, returns the suggested chip breakdown.
 * Used as a hint display for the dealer (not enforced).
 *
 * @param {number} amount         - Amount to break down
 * @param {number[]} chipValues   - Available denominations, sorted descending
 * @returns {{ denomination: number, count: number }[]}
 */
export function suggestChipBreakdown(amount, chipValues) {
  // TODO[Phase9]: greedy breakdown — largest denomination first
  const result = [];
  let remaining = amount;
  for (const val of chipValues.slice().sort((a, b) => b - a)) {
    const count = Math.floor(remaining / val);
    if (count > 0) {
      result.push({ denomination: val, count });
      remaining -= val * count;
    }
  }
  return result;
}

/**
 * Checks whether the full settlement for all seats is complete.
 * All winning seats must be fully paid, all losing seats fully collected.
 *
 * @param {object[]} settlementRows   - From settlement-engine.settleRound
 * @param {object} chipsPaidBySeat    - { [seatId]: amountPaid }
 * @param {object} chipsCollectedBySeat - { [seatId]: amountCollected }
 * @returns {{ complete: boolean, pendingSeatIds: number[] }}
 */
export function isSettlementComplete(settlementRows, chipsPaidBySeat, chipsCollectedBySeat) {
  // TODO[Phase9]: implement
  // For each row:
  //   if creditAmount > 0 (winning): check chipsPaidBySeat[seatId] === creditAmount
  //   if totalBet > 0 and outcome === 'LOSE': check chipsCollectedBySeat[seatId] === totalBet
  const pendingSeatIds = [];

  for (const row of settlementRows) {
    if (!row) continue;
    const paid      = chipsPaidBySeat[row.seatId] || 0;
    const collected = chipsCollectedBySeat[row.seatId] || 0;

    if (row.creditAmount > 0 && paid < row.creditAmount) {
      pendingSeatIds.push(row.seatId);
    } else if (row.outcome === 'LOSE' && collected < row.totalBet) {
      pendingSeatIds.push(row.seatId);
    }
  }

  return { complete: pendingSeatIds.length === 0, pendingSeatIds };
}

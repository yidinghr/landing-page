import { fmtAmt, fmtBalance } from '../engines/payout-engine.js';

const ZONE_LABELS = {
  playerPair: 'P.Pair',
  player: 'Player',
  tie: 'Tie',
  banker: 'Banker',
  bankerPair: 'B.Pair',
  luckySix: 'Lucky 6'
};

function betsText(row) {
  if (!row.betSummary || !row.betSummary.length) {
    return '-';
  }

  return row.betSummary.map(function (bet) {
    return ZONE_LABELS[bet.zone] + ' ' + fmtBalance(bet.amount);
  }).join(', ');
}

function insuranceText(row) {
  if (!row.insurance) {
    return '-';
  }
  if (!row.insurance.accepted) {
    return row.insurance.offered ? 'Declined' : '-';
  }

  return fmtBalance(row.insurance.amount) + ' / ' + fmtAmt(row.insurance.payout);
}

function actionButton(label, action, seatId, disabled) {
  return [
    '<button type="button" class="tr-settle-action"',
    ' data-settle-action="' + action + '"',
    ' data-seat-id="' + seatId + '"',
    disabled ? ' disabled' : '',
    '>' + label + '</button>'
  ].join('');
}

function chipDirection(row) {
  if (Number(row.creditAmount || 0) > 0) return 'pay';
  if (row.outcome === 'LOSE' && Number(row.totalBet || 0) > 0) return 'collect';
  return null;
}

function chipProgress(row, options) {
  const direction = chipDirection(row);
  if (!direction) return '';

  if (direction === 'pay') {
    const paid = Number(options.chipsPaidBySeat && options.chipsPaidBySeat[row.seatId] || 0);
    const expected = Number(row.creditAmount || 0);
    const cls = paid >= expected ? ' tr-procedure-pill--ok' : '';
    return '<span class="tr-procedure-pill' + cls + '">Pay ' + fmtBalance(paid) + ' / ' + fmtBalance(expected) + '</span>';
  }

  const collected = Number(options.chipsCollectedBySeat && options.chipsCollectedBySeat[row.seatId] || 0);
  const expected = Number(row.totalBet || 0);
  const cls = collected >= expected ? ' tr-procedure-pill--ok' : '';
  return '<span class="tr-procedure-pill' + cls + '" data-chip-source="seat-' + row.seatId + '" title="Select a chip, then drag from this pill back to the tray">Collect ' + fmtBalance(collected) + ' / ' + fmtBalance(expected) + '</span>';
}

function procedureCell(row, options) {
  const canAct = Boolean(options.canUseDealerActions);
  const collected = Boolean(options.collectedCommissions && options.collectedCommissions[row.seatId]);
  const changeAcked = Boolean(options.acknowledgedChange && options.acknowledgedChange[row.seatId]);
  const parts = [];
  const progress = chipProgress(row, options);

  if (progress) parts.push(progress);

  if (row.commission > 0) {
    parts.push(collected
      ? '<span class="tr-procedure-pill tr-procedure-pill--ok">Commission collected</span>'
      : actionButton('Collect Commission', 'collect-commission', row.seatId, !canAct));
  }

  if (row.change && row.change.required) {
    parts.push(changeAcked
      ? '<span class="tr-procedure-pill tr-procedure-pill--ok">Change acknowledged</span>'
      : actionButton('Ack short ' + fmtBalance(row.change.shortAmount), 'ack-change', row.seatId, !canAct));
  }

  if (row.wrongPayout && row.wrongPayout.seeded) {
    parts.push(row.wrongPayout.caught
      ? '<span class="tr-procedure-pill tr-procedure-pill--catch">Corrected</span>'
      : actionButton('Correct', 'correct-payout', row.seatId, !canAct));
  }

  return parts.length ? parts.join('') : '-';
}

export function renderSettlementBoard(host, settlement, options = {}) {
  if (!host) return;
  if (!settlement) {
    host.hidden = true;
    host.innerHTML = '';
    return;
  }

  const rows = settlement.seats.map(function (row) {
    const rowClass = row.net > 0
      ? ' tr-settle-row--win'
      : row.net < 0 ? ' tr-settle-row--lose' : '';
    const direction = chipDirection(row);
    const chipAttrs = direction === 'pay'
      ? ' data-chip-zone="seat-' + row.seatId + '" data-chip-direction="pay" title="Drop chips here to pay this seat"'
      : '';
    const displayPayout = row.wrongPayout && row.wrongPayout.seeded && !row.wrongPayout.caught
      ? row.wrongPayout.displayedPayout
      : row.payout;
    const displayNet = row.wrongPayout && row.wrongPayout.seeded && !row.wrongPayout.caught
      ? row.wrongPayout.displayedNet
      : row.net;
    const payoutClass = row.wrongPayout && row.wrongPayout.seeded && !row.wrongPayout.caught
      ? ' tr-settle-col--wrong'
      : '';

    return [
      '<div class="tr-settle-row' + rowClass + '"' + chipAttrs + '>',
      '<span><strong>Seat ' + row.seatId + '</strong></span>',
      '<span>' + betsText(row) + '</span>',
      '<span>' + fmtBalance(row.totalBet) + '</span>',
      '<span>' + row.outcome + '</span>',
      '<span class="' + payoutClass.trim() + '">' + fmtAmt(displayPayout) + '</span>',
      '<span>' + (row.commission ? fmtBalance(row.commission) : '-') + '</span>',
      '<span>' + insuranceText(row) + '</span>',
      '<span class="tr-settle-col--net' + payoutClass + '">' + fmtAmt(displayNet) + '</span>',
      '<span class="tr-settle-col--procedure">' + procedureCell(row, options) + '</span>',
      '</div>'
    ].join('');
  }).join('');

  host.innerHTML = [
    '<div class="tr-settle">',
    '<div class="tr-settle__head">',
    '<span>Seat</span>',
    '<span>Bets</span>',
    '<span>Total</span>',
    '<span>Outcome</span>',
    '<span>Payout</span>',
    '<span>Comm.</span>',
    '<span>Ins.</span>',
    '<span>Net</span>',
    '<span>Procedure</span>',
    '</div>',
    rows,
    '</div>'
  ].join('');
  host.hidden = false;
}

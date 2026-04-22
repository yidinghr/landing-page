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

function procedureCell(row, options) {
  const canAct = Boolean(options.canUseDealerActions);
  const collected = Boolean(options.collectedCommissions && options.collectedCommissions[row.seatId]);
  const changeAcked = Boolean(options.acknowledgedChange && options.acknowledgedChange[row.seatId]);
  const parts = [];

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
      '<div class="tr-settle-row' + rowClass + '">',
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

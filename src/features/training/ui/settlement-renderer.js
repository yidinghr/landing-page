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
  if (!row.insurance || !row.insurance.accepted) {
    return '-';
  }

  return fmtBalance(row.insurance.amount) + ' / ' + fmtAmt(row.insurance.payout);
}

export function renderSettlementBoard(host, settlement) {
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

    return [
      '<div class="tr-settle-row' + rowClass + '">',
      '<span><strong>Seat ' + row.seatId + '</strong></span>',
      '<span>' + betsText(row) + '</span>',
      '<span>' + fmtBalance(row.totalBet) + '</span>',
      '<span>' + row.outcome + '</span>',
      '<span>' + fmtAmt(row.payout) + '</span>',
      '<span>' + (row.commission ? fmtBalance(row.commission) : '-') + '</span>',
      '<span>' + insuranceText(row) + '</span>',
      '<span class="tr-settle-col--net">' + fmtAmt(row.net) + '</span>',
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
    '</div>',
    rows,
    '</div>'
  ].join('');
  host.hidden = false;
}

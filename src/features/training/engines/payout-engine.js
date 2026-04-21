// Pure payout calculation — no state, no DOM

export function calcPayout(bets, result, rules) {
  const out = {};

  // Player: 1:1, push on tie
  if (bets.player) {
    if (result.winner === 'player')      out.player = bets.player;
    else if (result.winner === 'tie')    out.player = 0;
    else                                 out.player = -bets.player;
  }

  // Banker: 1:1 minus commission, push on tie
  if (bets.banker) {
    if (result.winner === 'banker') {
      const comm = Math.ceil(bets.banker * rules.bankerCommission);
      out.banker = bets.banker - comm;
      out.commission = comm;
    } else if (result.winner === 'tie') {
      out.banker = 0;
    } else {
      out.banker = -bets.banker;
    }
  }

  // Tie: tiePayout:1 win, else lose
  if (bets.tie) {
    out.tie = result.winner === 'tie'
      ? bets.tie * rules.tiePayout
      : -bets.tie;
  }

  // Player Pair: 11:1 win, else lose
  if (bets.playerPair) {
    out.playerPair = result.pPair
      ? bets.playerPair * rules.playerPairPayout
      : -bets.playerPair;
  }

  // Banker Pair: 11:1 win, else lose
  if (bets.bankerPair) {
    out.bankerPair = result.bPair
      ? bets.bankerPair * rules.bankerPairPayout
      : -bets.bankerPair;
  }

  // Lucky Six side bet
  if (bets.luckySix) {
    if      (result.luckySix === '2-card') out.luckySix = bets.luckySix * rules.luckySix2CardPayout;
    else if (result.luckySix === '3-card') out.luckySix = bets.luckySix * rules.luckySix3CardPayout;
    else                                   out.luckySix = -bets.luckySix;
  }

  // Net profit/loss across all bets
  out.net = ['player', 'banker', 'tie', 'playerPair', 'bankerPair', 'luckySix']
    .reduce((s, k) => s + (out[k] || 0), 0);

  return out;
}

export function betTotal(bets) {
  return Object.values(bets).reduce((s, v) => s + v, 0);
}

export function fmtAmt(n) {
  if (n === 0) return 'PUSH';
  const sign = n > 0 ? '+' : '';
  return sign + n.toLocaleString();
}

export function fmtBalance(n) {
  return n.toLocaleString();
}

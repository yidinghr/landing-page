// Pure probability & statistics — no state, no DOM
import { RANKS, cardValue } from './shoe-engine.js';

// ---------------------------------------------------------------------------
// Phase5: Live probability after any dealt card state
// ---------------------------------------------------------------------------

/**
 * Estimates win probabilities from current shoe composition.
 * Call this after every dealOne() to update live probability bar.
 * All values are approximations — sufficient for training display.
 *
 * @param {object} shoe - current shoe state (any point mid-round or between rounds)
 * @returns {{ banker: number, player: number, tie: number,
 *             bankerPair: number, playerPair: number, luckySix: number }}
 */
export function probFromShoe(shoe) {
  // TODO[Phase5]: implement
  // Use shoeValueCounts() and approxNaturalRate() already in this file.
  // Approximate method:
  //   player: base rate ~44.6% adjusted by zero-card count (tens) in shoe
  //   banker: base rate ~45.8% adjusted similarly
  //   tie:    base rate ~9.5% — decreases as zeros (10-value cards) are removed
  //   bankerPair/playerPair: use approxPairRate().sidePairRate for each hand
  //   luckySix: approximate as P(banker wins with 6) ≈ count(6-value remaining) / total * ~0.5

  const counts = shoeValueCounts(shoe);
  const total  = counts.reduce(function (s, n) { return s + n; }, 0);

  if (total < 10) {
    return { banker: 0.458, player: 0.446, tie: 0.095, bankerPair: 0.075, playerPair: 0.075, luckySix: 0.05 };
  }

  // Density of zero-value cards (10, J, Q, K) affects outcomes
  const zeroCount   = counts[0];
  const zeroDensity = zeroCount / total;

  // Base rates — shift slightly based on zero density vs expected (16/52 ≈ 0.308 per deck)
  const expectedZero = 0.308;
  const zeroDiff = zeroDensity - expectedZero;

  const bankerProb = Math.max(0.35, Math.min(0.52, 0.4585 - zeroDiff * 0.3));
  const tieProb    = Math.max(0.05, Math.min(0.15, 0.0953 + zeroDiff * 0.1));
  const playerProb = Math.max(0.33, Math.min(0.52, 1 - bankerProb - tieProb));

  const { sidePairRate } = approxPairRate(shoe);

  // Lucky six: rough estimate — banker 6 win rate is ~5% of total rounds
  const sixCount   = counts[6] || 0;
  const luckySix   = Math.min(0.12, (sixCount / Math.max(total, 1)) * 0.8);

  return {
    banker:     bankerProb,
    player:     playerProb,
    tie:        tieProb,
    bankerPair: sidePairRate,
    playerPair: sidePairRate,
    luckySix:   luckySix
  };
}

// Count remaining cards (after shoe.pos) by baccarat value 0-9
export function shoeValueCounts(shoe) {
  const counts = new Array(10).fill(0);
  if (!shoe || !shoe.cards) return counts;
  for (let i = shoe.pos; i < shoe.cards.length; i++) {
    counts[cardValue(shoe.cards[i].rank)]++;
  }
  return counts;
}

// Approximate probability that a random 2-card draw totals 8 or 9
// Uses with-replacement approximation (accurate enough for 8-deck shoe)
export function approxNaturalRate(valueCounts, total) {
  if (total < 4) return 0;
  let p = 0;
  for (let a = 0; a < 10; a++) {
    for (let b = 0; b < 10; b++) {
      if ((a + b) % 10 === 8 || (a + b) % 10 === 9) {
        p += (valueCounts[a] / total) * (valueCounts[b] / total);
      }
    }
  }
  return p;
}

export function shoeRankCounts(shoe) {
  const counts = RANKS.reduce(function (acc, rank) {
    acc[rank] = 0;
    return acc;
  }, {});
  if (!shoe || !shoe.cards) return counts;
  for (let i = shoe.pos; i < shoe.cards.length; i++) {
    counts[shoe.cards[i].rank]++;
  }
  return counts;
}

export function approxPairRate(shoe) {
  const counts = shoeRankCounts(shoe);
  const total = Object.keys(counts).reduce(function (sum, rank) {
    return sum + counts[rank];
  }, 0);
  if (total < 2) {
    return { sidePairRate: 0, anyPairRate: 0 };
  }

  const sidePairRate = Object.keys(counts).reduce(function (sum, rank) {
    const cnt = counts[rank];
    return sum + (cnt / total) * ((cnt - 1) / (total - 1));
  }, 0);

  return {
    sidePairRate: sidePairRate,
    anyPairRate: 1 - Math.pow(1 - sidePairRate, 2)
  };
}

// Aggregate session stats from log array (newest-first)
export function sessionStats(log) {
  const rounds      = log.length;
  const playerWins  = log.filter(function (e) { return e.winner === 'player'; }).length;
  const bankerWins  = log.filter(function (e) { return e.winner === 'banker'; }).length;
  const ties        = log.filter(function (e) { return e.winner === 'tie'; }).length;
  const naturals    = log.filter(function (e) { return e.natural; }).length;
  const pairRounds  = log.filter(function (e) { return e.pPair || e.bPair; }).length;
  const net         = log.reduce(function (s, e) { return s + (e.net || 0); }, 0);
  const latest      = log[0] || null;
  let streakSide    = latest ? latest.winner : null;
  let streakCount   = latest ? 1 : 0;
  let tieDrought    = 0;

  if (latest) {
    for (let i = 1; i < log.length; i++) {
      if (log[i].winner !== streakSide) break;
      streakCount++;
    }
  }

  for (let i = 0; i < log.length; i++) {
    if (log[i].winner === 'tie') break;
    tieDrought++;
  }

  return {
    rounds,
    playerWins,
    bankerWins,
    ties,
    naturals,
    pairRounds,
    streakSide,
    streakCount,
    tieDrought,
    net
  };
}

export function fmtPct(n, total) {
  if (!total) return '—';
  return Math.round(n / total * 100) + '%';
}

export function fmtNet(n) {
  if (n === 0) return '±0';
  return (n > 0 ? '+' : '') + n.toLocaleString();
}

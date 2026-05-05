// Pure probability & statistics — no state, no DOM
import { RANKS, cardValue } from './shoe-engine.js';

const EXACT_PROB_CACHE = new Map();

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

function cloneCounts(counts) {
  return counts.slice();
}

function removeValue(counts, value) {
  const next = cloneCounts(counts);
  next[value]--;
  return next;
}

function baccaratTotal(values) {
  return values.reduce(function (sum, value) {
    return sum + value;
  }, 0) % 10;
}

function playerNeedsDraw(total) {
  return total <= 5;
}

function bankerNeedsDraw(total, playerThirdValue, playerDrew) {
  if (!playerDrew) return total <= 5;
  if (total <= 2) return true;
  if (total === 3) return playerThirdValue !== 8;
  if (total === 4) return playerThirdValue >= 2 && playerThirdValue <= 7;
  if (total === 5) return playerThirdValue >= 4 && playerThirdValue <= 7;
  if (total === 6) return playerThirdValue === 6 || playerThirdValue === 7;
  return false;
}

function addOutcome(out, pVals, bVals, weight) {
  const pTotal = baccaratTotal(pVals);
  const bTotal = baccaratTotal(bVals);
  if (pTotal > bTotal) out.player += weight;
  else if (bTotal > pTotal) out.banker += weight;
  else out.tie += weight;
  if (bTotal === 6 && bTotal > pTotal) out.luckySix += weight;
}

function scaleOutcome(target, source, weight) {
  target.player += source.player * weight;
  target.banker += source.banker * weight;
  target.tie += source.tie * weight;
  target.luckySix += source.luckySix * weight;
}

function memoKey(valueCounts, pVals, bVals) {
  return valueCounts.join(',') + '|' + pVals.join(',') + '|' + bVals.join(',');
}

function enumerateRoundFromValues(valueCounts, pVals, bVals, weight, out, memo) {
  if (memo) {
    const key = memoKey(valueCounts, pVals, bVals);
    const cached = memo.get(key);
    if (cached) {
      scaleOutcome(out, cached, weight);
      return;
    }

    const unit = { player: 0, banker: 0, tie: 0, luckySix: 0 };
    enumerateRoundFromValues(valueCounts, pVals, bVals, 1, unit, null);
    memo.set(key, unit);
    scaleOutcome(out, unit, weight);
    return;
  }

  const total = valueCounts.reduce(function (sum, count) { return sum + count; }, 0);
  if (weight <= 0) return;

  if (pVals.length < 2 || bVals.length < 2) {
    const nextSide = pVals.length === 0 ? 'p' : bVals.length === 0 ? 'b' : pVals.length === 1 ? 'p' : 'b';
    if (total <= 0) {
      addOutcome(out, pVals, bVals, weight);
      return;
    }
    for (let value = 0; value <= 9; value++) {
      const count = valueCounts[value];
      if (!count) continue;
      const probability = count / total;
      if (nextSide === 'p') {
        enumerateRoundFromValues(removeValue(valueCounts, value), pVals.concat(value), bVals, weight * probability, out, memo);
      } else {
        enumerateRoundFromValues(removeValue(valueCounts, value), pVals, bVals.concat(value), weight * probability, out, memo);
      }
    }
    return;
  }

  const pTwoCardTotal = baccaratTotal(pVals.slice(0, 2));
  const bTwoCardTotal = baccaratTotal(bVals.slice(0, 2));
  if (pVals.length === 2 && bVals.length === 2 && (pTwoCardTotal >= 8 || bTwoCardTotal >= 8)) {
    addOutcome(out, pVals, bVals, weight);
    return;
  }

  if (pVals.length < 3 && playerNeedsDraw(pTwoCardTotal)) {
    if (total <= 0) {
      addOutcome(out, pVals, bVals, weight);
      return;
    }
    for (let value = 0; value <= 9; value++) {
      const count = valueCounts[value];
      if (!count) continue;
      enumerateRoundFromValues(removeValue(valueCounts, value), pVals.concat(value), bVals, weight * (count / total), out, memo);
    }
    return;
  }

  const playerDrew = pVals.length >= 3;
  const playerThirdValue = playerDrew ? pVals[2] : null;
  if (bVals.length < 3 && bankerNeedsDraw(bTwoCardTotal, playerThirdValue, playerDrew)) {
    if (total <= 0) {
      addOutcome(out, pVals, bVals, weight);
      return;
    }
    for (let value = 0; value <= 9; value++) {
      const count = valueCounts[value];
      if (!count) continue;
      enumerateRoundFromValues(removeValue(valueCounts, value), pVals, bVals.concat(value), weight * (count / total), out, memo);
    }
    return;
  }

  addOutcome(out, pVals, bVals, weight);
}

function sidePairProbability(shoe, currentCards) {
  const known = Array.isArray(currentCards) ? currentCards.slice(0, 2) : [];
  const rankCounts = shoeRankCounts(shoe);
  const total = Object.keys(rankCounts).reduce(function (sum, rank) {
    return sum + rankCounts[rank];
  }, 0);

  if (known.length >= 2) return known[0].rank === known[1].rank ? 1 : 0;
  if (known.length === 1) {
    if (total <= 0) return 0;
    return (rankCounts[known[0].rank] || 0) / total;
  }
  if (total < 2) return 0;
  return Object.keys(rankCounts).reduce(function (sum, rank) {
    const count = rankCounts[rank];
    return sum + (count / total) * ((count - 1) / (total - 1));
  }, 0);
}

function solveRound(valueCounts, pVals, bVals, memo) {
  const key = memoKey(valueCounts, pVals, bVals);
  const cached = memo.get(key);
  if (cached) return cached;

  const out = { player: 0, banker: 0, tie: 0, luckySix: 0 };
  const total = valueCounts.reduce(function (sum, count) { return sum + count; }, 0);

  if (pVals.length < 2 || bVals.length < 2) {
    const nextSide = pVals.length === 0 ? 'p' : bVals.length === 0 ? 'b' : pVals.length === 1 ? 'p' : 'b';
    if (total <= 0) {
      addOutcome(out, pVals, bVals, 1);
    } else {
      for (let value = 0; value <= 9; value++) {
        const count = valueCounts[value];
        if (!count) continue;
        const child = nextSide === 'p'
          ? solveRound(removeValue(valueCounts, value), pVals.concat(value), bVals, memo)
          : solveRound(removeValue(valueCounts, value), pVals, bVals.concat(value), memo);
        scaleOutcome(out, child, count / total);
      }
    }
    memo.set(key, out);
    return out;
  }

  const pTwoCardTotal = baccaratTotal(pVals.slice(0, 2));
  const bTwoCardTotal = baccaratTotal(bVals.slice(0, 2));
  if (pVals.length === 2 && bVals.length === 2 && (pTwoCardTotal >= 8 || bTwoCardTotal >= 8)) {
    addOutcome(out, pVals, bVals, 1);
    memo.set(key, out);
    return out;
  }

  if (pVals.length < 3 && playerNeedsDraw(pTwoCardTotal)) {
    if (total <= 0) {
      addOutcome(out, pVals, bVals, 1);
    } else {
      for (let value = 0; value <= 9; value++) {
        const count = valueCounts[value];
        if (!count) continue;
        scaleOutcome(out, solveRound(removeValue(valueCounts, value), pVals.concat(value), bVals, memo), count / total);
      }
    }
    memo.set(key, out);
    return out;
  }

  const playerDrew = pVals.length >= 3;
  const playerThirdValue = playerDrew ? pVals[2] : null;
  if (bVals.length < 3 && bankerNeedsDraw(bTwoCardTotal, playerThirdValue, playerDrew)) {
    if (total <= 0) {
      addOutcome(out, pVals, bVals, 1);
    } else {
      for (let value = 0; value <= 9; value++) {
        const count = valueCounts[value];
        if (!count) continue;
        scaleOutcome(out, solveRound(removeValue(valueCounts, value), pVals, bVals.concat(value), memo), count / total);
      }
    }
    memo.set(key, out);
    return out;
  }

  addOutcome(out, pVals, bVals, 1);
  memo.set(key, out);
  return out;
}

/**
 * Exact conditional probabilities for the next baccarat result from the
 * current shoe composition and any already-dealt cards in the active round.
 */
export function exactBaccaratProbabilities(shoe, pCards = [], bCards = []) {
  const valueCounts = shoeValueCounts(shoe);
  const pVals = (pCards || []).map(function (card) { return cardValue(card.rank); }).slice(0, 3);
  const bVals = (bCards || []).map(function (card) { return cardValue(card.rank); }).slice(0, 3);
  const pRankKey = (pCards || []).slice(0, 2).map(function (card) { return card.rank; }).join(',');
  const bRankKey = (bCards || []).slice(0, 2).map(function (card) { return card.rank; }).join(',');
  const cacheKey = valueCounts.join(',') + '|pv=' + pVals.join(',') + '|bv=' + bVals.join(',') + '|pr=' + pRankKey + '|br=' + bRankKey;
  const cached = EXACT_PROB_CACHE.get(cacheKey);
  if (cached) return cached;

  const out = { player: 0, banker: 0, tie: 0, playerPair: 0, bankerPair: 0, pair: 0, luckySix: 0 };

  scaleOutcome(out, solveRound(valueCounts, pVals, bVals, new Map()), 1);
  out.playerPair = sidePairProbability(shoe, pCards);
  out.bankerPair = sidePairProbability(shoe, bCards);
  out.pair = 1 - ((1 - out.playerPair) * (1 - out.bankerPair));
  if (EXACT_PROB_CACHE.size > 200) EXACT_PROB_CACHE.clear();
  EXACT_PROB_CACHE.set(cacheKey, out);
  return out;
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

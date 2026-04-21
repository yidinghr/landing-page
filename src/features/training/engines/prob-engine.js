// Pure probability & statistics — no state, no DOM
import { cardValue } from './shoe-engine.js';

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

// Aggregate session stats from log array (newest-first)
export function sessionStats(log) {
  const rounds      = log.length;
  const playerWins  = log.filter(function (e) { return e.winner === 'player'; }).length;
  const bankerWins  = log.filter(function (e) { return e.winner === 'banker'; }).length;
  const ties        = log.filter(function (e) { return e.winner === 'tie'; }).length;
  const naturals    = log.filter(function (e) { return e.natural; }).length;
  const net         = log.reduce(function (s, e) { return s + (e.net || 0); }, 0);
  return { rounds, playerWins, bankerWins, ties, naturals, net };
}

export function fmtPct(n, total) {
  if (!total) return '—';
  return Math.round(n / total * 100) + '%';
}

export function fmtNet(n) {
  if (n === 0) return '±0';
  return (n > 0 ? '+' : '') + n.toLocaleString();
}

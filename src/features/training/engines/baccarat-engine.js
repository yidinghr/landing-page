import { cardValue } from './shoe-engine.js';

export function handTotal(cards) {
  return cards.reduce((s, c) => (s + cardValue(c.rank)) % 10, 0);
}

export function isNatural(t) { return t === 8 || t === 9; }

export function isPair(cards) {
  return cards.length >= 2 && cards[0].rank === cards[1].rank;
}

// Player draws on 0–5, stands on 6–7
export function playerDraws(t) { return t <= 5; }

// Banker third-card rule (standard baccarat)
export function bankerDraws(bt, playerDrewThird, pThirdVal) {
  if (!playerDrewThird) return bt <= 5;
  if (bt <= 2) return true;
  if (bt === 3) return pThirdVal !== 8;
  if (bt === 4) return pThirdVal >= 2 && pThirdVal <= 7;
  if (bt === 5) return pThirdVal >= 4 && pThirdVal <= 7;
  if (bt === 6) return pThirdVal === 6 || pThirdVal === 7;
  return false; // bt === 7: always stand
}

export function resolveRound(pCards, bCards) {
  const p = handTotal(pCards);
  const b = handTotal(bCards);
  const winner = p > b ? 'player' : b > p ? 'banker' : 'tie';

  const pNatural = isNatural(handTotal(pCards.slice(0, 2)));
  const bNatural = isNatural(handTotal(bCards.slice(0, 2)));

  let luckySix = null;
  if (winner === 'banker' && b === 6) {
    luckySix = bCards.length === 2 ? '2-card' : '3-card';
  }

  return {
    winner, pTotal: p, bTotal: b,
    pNatural, bNatural,
    pPair: isPair(pCards),
    bPair: isPair(bCards),
    luckySix
  };
}

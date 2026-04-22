export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const SUITS = ['H', 'D', 'C', 'S'];
export const SUIT_SYMBOL = { H: '♥', D: '♦', C: '♣', S: '♠' };
const DECK_COUNT = 8;

export function cardValue(rank) {
  if (rank === 'A') return 1;
  if (rank === '10' || rank === 'J' || rank === 'Q' || rank === 'K') return 0;
  return parseInt(rank, 10);
}

function buildDeck() {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) cards.push({ suit, rank });
  }
  return cards;
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function normalizeCutRatio(value) {
  const ratio = Number(value);
  if (!Number.isFinite(ratio)) return null;
  return Math.min(0.8, Math.max(0.2, ratio));
}

export function initShoe(options = {}) {
  const raw = [];
  for (let d = 0; d < DECK_COUNT; d++) raw.push(...buildDeck());
  const cards = shuffled(raw);

  // Cut between 1/3 and 2/3 of shoe
  const configuredCut = normalizeCutRatio(options.cutAtRatio);
  const cutAtRatio = configuredCut || (1 / 3 + Math.random() / 3);
  const cutAt = Math.floor(cards.length * cutAtRatio);
  const cut = [...cards.slice(cutAt), ...cards.slice(0, cutAt)];

  // Burn: first card reveals how many extra cards to burn (face cards = 10)
  const burnCard = cut[0];
  const burnExtraCount = cardValue(burnCard.rank) || 10;
  const startPos = 1 + burnExtraCount;

  return {
    cards: cut,
    pos: startPos,
    total: cut.length,
    burnCard: burnCard,
    burnCount: startPos,
    cutAtRatio: cutAtRatio
  };
}

export function dealOne(shoe) {
  if (shoe.pos >= shoe.cards.length) return { card: null, shoe };
  return { card: shoe.cards[shoe.pos], shoe: { ...shoe, pos: shoe.pos + 1 } };
}

export function shoeRemaining(shoe) {
  return shoe.total - shoe.pos;
}

export function shoePct(shoe) {
  return Math.round((shoeRemaining(shoe) / shoe.total) * 100);
}

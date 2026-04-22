export const SHOE_PRESETS = Object.freeze({
  random: Object.freeze({
    id: 'random',
    name: 'Random shoe',
    cards: null
  }),
  bankerHeavy: Object.freeze({
    id: 'bankerHeavy',
    name: 'Banker natural drill',
    cards: [
      { rank: '2', suit: 'H' },
      { rank: '9', suit: 'S' },
      { rank: '3', suit: 'D' },
      { rank: 'K', suit: 'C' }
    ]
  }),
  playerHeavy: Object.freeze({
    id: 'playerHeavy',
    name: 'Player natural drill',
    cards: [
      { rank: '9', suit: 'H' },
      { rank: '2', suit: 'S' },
      { rank: 'K', suit: 'D' },
      { rank: '3', suit: 'C' }
    ]
  }),
  tieDrill: Object.freeze({
    id: 'tieDrill',
    name: 'Tie drill',
    cards: [
      { rank: '7', suit: 'H' },
      { rank: '4', suit: 'S' },
      { rank: 'K', suit: 'D' },
      { rank: '3', suit: 'C' }
    ]
  }),
  pairDrill: Object.freeze({
    id: 'pairDrill',
    name: 'Pair drill',
    cards: [
      { rank: '8', suit: 'H' },
      { rank: '6', suit: 'S' },
      { rank: '8', suit: 'D' },
      { rank: '2', suit: 'C' }
    ]
  }),
  luckySixDrill: Object.freeze({
    id: 'luckySixDrill',
    name: 'Lucky 6 drill',
    cards: [
      { rank: '2', suit: 'H' },
      { rank: 'A', suit: 'S' },
      { rank: '3', suit: 'D' },
      { rank: '2', suit: 'C' },
      { rank: 'K', suit: 'H' },
      { rank: '3', suit: 'S' }
    ]
  })
});

export function applyShoePreset(shoe, presetId) {
  const preset = SHOE_PRESETS[presetId] || SHOE_PRESETS.random;
  if (!preset.cards || !preset.cards.length || !shoe || !Array.isArray(shoe.cards)) {
    return {
      ...shoe,
      presetId: preset.id
    };
  }

  const cards = shoe.cards.slice();
  preset.cards.forEach(function (card, index) {
    const target = shoe.pos + index;
    if (target < cards.length) {
      cards[target] = { ...card };
    }
  });

  return {
    ...shoe,
    cards: cards,
    presetId: preset.id
  };
}

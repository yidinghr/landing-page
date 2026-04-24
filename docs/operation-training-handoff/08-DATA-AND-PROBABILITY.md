# 08 — DATA AND PROBABILITY

How card data flows through the system and how live probability is computed.

---

## 1. Card data model

### Card shape
```js
{ rank: 'A'|'2'|…|'10'|'J'|'Q'|'K', suit: '♠'|'♥'|'♦'|'♣' }
```

### Baccarat value
```js
import { cardValue } from 'src/features/training/engines/shoe-engine.js';
// A=1, 2-9=face, 10/J/Q/K = 0
```

### Shoe shape
```js
{
  cards:     Card[],   // length = decks * 52 (default 8 decks = 416)
  pos:       number,   // index of next undealt card
  burnCount: number,   // cards burned after cut (read from manualCutPct)
  cutPos:    number,   // position of cut card; draws beyond trigger warn
  decks:     number    // 6 or 8
}
```

### Dealing
```js
import { dealOne } from 'src/features/training/engines/shoe-engine.js';
const { shoe, card } = dealOne(prevShoe);   // pure — returns NEW shoe
```

---

## 2. Data flow

```
newShoe click
   ↓
orchestrator.newShoe() → shoe-engine.initShoe(decks, manualCutPct)
   ↓
training-state.setShoe(state, shoe)
   ↓
renderShoe / renderCardCounter / renderStats (all read state.shoe)
```

Per round:
```
handleCardDrop(state, 'player'|'banker')
   ↓
shoe-engine.dealOne(state.shoe) → { shoe, card }
   ↓
training-state.setShoe + setPCards/setBCards
   ↓
advancePhaseAfterDeal → setPhase
   ↓
renderAll (hands + shoe bar + live prob + card counter)
```

After reveal:
```
orchestrator.reveal → baccarat-engine.resolveRound(pCards, bCards, rules)
   ↓
state.result = { winner, pScore, bScore, natural, pPair, bPair, luckySix }
   ↓
orchestrator.settle → settlement-engine.settleRound(seats, result, rules, insuranceStakes)
   ↓
state.settlement = [{seatId, outcome, totalBet, creditAmount, netPayout, commission, …}, …]
```

After round close:
```
addLogEntry({
  round, winner, pScore, bScore, natural,
  pPair, bPair, luckySix, net,
  procedureErrors, procedureCatches
})
// newest first, cap 60
```

---

## 3. Probability computation

### `probFromShoe(shoe)` — located in [engines/prob-engine.js](../../src/features/training/engines/prob-engine.js)

**Approximation strategy** (not exact, sufficient for training display):

1. Count remaining cards by baccarat value 0–9 → `valueCounts[0..9]`.
2. Density of zero-value cards (10/J/Q/K) affects banker/player/tie split.
3. Base rates (from 8-deck fresh shoe): banker ≈ 45.85%, player ≈ 44.62%, tie ≈ 9.53%.
4. As zero-density rises above expected (~30.8% per deck), banker rate drops slightly and tie rate rises.
5. Pair rate (`sidePairRate`) computed exactly from remaining rank counts.
6. Lucky-6 estimated as a function of remaining 6-value density.

**Returns:**
```js
{
  banker:     number,
  player:     number,
  tie:        number,
  bankerPair: number,
  playerPair: number,
  luckySix:   number
}
```

All values in [0, 1]. Clamped to reasonable ranges (`0.35 ≤ banker ≤ 0.52`, etc.).

### When it should be called

Ideally **after every `dealOne` call**, not only on round close. In practice `renderStats` runs on every `renderAll()` tick, which currently happens after every action → works but verify cadence.

For Phase 5 completeness, verify:
- Prob bar re-renders between `deal-2` and `deal-3`.
- Prob bar re-renders after the burn card is dealt on new shoe.
- Prob bar does NOT re-render between renders if shoe hasn't changed (memoize if performance issue).

### Caller contract

`renderLiveProb(host, probs)` accepts the output directly. No further transformation needed.

---

## 4. Card counter

### `buildRemovedCardCounts(shoe)` — [ui/card-counter-renderer.js](../../src/features/training/ui/card-counter-renderer.js)

Iterates `shoe.cards` from `burnCount` to `pos`.
Returns `{ [rank]: removedCount }` for each of 13 ranks.

### `buildRemainingCardCounts(removedCounts)`

Returns `{ [rank]: 32 - removed }` assuming 8-deck shoe (4 suits × 8 decks = 32 per rank).

### Rendering

13 cells in a grid, each showing rank + remaining count with color severity:
- 0 remaining: red (#ef4444)
- 1–8 remaining: orange (#f97316)
- 9–16 remaining: yellow (#eab308)
- >16: gray (#6b7280)

---

## 5. Session stats

`sessionStats(log)` in [engines/prob-engine.js](../../src/features/training/engines/prob-engine.js) returns:

```js
{
  rounds, playerWins, bankerWins, ties,
  naturals, pairRounds,
  streakSide, streakCount,       // current streak
  tieDrought,                    // rounds since last tie
  net                            // running cumulative net payout
}
```

Used by `renderStats` in `table-renderer.js`.

---

## 6. Invariants the probability module must preserve

1. **Pure function.** No DOM, no state. Inputs → output.
2. **Monotonic as shoe drains.** Values should not oscillate randomly between neighboring ticks with no card dealt.
3. **Clamped outputs.** No negative rates, no > 1 rates.
4. **Cheap.** Called on every render — < 1ms even on old hardware. Don't introduce O(n²) per call.
5. **Deterministic.** Same shoe in → same probs out. No randomness.
6. **Robust on empty shoe.** Returns safe defaults when `total < 10`.

---

## 7. If you need more accurate probabilities

The current approximation is intentionally cheap. For higher accuracy:

- **Monte Carlo**: simulate 10k hypothetical rounds on current shoe snapshot. Cost ~10–30ms. Could run on-demand, not every deal.
- **Exact enumeration**: intractable mid-shoe (too many remaining combinations).
- **Lookup tables**: for small remaining shoes (< 100 cards), precompute.

Don't add MC yet — current approximation is within 0.5% of exact for a full shoe and sufficient for training.

---

## 8. Test ideas

- Seed a shoe with only 10s + Js + Qs + Ks → tie probability should be very low (no way to total 8/9).
- Seed a shoe with only 8s and 9s → natural rate should be ~100%.
- Remove all Aces → `bankerPair` and `playerPair` rates should drop.
- Snapshot tests per fixed shoe state for regression.

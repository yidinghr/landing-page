# 06 — REAL TABLE REFERENCE

Reference material for making the simulator match a real casino baccarat table.
Used primarily for **Phase 14 (curved/arc table redesign)** and visual QA.

---

## 1. Physical layout of a real 5-seat baccarat table

```
                        ┌────────────────────────┐
                        │       SHOE + TRAY      │    ← dealer position
                        │   DISCARD      COMMISS │
                        └────────────────────────┘
                         ══════════════════════════
                        /         FELT             \
                       /   ROADMAP STRIP (shared)   \
                      /    ┌──────────────────┐     \
                     /     │  bead / big /    │      \
                    /      │  eye / small /   │       \
                   /       │  cockroach       │        \
                  /        └──────────────────┘         \
                 /                                        \
            ┌───┴───┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┴───┐
            │ Seat1 │  │Seat2│  │Seat3│  │Seat4│  │  Seat5  │
            │ VIP   │  │     │  │     │  │     │  │         │
            └───────┘  └─────┘  └─────┘  └─────┘  └─────────┘
```

Key features:
- **Dealer at top**, seats arced along the bottom.
- **Felt is concave** — card zones for Player and Banker are near the dealer (top-center).
- **Each seat has its own betting area** painted on the felt directly in front of the seat: Player / Banker / Tie / P-Pair / B-Pair / Lucky-6.
- **Roadmap strip** is a separate panel/display visible to all seats, usually above or behind the table.
- **Chip tray** is in front of the dealer only; staff insurance tray (if present) is separate and smaller, often to the side.
- **Discard holder** to dealer's left; commission box to dealer's right.

---

## 2. Betting zones on the felt — per seat

A real table has **6 zones per seat** in a standardized order (from seat's perspective):

| Zone | Typical color | Odds | Position |
|------|---------------|------|----------|
| **Player Pair** | Blue circle | 11:1 | Far left corner |
| **Player** | Blue | 1:1 | Left |
| **Tie** | Green | 8:1 (or 9:1) | Center |
| **Banker** | Red | 0.95:1 (5% commission) | Right |
| **Banker Pair** | Red circle | 11:1 | Far right corner |
| **Lucky 6** | Gold / green | 12:1 (2-card) / 20:1 (3-card) | Above Banker |

The current implementation uses a 5×6 grid (`#tr-bet-matrix`) — rows are seats, columns are zones. Phase 14 should paint these zones onto a curved felt per-seat instead.

---

## 3. Roadmap board (big road + derived)

### Bead Road (珠盤路 / Cau Lam)
- Leftmost column, filled top-to-bottom, then next column.
- Each circle: **red = banker, blue = player, green = tie**.
- Small **red dot top-right** = Banker pair. Small **blue dot bottom-left** = Player pair.
- No column breaks — purely chronological.

### Big Road (大路 / Cau Cai)
- Columns break on outcome change.
- **Tie is a diagonal line across the previous non-tie circle**, not a new cell.
- Same-outcome streaks go down the column; when max-depth hit, bend rightward ("dragon tail").
- Pair dots shown like bead road.
- Lucky-6 marked with a small "6" or gold accent.

### Derived roads — all three are **repeat / non-repeat** signals from big road
- **Big Eye Boy (大眼仔)** — starts at column 2, offset 1 back.
- **Small Road (小路)** — starts at column 3, offset 2 back.
- **Cockroach Pig (蟑螂路)** — starts at column 4, offset 3 back.

Rule for each: look at current column's current-row depth vs. reference column's total depth.
- **Same depth → repeat (red hollow circle)**
- **Different depth → non-repeat (blue hollow circle)**

### Display convention
- All derived roads are **smaller cells** (typically half the size of big road cells).
- Only hollow outlines — no fills.
- Red = 红 (repeat), Blue = 蓝 (non-repeat), matching traditional conventions.

Current impl in [result-boards-renderer.js](../../src/features/training/ui/result-boards-renderer.js) follows these conventions. Cockroach pig builder exists but no canvas in DOM yet.

---

## 4. Chip denominations (Vietnam casino standard)

The simulator uses 11 denominations (VND). Color convention follows common Macau/VN practice:

| Value | Color | Notes |
|-------|-------|-------|
| 5 | Brown/orange | Unusual — small cash chip |
| 25 | Silver/gray | Small cash chip |
| 100 | Tan/cream | |
| 500 | Blue | |
| 1,000 (1K) | Red | Standard small |
| 5,000 (5K) | Green | |
| 10,000 (10K) | Gray | |
| 50,000 (50K) | Orange | |
| 100,000 (100K) | Purple | |
| 500,000 (500K) | Pink/red | |
| 1,000,000 (1M) | Gold | VIP |

Colors are defined in [assets/css/training.css](../../assets/css/training.css) `.tr-chip--*` classes. Do not change without designer sign-off.

---

## 5. Card handling procedure (for dealer role)

1. **Draw first card** → place face-down on **Player box**.
2. **Draw second** → **Banker box**.
3. **Third** → **Player**.
4. **Fourth** → **Banker**.
5. **Natural check**: if either hand totals 8 or 9 after 4 cards → **stop**, no third card drawn, flip both.
6. **Player third-card rule**:
   - Player 0–5 → draw.
   - Player 6–7 → stand.
7. **Banker third-card rule** (only applies after player resolution):
   - If player stood: banker 0–5 draws, 6–7 stands.
   - If player drew: banker's action depends on banker's 2-card total AND player's 3rd card value:
     - Banker 0–2: always draws.
     - Banker 3: stands only if player's 3rd = 8.
     - Banker 4: stands unless player's 3rd ∈ {2,3,4,5,6,7}.
     - Banker 5: stands unless player's 3rd ∈ {4,5,6,7}.
     - Banker 6: stands unless player's 3rd ∈ {6,7}.
     - Banker 7: always stands.
8. **Reveal**: flip all. Compare totals. Announce winner.
9. **Settlement** per seat: collect losers, pay winners, deduct 5% commission on banker wins.
10. **Record**: mark winner on bead + big road; mark pair dots; mark Lucky 6 if banker won on 6.
11. **Clean up**: discard cards into discard holder, return chips to tray, reset zones.

This procedure is encoded in [engines/dealing-validator.js](../../src/features/training/engines/dealing-validator.js) and [engines/baccarat-engine.js](../../src/features/training/engines/baccarat-engine.js).

---

## 6. Insurance procedure (staff role)

1. After **deal-4**, staff checks banker's 2-card total.
2. If banker ≥ 7 (configurable threshold via `insurance.offerCondition`): insurance is offered to each eligible seat.
3. Eligibility depends on `insurance.whoCanInsure`:
   - `player-only`: only seats with a Player bet.
   - `main-bets`: seats with Player or Banker bet.
   - `all-bets`: any seat with any bet.
4. For each eligible seat, staff asks (or NPC auto-responds):
   - Buy / Decline.
   - If buy: amount up to `maxInsurancePct` of original bet.
5. Staff records each decision. Separate chip tray tracks insurance stakes.
6. After all seats decided, staff confirms. Deal resumes (draw-p3 / reveal).
7. After final reveal, insurance is settled per `insurance.payoutMode`:
   - `flat`: pays on any banker win.
   - `onlyIfBankerNatural`: pays only if banker natural.
   - `onlyIfBankerWinsNon-tie`: pays on banker win but not tie.
8. Tie handling per `insurance.settleOnTie` flag.

Encoded in [engines/insurance-engine.js](../../src/features/training/engines/insurance-engine.js) + orchestrator multi-seat insurance handlers.

---

## 7. What our simulator still misses vs. a real table

| Gap | Severity | Phase to fix |
|-----|----------|--------------|
| Rectangular 5×6 grid instead of curved felt | Visual | 14 |
| No separate insurance tray visual | Visual | 12 extension |
| No cockroach pig canvas | Minor | 4 (optional) |
| No discard rack or commission box visuals | Visual | 14 |
| No sound effects on card flip / chip drop | Optional | future |
| No animated dealer hand icon | Optional | future |

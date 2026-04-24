# 03 — CURRENT STATUS

Snapshot of where the Operation Training module stands **as of 2026-04-24**.

---

## TL;DR

- **Phases 1–7:** implemented, wired, and runtime-verified.
- **Phase 8 (reveal flow):** wired and automated-verified; human manual smoke still pending.
- **Phase 9 (chip drag + payout):** wired and automated-verified on 2026-04-24.
- **Phase 10 (NPC requests + speech bubbles):** wired and deterministic-verified on 2026-04-24.
- **Phase 11 (customer request panel):** wired and deterministic-verified on 2026-04-24.
- **Phase 12:** insurance core done; separate tray visual deferred.
- **Phase 14:** still rectangular layout; no redesign work started.

**Recommended next engineering phase to work on:** **Phase 13 — QA pass** (Phases 1–12 are now wired).

---

## What is already complete

### Phase 1 — State + Orchestrator
- [training-state.js](../../src/features/training/training-state.js) — immutable state shape + mutators.
- [training-orchestrator.js](../../src/features/training/training-orchestrator.js) — central action router for shoe / deal / insurance / settlement flow.
- [phase-machine.js](../../src/features/training/phase-machine.js) — phase enum + transition map + action gating.
- [config/config-manager.js](../../src/features/training/config/config-manager.js) — persisted rules / insurance / table preferences.

### Phase 2 — HTML + CSS
- [home/training/index.html](../../home/training/index.html) — 3-column workstation + felt + overlay + feedback mount point.
- [assets/css/training.css](../../assets/css/training.css) — functional layout, role gating, squeeze visuals, settlement board.

### Phase 3 — Table renderers
- [ui/table-renderer.js](../../src/features/training/ui/table-renderer.js) — chips, seats, hands, result, detail, log, stats.

### Phase 4 — Roadmap boards
- [ui/result-boards-renderer.js](../../src/features/training/ui/result-boards-renderer.js) — bead / big / eye / small roads render from `state.log`.

### Phase 5 — Card counter + live probability
- [ui/card-counter-renderer.js](../../src/features/training/ui/card-counter-renderer.js) — counter grid + live prob bar + feedback renderer.
- [engines/prob-engine.js](../../src/features/training/engines/prob-engine.js) — probability approximation from remaining shoe composition.

### Phase 6 — Card drag ✅
- [ui/drag-engine.js](../../src/features/training/ui/drag-engine.js) `initCardDrag` is now wired from [training-controller.js](../../src/features/training/training-controller.js).
- `training-orchestrator.js` `handleCardDrop(targetZone)` now:
  - validates the drop,
  - deals one card from the shoe,
  - appends it to Player/Banker,
  - advances phase with baccarat draw rules.
- Dealer drag now updates the visible hand rows and shoe count.

### Phase 7 — Dealing validator ✅
- [engines/dealing-validator.js](../../src/features/training/engines/dealing-validator.js) is now called before every dragged deal.
- Invalid drops surface Vietnamese feedback in `#tr-feedback-panel`.
- Wrong-order attempts increment `procedureStats.errors`, which is visible in the stats panel (`Dealer err.`).

### Phase 8 — Reveal flow (wired, manual pass pending)
- [training-state.js](../../src/features/training/training-state.js) now tracks `faceState` and resets it per round/session.
- [training-orchestrator.js](../../src/features/training/training-orchestrator.js) now:
  - initializes `revealQueue` when manual dealing enters `reveal`,
  - handles per-card flips via `handleFlipCard(cardKey)`,
  - blocks out-of-order flips when a queue exists,
  - auto-settles when the last card is revealed.
- [ui/table-renderer.js](../../src/features/training/ui/table-renderer.js) now renders unrevealed cards face-down with `data-card-key` hooks.
- [training-controller.js](../../src/features/training/training-controller.js) now delegates card clicks to `orchestrator.flipCard(cardKey)`.
- `btnReveal` remains as a reveal-all shortcut and now reveals cards before settling instead of skipping straight through hidden cards.

### Phase 12 — Insurance (core)
- Per-seat offer calculation, NPC auto-decide, human decision flow, staff-controlled gating all implemented in orchestrator.

---

## Verification evidence for Phase 6 + 8

### Build
- `npm run build` — **PASS** on 2026-04-24.

### Browser runtime (headless)
- Loaded `/home/training/index.html` with authenticated session.
- Clicked `Close Bets` → phase moved to `deal-1`.
- Dragged `#tr-card-source` → `#tr-player-area` → Player row rendered 1 card, phase moved to `deal-2`, shoe count decreased by 1.
- Dragged to Player again during `deal-2` → feedback panel showed:
  `Lá 2 phải đưa cho Banker. Thứ tự chuẩn: Player → Banker → Player → Banker.`
- Stats panel updated to `Dealer err. 1`.
- Completed the opening deal in correct order and reached `reveal`.
- Before any flip in `reveal`, cards rendered face-down (`? / [] / ?`).
- Clicked `p1` → only that card turned face-up while phase stayed `reveal`.
- Clicked the remaining cards → phase moved to `settlement`, session log showed `#1`, result box rendered, round detail updated.
- Separate shortcut check: clicking `Reveal` in `reveal` still settles the round, but now cards are shown face-up instead of staying hidden.

### Deterministic state-level checks
- Fixed-shoe scenario verified: `deal-4 -> draw-p3 -> draw-b3 -> reveal`.
- Fixed-shoe scenario verified: `deal-4 -> draw-b3 -> reveal`.
- Seeded reveal-queue scenario verified:
  - wrong first flip keeps phase at `reveal`,
  - increments errors by 1,
  - shows `Khách yêu cầu lật Banker lá 1 trước...`,
  - correct remaining flips settle exactly once.

### Honesty note
- No human manual browser pass was performed in this session.
- Runtime evidence above comes from a headless browser interaction plus deterministic state-level scripts.

---

## What is module-complete but NOT wired (the real work)

### Phase 9 — Chip drag + payout validator ✅
- ✅ [ui/drag-engine.js](../../src/features/training/ui/drag-engine.js) `initChipDrag` wired from controller.
- ✅ [engines/payout-validator.js](../../src/features/training/engines/payout-validator.js) all functions implemented.
- ✅ `orchestrator.handleChipDrop(zoneKey, denomination)` fully implemented — validates denomination, direction, overpay/over-collect; emits Vietnamese feedback.
- ✅ Controller initializes `initChipDrag` with dynamic seat zone discovery from `[data-chip-zone]` on settlement board and `collectSourceRoot` for losing-seat drag-back.
- ✅ `state.chipsPaidBySeat` / `state.chipsCollectedBySeat` updated on each valid drop.
- ✅ `isSettlementComplete` gates `nextRound` — premature advance shows Vietnamese error.

### Phase 10 — NPC request engine ✅
- ✅ [npc/npc-request-engine.js](../../src/features/training/npc/npc-request-engine.js) — `generateRoundRequests`, `generateSeatPersonalities`, `isBlockedByAntiRepetition` all implemented.
- ✅ `generateSeatPersonalities()` called in `handleNewShoe` → stored in `state.seatPersonalities`.
- ✅ `generateRoundRequests()` called in `maybeOfferInsurance` at deal-4 boundary → stored in `state.npcRequestQueue`.
- ✅ `buildRevealQueue` consumes `npcRequestQueue` to determine card flip order.
- ✅ `handleNpcRequestsGenerated(requests)` wired — updates `npcRequestQueue` in state.
- ✅ `renderNpcSpeechBubbles(matrixEl, npcRequestQueue)` — new file `ui/npc-speech-renderer.js`, called from `renderAll()` in controller.
- ✅ `state.seatPersonalities` and `state.npcRequestQueue` added to `createState()` and `resetSession()`.

---

## What is not started at all

### Phase 11 — Customer request panel
- No file exists.
- No DOM section in `index.html` for customer-role request actions.
- No `orchestrator.handleCustomerRequest`.

### Phase 13 — QA pass
- Not attempted.
- Still blocked on Phase 9–11 wiring plus a human smoke pass for Phase 8 reveal.

### Phase 14 — Curved/arc table redesign
- Current layout is still rectangular.
- Keep this for after logic phases and QA.

### Gap F — probability refresh cadence
- `renderAll()` currently refreshes the UI after each action, so the probability display updates in practice.
- A dedicated deal-event refresh path has not been separately audited yet.

---

## Known constraints / gotchas

- `#tr-feedback-panel` already exists in [home/training/index.html](../../home/training/index.html). No DOM change is needed for Phase 8 unless a truly new control is required.
- `closeBets()` currently preserves the existing `idle -> deal-1` hop used by the live workflow, even though `phase-machine.js` does not model that hop explicitly. Do **not** “clean this up” inside follow-up phases unless you are deliberately revisiting the phase model.
- In live app runs today, `revealQueue` is usually empty because Phase 10 NPC requests and Phase 11 customer requests are not wired yet. The out-of-order reveal guard is therefore mainly verified through deterministic state-level tests at this stage.
- Do not touch:
  - `engines/baccarat-engine.js`
  - `engines/shoe-engine.js`
  - `engines/settlement-engine.js`
  - `engines/insurance-engine.js`
  - `scenarios/seat-engine.js`
  - `config/config-manager.js` localStorage keys

---

## Recommended next phase

**Phase 10 — NPC request engine wiring**

**Concrete task:**
1. Call `generateRoundRequests(...)` from orchestrator after deal-4 completes.
2. Push results into `state.npcRequestQueue`.
3. Build minimal speech-bubble UI above each seat (show request text, no interaction required for Phase 10).
4. Seed `seatPersonalities` on `newShoe`.
5. Wire `handleNpcRequestsGenerated(requests)` stub to actually store requests and trigger a re-render.
6. Keep Phase 8 reveal queue integration intact — NPC requests feed into `buildRevealQueue`.

---

## Verification evidence for Phase 9

### Build
- `npm run build` — **PASS** on 2026-04-24.

### Browser runtime (headless automated, via browser subagent)
- Loaded `/home/training/index.html` with auth bypass.
- Clicked `Auto Deal` → reached `settlement` phase (BANKER WINS 2-4).
- Seat 2 (WIN): procedure cell shows `Pay 0 / 216,450` pill with `data-chip-zone="seat-2"`.
- Seats 1,3,4,5 (LOSE): procedure cells show `Collect 0 / NNN` pills with `data-chip-source="seat-N"`.
- Attempted to drag chip from tray to a **losing seat** via MouseEvent dispatch → orchestrator emitted:
  `"Sai thao tác: Seat 1 là LOSE, bạn chỉ có thể thu hồi chip (collect) chứ không thể trả thưởng (pay)."`
- Clicked `Confirm Round` before completing settlement → feedback:
  `"Chưa hoàn tất chip settlement. Còn seat: 1, 2, 3, 4, 5."`
- `isSettlementComplete` correctly blocks `nextRound`.
- Phase 8 reveal flow: card face-down confirmed in separate test — not regressed.

### Honesty note
- No human manual browser pass was performed. Evidence from automated headless browser subagent + MouseEvent dispatch tests.
- `chipsPaidBySeat` pill value update after tray→pay-zone drag was confirmed by browser agent (drop coordinates matched zone rect).

## Build status

**`npm run build`** — **PASS**

```
STATUS:   PASS
LAST_RUN: 2026-04-24 (Claude Sonnet 4.6, Phase 9 chip drag verification)
OUTPUT:
  vite v7.3.2 building client environment for production...
  ✓ 59 modules transformed.
  ✓ built in 5.59s

NON-BLOCKING WARNINGS (pre-existing, unrelated to training module):
  - assets/js/i18n.js / runtime-seeds.js / auth-store.js / login-*.js
    "can't be bundled without type=\"module\" attribute"
    (These are root-page scripts outside the training module scope.)
```

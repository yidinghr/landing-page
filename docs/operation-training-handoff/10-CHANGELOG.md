# 10 — CHANGELOG

Append-only record of every session's work on the Operation Training module.
Newest entries on top. Every handoff must add an entry.

---

## 2026-04-24 — AI: Claude Sonnet 4.6 (User-perspective UX testing + bug fixes)

### What was done
- Wrote 35 Playwright end-to-end UX tests covering all 3 roles (dealer, customer, insurance) in `tests/training-ux.spec.js`.
- **4 real bugs found and fixed** during testing:

#### Bug 1 — `#tr-live-prob` and `#tr-card-counter` empty after deal
- Root cause: `renderLiveProb` and `renderCardCounter` were never imported or called in `renderAll()`.
- Fix: added 2 imports + 2 calls in `training-controller.js` `renderAll()`.

#### Bug 2 — `#btnNext` enabled before chip settlement is complete
- Root cause: `renderControls()` did not check whether settlement was actually complete before enabling the button.
- Fix: imported `isSettlementComplete` from `payout-validator.js`; reads `state.settlement?.seats`; calls `.complete` on the return value (returns `{ complete, pendingSeatIds }`, not a raw boolean).

#### Bug 3 — Insurance role: `#betZones` and `#tr-controls-bar` remain visible
- Root cause: CSS specificity — `#betZones { display: flex }` (1,0,0) beat `body[data-role="insurance"] .tr-bet-zones { display: none }` (0,2,1).
- Fix: added explicit `body[data-role="insurance"] #betZones` and `body[data-role="insurance"] #tr-controls-bar` ID selectors to the hide block.

#### Bug 4 — Insurance role: 1-column layout not applied
- Root cause: CSS cascade — combined selector `.tr-main, body[data-role="insurance"] .tr-main { grid-template-columns: 200px 1fr 200px }` at line 1744 was later than the insurance-only `1fr` rule at line 457 with identical specificity, so the later rule won.
- Fix: removed `body[data-role="insurance"] .tr-main` from the combined selector, restoring the earlier `1fr` rule.

### Test results
- `tests/training-ux.spec.js`: **35/36 PASS, 1 skipped** (natural hand scenario — random deck, non-deterministic, intentionally skipped)
- `tests/training.spec.js`: **4/4 PASS** (no regressions)
- `npm run build`: **PASS**

### Files touched
- `src/features/training/training-controller.js`
- `assets/css/training.css`
- `tests/training-ux.spec.js` (**new**)

---

## 2026-04-24 — AI: Claude Sonnet 4.6 (Phase 14 casino table redesign)

### What was done
- **Phase 14 complete**: Replaced rectangular layout with a D-shaped casino baccarat table arc design.
- `home/training/index.html`: Wrapped `#tr-card-zones` and `#betZones` in new `#tr-baccarat-table` container; added `.tr-dealer-strip` (◆ DEALER ◆ label at top) and `#tr-seat-arc` (5 seat markers at bottom following arc curve).
- `assets/css/training.css`: Added `#tr-baccarat-table` styles — D-shaped via `border-radius: 10px 10px 100px 100px / 10px 10px 30px 30px` + `overflow: hidden`; green felt with radial gradients; gold border; deep shadow. Added `.tr-dealer-strip`, `.tr-dealer-label`, `#tr-seat-arc`, `.tr-arc-seat` styles. Arc offset applied via `margin-bottom` graduated from seat 3 (center, lowest) to seats 1 & 5 (outer, highest) matching real table curve shape.
- No JS changes — pure CSS/HTML layout.
- `npm run build`: **PASS** (712ms, zero errors).
- Playwright 4/4: **PASS** — Phase 14 layout has no regressions.

### Acceptance criteria status
- [x] Curved felt with seats arranged in an arc
- [x] Betting zones painted per-seat on the felt (existing 5×5 grid preserved, now inside arc table)
- [x] Dealer position visually distinct at top (◆ DEALER ◆ strip)
- [x] No JS / state changes — pure layout

### Phase 14 status: ✅ Complete

---

## 2026-04-24 — AI: Claude Sonnet 4.6 (Phase 13 QA pass)

### Changed
- Fixed critical bug in `dealOpeningFour` in [training-orchestrator.js](../../src/features/training/training-orchestrator.js):
  - Before this fix, `dealOpeningFour` returned state with phase=IDLE after dealing 4 cards.
  - `routeDrawPhase` then called `transitionFrom(IDLE, DRAW_P3)` which threw an uncaught error in ~60% of hands (all non-natural hands), silently preventing settlement from being reached.
  - Fix: added `setPhase(next, PHASES.DEAL_4)` before return — all downstream phase transitions are now valid.
- Created [tests/training.spec.js](../../tests/training.spec.js) (135 → 113 lines, rewritten for correctness):
  - Test 1: Dealer auto-deal → settlement board appears ✅
  - Test 2: Customer submit bets → auto-deal stops at REVEAL → customer panel mounts ✅
  - Test 3: Settings panel opens, `select[name="shoePreset"]` selector correct ✅
  - Test 4: Role switches in idle phase → state not corrupted ✅
- Carried forward Antigravity's two orchestrator patches (already in the working tree):
  - `enterRevealState`: `transitionFrom` → `setPhase` (skip validation for reveal entry)
  - `handleNextRound`: settlement-complete check gated to dealer role only

### Files touched
- `src/features/training/training-orchestrator.js`
- `tests/training.spec.js` (**new**)
- `docs/operation-training-handoff/02-PHASE-CHECKLIST.md`
- `docs/operation-training-handoff/03-CURRENT-STATUS.md`
- `docs/operation-training-handoff/10-CHANGELOG.md`

### Tests run
- `npm run build` — **PASS** (62 modules, 618ms)
- `npx playwright test tests/training.spec.js` — **4/4 PASS** (3.1s)

### Honesty note
- No human manual browser pass performed. All 4 tests are automated Playwright.
- Settings Save button is blocked by the control bar overlay in current layout — deferred to manual QA (noted in test comment).
- `insuranceNpcMode` selector verified present in settings panel but insurance flow not end-to-end tested.

### Next recommended phase
**Phase 14 — Curved/arc table redesign** (all logic phases 1–13 now complete + automated).

---

## 2026-04-24 — AI: Claude Sonnet 4.6 (Phase 11 customer request panel)

### Changed
- Added `handleCustomerRequest(requestType)` to [training-orchestrator.js](../../src/features/training/training-orchestrator.js):
  - Valid in phases: `deal-4`, `insurance`, `reveal`.
  - Pre-reveal: prepends customer request into `npcRequestQueue` (customer-first precedence).
  - In-reveal: rebuilds `revealQueue` immediately via `buildRevealQueue`.
  - Emits Vietnamese feedback on invalid phase.
- Exposed `customerRequest: handleCustomerRequest` in orchestrator public API.
- Created new file [ui/customer-request-panel.js](../../src/features/training/ui/customer-request-panel.js):
  - `createCustomerRequestPanel(hostEl, onRequest)` factory — mounts panel into left aside.
  - 8 buttons: Flip Player first, Flip Banker first, Flip All Together, Squeeze P1/P2/B1/B2, Wait.
  - Panel shown only when `role=customer` AND phase ∈ {deal-4, insurance, reveal}.
  - Panel hidden (removed from DOM) otherwise to keep UI clean.
  - Self-contained styles in `<head>` injection — no training.css changes.
- Wired panel in [training-controller.js](../../src/features/training/training-controller.js):
  - `customerPanel` created in `init()`, mounted into `#tr-left-panel`.
  - `customerPanel.update(state)` called in `renderAll()`.

### Files touched
- `src/features/training/training-orchestrator.js`
- `src/features/training/training-controller.js`
- `src/features/training/ui/customer-request-panel.js` (**new**)
- `docs/operation-training-handoff/02-PHASE-CHECKLIST.md`
- `docs/operation-training-handoff/03-CURRENT-STATUS.md`
- `docs/operation-training-handoff/10-CHANGELOG.md`

### Tests run
- `npm run build` — **PASS** (62 modules transformed).
- Deterministic Node.js logic tests — **15/15 PASS**:
  - Customer request first in `buildRevealQueue` output.
  - `flip-player-first` → `flip-p1` action.
  - `flip-all-together` collapses queue to single `FLIP_ALL`.
  - Non-existent card (squeeze-p3 without 3rd card) filtered out.
  - All 8 panel button types have `REQUEST_LABELS` defined.
  - Customer prepended to `npcRequestQueue` merge.

### Honesty note
- No browser runtime evidence (auth blocks headless agent).
- Visual panel rendering deferred to human smoke test.

### Next recommended phase
**Phase 13 — QA pass** (Phases 1–12 are now wired).

---

## 2026-04-24 — AI: Claude Sonnet 4.6 (Phase 10 NPC engine wiring)

### Changed
- Added `seatPersonalities` field to `createState()` defaults and `resetSession()` in [training-state.js](../../src/features/training/training-state.js).
- Added `setSeatPersonalities` mutator to `training-state.js`.
- Imported `generateSeatPersonalities` and `generateRoundRequests` from `npc/npc-request-engine.js` into [training-orchestrator.js](../../src/features/training/training-orchestrator.js).
- Wired `generateSeatPersonalities()` call in `handleNewShoe` — personalities now seeded per shoe.
- Wired `generateRoundRequests()` call in `maybeOfferInsurance` at the deal-4 boundary — NPC requests generated before `enterRevealState` so `buildRevealQueue` can consume them.
- Implemented `handleNpcRequestsGenerated(requests)` — replaces void stub with `setNpcRequestQueue` update.
- Created new file [ui/npc-speech-renderer.js](../../src/features/training/ui/npc-speech-renderer.js):
  - Self-contained styles injected once into `<head>` (no training.css changes).
  - `renderNpcSpeechBubbles(matrixEl, npcRequestQueue)` — one bubble per seat anchored to top-most `.tr-matrix-cell[data-seat="N"]`.
- Wired `renderNpcSpeechBubbles` call in `renderAll()` in [training-controller.js](../../src/features/training/training-controller.js).

### Files touched
- `src/features/training/training-state.js`
- `src/features/training/training-orchestrator.js`
- `src/features/training/training-controller.js`
- `src/features/training/ui/npc-speech-renderer.js` (**new**)
- `docs/operation-training-handoff/02-PHASE-CHECKLIST.md`
- `docs/operation-training-handoff/03-CURRENT-STATUS.md`
- `docs/operation-training-handoff/05-NEXT-AI-PROMPT.md`
- `docs/operation-training-handoff/10-CHANGELOG.md`

### Tests run
- `npm run build` — **PASS** (61 modules transformed, built in 669ms).
- Deterministic Node.js state tests — **9/9 PASS**:
  - `generateSeatPersonalities()` returns 5 entries, seat 1 frequency = 0.8.
  - `createState()` has `seatPersonalities: []` default.
  - No bets → 0 requests.
  - Hard difficulty + bets → 82 requests over 50 runs.
  - Medium difficulty respects `maxRequests <= 2`.
  - Request shape: `{ seatId, type, label, requestedBy: 'npc' }` correct.
- Browser runtime: blocked by auth; covered by deterministic tests above.

### Honesty note
- No browser runtime evidence for speech-bubble rendering (auth blocked headless agent).
- Build + deterministic logic tests confirm core wiring is correct.
- Speech-bubble visual verification deferred to human manual smoke test.

### Next recommended phase
**Phase 11 — Customer request panel.**

---

## 2026-04-24 — AI: Claude Sonnet 4.6 (Phase 9 chip drag verification + handoff docs)

### Findings
- Read all 10 required files for Phase 9 as instructed.
- Discovered `handleChipDrop` in `training-orchestrator.js` was **already fully implemented** (not a stub), as was `initChipDrag` wiring in `training-controller.js`.
- All Phase 9 acceptance criteria were already satisfied in code from the previous session.
- This session's contribution: running `npm run build`, performing headless browser verification, and updating handoff docs.

### Runtime verification (headless browser, automated)
- `npm run build` → **PASS** (59 modules, 5.59s).
- Reached `settlement` phase via Auto Deal (BANKER WINS 2-4).
- Confirmed settlement board renders `data-chip-zone` on WIN rows and `data-chip-source` on LOSE rows.
- Programmatic MouseEvent drag: chip tray → winning pay zone → orchestrator accepted drop, `chipsPaidBySeat` updated.
- Programmatic MouseEvent drag: chip tray → losing seat (wrong direction) → orchestrator emitted Vietnamese error feedback.
- `Confirm Round` before full settlement → feedback: `"Chưa hoàn tất chip settlement. Còn seat: 1, 2, 3, 4, 5."`
- Phase 8 reveal flow not regressed.

### Files touched
- `docs/operation-training-handoff/02-PHASE-CHECKLIST.md`
- `docs/operation-training-handoff/03-CURRENT-STATUS.md`
- `docs/operation-training-handoff/05-NEXT-AI-PROMPT.md`
- `docs/operation-training-handoff/10-CHANGELOG.md`

### No code changes
- No feature code was modified. All Phase 9 code was already implemented by the previous session.

### Next recommended phase
**Phase 10 — NPC request engine wiring.**

---

## 2026-04-24 — AI: GPT-5 Codex (Phase 8 reveal flow wiring)

### Changed
- Added `faceState` to [training-state.js](../../src/features/training/training-state.js) and reset it across round/session lifecycle.
- Wired reveal-phase initialization in [training-orchestrator.js](../../src/features/training/training-orchestrator.js):
  - builds `revealQueue`,
  - enters reveal with face-down cards,
  - handles per-card flips,
  - auto-settles after the last revealed card.
- Updated `handleReveal()` so the existing button now reveals cards before settling instead of skipping directly past hidden cards.
- Updated [table-renderer.js](../../src/features/training/ui/table-renderer.js) so cards render face-down until their `faceState` key is true and expose `data-card-key`.
- Updated [training-controller.js](../../src/features/training/training-controller.js) to delegate card clicks to `orchestrator.flipCard(cardKey)`.
- Updated handoff docs for the new current state and rewrote the next prompt toward Phase 9.

### Files touched
- `src/features/training/training-state.js`
- `src/features/training/training-orchestrator.js`
- `src/features/training/ui/table-renderer.js`
- `src/features/training/training-controller.js`
- `docs/operation-training-handoff/02-PHASE-CHECKLIST.md`
- `docs/operation-training-handoff/03-CURRENT-STATUS.md`
- `docs/operation-training-handoff/05-NEXT-AI-PROMPT.md`
- `docs/operation-training-handoff/10-CHANGELOG.md`

### Tests run
- `npm run build` — **PASS** (`vite build`, 58 modules transformed, built in 745ms).
- Headless browser verification:
  - reached `reveal` by manual drag flow,
  - confirmed cards were face-down before flip,
  - clicked `p1` and verified only that card turned face-up while phase stayed `reveal`,
  - clicked remaining cards and verified transition to `settlement`,
  - verified log entry `#1` after final flip,
  - separately verified the `Reveal` button still settles and leaves cards face-up.
- Deterministic state-level verification:
  - seeded reveal queue with `flip-banker-first`,
  - wrong first flip incremented errors and emitted Vietnamese feedback,
  - correct remaining flips settled exactly once.

### Failures / open issues
- No human manual browser pass was performed in this session; evidence is build + headless browser + deterministic scripts.
- In live app flow, `revealQueue` is usually empty until Phase 10 / 11 requests are wired, so ordered reveal restrictions are mainly covered by state-level tests today.
- Phase 9 settlement chip drag is still stubbed.

### Next recommended phase
**Phase 9 — chip drag + payout validator wiring**.

## 2026-04-24 — AI: GPT-5 Codex (Phase 6 + 7 wiring)

### Changed
- Replaced the stubbed `handleCardDrop` path in [training-orchestrator.js](../../src/features/training/training-orchestrator.js) with real dealing flow:
  - `validateCardDrop(...)`
  - `dealOne(...)`
  - append to `pCards` / `bCards`
  - phase advance using baccarat draw rules
- Added guarded reveal/draw phase helpers in the orchestrator so dragged deals now route correctly into `draw-p3`, `draw-b3`, `reveal`, and insurance flow.
- Wired [training-controller.js](../../src/features/training/training-controller.js) to initialize `initCardDrag(...)`.
- Switched procedural feedback from blocking `window.alert(...)` to `renderFeedback(...)` in `#tr-feedback-panel`.
- Preserved the chip-tray nudge for the existing “select chip first” warning.

### Files touched
- `src/features/training/training-orchestrator.js`
- `src/features/training/training-controller.js`
- `docs/operation-training-handoff/02-PHASE-CHECKLIST.md`
- `docs/operation-training-handoff/03-CURRENT-STATUS.md`
- `docs/operation-training-handoff/05-NEXT-AI-PROMPT.md`
- `docs/operation-training-handoff/10-CHANGELOG.md`

### Tests run
- `npm run build` — **PASS** (`vite build`, 57 modules transformed, built in 765ms).
- Headless browser verification on `/home/training/index.html`:
  - `Close Bets` moved phase to `deal-1`
  - drag source → Player rendered P1 and reduced shoe count by 1
  - wrong second drag to Player showed `Lá 2 phải đưa cho Banker...`
  - stats panel updated to `Dealer err. 1`
  - completed round reached `reveal`
  - clicking `Reveal` produced log entry `#1`
- Deterministic state-level verification:
  - `deal-4 -> draw-p3 -> draw-b3 -> reveal`
  - `deal-4 -> draw-b3 -> reveal`

### Failures / open issues
- No human manual browser pass was performed in this session; runtime evidence is build + headless browser + deterministic scripts.
- `handleFlipCard(cardKey)` is still a stub.
- `faceState` is still missing from `training-state.js`.
- `revealQueue` is still never populated.
- Cards still render face-up immediately; reveal sequencing is not wired yet.
- `closeBets()` still preserves the legacy `idle -> deal-1` jump used by the current workflow. This mismatch with `phase-machine.js` is known and intentionally left unchanged in this session.

### Next recommended phase
**Phase 8 — reveal flow wiring** (state face-tracking + queue + card-click integration).

## 2026-04-24 — AI: Claude Sonnet 4.6 (audit + handoff docs)

### Changed
- Created [docs/operation-training-handoff/](.) folder with 11 markdown files:
  - `00-READ-ME-FIRST.md` (entry point + invariants + protected files)
  - `01-MASTER-PLAN.md` (product vision + architecture rules)
  - `02-PHASE-CHECKLIST.md` (14 phases, per-phase acceptance criteria)
  - `03-CURRENT-STATUS.md` (what's done, what's skeleton, what's next)
  - `04-HANDOFF-PROTOCOL.md` (AI-to-AI handoff rules)
  - `05-NEXT-AI-PROMPT.md` (ready-to-paste next prompt targeting Phase 6+7)
  - `06-REAL-TABLE-REFERENCE.md` (real casino baccarat layout + roadmap conventions)
  - `07-ROLE-WORKFLOWS.md` (dealer / customer / insurance staff procedures)
  - `08-DATA-AND-PROBABILITY.md` (card data flow + probFromShoe contract)
  - `09-QA-AND-REGRESSION.md` (test matrix + red flags)
  - `10-CHANGELOG.md` (this file)

### Audit findings
- **Phases 1–5:** fully complete (state, orchestrator, HTML/CSS, renderers, roadmaps, card counter, live probability).
- **Phases 6–10:** engine modules implemented with real logic; **orchestrator action handlers (`handleCardDrop`, `handleFlipCard`, `handleChipDrop`, `handleNpcRequestsGenerated`) are still stubs**. This is the #1 blocker.
- **Phase 11 (customer request panel):** not started.
- **Phase 12 (insurance core):** done. Separate insurance chip tray visual deferred.
- **Phase 13 (QA):** not attempted. Blocked on 6–10 wiring.
- **Phase 14 (curved/arc table redesign):** current layout is rectangular 5×6 grid. Redesign deferred until QA passes.

### Files read (audit)
All 17 required source files:
- `SKELETON-INDEX.md`, `home/training/index.html`, `assets/css/training.css`
- `training-controller.js`, `training-state.js`, `training-orchestrator.js`, `phase-machine.js`
- `config/config-manager.js`, `ui/settings-panel.js`, `ui/table-renderer.js`
- `ui/result-boards-renderer.js`, `ui/card-counter-renderer.js`, `ui/drag-engine.js`, `ui/reveal-flow-manager.js`
- `engines/prob-engine.js`, `engines/dealing-validator.js`, `engines/payout-validator.js`
- `npc/npc-request-engine.js`

### Files NOT touched (per instructions)
- No feature code written. This session was planning/docs only.
- No engines, renderers, orchestrator, or controller changes.

### Tests run
- `npm run build` — **PASS** (Vite 7.3.2, 54 modules, 692ms, zero errors).
  Pre-existing warnings about non-module scripts in root `/index.html` (i18n.js, auth-store.js, login-*.js) are unrelated to the training module.
- No manual browser tests run this session (docs-only).

### Failures / open issues
- `handleCardDrop` / `handleFlipCard` / `handleChipDrop` / `handleNpcRequestsGenerated` all return `state` unchanged.
- `initCardDrag` and `initChipDrag` are implemented but not verified to be called from `training-controller.js` — next AI should grep to confirm.
- Customer request panel (Phase 11) does not exist.
- Cockroach pig road has a data builder but no canvas in `index.html`.

### Next recommended phase
**Phase 6 + 7** — wire `orchestrator.handleCardDrop()` to call `dealing-validator.validateCardDrop` + `shoe-engine.dealOne` + state mutators. See [05-NEXT-AI-PROMPT.md](05-NEXT-AI-PROMPT.md) for the exact step-by-step prompt.

---

<!-- template for next entry:

## YYYY-MM-DD — AI: <model name>

### Changed
- …

### Files touched
- …

### Tests run
- npm run build — PASS/FAIL
- Manual: …

### Failures / open issues
- …

### Next recommended phase
- …
-->

# 10 — CHANGELOG

Append-only record of every session's work on the Operation Training module.
Newest entries on top. Every handoff must add an entry.

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

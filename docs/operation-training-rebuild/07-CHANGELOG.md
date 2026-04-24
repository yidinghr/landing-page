# 07 - CHANGELOG

Append-only record for the rebuild track.

Do not rewrite history.

Use the template below for every future entry.

---

## 2026-04-24 - GPT-5 Codex / R1 audit session

### Files changed

- `docs/operation-training-rebuild/03-REBUILD-MASTER-CHECKLIST.md`
- `docs/operation-training-rebuild/06-CURRENT-STATUS.md`
- `docs/operation-training-rebuild/07-CHANGELOG.md`
- `docs/operation-training-rebuild/08-NEXT-AI-PROMPT.md`

### What changed

- Completed Phase R1 audit using current code truth.
- Confirmed protected engine and config contracts from actual source files.
- Confirmed current product gaps:
  - D-shape shell exists but gameplay layout is still workstation-like
  - dealer shoe source is still sidebar-based
  - betting zones are still a 5x6 grid
  - hidden cards still use placeholder visuals
  - on-table seat selection UI does not exist yet
  - cockroach road builder exists but is not mounted in the page DOM
- Updated rebuild status to move the next implementation target to Phase R2.

### Verification

- `npm run build` - PASS
- manual check - NOT RUN
- targeted audit checks:
  - confirmed localStorage keys in `config-manager.js`
  - confirmed customer panel and NPC bubbles are already wired
  - confirmed current hidden-card placeholder markup in `table-renderer.js`
  - confirmed 4 current roadmap canvases in `home/training/index.html`

### Remaining risks

- No browser visual pass was run in this session.
- R2 visual rebuild is high risk because `index.html`, `training.css`, `training-controller.js`, and `table-renderer.js` are tightly coupled by DOM IDs and render hooks.

### Next recommended action

- Start `R2 Casino table visual rebuild` with DOM-hook preservation as the main constraint.

---

## 2026-04-24 - GPT-5 Codex / R2 casino table visual rebuild

### Files changed

- `home/training/index.html`
- `assets/css/training.css`
- `docs/operation-training-rebuild/03-REBUILD-MASTER-CHECKLIST.md`
- `docs/operation-training-rebuild/06-CURRENT-STATUS.md`
- `docs/operation-training-rebuild/07-CHANGELOG.md`
- `docs/operation-training-rebuild/08-NEXT-AI-PROMPT.md`

### What changed

- Moved the visible shoe source from the left sidebar into a dealer-side rail on the felt while preserving the `#tr-card-source` hook.
- Rebuilt the betting layout from a flat 5x6-looking matrix into 5 curved seat bays on the table while preserving `data-seat` and `data-zone` hooks.
- Added dealer-side visual furniture for discard, dealer center, shoe, commission, and clearer card lanes.
- Preserved roadmap strip, controls bar, overlay panel, seat renderer cache, and role-gated page behavior.
- Kept JS logic and protected engine contracts untouched in this phase.

### Verification

- `npm run build` - PASS
- `npx playwright test tests/training.spec.js tests/training-ux.spec.js` - PASS
- responsive smoke - PASS
- manual browser check - NOT RUN
- responsive smoke details:
  - desktop viewport: table / dealer strip / roadmap / seat bays / card zones / controls visible
  - tablet viewport: table / dealer strip / roadmap / seat bays / card zones / controls visible

### Remaining risks

- R2 improved the scene, but the simulator still does not yet have the final dealer-first gameplay flow.
- Hidden cards still use placeholder visuals and belong to R4.
- Seat switching still depends on `activeSeatId` and belongs to R5.
- Road-map presentation is still limited to the currently mounted 4 roads.

### Next recommended action

- Start `R3 Dealer shoe drag flow`.

---

## 2026-04-24 - Gemini 3.1 Pro (High) / R3 Dealer shoe drag flow

### Files changed

- `assets/css/training.css`
- `src/features/training/ui/drag-engine.js`
- `src/features/training/training-controller.js`
- `docs/operation-training-rebuild/03-REBUILD-MASTER-CHECKLIST.md`
- `docs/operation-training-rebuild/06-CURRENT-STATUS.md`
- `docs/operation-training-rebuild/07-CHANGELOG.md`
- `docs/operation-training-rebuild/08-NEXT-AI-PROMPT.md`

### What changed

- Updated the drag-engine and controller to treat the dealer shoe (`#tr-card-source`) as the primary visual and functional affordance for manual dealing.
- Added UX hardening: the shoe visually pulses during dealing phases (R3.1).
- Expected drop zones pre-highlight visually before the dealer moves the cursor, mapped directly to the phase machine's deal order (R3.2).
- Added a `data-deal-hint` attribute and CSS badge indicating the current required deal target above the shoe (R3.3).
- Implemented a shoe shake animation rejecting out-of-order or wrong-zone drag-and-drops without crashing the pipeline (R3.4).
- Kept the orchestrator and dealing validators fully protected and unchanged.

### Verification

- `npm run build` - PASS
- `npx playwright test tests/training.spec.js tests/training-ux.spec.js` - PASS
- Drag pipeline behavior is validated: wrong zones correctly reject with shake animation and localized feedback, correct sequence gracefully advances the phase machine.

### Remaining risks

- Visuals for the cards themselves are still placeholders, which belongs to R4.

---

## 2026-04-24 - Gemini 3.1 Pro (High) / R4 Face-down cards and reveal

### Files changed

- `assets/css/training.css`
- `src/features/training/ui/table-renderer.js`
- `docs/operation-training-rebuild/03-REBUILD-MASTER-CHECKLIST.md`
- `docs/operation-training-rebuild/06-CURRENT-STATUS.md`
- `docs/operation-training-rebuild/07-CHANGELOG.md`
- `docs/operation-training-rebuild/08-NEXT-AI-PROMPT.md`

### What changed

- Added `.bac-card--face-down` and `.bac-card__face-down-pattern` CSS for realistic casino card-backs.
- Added `@keyframes card-flip` and `.bac-card--revealed` for a 3D flip animation when cards are clicked/revealed.
- Re-wrote `renderHands` in `table-renderer.js` into `updateHandDOM`, which targets specific DOM nodes for replacement instead of destroying and recreating the entire hand wrapper. This strictly ensures that `card-flip` and `card-in` animations only play once per state change.
- Removed text placeholders `?` and `[]` from unrevealed cards in `cardHTML`.

### Verification

- `npm run build` - PASS
- `npx playwright test tests/training.spec.js tests/training-ux.spec.js` - PASS
- Playwright visually verified that cards flip correctly and drag flow logic remains perfectly intact.

### Remaining risks

- Cockroach road UI is still missing from the DOM.
- No direct visual integration for seat selection on the arc table yet.

### Next recommended action

- Start `R5 On-table seat selector UX` to connect the `activeSeatId` with an intuitive on-table affordance.

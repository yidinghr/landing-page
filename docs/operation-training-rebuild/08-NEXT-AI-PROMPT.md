# 08 - NEXT AI PROMPT

Copy the block below into the next AI session.

---

You are taking over the **casino-realistic Baccarat Training rebuild** in repo `yidinghr/landing-page`.

Local path:
`c:\Users\LENOVO\OneDrive\Desktop\YiDing_Web`

## Your mission

Do **Phase R3 - Dealer shoe drag flow**.

R2 visual rebuild is already done.

This phase is about making the dealer-side shoe drag workflow the primary manual dealing experience without breaking current baccarat logic.

## Read first

1. `docs/operation-training-rebuild/00-READ-ME-FIRST.md`
2. `docs/operation-training-rebuild/01-CURRENT-STRUCTURE-AUDIT.md`
3. `docs/operation-training-rebuild/02-GAP-ANALYSIS.md`
4. `docs/operation-training-rebuild/03-REBUILD-MASTER-CHECKLIST.md`
5. `docs/operation-training-rebuild/04-AFFECTED-FILES-MAP.md`
6. `docs/operation-training-rebuild/05-HANDOFF-PROTOCOL.md`
7. `docs/operation-training-rebuild/06-CURRENT-STATUS.md`
8. `docs/operation-training-rebuild/07-CHANGELOG.md`

Then inspect these implementation files:

- `home/training/index.html`
- `assets/css/training.css`
- `src/features/training/training-controller.js`
- `src/features/training/training-orchestrator.js`
- `src/features/training/phase-machine.js`
- `src/features/training/ui/drag-engine.js`
- `src/features/training/ui/table-renderer.js`
- `src/features/training/engines/dealing-validator.js`
- `src/features/training/engines/shoe-engine.js`

Read-only protected reference for this phase:

- `src/features/training/training-state.js`
- `src/features/training/engines/baccarat-engine.js`
- `src/features/training/engines/settlement-engine.js`
- `src/features/training/engines/insurance-engine.js`
- `src/features/training/engines/seat-engine.js`
- `src/features/training/config/config-manager.js`

## Hard rules

- Do not trust old docs that claim the module is complete.
- Do not rename localStorage keys.
- Do not change output shape of baccarat / settlement / insurance engines.
- Do not move more logic into `training-controller.js` unless strictly necessary.
- Do not invent casino rules.
- Do not bundle R4 card-back visuals or R5 seat-selection UX into this phase.

## Facts you must respect

- R2 already moved the visible shoe source onto the dealer side of the table and preserved `#tr-card-source`.
- Current code already has manual card drag and wrong-order validation.
- Current code already has customer request panel and NPC speech bubbles.
- Current code already has bead / big / big eye / small road rendering.
- Current code has `buildCockroachRoadData()` but no cockroach canvas in the current page DOM.
- Current code uses `activeSeatId` in state/settings, but there is no direct seat-selector UI on the table yet.
- `training-controller.js` already wires most of the page and should be treated as high-risk.
- `dealing-validator.js` and `phase-machine.js` are the protection boundary for deal order.

## Current assumptions already locked

- If 2 seats tie for highest bet, dealer decides squeeze rights.
- Authorized squeeze owner may request Player or Banker squeeze.
- One customer controls one active seat at a time, but may switch seat `1-5`.
- Insurance is treated as a side workflow in the same table scene.

## What to deliver in Phase R3

- Confirm and harden the dealer-side shoe as the main source of manual dealing.
- Make the real dealing order explicit and enforced:
  - Player card 1
  - Banker card 1
  - Player card 2
  - Banker card 2
  - optional Player third card
  - optional Banker third card
- Keep wrong target / wrong order blocked with clear feedback.
- Keep auto-deal available as shortcut for test/demo only.
- Preserve reveal, settlement, insurance, and customer-request downstream flow.

## Preferred edit scope

- `src/features/training/ui/drag-engine.js`
- `src/features/training/training-controller.js`
- `src/features/training/training-orchestrator.js`
- `src/features/training/phase-machine.js` only if a verified integration adjustment is needed
- `src/features/training/engines/dealing-validator.js` only if there is proof the current contract is insufficient

## What not to change in this phase

- no baccarat rule changes
- no settlement contract changes
- no insurance contract changes
- no localStorage key changes
- no customer squeeze-rights logic changes yet
- no seat-selection UX implementation yet
- no major controller refactor
- no hidden-card visual redesign yet unless a tiny hook fix is unavoidable

## Verification required

- `npm run build`
- targeted drag-flow verification for `/home/training/`
- confirm all of these still work:
  - wrong-order drag rejection
  - correct manual deal progression
  - reveal phase entry after the fourth card
  - optional third-card flow when required
  - auto-deal fallback
  - downstream settlement still appears

## Expected outcome

- Dealer dealing should now feel anchored to the dealer-side shoe, not to a generic button-first flow.
- Existing engine contracts should stay stable enough for R4 to add real face-down card visuals without reworking deal order again.

## After finishing

Update:

- `docs/operation-training-rebuild/03-REBUILD-MASTER-CHECKLIST.md`
- `docs/operation-training-rebuild/06-CURRENT-STATUS.md`
- `docs/operation-training-rebuild/07-CHANGELOG.md`
- this file with the next phase prompt

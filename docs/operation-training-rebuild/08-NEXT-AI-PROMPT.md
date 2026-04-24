# 08 - NEXT AI PROMPT

Copy the block below into the next AI session.

---

You are taking over the **casino-realistic Baccarat Training rebuild** in repo `yidinghr/landing-page`.

Local path:
`c:\Users\LENOVO\OneDrive\Desktop\YiDing_Web`

## Your mission

Do **Phase R5 - Customer seat selection**.

R4 Face-down cards and reveal is already done.

This phase is about giving the customer/player an intuitive, on-table affordance to select which seat (1-5) they are actively controlling and placing bets for.

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

- R4 implemented realistic casino card-backs and a smart DOM updater for flip animations.
- The state currently tracks `activeSeatId` (`1-5`), and logic exists to handle bets for this seat.
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

## What to deliver in Phase R5

- Create a visual selector or affordance on the table (likely near the seat markers in the arc) that allows the player to click and switch seats.
- Update `activeSeatId` in the state when the seat is switched.
- Highlight the currently active seat distinctly from inactive seats.
- Keep the `betZones` logic functional for the new active seat without wiping out bets already placed on other seats.
- Do not break the dealer workflow.

## Preferred edit scope

- `src/features/training/ui/table-renderer.js`
- `assets/css/training.css`
- `src/features/training/training-controller.js` (for click event bindings)

## What not to change in this phase

- no baccarat rule changes
- no settlement contract changes
- no insurance contract changes
- no localStorage key changes
- no major controller refactor

## Verification required

- `npm run build`
- `npx playwright test tests/training.spec.js tests/training-ux.spec.js`
- targeted seat-selection verification
- confirm all of these still work:
  - switching seats updates the active state visually
  - bets can be placed on multiple seats independently
  - settlement correctly processes multi-seat bets

## Expected outcome

- The player can effortlessly switch between 5 seats directly on the casino table interface.
- Existing bet tracking accurately retains independent data for all seats.

## After finishing

Update:

- `docs/operation-training-rebuild/03-REBUILD-MASTER-CHECKLIST.md`
- `docs/operation-training-rebuild/06-CURRENT-STATUS.md`
- `docs/operation-training-rebuild/07-CHANGELOG.md`
- this file with the next phase prompt

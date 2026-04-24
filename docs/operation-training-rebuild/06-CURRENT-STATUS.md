# 06 - CURRENT STATUS

## Status

`R4 Face-down cards and reveal complete`

## Current truth

- R1 audit has been completed from current code truth.
- R2 visual/layout code has been implemented in the rebuild track.
- R3 hardened the dealer-side shoe drag workflow as the primary manual dealing experience.
- R4 implemented realistic casino card-backs, face-down dealing, and smart DOM updates for stable flip animations.
- No baccarat, settlement, insurance, or seat-engine contract was changed in R4.

## Why the rebuild exists

The current module already has working baccarat logic, settlement logic, insurance logic, drag logic, and partial table visuals.

However, it still does not fully satisfy the new product target:

- realistic dealer-side table workflow
- realistic on-felt betting seats
- realistic hidden-card visuals
- clear seat-selection UX
- highest-bet squeeze ownership logic
- full casino-style result board presentation

## What R2 changed

- `home/training/index.html`
  moved the visible shoe source onto the dealer side of the table while preserving `#tr-card-source`
- `home/training/index.html`
  replaced the flat 5x6 betting block markup with 5 on-felt seat bays that still keep `data-seat` and `data-zone`
- `home/training/index.html`
  added dealer-side furniture placeholders for discard / dealer center / commission without breaking the existing page flow
- `assets/css/training.css`
  rebuilt the center scene into a more casino-like D-shape table with dealer strip, card lanes, curved seat bays, and stronger seat arc styling
- `assets/css/training.css`
  kept roadmap strip, controls bar, overlay panel, and role-gated layout behavior working with the new table scene

## Protected contracts still untouched

- `baccarat-engine.js`
  core baccarat totals, naturals, draw rules, and round resolution
- `dealing-validator.js`
  manual-deal order enforcement
- `settlement-engine.js`
  settlement row generation and totals
- `insurance-engine.js`
  insurance eligibility and payout logic
- `seat-engine.js`
  5-seat structure and balance math
- `config-manager.js`
  persisted table/rule/insurance keys and defaults

## Product gaps still open after R4

- Table realism is stronger, dealer drag flow is standard, and cards flip realistically, but the module is not quite done.
- `activeSeatId` exists, but there is no direct on-table seat selector UX.
- The result board renders 4 roads only in the current DOM (missing Cockroach road canvas).
- Highest-bet squeeze authorization is not fully linked to a visual representation yet.

## High-risk files for future work

- `home/training/index.html`
- `assets/css/training.css`
- `src/features/training/training-controller.js`
- `src/features/training/training-orchestrator.js`
- `src/features/training/ui/table-renderer.js`
- `src/features/training/ui/result-boards-renderer.js`

## Next recommended phase

`R5 On-table seat selector UX`

## What must happen next

- introduce an affordance for the customer/player to select their active seat directly on the table.
- update `activeSeatId` appropriately when a seat is selected.
- preserve bet placement and settlement behavior.

## Verification for current status

- `npm run build` - PASS on 2026-04-24
- `npx playwright test tests/training.spec.js tests/training-ux.spec.js` - PASS on 2026-04-24
- responsive smoke check - PASS on 2026-04-24
- Notes:
  - build still shows pre-existing root-page script warnings unrelated to the training module
  - responsive smoke used seeded admin auth and confirmed table / dealer strip / roadmap / seat bays / card zones / controls at desktop and tablet widths
  - Cards now render face-down realistically on drop, and a smart DOM updater (`updateHandDOM`) ensures CSS flip animations only play once upon reveal.

## Last updated by AI

- Date: 2026-04-24
- Session: R4 Face-down cards and reveal
- State: R4 complete, runtime changes limited to CSS and rendering logic in `table-renderer.js` to support card-backs and flip animations.

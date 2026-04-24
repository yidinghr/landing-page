# 00 - READ ME FIRST

This folder is the rebuild handoff set for the **casino-realistic Baccarat Training** rewrite.

It replaces the old "phase complete" narrative with a stricter rule:

- old docs in `docs/operation-training-handoff/` are historical reference only
- new docs in `docs/operation-training-rebuild/` are the **source of truth for the rebuild**
- "all 14 phases complete" in old docs does **not** mean the product is complete against the new requirement

## Product intent

The target is not a generic training workstation.

The target is a **realistic baccarat simulator** that feels like a real casino table:

- curved / D-shape / semi-circle table
- 5 customer betting seats on the felt
- dealer-side shoe workflow
- face-down cards with real card-back visuals
- realistic squeeze / reveal ownership flow
- casino-style road map boards

## Read in this order

1. `00-READ-ME-FIRST.md`
2. `01-CURRENT-STRUCTURE-AUDIT.md`
3. `02-GAP-ANALYSIS.md`
4. `03-REBUILD-MASTER-CHECKLIST.md`
5. `04-AFFECTED-FILES-MAP.md`
6. `05-HANDOFF-PROTOCOL.md`
7. `06-CURRENT-STATUS.md`
8. `07-CHANGELOG.md`
9. `08-NEXT-AI-PROMPT.md`

## Working rules

- Audit first, code later.
- Protect engine contracts before changing UI flow.
- Use current code as truth, not old status claims.
- Keep diffs small and targeted.
- Update the rebuild checklist only after real observable verification.
- Do not mark any rebuild phase complete without matching build/test evidence.

## Critical protected contracts

These are not optional cleanup targets:

- `src/features/training/engines/baccarat-engine.js`
  `resolveRound()` output shape must stay stable.
- `src/features/training/engines/settlement-engine.js`
  `settleRound()` output shape must stay stable because renderers read it directly.
- `src/features/training/engines/insurance-engine.js`
  function contracts must stay stable.
- `src/features/training/engines/seat-engine.js`
  seat structure and seat math must stay stable unless a required business change proves otherwise.
- `src/features/training/config/config-manager.js`
  real localStorage keys are:
  - `yiding_training_rules_v1`
  - `yiding_training_insurance_v1`
  - `yiding_training_table_prefs_v1`

## Known old-doc mismatches that must not be copied forward

- Seat engine path in old docs is partly wrong. Current code uses:
  `src/features/training/engines/seat-engine.js`
  not `src/features/training/scenarios/seat-engine.js`.
- Old docs mention localStorage keys in `yiding.training.*` style.
  Current code uses `yiding_training_*_v1`.

## Definition of "done" for this rebuild

Only count work as done when there is a visible or testable result such as:

- layout changed in browser
- drag flow works correctly
- rule enforcement is preserved
- reveal flow is correct
- road map updates correctly
- `npm run build` passes
- targeted manual smoke tests pass

Until then, status must stay `planned` or `in progress`.

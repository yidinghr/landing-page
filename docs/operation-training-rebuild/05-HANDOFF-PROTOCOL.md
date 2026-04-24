# 05 - HANDOFF PROTOCOL

This protocol applies to every AI or engineer touching the rebuild.

## Before writing code

- Read `00-READ-ME-FIRST.md` first.
- Read the rest of the rebuild docs in order.
- Reconfirm current code truth before proposing edits.
- State clearly which files, which layer, and which risks are affected before editing.

## Mandatory build/check honesty

- Do not mark checklist items complete without real verification.
- If build/test was not run, say that directly.
- If manual test was not run, say that directly.
- If a phase is only partly done, mark it `in progress`, not `completed`.

## Mandatory docs update after each coded phase

After a real implementation phase, update:

- `03-REBUILD-MASTER-CHECKLIST.md`
- `06-CURRENT-STATUS.md`
- `07-CHANGELOG.md`

If the phase is incomplete, status must remain partial or in progress.

## Rules that later AI must not violate

- Do not invent casino business rules.
- Do not rename localStorage keys.
- Do not change the output shape of baccarat, settlement, or insurance engines casually.
- Do not expand `training-controller.js` into a larger all-in-one file.
- Do not delete old docs in `docs/operation-training-handoff/`.
- Do not replace rebuild docs with old "everything complete" claims.

## Protected contracts to preserve

- `src/features/training/engines/baccarat-engine.js`
  `resolveRound()` output shape stays stable.
- `src/features/training/engines/settlement-engine.js`
  `settleRound()` output shape stays stable.
- `src/features/training/engines/insurance-engine.js`
  public function behavior and shape stay stable unless the owner approves a real rule change.
- `src/features/training/engines/seat-engine.js`
  seat structure stays stable unless there is a required product reason.
- `src/features/training/config/config-manager.js`
  localStorage keys stay stable:
  - `yiding_training_rules_v1`
  - `yiding_training_insurance_v1`
  - `yiding_training_table_prefs_v1`

## Default rebuild assumptions currently locked

Until the owner changes them, use these assumptions:

- If 2 seats tie for the highest bet, the dealer decides who gets squeeze rights.
- An authorized squeeze owner may request squeeze on Player or Banker.
- One customer controls one active seat at a time, but may switch seat `1-5` when the workflow allows.
- Insurance is treated as a side workflow with its own tray/panel while still living in the same baccarat-table scene.

## If business logic is unclear

Stop and ask before implementing when the missing answer would change:

- squeeze ownership rules
- seat ownership rules
- insurance workflow boundaries
- result-board conventions
- any pure-engine output contract

## Handoff quality bar

Every session should leave behind:

- exact files touched
- exact behavior changed
- exact verification performed
- exact remaining risk
- exact next recommended action

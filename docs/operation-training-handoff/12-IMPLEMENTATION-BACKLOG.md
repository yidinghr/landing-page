# 12 — Implementation Backlog

Single source of truth for what is planned, in-flight, done, or deferred. Update after every Step in `07` (and after every phase).

Legend: `[ ]` todo · `[/]` in progress · `[x]` done · `[~]` deferred · `[!]` blocked

---

## Phase 1 — Multi-Seat Foundation

- [x] **P1-01** Branch `feat/training-phase1-multi-seat` from `main`
- [x] **P1-02** Create `src/features/training/engines/seat-engine.js` with `createSeats`, `getSeat`, `setBet`, `clearBets`, `debitSeat`, `creditSeat`, `setInsuranceDecision`
- [x] **P1-03** Update `home/training/index.html` with `#seatsRow` and 5 `.tr-seat` nodes
- [x] **P1-04** Add 5-seat CSS styles in `assets/css/training.css`
- [x] **P1-05** Extend `CHIPS` in `training-controller.js` to 11 denominations; add 4 new chip classes in CSS
- [x] **P1-06** Wire controller state from single `bets`/`balance` to `seats` array; default `activeSeatId = 1`
- [x] **P1-07** Extract rendering functions into `src/features/training/ui/table-renderer.js`
- [x] **P1-08** Create `src/features/training/engines/settlement-engine.js` (`settleRound`)
- [x] **P1-09** Create `src/features/training/ui/settlement-renderer.js` (`renderSettlementBoard`)
- [x] **P1-10** Split phase machine to support `deal-1..deal-4`, `draw-p3`, `draw-b3`, `settlement`, `round-end`
- [x] **P1-11** Add manual `[Deal]` per-card click, keep `[Auto-Deal]` for parity
- [x] **P1-12** Burn card reveal on `[New Shoe]` (2-second display, audio optional)
- [x] **P1-13** Create `src/features/training/npc/npc-behavior.js` with `npcAutoBet` for seats 2–5
- [x] **P1-14** Manual smoke test (Section H in `10`)
- [x] **P1-15** Update `09` with any new assumption
- [x] **P1-16** Update this backlog: mark Phase 1 items; add carryovers
- [/] **P1-17** PR: Phase 1 with final report (each `08 Phase 1` criterion pass/fail)

**Phase 1 carryovers**
- PR/commit packaging is pending because the working tree already contains unrelated staged/unstaged cleanup edits.
- NPC betting is deterministic in Phase 1 (seats 2-5 always bet) to satisfy `08` acceptance; restore 60% probability during simulation tuning.
- Tracked `npm run test:e2e` passes. The uncommitted legacy training spec has one stale assertion expecting 6 chips; Phase 1 now requires 11 chips.

---

## Phase 2 — Role Separation

- [x] **P2-01** Create `controllers/dealer-controller.js`
- [x] **P2-02** Create `controllers/customer-controller.js`
- [x] **P2-03** Create `controllers/insurance-controller.js` (idle-only placeholder)
- [x] **P2-04** Body `data-role` gating in CSS for panel visibility
- [x] **P2-05** Role switch lock during non-idle phases
- [x] **P2-06** Create `ui/settings-panel.js` (modal for rules + insurance)
- [x] **P2-07** Wire presets in `config-manager.js` (`RULE_PRESETS`, `INSURANCE_PRESETS`)
- [x] **P2-08** Extend `npc-behavior.js` with dealer and insurance profiles
- [x] **P2-09** New storage key `yiding_training_table_prefs_v1`; register in `09`
- [x] **P2-10** Regression pass against Phase 1 criteria
- [/] **P2-11** PR: Phase 2 with report

**Phase 2 carryovers**
- Insurance remains single-seat by design; multi-seat insurance starts in Phase 3.
- Auto-Deal remains available through `tablePrefs.autoDealEnabled` and the Settings modal.
- Tracked tests do not include the legacy `tests/training.spec.js` 6-chip assertion in this clean branch.
- Full `npm run test:e2e` currently times out in unrelated schedule-module tests; `tests/smoke.spec.js` + `tests/i18n.spec.js` pass and Phase 2 browser smoke passes.

---

## Phase 3 — Multi-Seat Insurance + Insurance Staff

- [x] **P3-01** Expand `insurance-engine.js` for `payoutMode`, `whoCanInsure`, `settleOnTie`
- [x] **P3-02** Add per-seat decision record shape (see `04`)
- [x] **P3-03** Full Insurance Console for staff role
- [x] **P3-04** NPC-staff behavior: auto-offer max when not trainee
- [x] **P3-05** Settlement board: add insurance column, per-seat
- [x] **P3-06** Session log: insurance chips per seat
- [x] **P3-07** Regression pass against Phase 2 criteria
- [x] **P3-08** PR: Phase 3 with report — https://github.com/yidinghr/landing-page/pull/16

**Phase 3 verification — 2026-04-22**
- Browser smoke passed for Insurance Staff 5-row console and Dealer trainee NPC insurance settlement.
- `npm run build` passed.
- `npx playwright test tests/smoke.spec.js tests/i18n.spec.js --workers=1` passed 11/11.
- `npm run test:e2e -- --workers=1` passed 55/55.

---

## Phase 4 — Commission / Change / Wrong-Payout

- [ ] **P4-01** Commission collection as explicit dealer action
- [ ] **P4-02** Change handling (`roundToChipUnit`, short-change tracking)
- [ ] **P4-03** Wrong-payout mode in `scenarios/wrong-payout.js`
- [ ] **P4-04** Correction UI on settlement rows
- [ ] **P4-05** Dealer error log in session log
- [ ] **P4-06** Session score summary
- [ ] **P4-07** Regression pass against Phase 3 criteria
- [ ] **P4-08** PR: Phase 4 with report

---

## Phase 5 — Probability + Squeeze + Scenarios

- [ ] **P5-01** Streak indicator
- [ ] **P5-02** Tie drought counter
- [ ] **P5-03** Pair-rate estimate
- [ ] **P5-04** EV per bet (configurable on/off)
- [ ] **P5-05** Squeeze / reveal animation
- [ ] **P5-06** Manual cut-card placement UI
- [ ] **P5-07** Preset shoe scenarios (`scenarios/shoe-presets.js`)
- [ ] **P5-08** Regression pass against Phase 4 criteria
- [ ] **P5-09** PR: Phase 5 with report

---

## Cross-cutting

- [ ] **X-01** Introduce a minimal test runner (node --test or browser harness) — deferrable until Phase 2
- [ ] **X-02** Decide on i18n story for the three roles (owner input needed)
- [ ] **X-03** Decide whether the scoreboard persists across shoes (owner input needed)
- [ ] **X-04** Audit passes of the auth redirect after every phase
- [ ] **X-05** After Phase 2, consider extracting HTML fragments to templates if the controller file bloats again

---

## Resolved / closed

(No items yet. Move entries here with date + PR link when done.)

---

## Deferred

- `[~]` i18n of training copy — out of scope until owner scopes it.
- `[~]` Persistence of session history to backend — not in requirements.
- `[~]` Multi-browser turn-taking — default is no per `09.D.6`.

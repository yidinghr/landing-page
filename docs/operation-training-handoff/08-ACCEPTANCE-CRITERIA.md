# 08 — Acceptance Criteria

Binary, observable checks. A phase is done only when every listed criterion passes.

---

## Phase 1 — Multi-Seat Foundation

**Must-haves:**
1. The training page renders 5 distinct seats in a row.
2. Chip tray shows all 11 denominations: 1M / 500K / 100K / 50K / 10K / 5K / 1K / 500 / 100 / 25 / 5.
3. Placing a chip on a bet zone credits only the active seat.
4. Each seat has its own balance. Seat 1 starts at 1,000,000. Other seats start at a configurable default (assumption: 1,000,000 each; see `09`).
5. Dealer can click `[Deal]` four times to deal P1-B1-P2-B2 in correct order. Clicking a fifth time does not deal a fifth card unless the draw phase eligibility says so.
6. An `[Auto-Deal]` button still performs the old one-click full deal.
7. On `[New Shoe]`, the burn card is visible for at least 2 seconds, with its count summary ("Burned 7 cards" etc.).
8. After reveal, the Settlement Board shows one row per seat with:
   - Zones bet (summary text)
   - Total bet
   - Outcome
   - Payout
   - Commission (if any)
   - Net
9. NPC auto-bets 4 seats when the trainee is at seat 1. NPC bets are visible on the seats before `[Close Bets]` is clicked.
10. No console errors. No regression in existing baccarat rule, payout, or insurance logic.

**Nice-to-have (not blocking):**
- Seat 1 animated as "active seat".
- Burn-card visible to all roles for now.

**Verification — 2026-04-22**
- [x] 1. Browser smoke confirmed 5 seats render.
- [x] 2. Browser smoke confirmed 11 chip buttons render.
- [x] 3. Browser smoke confirmed chip placement updates Seat 1 bet only.
- [x] 4. Browser smoke confirmed separate seat balances render from seat state.
- [x] 5. Browser smoke confirmed `[Deal]` deals P1-B1-P2-B2 in four clicks.
- [x] 6. Build passed with `[Auto-Deal]` wired; browser smoke kept it enabled in idle.
- [x] 7. Browser smoke confirmed `[New Shoe]` burn notice with count summary for 3 seconds.
- [x] 8. Browser smoke confirmed settlement board renders 5 rows after reveal.
- [x] 9. Browser smoke confirmed NPC bets visible on seats 2-5 after Seat 1 places a bet and before close/deal lock.
- [x] 10. Browser smoke captured no console/page errors; `npm run build` and tracked `npm run test:e2e` passed. An uncommitted legacy training spec still has a stale 6-chip assertion and was not updated in this Phase 1 commit.

---

## Phase 2 — Role Separation

**Must-haves:**
1. Choosing "Dealer" in the role selector hides customer-only controls (bet zones are non-interactive, chip tray shown as dealer tray).
2. Choosing "Customer" shows chip tray + bet zones scoped to the active seat only. Dealer controls hidden.
3. Choosing "Insurance Staff" shows only the Insurance Console and a read-only felt. Bet zones and dealer controls hidden.
4. Role cannot switch during `dealing`, `insurance_window`, `draw_phase`, `reveal`, `settlement`.
5. NPC logic runs for the two roles not held by the trainee. No role is idle.
6. Settings modal is reachable from the header and can change:
   - Banker commission (rate)
   - Tie payout
   - Pair payouts
   - Lucky Six payouts
   - Insurance enabled/disabled
   - Insurance condition, maxPct, payout, staffControlled
7. Settings persist to localStorage and load on refresh.
8. No regression in Phase 1 criteria.

---

## Phase 3 — Multi-Seat Insurance + Insurance Staff

**Must-haves:**
1. When the offer condition triggers, the Insurance Console opens for the staff role (or customer seats, if `staffControlled=false`).
2. Every eligible seat has an independent decision recorded (see `04` for the decision shape).
3. Insurance amount is validated against `maxInsurancePct` relative to the correct base (see `whoCanInsure`).
4. Insurance payout honors `payoutMode` (`flat` / `onlyIfBankerNatural` / `onlyIfBankerWinsNon-tie`) and `settleOnTie`.
5. Settlement board shows insurance column per seat.
6. NPC Insurance Staff resolves all eligible seats automatically when staff is not the trainee.
7. No regression in Phase 2 criteria.

---

## Phase 4 — Commission / Change / Wrong-Payout

**Must-haves:**
1. Dealer must click `[Collect Commission]` on commission-bearing seats before `[Confirm Round]`; otherwise round scores a procedure error.
2. Change: when payout is not a whole multiple of 5 (smallest chip), dealer must acknowledge the short amount.
3. Wrong-payout mode (opt-in via Settings) seeds exactly one deliberate error per round in a random seat.
4. Dealer can click `[Correct]` on a seat to override. Correct override within the same round counts as a catch.
5. Session stats show dealer procedure error count.
6. No regression in Phase 3 criteria.

---

## Phase 5 — Probability + Squeeze + Scenarios

**Must-haves:**
1. Streak indicator updates live from the log.
2. Tie drought counter visible.
3. Pair-rate estimate visible.
4. EV per bet configurable on/off; default off.
5. Squeeze / reveal animation is enabled in dealer role (for the 3rd and reveal steps). Can be disabled in Settings.
6. Cut card can be placed manually on `[New Shoe]` in dealer role.
7. Preset shoe scenarios selectable from Settings.
8. No regression in Phase 4 criteria.

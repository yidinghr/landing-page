# 07 — ROLE WORKFLOWS

Detailed workflow for each of the three trainee roles.
Mirrors real casino procedure; code must match this flow.

---

## Role selection

Set in the settings panel (`tablePrefs.role`) or via the role selector pill.
Stored in `state.role` and mirrored to `body[data-role]`.
CSS handles visibility gating per role.

---

## A. Dealer (sàn chính)

Primary training role. Runs the whole round.

### A.1 Session start
1. Click "New shoe" → 8-deck shoe shuffled, cut card at `manualCutPct` (default 65%).
2. Burn card auto-handled (`burnCount` tracked in shoe).
3. Role defaults to `dealer` unless changed in settings.
4. Bet matrix auto-locks until round starts (or auto-deal is on).

### A.2 Round flow

```
IDLE → BETTING → DEAL_1 → DEAL_2 → DEAL_3 → DEAL_4 → {INSURANCE | DRAW_P3 | REVEAL} → SETTLEMENT → ROUND_END → BETTING (next)
```

| Step | Action | UI |
|------|--------|----|
| 1 | Close bets | Click "Đóng cửa" / auto on auto-deal |
| 2 | Deal P1 | Drag card source → Player zone |
| 3 | Deal B1 | Drag card source → Banker zone |
| 4 | Deal P2 | Drag card source → Player zone |
| 5 | Deal B2 | Drag card source → Banker zone |
| 6a | If banker≥7: offer insurance | Insurance panel appears, dealer waits for insurance staff OR auto-resolves NPCs |
| 6b | If natural: skip 3rd card | Auto-advance to REVEAL |
| 6c | Else: evaluate P3 | If player draws, drag source → Player zone; if stand, skip |
| 7 | Evaluate B3 | If banker draws per table, drag source → Banker zone; if stand, skip |
| 8 | Reveal | Click "Reveal" OR drag each card to flip per queue order if squeeze requested |
| 9 | Result + settlement | Settlement board auto-computes. Dealer drags chips: pay winners (tray → seat), collect losers (seat → tray). |
| 10 | Commission | For each banker-win seat, click "Collect commission" (or drag commission chip to commission box). |
| 11 | Wrong-payout drill | If `wrongPayoutEnabled`, some rounds inject a wrong payout — dealer must catch it before clicking "Next round". |
| 12 | Next round | Resets hands, keeps shoe + log + balances. |

### A.3 What the simulator enforces

- **Order enforcement** via `dealing-validator` — wrong zone produces Vietnamese error + `procedureErrors++`.
- **Phase guard** — can't deal during insurance, can't settle before reveal.
- **Auto-deal toggle** — if enabled, skips drag steps (used for Playwright and debug).
- **Squeeze** — if `squeezeEnabled=true` AND role=dealer, cards animate with a squeeze rotation on reveal.

### A.4 Error catches the dealer must practice

| Scenario | Expected catch |
|----------|----------------|
| NPC places bet on locked zone | Reject bet |
| Wrong-payout drill injects an extra chip | Catch before "Next round"; `catchesThisRound++` |
| Insurance staff tries to buy after deal-4 closed | Phase guard prevents |
| Third card on natural | Validator blocks |

---

## B. Customer (khách)

Places bets, requests reveals, collects winnings.

### B.1 What the customer sees

- Only their active seat's chip stack is highlighted (via `activeSeatId`).
- Bet zones for their seat are clickable.
- Chip tray becomes **personal** (chips come from their balance, not dealer tray).
- During reveal: a customer request panel appears with buttons:
  - "Squeeze P1" / "Squeeze P2"
  - "Squeeze B1" / "Squeeze B2"
  - "Flip Player first" / "Flip Banker first"
  - "Flip all together"
  - "Wait a moment"

### B.2 Round flow

1. **Betting phase**: customer drags chips from personal tray onto bet zones on their seat.
2. After deal-2 (and deal-4), if customer clicks a squeeze button, request is added to `state.revealQueue` with `requestedBy='customer'`.
3. During reveal, dealer must honor customer requests in order (customer takes precedence over NPCs).
4. After settlement: customer collects winnings by dragging chips from seat-zone back to personal stack.

### B.3 What the simulator enforces

- Customer CANNOT deal cards (phase guard + CSS hides card source drag for role=customer).
- Customer CANNOT touch other seats.
- Customer CANNOT collect chips the dealer hasn't paid yet (chip drag origin validated).
- Request panel disappears outside reveal phase.

### B.4 Current state

**Phase 11 — customer request panel is NOT built yet.**
Bet placing + chip drag work because dealer-bet placement shares the same orchestrator action.

---

## C. Insurance Staff (nhân viên bảo hiểm)

Handles the insurance offering when banker has a qualifying 2-card total.

### C.1 Trigger conditions

- `insurance.enabled = true` (settings).
- Banker's first-2-card total ≥ `insurance.offerCondition` threshold:
  - `banker7`: trigger if banker ≥ 7.
  - `banker8`: trigger if banker ≥ 8 (natural only).
  - `always`: every round.
- Phase = `INSURANCE` (between deal-4 and draw-p3/reveal).

### C.2 Who can insure

Per `insurance.whoCanInsure`:
- `player-only`: seats with a Player main bet.
- `main-bets`: Player or Banker main bets.
- `all-bets`: any bet.

### C.3 Staff-controlled flow (`insurance.staffControlled = true`)

1. Deal-4 completes. Orchestrator transitions to `INSURANCE` phase.
2. Each eligible seat shows in the insurance panel with status "pending".
3. For each seat:
   - If NPC: orchestrator auto-picks `decline` or `maxAccept` based on `insuranceNpcMode`.
   - If human seat (activeSeatId with role=insurance): staff clicks "Decline" / "Buy 50%" / "Buy 100%" etc.
4. Staff reviews all decisions, clicks "Confirm" to exit INSURANCE phase.
5. Phase advances to `draw-p3` or `reveal`.

### C.4 After round

- Insurance settlement runs separately from main settlement.
- Per `insurance.payoutMode`:
  - Banker won + natural rule satisfied → staff pays 1:1 per stake.
  - Banker did not qualify → staff collects stake.
- Separate chip tray tracks insurance stakes — never mixes with dealer tray.

### C.5 What the staff must practice

- **Trigger recognition**: is this a qualifying banker total?
- **Multi-seat speed**: 5 seats in under 60s with no wrong payouts.
- **Separate tracking**: insurance chips never enter the main tray.
- **NPC prompt handling**: respond to "buy max" / "decline" / "buy 25K" from NPC seats.

### C.6 What the simulator enforces

- Insurance panel only visible during INSURANCE phase for eligible seats.
- Auto-deal blocks until staff confirms (`state.autoAfterInsurance` flag).
- Wrong-payout drill can inject an insurance payout error.
- Role-CSS hides dealer controls + chip tray + bet zones from insurance staff view.

---

## Role switching mid-session

Allowed — controlled by `ROLE_SWITCH_PHASES` in `phase-machine.js`. Typically only safe during `IDLE` / `BETTING` / `ROUND_END`.
Switching during DEALING / REVEAL / SETTLEMENT is rejected at the orchestrator to avoid corrupting the drag state.

---

## Success metrics per role

| Role | Metric | Target |
|------|--------|--------|
| Dealer | `procedureErrors` per 10 rounds | < 2 |
| Dealer | Wrong-payout catches | 100% |
| Customer | Bet placement errors | < 1 per session |
| Customer | Correct chip collection after win | 100% |
| Insurance | Multi-seat round time | < 60s |
| Insurance | Settlement accuracy | 100% |

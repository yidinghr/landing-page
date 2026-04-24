# 01 — MASTER PLAN

Full product plan for the Operation Training module.
This is the **product vision**, not the phase-by-phase code plan — for that see [02-PHASE-CHECKLIST.md](02-PHASE-CHECKLIST.md).

---

## 1. Vision

A **browser-based realistic baccarat table simulator** used by YiDing to train three categories of floor staff:

1. **Dealer** — draws cards, validates order, flips, collects & pays chips, settles commissions.
2. **Customer** — places chips, requests squeeze, collects winnings.
3. **Insurance Staff** — watches for banker-natural trigger, offers insurance per seat, records decisions, settles separately.

The simulator must feel like a **real table** — curved felt, realistic chips with denomination stacks, real bead/big/derived roadmaps, and NPCs that behave plausibly (request squeeze, decline insurance, place varied bets).

Goal: a trainee walks onto a real floor with muscle memory for **procedure order, error catching, and multi-seat settlement.**

---

## 2. Product pillars

### A. Realistic curved/arc table layout
- Curved felt like a real 5-seat baccarat table (player seats arced around the dealer).
- Betting zones painted into the felt per seat (Player / Banker / Tie / P-Pair / B-Pair / Lucky-6).
- Dealer position at top with card shoe + discard rack + chip tray.
- Roadmap strip visible to all seats.
- Currently: a flat 5×6 grid — **needs Phase 14 visual redesign** (gap A).

### B. Real baccarat roadmap board
- **Bead road** — one dot per round, red/blue/green, pair side-dots.
- **Big road** — column-wise layout with tie marks.
- **Big eye boy / Small road / Cockroach pig** — derived repeat/non-repeat from big road.
- Currently: all four implemented in [result-boards-renderer.js](../../src/features/training/ui/result-boards-renderer.js). Visuals can be tuned.

### C. Dealer manual operation
- Drag card from shoe → drop on Player / Banker zone.
- Validator enforces P→B→P→B, natural-stop, third-card rules (Phase 7 done).
- Flip / squeeze queue driven by NPC/customer requests (Phase 8 done).
- Collect losing bets, pay winning bets, settle commission per seat (Phase 9 — engine done, orchestrator wiring pending).
- Wrong-payout drill injects payout errors the trainee must catch (existing).

### D. Customer manual operation
- Drag chip from tray onto own seat betting zone.
- Request panel during reveal: "Squeeze P1", "Flip banker first", etc.
- Collect winnings after settlement (drag chips back from seat to personal stack).

### E. Insurance staff operation
- **Only enabled when insurance offerCondition fires** (default banker ≥ 7 from first 2 cards).
- Separate chip tray — never touches main dealer tray.
- NPC prompts: each seat responds "buy / decline / how much".
- Staff records decision + amount per seat, confirms, then settles independently.

### F. Probability from remaining shoe
- `probFromShoe(shoe)` returns `{banker, player, tie, bankerPair, playerPair, luckySix}` based on current card composition.
- Rendered as live prob bar in right sidebar.
- Must update **after every dealt card**, not only between rounds (Phase 5 module done, caller wiring minimal).

---

## 3. Architecture rules

1. **Engines pure** — no DOM / storage / side effects. Everything under `engines/*` and `scenarios/*`.
2. **Renderers render only** — read state, write DOM; never mutate state, never call engines except for formatting helpers.
3. **Controller is a shell** — wires DOM events to orchestrator actions and orchestrator state changes to renderers.
4. **Orchestrator is the brain** — every state change funnels through `orchestrator.handleX(...)` which returns a new state.
5. **State is the single source of truth.** Mutations return new objects (spread-and-replace pattern).
6. **Phase machine gates actions.** Invalid actions must be rejected at the orchestrator, not just hidden in UI.
7. **Role UI is CSS-driven.** `body[data-role]` attribute toggles visibility; JS never manually hides/shows per role.
8. **LocalStorage keys are stable.** Migration only via explicit config-manager migration step.

---

## 4. Data flow (simplified)

```
 DOM event
    ↓
 training-controller.js (attachEvents)
    ↓
 orchestrator.handleX(args)            ← phase guard + business logic
    ↓
 pure engines (baccarat / shoe / payout / settlement / insurance / prob)
    ↓
 training-state.setX(newState)         ← immutable mutator
    ↓
 renderAll() from controller
    ↓
 table-renderer / result-boards / card-counter / settings
    ↓
 DOM updated
```

NPC requests + reveal queue + insurance per-seat flow follow the same pattern but are pushed from orchestrator side effects (e.g. after `deal-4` completes, orchestrator generates NPC requests into state).

---

## 5. Out of scope (for now)

- Real money / payment integration.
- Multi-user real-time sync (this is a single-trainee simulator).
- Mobile drag (desktop-first; tablet supported).
- Chinese/English localisation (Vietnamese + current UI only).
- Replay / session recording.
- Analytics dashboard (error rates persist only in `state.procedureStats` in-memory).

---

## 6. Success criteria

1. A new dealer can complete a full round (deal → natural-stop check → third-card → reveal → settlement → commission) without prompting.
2. A new customer can place chips, request squeeze, and collect winnings correctly.
3. An insurance staff can handle a 5-seat banker-natural scenario in under 60 seconds with no wrong payouts.
4. Roadmap board matches a real casino display — dealers recognise it immediately.
5. No regressions in Playwright auto-deal test suite.

See **[02-PHASE-CHECKLIST.md](02-PHASE-CHECKLIST.md)** for the per-phase execution plan.

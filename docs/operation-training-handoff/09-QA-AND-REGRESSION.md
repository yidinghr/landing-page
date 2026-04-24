# 09 — QA AND REGRESSION

How to verify the module before and after every change.

---

## 1. Always run before committing

```bash
cd c:/Users/LENOVO/OneDrive/Desktop/YiDing_Web
npm run build
```

**Zero errors expected.** If warnings appear, read them — Vite warnings about unused imports are usually real.

If build fails, stop. Do not commit a broken build.

---

## 2. Dev server for manual testing

```bash
npm run dev
```

Then open:
- Landing: http://localhost:5173/
- Training: http://localhost:5173/home/training/

---

## 3. Playwright tests (when available)

```bash
npx playwright test
# or
npm run test:e2e
```

The existing test suite relies on `tablePrefs.autoDealEnabled = true`. Do not break auto-deal — many tests depend on it.

---

## 4. Manual test matrix per role

### 4.1 Dealer — golden path

- [ ] Click "New shoe" — shoe count shows ~416, cut card marker visible.
- [ ] Place a bet on Seat 1 Player (25K).
- [ ] Click "Đóng cửa" / close bets → phase = `deal-1`.
- [ ] Drag card source → Player area. Card appears, phase = `deal-2`.
- [ ] Drag source → Banker. `deal-3`. Drag → Player. `deal-4`. Drag → Banker.
- [ ] Verify transition to `insurance` / `draw-p3` / `reveal` per banker total.
- [ ] Click "Reveal". Result badge shows winner; settlement board appears.
- [ ] Drag chips from tray → Seat 1 zone if won. Click "Next round".
- [ ] Log entry appears with round #1.

### 4.2 Dealer — error catches

- [ ] During `deal-1`, drag to Banker → Vietnamese error "Lá 1 phải đưa cho Player trước". `procedureErrors` ++.
- [ ] Natural-hand scenario: after deal-4 with P8/P9, verify no third card allowed.
- [ ] Wrong-payout drill (`wrongPayoutEnabled=true`): occasionally the settlement board shows extra chip. Dealer must click "Catch" before next round.

### 4.3 Customer — golden path

- [ ] Settings → Role = Customer, Active seat = 1.
- [ ] Card source should be invisible (CSS gating).
- [ ] Drag chip from personal tray → Seat 1 Player zone. Bet visible.
- [ ] Click "Close bets" (customer button variant).
- [ ] Dealer auto-deals (if autoDealEnabled) or wait for dealer role.
- [ ] During reveal phase: customer request panel (Phase 11 — NOT BUILT YET) should appear.
- [ ] Collect winnings after settlement.

### 4.4 Insurance Staff — banker natural scenario

- [ ] Settings: Role = Insurance, `staffControlled = true`, `offerCondition = banker7`.
- [ ] Main view hides bet zones, chip tray, controls.
- [ ] Dealer (or auto-deal) runs until deal-4.
- [ ] If banker total ≥ 7: insurance panel appears with eligible seats.
- [ ] Click "Buy 100%" on Seat 1, "Decline" on Seat 2. NPC seats auto-decide.
- [ ] Click "Confirm" → phase advances.
- [ ] After reveal: settlement board shows insurance column with payouts.

### 4.5 Role switch

- [ ] During IDLE: switch dealer → customer → insurance. Each view updates.
- [ ] During DEAL_2: try to switch. Should be rejected (phase guard).
- [ ] During ROUND_END: switch works.

### 4.6 Session persistence

- [ ] Open settings, change "Banker commission" to 3%.
- [ ] Reload page.
- [ ] Verify commission is still 3% (localStorage persists).

---

## 5. Regression hotspots

Areas that break most often when changed:

1. **Phase transitions** — adding a phase without updating `VALID_TRANSITIONS` breaks everything downstream.
2. **Log shape** — roadmap renderers depend on `entry.winner`, `entry.pPair`, `entry.bPair`. Don't rename.
3. **Settlement output shape** — `renderSettlementBoard` reads specific columns. Don't add/remove fields silently.
4. **Role CSS** — adding a new DOM section without a `body[data-role=…]` hide rule leaks it across roles.
5. **Auto-deal loop** — any orchestrator handler that throws unhandled breaks auto-deal, which kills Playwright.
6. **Shoe ownership** — only `shoe-engine.dealOne` mutates position; renderers must not touch `shoe.pos`.
7. **Chip denomination list** — `CHIPS` in controller + `.tr-chip--*` CSS classes must stay in sync.

---

## 6. Smoke test after Phase 6 + 7 wiring

- [ ] `npm run build` → 0 errors
- [ ] Manual dealer: 4-card deal, error on wrong zone, correct phase advance
- [ ] Auto-deal still works (toggle on, click close bets, verify 3 rounds auto-run)
- [ ] `procedureErrors` increments on validation failure
- [ ] `renderFeedback` shows Vietnamese error message

---

## 7. Known issues / tech debt

- **Cockroach pig road** — data builder exists, no canvas in DOM.
- **Customer request panel (Phase 11)** — not built.
- **Separate insurance chip tray visual (Phase 12 extension)** — not built.
- **Curved felt redesign (Phase 14)** — not started.
- **Prob bar refresh cadence** — verified working but not profiled.
- **Log storage** — memory only, no persistence across reload (by design, but user may expect).

---

## 8. Red flags — stop and ask

If any of these happen, stop and escalate:

- Build fails with errors you don't understand.
- Tests that used to pass now fail.
- `localStorage.getItem('yiding.training.rules')` returns `null` after a change — key was renamed by accident.
- Renderer throws "cannot read property X of undefined" — state shape changed silently.
- Drag ghost stays on screen after drop — event listeners leaked.
- Phase shows invalid value (e.g., `undefined`) — transition logic broke.

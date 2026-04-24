# 02 — PHASE CHECKLIST

Per-phase execution plan. Each phase is **atomic** — merge only when all its acceptance criteria pass.

---

## Legend

- ✅ **Done** — module implemented AND wired AND tested
- 🟡 **Module done, wiring partial** — engine/renderer exists; orchestrator/controller does not yet invoke it
- ⬜ **Not started** — TODO stubs or empty file
- 🔒 **Do not touch** — protected contract

---

## Phase 1 — State + Orchestrator scaffolding ✅

**Goal:** Central immutable state + action-routing orchestrator.

**Files:** `training-state.js`, `training-orchestrator.js`, `phase-machine.js`, `config/config-manager.js`

**Acceptance:**
- [x] `createState()` returns full default shape
- [x] Every mutator returns new state
- [x] Phase transitions validated via `VALID_TRANSITIONS`
- [x] 3 localStorage keys load + save

**Status:** Complete.

---

## Phase 2 — HTML layout + CSS ✅

**Goal:** 3-column workstation layout (left balance/chips, center felt+roadmap+zones+overlay, right prob/counter/stats/log).

**Files:** `home/training/index.html`, `assets/css/training.css`

**Acceptance:**
- [x] Full-height `tr-app` grid `200px 1fr 200px`
- [x] Roadmap strip with 4 canvases (bead / big / eye / small)
- [x] Bet matrix 5×6 grid
- [x] Overlay panel auto-shows when insurance/result/settlement visible
- [x] Role CSS hides insurance-only / dealer-only / customer-only zones

**Status:** Complete. Layout is functional but **rectangular** — pillar A (curved/arc table) still deferred.

---

## Phase 3 — Renderer reconnection ✅

**Goal:** All state reads render to DOM on every `renderAll()`.

**Files:** `ui/table-renderer.js` (+ controller wiring)

**Acceptance:**
- [x] `renderChipTray / renderBetZones / renderSeats / renderBalance / renderPayoutSummary / renderShoe / renderHands / renderResult / renderDetail / renderLog / renderStats` all present
- [x] Backward-compat fallback for legacy `#seatsRow` DOM
- [x] Squeeze animation on `[data-role=dealer][data-squeeze=enabled]`

**Status:** Complete.

---

## Phase 4 — Roadmap boards (bead / big / eye / small) ✅

**Goal:** Real baccarat roadmap renders from `state.log`.

**Files:** `ui/result-boards-renderer.js`

**Acceptance:**
- [x] Bead road: dots colored per outcome, pair dots in corners
- [x] Big road: column layout, tie diagonal marks, pair dots
- [x] Big eye boy: compareOffset=1 derived
- [x] Small road: compareOffset=2 derived
- [x] Cockroach pig: compareOffset=3 (exported but **not rendered** — add canvas if needed)

**Status:** Done. Cockroach pig function exists but no canvas in DOM yet.

---

## Phase 5 — Card counter + live probability ✅

**Goal:** Live prob bar + per-rank remaining counter.

**Files:** `ui/card-counter-renderer.js`, `engines/prob-engine.js`

**Acceptance:**
- [x] `probFromShoe(shoe)` returns approx `{banker, player, tie, bankerPair, playerPair, luckySix}`
- [x] `buildRemovedCardCounts` iterates from `burnCount` to `pos`
- [x] `renderCardCounter` draws 13-rank grid
- [x] `renderLiveProb` draws 6-item bar
- [ ] Orchestrator calls `probFromShoe` **after every dealt card** (currently only on render tick) — **VERIFY**

**Status:** Module done. Wiring to call on every deal event may be incomplete.

---

## Phase 6 — Card drag engine ✅

**Goal:** Dealer drags cards from shoe source to Player/Banker zone.

**Files:** `ui/drag-engine.js` (initCardDrag), `training-orchestrator.js` (handleCardDrop)

**Acceptance:**
- [x] `initCardDrag` creates ghost, caches drop rects, handles mouseup hit test
- [x] Only active during `DEALING_PHASES`
- [x] Orchestrator `handleCardDrop(targetZone)` validates, deals, writes to state, and advances phase
- [x] Controller initializes `initCardDrag` on mount
- [x] Browser drag test: source → Player renders P1 and decrements shoe count

**Status:** Complete. Wired and browser-verified (headless) on 2026-04-24.

**Do-not-touch:** `shoe-engine.dealOne`, `baccarat-engine.*`.

---

## Phase 7 — Dealing validator ✅

**Goal:** Reject out-of-order / natural-stop / third-card-violation drops with clear Vietnamese messages.

**Files:** `engines/dealing-validator.js`

**Acceptance:**
- [x] All 11 error codes in `DEAL_ERRORS`
- [x] `validateCardDrop(phase, targetZone, pCards, bCards, result)` returns `{valid, errorCode, message}`
- [x] Messages use `{total}` / `{bTotal}` / `{p3val}` interpolation
- [x] Orchestrator calls validator in `handleCardDrop` **before** `dealOne`
- [x] Error feedback renders in `#tr-feedback-panel` via `renderFeedback`
- [x] Wrong-order drag keeps phase unchanged and increments `Dealer err.` in stats

**Status:** Complete. Wired and browser-verified (headless) on 2026-04-24.

---

## Phase 8 — Reveal flow manager 🟡

**Goal:** Ordered flip/squeeze queue driven by NPC + customer requests.

**Files:** `ui/reveal-flow-manager.js`, orchestrator `handleFlipCard`

**Acceptance:**
- [x] `buildRevealQueue(npcRequests, customerRequests, existingCards)`
- [x] `validateFlipAction(queue, cardKey)` returns `{allowed, expected, message}`
- [x] `applyFlip`, `isRevealComplete`, `allCardsRevealed`
- [x] Orchestrator `handleFlipCard(cardKey)` wired
- [x] `state.revealQueue` built after dealing enters `reveal`
- [x] Face state `{p1,p2,b1,b2,p3?,b3?}` tracked in state
- [x] Browser reveal test: cards are face-down before flip, one valid click reveals one card, final click settles the round
- [x] Deterministic queue test: wrong first flip shows Vietnamese feedback and increments procedure errors

**Status:** Wired and automated-verified on 2026-04-24. Human manual browser pass still pending, so this phase remains 🟡 in docs.

---

## Phase 9 — Chip drag + payout validator ✅

**Goal:** Dealer drags chips from tray → seat (pay) or seat → tray (collect).

**Files:** `ui/drag-engine.js` (initChipDrag), `engines/payout-validator.js`, orchestrator `handleChipDrop`

**Acceptance:**
- [x] `initChipDrag` — mousedown on `[data-chip-value]`, only active in `settlement` phase
- [x] `validatePaidAmount / validateCollectedAmount / suggestChipBreakdown / isValidDenomination / isSettlementComplete`
- [x] Orchestrator `handleChipDrop(zoneKey, denomination)` — **implemented and wired**
- [x] Controller initializes `initChipDrag` with seat drop zones — **wired**
- [x] `state.chipsPaidBySeat / chipsCollectedBySeat` updated on each drop

**Status:** Wired and automated-verified (headless browser) on 2026-04-24.

---

## Phase 10 — NPC request engine 🟡

**Goal:** NPC seats emit contextual squeeze/flip requests after deal-4.

**Files:** `npc/npc-request-engine.js`, orchestrator `handleNpcRequestsGenerated`

**Acceptance:**
- [x] `generateSeatPersonalities()` — 5 profiles per shoe
- [x] `generateRoundRequests(seats, phase, round, difficulty, history, personalities)`
- [x] `isBlockedByAntiRepetition` — dedup rules
- [x] `DIFFICULTY_PROFILES` for easy / medium / hard / expert
- [ ] Orchestrator generates + pushes requests into `state.npcRequestQueue` after deal-4 — **stubbed**
- [ ] Speech-bubble UI renders queue above each seat — **NOT BUILT**

**Status:** Engine done. UI + orchestrator integration **pending**.

---

## Phase 11 — Customer request panel ⬜

**Goal:** When role=customer, show a request panel during reveal phase with buttons: Squeeze P1 / Flip banker first / Flip all together / Wait.

**Files:** New `ui/customer-request-panel.js`, HTML section in `index.html`, orchestrator `handleCustomerRequest`

**Acceptance:**
- [ ] Panel visible only when `body[data-role=customer]` AND `phase ∈ {deal-4, insurance, reveal}`
- [ ] Clicking a button pushes into `state.revealQueue` with `requestedBy: 'customer'`
- [ ] Customer requests always take precedence over NPC requests (customer is human trainee)

**Status:** Not started.

---

## Phase 12 — Insurance extensions ✅ (mostly)

**Goal:** Per-seat insurance with staffControlled flow.

**Files:** `training-orchestrator.js`, `engines/insurance-engine.js`, `config/config-manager.js`

**Acceptance:**
- [x] `markInsuranceOffers` computes eligible seats
- [x] `resolveNpcPendingInsurance` auto-decides NPC seats based on `insuranceNpcMode`
- [x] `handleInsuranceDecision(seatId, option)` applies buy/decline/amount
- [x] Staff-controlled flow blocks auto-deal until confirm
- [ ] **Separate chip tray for insurance staff** — not yet visually separated

**Status:** Core done. Separate-tray visual deferred.

---

## Phase 13 — QA pass ⬜

**Goal:** Regression + manual flows for all 3 roles.

**Files:** Playwright tests + manual walkthrough

**Acceptance:**
- [ ] `npm run build` — zero errors
- [ ] `npm run test` / Playwright auto-deal passes
- [ ] Manual dealer flow: 3 rounds no errors
- [ ] Manual customer flow: bet + request squeeze + collect
- [ ] Manual insurance flow: banker-natural scenario, 5 seats
- [ ] Role switch mid-session doesn't corrupt state

**Status:** Not started (pending Phase 6–11 wiring).

---

## Phase 14 — Realistic curved/arc table redesign ⬜

**Goal:** Replace rectangular 5-seat row with curved felt matching a real 5-seat baccarat table.

**Files:** `assets/css/training.css`, `home/training/index.html` (layout only — no JS)

**Acceptance:**
- [ ] Curved felt with seats arranged in an arc
- [ ] Betting zones painted per-seat on the felt
- [ ] Dealer position visually distinct at top
- [ ] No JS / state changes — pure layout

**Status:** Not started. **Do this AFTER Phase 13 QA passes** — don't merge redesign into logic phase.

---

## Summary table

| Phase | Name | Module | Wiring | Next action |
|-------|------|--------|--------|-------------|
| 1 | State + orchestrator | ✅ | ✅ | — |
| 2 | HTML + CSS | ✅ | ✅ | Phase 14 redesign later |
| 3 | Renderers | ✅ | ✅ | — |
| 4 | Roadmaps | ✅ | ✅ | (optional) cockroach canvas |
| 5 | Card counter + prob | ✅ | 🟡 | Verify prob call on every deal |
| 6 | Card drag | ✅ | ✅ | — |
| 7 | Dealing validator | ✅ | ✅ | — |
| 8 | Reveal flow | ✅ | ✅ | Human smoke check pending |
| 9 | Chip drag + payout | ✅ | ✅ | — |
| 10 | NPC requests | ✅ | ⬜ | Wire generator + speech UI |
| 11 | Customer panel | ⬜ | ⬜ | Build panel |
| 12 | Insurance extensions | ✅ | ✅ | (optional) separate tray |
| 13 | QA pass | ⬜ | ⬜ | After 6–11 done |
| 14 | Curved table redesign | ⬜ | ⬜ | After 13 passes |

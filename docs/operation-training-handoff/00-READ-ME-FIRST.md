# 00 — READ ME FIRST

> **Entry point for every AI/engineer handed off the Operation Training module.**
> Read this file before writing or reviewing a single line of code.

---

## 1. Goal of this module

Build a **realistic baccarat casino operation training simulator** inside `yidinghr/landing-page`
(sub-route: [/home/training/](../../home/training/)) that teaches three roles end-to-end:

| Role | What they do | What they train |
|------|--------------|-----------------|
| **Dealer (sàn chính)** | Draw cards from shoe, validate draw order, flip/squeeze, collect & pay chips, settle commission | Procedural accuracy, speed, error-catching |
| **Customer (khách)** | Place chips on felt, request squeeze/peel, collect wins | Customer-facing behavior and chip etiquette |
| **Insurance Staff** | Observe banker natural trigger, offer insurance per-seat, record buy/decline/amount, settle separately | Reading trigger conditions, separate tray, NPC prompts |

The simulator must reproduce a real casino table so trainees build muscle memory
before touching a live floor.

---

## 2. Files to read first (in this order)

| # | Path | Why |
|---|------|-----|
| 1 | [src/features/training/SKELETON-INDEX.md](../../src/features/training/SKELETON-INDEX.md) | Phase map + invariants |
| 2 | [home/training/index.html](../../home/training/index.html) | Actual DOM mount points |
| 3 | [assets/css/training.css](../../assets/css/training.css) | Visual layout (felt, chips, seats, roadmap strip) |
| 4 | [src/features/training/training-controller.js](../../src/features/training/training-controller.js) | Entry: DOM refs, renderAll, attachEvents, init |
| 5 | [src/features/training/training-state.js](../../src/features/training/training-state.js) | Immutable state shape + all mutators |
| 6 | [src/features/training/training-orchestrator.js](../../src/features/training/training-orchestrator.js) | Action handlers (deal, insurance, reveal, settlement, NPC) |
| 7 | [src/features/training/phase-machine.js](../../src/features/training/phase-machine.js) | Phase enum + valid transitions |
| 8 | [src/features/training/config/config-manager.js](../../src/features/training/config/config-manager.js) | 3 localStorage keys + presets |
| 9 | [src/features/training/ui/table-renderer.js](../../src/features/training/ui/table-renderer.js) | Chips, zones, seats, hands, payout, log |
| 10 | [src/features/training/ui/result-boards-renderer.js](../../src/features/training/ui/result-boards-renderer.js) | Bead/Big/Eye/Small road canvases |
| 11 | [src/features/training/ui/card-counter-renderer.js](../../src/features/training/ui/card-counter-renderer.js) | Card counter + live prob bar + feedback panel |
| 12 | [src/features/training/ui/drag-engine.js](../../src/features/training/ui/drag-engine.js) | Card + chip drag (Phase 6 / 9 modules) |
| 13 | [src/features/training/ui/reveal-flow-manager.js](../../src/features/training/ui/reveal-flow-manager.js) | Ordered flip/squeeze queue |
| 14 | [src/features/training/engines/prob-engine.js](../../src/features/training/engines/prob-engine.js) | `probFromShoe()` live prob from remaining cards |
| 15 | [src/features/training/engines/dealing-validator.js](../../src/features/training/engines/dealing-validator.js) | Deal order + natural-stop + draw rules |
| 16 | [src/features/training/engines/payout-validator.js](../../src/features/training/engines/payout-validator.js) | Chip paid/collected validation |
| 17 | [src/features/training/npc/npc-request-engine.js](../../src/features/training/npc/npc-request-engine.js) | NPC customer request generator |
| 18 | [src/features/training/ui/settings-panel.js](../../src/features/training/ui/settings-panel.js) | Settings modal (rules + insurance + prefs) |

Then read the other handoff docs in order:
**01 → 02 → 03 → 04 → 05** (Master plan → phase checklist → current status → handoff protocol → next prompt).

---

## 3. Protected files — do not mutate behavior

These modules define contracts the rest of the system depends on.
**Change shape only with explicit cross-phase approval.**

- **Pure engines (no DOM, no state):**
  - [src/features/training/engines/baccarat-engine.js](../../src/features/training/engines/baccarat-engine.js) — `handTotal`, `isNatural`, `playerDraws`, `bankerDraws`, `resolveRound`
  - [src/features/training/engines/shoe-engine.js](../../src/features/training/engines/shoe-engine.js) — `initShoe`, `dealOne`, `cardValue`, `RANKS`
  - [src/features/training/engines/insurance-engine.js](../../src/features/training/engines/insurance-engine.js)
  - [src/features/training/engines/settlement-engine.js](../../src/features/training/engines/settlement-engine.js) — `settleRound()` output shape frozen
- **Seat engine:** [src/features/training/scenarios/seat-engine.js](../../src/features/training/scenarios/seat-engine.js) — 5-seat creation + balance math
- **Config keys:** `yiding.training.rules` / `yiding.training.insurance` / `yiding.training.tablePrefs` — never rename

---

## 4. Invariants (break these and tests explode)

1. **Engines are pure.** No `document`, no `window`, no `localStorage` in `engines/*` or `scenarios/*`.
2. **State is immutable.** Every `training-state.js` mutator returns a new state object.
3. **`log[]` is newest-first, capped at 60 entries.**
4. **`resolveRound()` / `settleRound()` output shape is frozen** — many renderers read it.
5. **Role gating is CSS-driven** via `body[data-role="dealer|customer|insurance"]`. JS sets the attribute; CSS hides the rest.
6. **Auto-deal must keep working** (used by Playwright). `tablePrefs.autoDealEnabled` toggles it.
7. **`localStorage` keys cannot be renamed** — real users already have saved prefs.
8. **Controller must get SMALLER**, not larger. Heavy logic belongs in orchestrator/engines.
9. **Each phase reduces chaos.** Don't bundle a redesign into a logic phase.

---

## 5. Where to look for existing behavior

| Behavior | Look in |
|----------|---------|
| Phase transitions | `phase-machine.js` `VALID_TRANSITIONS` |
| Valid actions per phase | `phase-machine.js` `validActionsInPhase()` |
| Seat state shape | `scenarios/seat-engine.js` |
| Insurance multi-seat flow | `training-orchestrator.js` `markInsuranceOffers`, `resolveNpcPendingInsurance`, `handleInsuranceDecision` |
| Payout calc | `engines/payout-engine.js` + `engines/settlement-engine.js` |
| Chip denominations | `training-controller.js` `CHIPS = [1_000_000 … 5]` |
| Log entry shape | `training-orchestrator.js` `finalizeRound()` |

---

## 6. What you are NOT allowed to do without approval

- Rename `localStorage` keys
- Change `resolveRound` / `settleRound` output shape
- Convert engines to classes or add DOM access to them
- Merge visual redesign into logic phases
- Delete skeleton TODOs without replacing them with working code
- Bump Node / Vite / lint major versions

---

## 7. Next step

Open **[03-CURRENT-STATUS.md](03-CURRENT-STATUS.md)** to see what phase we are on right now,
then **[05-NEXT-AI-PROMPT.md](05-NEXT-AI-PROMPT.md)** for the ready-to-paste prompt.

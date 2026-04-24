# 01 - CURRENT STRUCTURE AUDIT

This audit describes the current training module based on **code truth**, not old completion claims.

## Repo areas involved

- `home/training/index.html`
  current training page DOM shell
- `assets/css/training.css`
  all major training layout and visual rules
- `src/features/training/`
  state, orchestrator, renderers, drag logic, engines, NPC logic, settings
- `docs/operation-training-handoff/`
  old handoff set, useful for history but not reliable as rebuild truth

## Layer map

### UI / Layout

- `home/training/index.html`
  Main page structure. It has roadmap canvases, felt area, player/banker card areas, bet matrix, seat arc labels, controls, overlay, sidebars, and settings mount.
- `assets/css/training.css`
  Main visual system. It already contains a D-shape shell, felt styling, card styling, role gating, settlement board styling, and layout rules.

### State

- `src/features/training/training-state.js`
  Central immutable-style state container. Holds phase, shoe, cards, result, log, seats, active seat, requests, reveal state, insurance drafts, settlement tracking, and table prefs.

### Orchestrator

- `src/features/training/training-orchestrator.js`
  Workflow brain. It handles new shoe, close bets, manual deal, auto deal, insurance flow, reveal flow, settlement chip flow, customer requests, and NPC request storage.

### Controller

- `src/features/training/training-controller.js`
  DOM wiring shell. It reads elements, attaches events, mounts settings/customer panel, calls renderers, and delegates actions to the orchestrator.
  Important note:
  this file already wires a large amount of flow and should not keep growing casually.

### Phase machine

- `src/features/training/phase-machine.js`
  Enum and transition guard for the training workflow.

### Renderers

- `src/features/training/ui/table-renderer.js`
  Renders cards, scores, bet zones, seat highlights, payout summary, stats, log, and shoe state.
  Current hidden-card rendering still uses placeholder symbols like `?` and `[]`, not a realistic card back.
- `src/features/training/ui/result-boards-renderer.js`
  Renders bead road, big road, big eye boy, and small road.
  `buildCockroachRoadData()` exists in code, but there is no cockroach canvas mounted in the current page DOM.
- `src/features/training/ui/settlement-renderer.js`
  Renders settlement rows and chip procedure state.
- `src/features/training/ui/card-counter-renderer.js`
  Renders live probability and card counter blocks.
- `src/features/training/ui/npc-speech-renderer.js`
  Renders NPC request bubbles above seat columns.
- `src/features/training/ui/customer-request-panel.js`
  Renders the customer request panel for reveal-related actions.
- `src/features/training/ui/settings-panel.js`
  Renders the settings modal for rules, insurance, and table prefs.

### Drag / Drop

- `src/features/training/ui/drag-engine.js`
  Handles drag ghosts, drop hit testing, card drag from source, and chip drag in settlement.
  Current manual dealing already uses drag, but the drag source is still the left sidebar card source, not a shoe placed on the dealer side of the felt.

### Result board

- `src/features/training/ui/result-boards-renderer.js`
  Current roadmap implementation is functional but partial against full casino presentation because only 4 roads are mounted in the DOM.

### Customer / Seat logic

- `src/features/training/engines/seat-engine.js`
  Pure seat state creation, balance math, betting updates, and insurance decision updates.
- `src/features/training/npc/npc-request-engine.js`
  Generates seat personalities and NPC requests.
- `src/features/training/npc/npc-behavior.js`
  Generates NPC auto-bets and NPC insurance responses.
- `src/features/training/training-state.js`
  Stores `activeSeatId`.
- `src/features/training/ui/settings-panel.js`
  Lets the app store a default `activeSeatId`.

### Engines

- `src/features/training/engines/baccarat-engine.js`
  Core baccarat totals, natural logic, draw rules, round resolution.
- `src/features/training/engines/dealing-validator.js`
  Enforces dealing order and third-card restrictions.
- `src/features/training/engines/shoe-engine.js`
  Shoe creation, burn logic, cut handling, and `dealOne`.
- `src/features/training/engines/settlement-engine.js`
  Converts round result plus bets into per-seat settlement rows.
- `src/features/training/engines/insurance-engine.js`
  Insurance eligibility, max bet, and payout logic.
- `src/features/training/engines/payout-engine.js`
  Main bet payout math.
- `src/features/training/engines/payout-validator.js`
  Settlement chip validation rules.
- `src/features/training/engines/prob-engine.js`
  Remaining-shoe probability estimates.

### Docs / Handoff

- `docs/operation-training-handoff/`
  Old documentation set.
  Useful for history, but it contains inconsistent status claims and some outdated file-path/key assumptions.

## Current implementation truth by behavior

### What is already present

- D-shape table shell exists.
- 5 seats exist in data model.
- Bet matrix exists for 5 seats x 6 zones.
- Manual card drag exists.
- Auto-deal shortcut exists.
- Reveal queue exists.
- Customer request panel exists.
- NPC speech bubble renderer exists.
- Insurance flow exists.
- Settlement flow exists.
- Roadmaps exist for bead, big, big eye, small.

### What is still not product-accurate

- The table is only a **visual shell** of a casino table.
  The full gameplay still behaves like a workstation layout.
- The shoe is still in the left panel, not on the dealer side of the table.
- Betting zones are still a rectangular 5x6 grid, not true curved per-seat betting areas on felt.
- Hidden cards use placeholders instead of a real card-back design.
- `activeSeatId` exists in state/settings, but there is no direct seat-selection control on the felt itself.
- Result board is missing cockroach-road rendering in the actual page layout.

## Parts that should not be edited directly unless necessary

Treat these as protected-first:

- `src/features/training/engines/baccarat-engine.js`
- `src/features/training/engines/shoe-engine.js`
- `src/features/training/engines/settlement-engine.js`
- `src/features/training/engines/insurance-engine.js`
- `src/features/training/engines/seat-engine.js`
- `src/features/training/config/config-manager.js`

Also handle with extra care because many other layers depend on their shapes:

- `src/features/training/ui/settlement-renderer.js`
- `src/features/training/ui/table-renderer.js`
- `src/features/training/ui/result-boards-renderer.js`
- `src/features/training/training-state.js`
- `src/features/training/training-controller.js`
- `src/features/training/training-orchestrator.js`

## Current audit conclusion

The current module is **not empty** and **not broken by default**.

It already contains:

- usable baccarat core rules
- usable dealing validation
- usable settlement and insurance logic
- partial realistic visuals
- partial role workflows

But it is still **not aligned enough** with the new casino-realistic product requirement to be treated as complete.

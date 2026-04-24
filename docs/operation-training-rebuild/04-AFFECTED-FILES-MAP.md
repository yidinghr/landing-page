# 04 - AFFECTED FILES MAP

This map is for rebuild planning.

It tells later AI sessions which files are likely read-only and which files may be edited by phase.

## Phase R1 - Audit and protection map

### Read-only

- `home/training/index.html`
- `assets/css/training.css`
- `src/features/training/training-controller.js`
- `src/features/training/training-state.js`
- `src/features/training/training-orchestrator.js`
- `src/features/training/phase-machine.js`
- `src/features/training/ui/table-renderer.js`
- `src/features/training/ui/drag-engine.js`
- `src/features/training/ui/reveal-flow-manager.js`
- `src/features/training/ui/result-boards-renderer.js`
- `src/features/training/engines/*.js`
- `src/features/training/config/config-manager.js`

### May edit

- none

### Why

- This phase is documentation, audit, and contract mapping only.

## Phase R2 - Casino table visual rebuild

### Read-only first

- `src/features/training/engines/baccarat-engine.js`
- `src/features/training/engines/shoe-engine.js`
- `src/features/training/engines/settlement-engine.js`
- `src/features/training/engines/insurance-engine.js`
- `src/features/training/engines/seat-engine.js`

### May edit

- `home/training/index.html`
- `assets/css/training.css`
- `src/features/training/ui/table-renderer.js`
- `src/features/training/training-controller.js`

### Why

- This phase is mainly structural UI and DOM-hook preservation.

## Phase R3 - Dealer shoe drag flow

### Read-only first

- `src/features/training/engines/dealing-validator.js`
- `src/features/training/engines/shoe-engine.js`
- `src/features/training/engines/baccarat-engine.js`
- `src/features/training/phase-machine.js`

### May edit

- `src/features/training/ui/drag-engine.js`
- `src/features/training/training-controller.js`
- `src/features/training/training-orchestrator.js`
- `home/training/index.html`
- `assets/css/training.css`

### Why

- Main work is visual drag source, drop routing, and manual-deal UX.
- Pure engines stay protected unless a proven rules mismatch is found.

## Phase R4 - Face-down cards and reveal

### Read-only first

- `src/features/training/engines/baccarat-engine.js`
- `src/features/training/engines/settlement-engine.js`

### May edit

- `src/features/training/ui/table-renderer.js`
- `src/features/training/ui/reveal-flow-manager.js`
- `src/features/training/training-orchestrator.js`
- `src/features/training/training-controller.js`
- `assets/css/training.css`
- `home/training/index.html`

### Why

- This phase changes card presentation and reveal UX while preserving reveal and settlement triggers.

## Phase R5 - Customer seat selection

### Read-only first

- `src/features/training/engines/seat-engine.js`
- `src/features/training/config/config-manager.js`

### May edit

- `src/features/training/training-state.js`
- `src/features/training/training-controller.js`
- `src/features/training/training-orchestrator.js`
- `src/features/training/ui/settings-panel.js`
- `src/features/training/ui/table-renderer.js`
- `home/training/index.html`
- `assets/css/training.css`

### Why

- Active-seat UX likely needs UI/state/controller/orchestrator updates, but should reuse the existing `activeSeatId` contract.

## Phase R6 - Highest-bet squeeze request

### Read-only first

- `src/features/training/engines/baccarat-engine.js`
- `src/features/training/engines/settlement-engine.js`
- `src/features/training/engines/insurance-engine.js`
- `src/features/training/engines/seat-engine.js`

### May edit

- `src/features/training/training-state.js`
- `src/features/training/training-orchestrator.js`
- `src/features/training/ui/customer-request-panel.js`
- `src/features/training/ui/npc-speech-renderer.js`
- `src/features/training/ui/reveal-flow-manager.js`
- `src/features/training/ui/table-renderer.js`

### Why

- This is a workflow-rights layer, not a baccarat core-rules rewrite.

## Phase R7 - Real baccarat result board

### Read-only first

- `src/features/training/training-state.js`
- `src/features/training/training-orchestrator.js`

### May edit

- `src/features/training/ui/result-boards-renderer.js`
- `home/training/index.html`
- `assets/css/training.css`
- `src/features/training/training-controller.js`

### Why

- Result-board work should preserve `state.log` shape and renderer input assumptions.

## Phase R8 - QA and handoff

### Read-only first

- all implementation files touched by prior rebuild phases

### May edit

- `docs/operation-training-rebuild/03-REBUILD-MASTER-CHECKLIST.md`
- `docs/operation-training-rebuild/06-CURRENT-STATUS.md`
- `docs/operation-training-rebuild/07-CHANGELOG.md`
- `docs/operation-training-rebuild/08-NEXT-AI-PROMPT.md`
- test files only if QA reveals a real missing regression check

### Why

- This phase is verification and truthful handoff, not opportunistic refactor work.

## Hard warning

Do not edit pure engines just because UI work feels easier that way.

Pure engines should be changed only when there is evidence that:

- the current contract is wrong for the real product rule, or
- the current contract cannot safely support the required rebuild behavior.

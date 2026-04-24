# 05 — NEXT AI PROMPT

> Copy everything below the `---` line and paste it as the next AI's first message.
> It is self-contained.

---

You are the next lead engineer on the **Operation Training** module in repo `yidinghr/landing-page` (local path: `c:\Users\LENOVO\OneDrive\Desktop\YiDing_Web`).

## Current phase

**Phase 10 — NPC request engine wiring.**

Phases 1–9 are now wired and automated-verified:
- Phase 6 card drag + Phase 7 dealing validator: working.
- Phase 8 reveal flow: face-down cards, per-card flips, auto-settle on last flip.
- Phase 9 chip drag + payout validator: `handleChipDrop` wired, `initChipDrag` wired, `chipsPaidBySeat`/`chipsCollectedBySeat` tracked, `nextRound` blocked until settlement complete.

The next blocker is Phase 10: NPC seat personalities are never seeded, `generateRoundRequests` is never called, `handleNpcRequestsGenerated` is still a stub, and there is no speech-bubble UI above seats.

## Read these files first (in order)

1. [docs/operation-training-handoff/00-READ-ME-FIRST.md](00-READ-ME-FIRST.md) — invariants + protected files
2. [docs/operation-training-handoff/03-CURRENT-STATUS.md](03-CURRENT-STATUS.md) — exact current wiring + verification evidence
3. [docs/operation-training-handoff/02-PHASE-CHECKLIST.md](02-PHASE-CHECKLIST.md) — Phase 10 acceptance
4. [src/features/training/npc/npc-request-engine.js](../../src/features/training/npc/npc-request-engine.js) — `generateSeatPersonalities`, `generateRoundRequests`, `DIFFICULTY_PROFILES`
5. [src/features/training/training-orchestrator.js](../../src/features/training/training-orchestrator.js) — locate `handleNpcRequestsGenerated` stub + `handleAutoDeal` / `handleCloseBets` where personalities should be seeded
6. [src/features/training/training-state.js](../../src/features/training/training-state.js) — `npcRequestQueue`, `setNpcRequestQueue`, `clearNpcRequestQueue`
7. [src/features/training/ui/reveal-flow-manager.js](../../src/features/training/ui/reveal-flow-manager.js) — `buildRevealQueue(npcRequests, customerRequests, cardKeys)` — NPC requests feed into this
8. [src/features/training/training-controller.js](../../src/features/training/training-controller.js) — where to add speech-bubble render call
9. [home/training/index.html](../../home/training/index.html) — inspect seat DOM structure to understand where speech bubbles can attach
10. [assets/css/training.css](../../assets/css/training.css) — existing seat styles; find a safe hook for bubble positioning

## Files to edit

- `src/features/training/training-orchestrator.js` — implement `handleNpcRequestsGenerated`, seed personalities on `newShoe`, call `generateRoundRequests` after deal-4
- `src/features/training/training-state.js` — add `seatPersonalities` field if not present
- `src/features/training/training-controller.js` — call speech-bubble render on `renderAll()`
- `src/features/training/ui/npc-speech-renderer.js` (**new file**) — minimal speech bubble renderer

## Files to NOT touch

- `engines/baccarat-engine.js`, `engines/shoe-engine.js`, `engines/settlement-engine.js`, `engines/insurance-engine.js` — contract-frozen
- `scenarios/seat-engine.js` — balance math protected
- `config/config-manager.js` — localStorage key names frozen
- `assets/css/training.css` — no visual redesign this phase (add a `<style>` block inside the renderer or a new CSS file if truly needed)
- Do not regress Phase 8 reveal flow or Phase 9 chip drag

## Unfinished task — step by step

### Step 1 — seed seat personalities on `newShoe`

In `training-orchestrator.js`, inside `handleNewShoe(...)`, after `resetSession(...)`:

```js
import { generateSeatPersonalities } from './npc/npc-request-engine.js';
// inside handleNewShoe, after next = resetSession(...)
const personalities = generateSeatPersonalities();
next = setSeatPersonalities(next, personalities); // add mutator to training-state.js
```

Add `seatPersonalities: []` to `createState()` defaults and a `setSeatPersonalities` mutator to `training-state.js`.

### Step 2 — call `generateRoundRequests` after deal-4

In `training-orchestrator.js`, after the opening four cards are dealt and before entering reveal (i.e., inside `maybeOfferInsurance` or the point where phase transitions away from `deal-4`):

```js
import { generateRoundRequests } from './npc/npc-request-engine.js';
// generate requests
const requests = generateRoundRequests(
  state.seats,
  state.phase,
  state.roundNum,
  state.tablePrefs.difficulty || 'medium',
  state.log,
  state.seatPersonalities
);
next = setNpcRequestQueue(next, requests);
```

Important: call `generateRoundRequests` **before** `enterRevealState`, because `enterRevealState` calls `buildRevealQueue(npcRequestQueue, ...)` which consumes the queue.

### Step 3 — implement `handleNpcRequestsGenerated`

Replace the current stub:

```js
function handleNpcRequestsGenerated(requests) {
  void requests;
}
```

With:

```js
function handleNpcRequestsGenerated(requests) {
  if (!Array.isArray(requests)) return;
  const state = getState();
  update(setNpcRequestQueue(state, requests));
}
```

### Step 4 — build minimal speech-bubble UI

Create `src/features/training/ui/npc-speech-renderer.js`:

- Accept `(hostEl, npcRequestQueue, seats)` — `hostEl` is a container element.
- For each request in the queue, render a small speech bubble:
  - Find or create a `[data-seat-bubble="N"]` element positioned near seat N.
  - Show the request action text (e.g. "Squeeze P1", "Flip Banker first").
  - Clear bubbles when queue is empty.
- Keep it minimal: no animations required, no new HTML in `index.html` needed if you can append to an existing seat container.
- Import and call `renderNpcSpeechBubbles(hostEl, npcRequestQueue, seats)` from `training-controller.js` inside `renderAll()`.

### Step 5 — verify

Minimum checks:

```bash
npm run build
```

Then in browser:
1. Start a new shoe — verify personalities are seeded (console log or state inspect).
2. Auto Deal a round — verify `npcRequestQueue` is non-empty after deal-4 (check via console).
3. Check that speech bubbles appear above at least one seat showing NPC request text.
4. Verify Phase 8 reveal queue is still built correctly (requests flow into `buildRevealQueue`).
5. Confirm Phase 9 chip drag still works after your changes.

### Step 6 — update handoff docs

Before ending your session:

- Update [03-CURRENT-STATUS.md](03-CURRENT-STATUS.md)
- Append to [10-CHANGELOG.md](10-CHANGELOG.md)
- Rewrite this file ([05-NEXT-AI-PROMPT.md](05-NEXT-AI-PROMPT.md)) for **Phase 11 — Customer request panel** or the actual next blocker

## Expected outcome

After your session:

- `npm run build` passes
- NPC seat personalities are seeded on each new shoe
- `npcRequestQueue` is populated after deal-4
- At least minimal speech bubbles render above seats
- Phase 8 reveal queue consumes NPC requests correctly
- Phase 11 becomes the next blocker

## Hard rules

- **Respond in Vietnamese to the user** (per global instructions). Docs in this folder stay English for AI-to-AI continuity.
- **Do not rename localStorage keys.**
- **Do not modify frozen engines.**
- **Do not merge visual redesign into this phase.**
- **Do not mark a phase `✅` without real runtime evidence.**

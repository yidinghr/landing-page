# 04 — HANDOFF PROTOCOL

How any AI / engineer ends their work session and prepares the next session.

---

## Why this exists

This module is large and handed between multiple AI sessions. Without a protocol,
context is lost and the same skeleton TODO gets half-implemented three times.
Follow this every single handoff.

---

## At end of every session — mandatory checklist

### 1. Update [03-CURRENT-STATUS.md](03-CURRENT-STATUS.md)

- Flip phase status (⬜ / 🟡 / ✅) to reflect actual state.
- Update the **Recommended next phase** block.
- Paste last `npm run build` output into the build status block.
- Remove completed items from the "not wired" list; add newly discovered blockers.

### 2. Describe what changed

Append a dated entry to [10-CHANGELOG.md](10-CHANGELOG.md):

```md
## 2026-04-24 — AI: Opus 4.x

### Changed
- Wired orchestrator.handleCardDrop to dealing-validator + shoe-engine.dealOne.
- Added advancePhaseAfterDeal helper.
- Added face-state tracking to training-state.js.

### Files touched
- src/features/training/training-orchestrator.js (lines 220-270)
- src/features/training/training-state.js (new setFaceState helper)
- src/features/training/training-controller.js (initCardDrag call)

### Tests run
- npm run build — PASS
- Manual dealer flow — 3 rounds OK
- Manual wrong-order drop — error rendered, procedureErrors +1

### Failures / open issues
- initCardDrag does not yet rebind when new shoe fires.
- TODO: prob-bar refresh rate feels slow — profile on next session.
```

### 3. Write the next prompt

Rewrite [05-NEXT-AI-PROMPT.md](05-NEXT-AI-PROMPT.md) so it is **self-contained** for a cold AI:
- Current phase + short status
- Files to read first
- Files to edit
- Files to NOT touch
- Concrete unfinished task (step-by-step)
- Test commands
- Expected outcome

### 4. Commit convention

Include phase number in the commit subject:

```
feat(training): phase-6 wire card drag to orchestrator

- validate drop via dealing-validator before dealOne
- advancePhaseAfterDeal helper
- render validation errors via renderFeedback
```

**Never** commit with skeleton TODOs replaced by `return state;`. That silently breaks the pipeline.

### 5. Run build before committing

```bash
npm run build
```

If it fails, do not commit. Fix or leave an uncommitted WIP branch.

### 6. Never claim "done" without evidence

Per user's global working contract:
> Do not say "done", "fixed", "verified", "correct", "safe", or "complete" unless there is real observable change.

If the build passes but you did not manually test the feature, write exactly that in the changelog. Better a known gap than a false claim.

---

## Receiving a handoff — mandatory checklist

### 1. Read in order
1. [00-READ-ME-FIRST.md](00-READ-ME-FIRST.md)
2. [03-CURRENT-STATUS.md](03-CURRENT-STATUS.md)
3. [05-NEXT-AI-PROMPT.md](05-NEXT-AI-PROMPT.md)
4. [10-CHANGELOG.md](10-CHANGELOG.md) — last 2 entries
5. Files listed under **Files to read first** in the next-prompt doc

### 2. Verify build before touching anything
```bash
npm run build
```
If it fails, fix that first — do not start a new phase on a broken build.

### 3. Don't re-plan
The phase plan in [02-PHASE-CHECKLIST.md](02-PHASE-CHECKLIST.md) is the source of truth.
Don't invent a new phase unless the current one is blocked by a discovered constraint.
If you do need to add a phase, document it in the checklist with a clear rationale.

### 4. Respect protected files
See the **Protected files** section in [00-READ-ME-FIRST.md](00-READ-ME-FIRST.md).

---

## Anti-patterns to avoid

- ❌ "While I was here I also refactored X." — do not bundle refactors into a wiring phase.
- ❌ "I renamed the localStorage key to be cleaner." — never rename keys without a migration.
- ❌ "I replaced the 5×6 bet matrix with a curved SVG." — that's Phase 14; don't merge into logic work.
- ❌ "I added feature flags for the experimental path." — no new flags without explicit approval.
- ❌ "The test failed so I skipped it with `.skip`." — fix the test or open an issue; never silence it.
- ❌ "I couldn't figure out the phase guard so I removed it." — phase guards are load-bearing; ask before removing.

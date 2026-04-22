# 09 — Open Questions, Assumptions, and Future Configurables

Three buckets. Keep them separate.

---

## A. Confirmed requirements (treat as fixed)

1. The tool must support three roles: Dealer, Customer, Insurance Staff.
2. There must be 5 customer seats.
3. Chip denominations: 1M / 500K / 100K / 50K / 10K / 5K / 1K / 500 / 100 / 25 / 5.
4. 8-deck shoe with burn + cut card.
5. Standard baccarat third-card rules (already implemented; do not alter).
6. Manual dealing (click per card) in dealer role.
7. Commission handling must be a trainable procedure, not an auto-deduction.
8. Insurance logic must be fully configurable (see `04`).
9. The current single-player flow must keep working during the multi-seat transition (via `[Auto-Deal]`).
10. Settlement board must itemize each seat per round.

---

## B. Assumptions (owner confirmation pending; fall back defaults listed)

| # | Assumption | Default value | Confirm how |
|---|---|---|---|
| 1 | NPC seats start with the same balance as the trainee | 1,000,000 each | Owner sign-off |
| 2 | Default dealer-NPC speed | 700 ms per card | Settings default |
| 3 | Default insurance offer condition | `banker8` | Settings default |
| 4 | Default insurance payout | `1` (1:1) | Settings default |
| 5 | Insurance tie treatment | `push` | Settings default |
| 6 | `whoCanInsure` | `player-only` | Settings default |
| 7 | `staffControlled` default | `false` | Settings default |
| 8 | Chip color palette for new denominations | 1M gold, 500K deep red, 100=brown, 25=silver, 5=copper | Visual sign-off |
| 9 | Settlement board default column order | Seat / Bets / Total / Outcome / Payout / Commission / Insurance / Net | UX sign-off |
| 10 | NPC customer bet distribution | 40% P / 45% B / 10% T / 5% Pairs | Simulation tuning |
| 11 | NPC customer bet probability per round | Phase 1: 100% for seats 2-5 so acceptance check is deterministic; later tuning target: 60% | Simulation tuning |
| 12 | Role persists across reloads | no | UX sign-off |
| 13 | Auto-deal option stays available after Phase 2 | yes, behind a dev-only toggle | UX sign-off |
| 14 | Commission rounding default | `ceil` (matches current code) | Rule sign-off |
| 15 | Smallest chip for change calculation | 5 | Rule sign-off |
| 16 | Phase 1 shows burn card to all roles | yes | UX sign-off |
| 17 | Burn card visible duration | 3 seconds (acceptance requires at least 2 seconds) | UX sign-off |
| 18 | Commission box is visualized as a separate chip stack in dealer view | yes | Visual sign-off |

Rule for the engineer: if an assumption blocks implementation, mark it blocked here, continue with the default, and flag it in the PR description.

---

## C. Future configurables (must not be hardcoded; no owner pressure today)

- Rule presets beyond `standard`:
  - No Commission
  - EZ Baccarat (push on 3-card banker 7)
  - Lucky Six variants (Macau 12:1 / 20:1 vs other venues)
- Insurance payout modes beyond `flat`:
  - `onlyIfBankerNatural`
  - `onlyIfBankerWinsNon-tie`
- Table-level settings:
  - Max bet per zone
  - Min bet per zone
  - Max bet per seat
  - Seat count (5 today, but supports up to 7 or 9 in future)
- Wrong-payout injection frequency (0%, 10%, 25%, 50%, 100%)
- Wrong-payout types (short, over, wrong winner, missed commission)
- Deal speed per role
- Card reveal animation style (flat / squeeze)
- Language (Vietnamese / English / Chinese)
- Currency label on chips (can be changed without changing chip value)
- Starting balance per seat
- Shoe presets for drill scenarios

---

## D. Open questions for the owner

Only block on these if the default is unusable. Otherwise, implement with default and record here.

1. Should the trainee be able to change seats mid-shoe? Default: no.
2. Should dealer action errors (e.g. wrong deal order) count against the trainee's score? Default: yes, but no score UI yet.
3. For Insurance Staff role, is there a "peek fee" if a seat declines? Default: 0 (`chargeOnDecline`).
4. How long is a training session by default? Default: until the shoe ends.
5. Does the tool need a "replay last round" button? Default: no.
6. Can multiple humans use the same browser (turn-taking)? Default: no — single-role-per-session.
7. Should wrong-payout mode include insurance mispayments? Default: no in Phase 4, yes in Phase 5.

---

## E. Storage keys in use

| Key | Shape | Owner |
|---|---|---|
| `yiding_training_rules_v1` | rule object | `config-manager.js` |
| `yiding_training_insurance_v1` | insurance object | `config-manager.js` |

**Planned new keys (add to this list before shipping):**
- `yiding_training_table_prefs_v1` — role, active seat, speed preferences.
- `yiding_training_npc_profile_v1` — NPC betting profile overrides.
- `yiding_training_scenario_v1` — scenario mode state.

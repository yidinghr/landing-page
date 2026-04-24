# 02 - GAP ANALYSIS

Compare the current module against the new casino-realistic product requirement.

| Requirement | Current implementation | Gap | Risk if changed wrongly | Recommended fix direction |
|---|---|---|---|---|
| realistic curved table | There is already a D-shape visual shell in `training.css` and `index.html`. | Partial only. The shell looks more casino-like than before, but the real interaction layout still behaves like a workstation. | Easy to break existing DOM hooks and render zones if the visual rebuild rewires structure too aggressively. | Keep current DOM anchors where possible, then redesign the felt layout around preserved hooks. |
| 5 betting seats/zones on table | The module has 5 seats in state and a 5x6 matrix of betting cells in the DOM. | Partial only. Zones are still a rectangular grid, not curved betting seats painted on the felt in front of each seat. | Rebuilding the zone layout carelessly can break seat mapping, click targets, and payout highlighting. | Rebuild the table layout so each seat owns its betting cluster on the felt while preserving seat/zone identifiers. |
| dealer shoe drag-to-deal | Manual drag already exists through `drag-engine.js` and `handleCardDrop()`. | Partial only. The drag source is `#tr-card-source` in the left sidebar, not a shoe on the dealer side of the table. | Can easily break the dealing flow, phase gating, or validator wiring if source/drop logic is reworked too broadly. | Move the visual/manual-deal source to a dealer-side shoe while keeping orchestrator + validator contracts intact. |
| face-down card back visual | Hidden cards are rendered by `table-renderer.js` as placeholder `?` / `[]`. | Not product-accurate. Cards are hidden logically, but they do not look like real face-down baccarat cards. | Can break reveal click hooks, card sizing, or squeeze animation if card markup changes too much. | Keep current card keys and reveal flow, but replace placeholder hidden-card markup/CSS with a real card-back design. |
| highest-bet customer squeeze request | Customer request flow exists, NPC requests exist, reveal queue exists. | Missing business rule. There is no current rule that only the highest-bet seat can request squeeze ownership. | Wrong implementation could create fake casino logic, break fairness, or conflict with future multi-seat/customer rules. | Add a seat-rights layer in orchestrator/state. Use current assumption: tie on highest bet is decided by dealer until owner says otherwise. |
| flexible customer seat selection | `activeSeatId` exists in state, settings, and flow. | Partial only. Seat identity exists in data, but there is no direct on-table seat selection UI and no strong product-level seat switching flow yet. | Can break current active-seat betting and insurance/customer flows if seat switching is added without state discipline. | Keep `activeSeatId` as the core contract. Add explicit seat selection UI on the table without changing seat engine shape. |
| real baccarat result board | Current page renders bead, big, big eye, and small roads. `buildCockroachRoadData()` exists in code. | Partial only. The board is functional, but the page does not yet render cockroach road and the final visual presentation still needs casino-style audit. | Wrong changes can corrupt road history interpretation because renderers depend on `state.log` shape. | Preserve `state.log` contract, add missing road output, then tune board visuals to match casino conventions. |
| preserving existing baccarat rules | `baccarat-engine.js` and `dealing-validator.js` already implement totals, naturals, draw rules, and order validation. | Mostly correct and protected. Main risk is not missing logic, but accidental regression during UI/flow rebuild. | A careless rebuild could silently break round resolution or third-card flow. | Treat baccarat core and dealing validation as protected contracts unless a proven rule mismatch is found. |
| preserving existing settlement/insurance contracts | `settlement-engine.js`, `insurance-engine.js`, `settlement-renderer.js`, and orchestrator settlement flow are already wired. | Mostly correct and protected. The product gap is more about table realism and interaction flow than payout math shape. | Very high. Output-shape changes would break settlement rendering, insurance rows, and chip workflow. | Keep settlement and insurance output shapes stable. Build new visuals/workflows around current contract shapes. |

## Practical reading of the gap

- Table realism is **partial**, not absent.
- Dealer drag flow is **partial**, not absent.
- Result board is **partial**, not absent.
- Baccarat rules, settlement, and insurance are **mostly correct and should be protected first**.

## Rebuild priority implied by this gap map

1. Protect contracts.
2. Rebuild table realism and dealer-side dealing flow.
3. Upgrade hidden-card visuals and reveal ownership flow.
4. Add explicit customer seat control and highest-bet squeeze rights.
5. Finish result-board presentation without breaking log compatibility.

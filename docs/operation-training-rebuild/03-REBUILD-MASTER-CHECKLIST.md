# 03 - REBUILD MASTER CHECKLIST

All items start unchecked by design.

Do not mark anything complete until there is matching implementation evidence.

## Phase R1 - Audit and protection map

- [x] Read the rebuild docs in order
- [x] Re-read current training code before planning edits
- [x] Identify protected engine contracts
- [x] Confirm current localStorage keys from code
- [x] Confirm current DOM hooks used by controller/renderers
- [x] Confirm current state fields that new UX will depend on
- [x] Separate "already correct" vs "product gap" findings
- [x] No code change in this phase

## Phase R2 - Casino table visual rebuild

- [x] Rebuild the center table into a more real baccarat layout
- [x] Keep the D-shape / semi-circle intent
- [x] Put 5 betting seat areas directly on the felt
- [x] Keep dealer side visually separate from customer side
- [x] Add realistic table furniture if safe: shoe area, discard area, card lanes, markers
- [x] Preserve current role gating behavior
- [x] Preserve current renderer mount points or replace them safely
- [x] Smoke test desktop and responsive layout

## Phase R3 - Dealer shoe drag flow

- [x] Audit current `drag-engine.js` behavior against the dealer workflow
- [x] Make dealer-side shoe the main source of manual dealing
- [x] Keep auto-deal only as test/demo shortcut
- [x] Validate drop targets against baccarat deal order
- [x] Block wrong target and wrong order clearly
- [x] Preserve phase-machine and validator behavior
- [x] Verify manual deal flow from P1 to possible B3

## Phase R4 - Face-down cards and reveal

- [x] Replace placeholder hidden-card visuals with a real card-back design (CSS/HTML)
- [x] Ensure that dealt cards arrive face-down on the table initially
- [x] Keep the `data-card-key` hook and click-to-reveal behavior stable
- [x] Preserve the reveal queue behavior
- [x] Preserve squeeze-related interaction logic where it currently exists
- [x] Ensure that the auto-settlement trigger still fires after the final card is revealed
- [ ] Verify reveal order and final transition to settlement

## Phase R5 - Customer seat selection

- [ ] Keep one active seat at a time as the core model
- [ ] Let customer switch seat 1-5 in the product flow
- [ ] Show active customer seat clearly on the table
- [ ] Keep `activeSeatId` as the safe state contract
- [ ] Preserve current betting and insurance behavior for the active seat
- [ ] Verify seat switching does not corrupt balances or bet mapping

## Phase R6 - Highest-bet squeeze request

- [ ] Calculate highest bet seat per round safely
- [ ] Allow squeeze ownership only for the highest-bet seat
- [ ] Reject non-authorized squeeze request with a clear reason
- [ ] Support the current assumption that authorized squeeze may apply to Player or Banker
- [ ] Support the current assumption that highest-bet ties are dealer-decided
- [ ] Keep customer/NPC request flow compatible with reveal queue
- [ ] Avoid changing pure baccarat rule engines without proof of need

## Phase R7 - Real baccarat result board

- [ ] Audit current road-map renderer against casino conventions
- [ ] Keep bead road compatibility
- [ ] Keep big road compatibility
- [ ] Keep big eye compatibility
- [ ] Keep small road compatibility
- [ ] Add cockroach road rendering if the product keeps it in scope
- [ ] Preserve `state.log` compatibility
- [ ] Verify pair markers and winner display still map correctly

## Phase R8 - QA and handoff

- [ ] `npm run build`
- [ ] Manual browser smoke test
- [ ] Dealer drag test
- [ ] Wrong-order validation test
- [ ] Customer seat selection test
- [ ] Highest-bet squeeze authorization test
- [ ] Reveal and settlement regression test
- [ ] Result board update test
- [ ] Insurance regression test
- [ ] Update rebuild docs truthfully
- [ ] Update handoff status truthfully

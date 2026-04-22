export function createInsuranceController(context) {
  function canResolve() {
    return context.getPhase() === 'insurance' && context.canResolveInsurance();
  }

  return {
    canResolve: canResolve,
    decline: function (seatId) {
      if (!canResolve()) return;
      context.actions.decline(seatId);
    },
    selectPercent: function (pct, seatId) {
      if (!canResolve()) return;
      context.actions.selectPercent(pct, seatId);
    },
    selectMax: function (seatId) {
      if (!canResolve()) return;
      context.actions.selectMax(seatId);
    },
    confirm: function (seatId) {
      if (!canResolve()) return;
      context.actions.confirm(seatId);
    }
  };
}

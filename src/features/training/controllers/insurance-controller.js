export function createInsuranceController(context) {
  function canResolve() {
    return context.getPhase() === 'insurance' && context.canResolveInsurance();
  }

  return {
    canResolve: canResolve,
    decline: function () {
      if (!canResolve()) return;
      context.actions.decline();
    },
    selectPercent: function (pct) {
      if (!canResolve()) return;
      context.actions.selectPercent(pct);
    },
    confirm: function () {
      if (!canResolve()) return;
      context.actions.confirm();
    }
  };
}

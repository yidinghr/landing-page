function isIdlePhase(phase) {
  return phase === 'idle' || phase === 'betting';
}

export function createCustomerController(context) {
  function canBet() {
    return context.getRole() === 'customer' && isIdlePhase(context.getPhase());
  }

  return {
    canBet: canBet,
    selectChip: function (value) {
      if (!canBet()) return;
      context.actions.selectChip(value);
    },
    placeBet: function (zone) {
      if (!canBet()) return;
      context.actions.placeBet(zone);
    },
    clearBets: function () {
      if (!canBet()) return;
      context.actions.clearBets();
    },
    submitBets: function () {
      if (!canBet()) return;
      context.actions.submitBets();
    }
  };
}

export function createDealerController(context) {
  function isDealer() {
    return context.getRole() === 'dealer';
  }

  function runWhenDealer(action) {
    if (!isDealer()) return;
    action();
  }

  return {
    canUseControls: isDealer,
    closeBets: function () {
      runWhenDealer(context.actions.closeBets);
    },
    deal: function () {
      runWhenDealer(context.actions.deal);
    },
    autoDeal: function () {
      runWhenDealer(context.actions.autoDeal);
    },
    reveal: function () {
      runWhenDealer(context.actions.reveal);
    },
    nextRound: function () {
      runWhenDealer(context.actions.nextRound);
    },
    newShoe: function () {
      runWhenDealer(context.actions.newShoe);
    }
  };
}

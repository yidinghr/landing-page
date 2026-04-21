// Pure insurance calculation — no state, no DOM

export function shouldOfferInsurance(bankerTwoCardTotal, playerBet, ins) {
  if (!ins || !ins.enabled) return false;
  if (!playerBet || playerBet <= 0) return false;
  switch (ins.offerCondition) {
    case 'banker7': return bankerTwoCardTotal >= 7;
    case 'banker8': return bankerTwoCardTotal >= 8;
    case 'always':  return true;
    default:        return false;
  }
}

export function insuranceMaxBet(playerBet, ins) {
  if (!ins || !playerBet) return 0;
  return Math.floor(playerBet * (ins.maxInsurancePct / 100));
}

export function calcInsurancePayout(insuranceBet, winner, ins) {
  if (!insuranceBet || insuranceBet <= 0) return 0;
  if (winner === 'banker') return insuranceBet * ins.payout;
  return -insuranceBet;
}

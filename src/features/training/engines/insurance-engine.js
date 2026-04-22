// Pure insurance calculation — no state, no DOM

const DEFAULT_CONFIG = Object.freeze({
  enabled: false,
  offerCondition: 'banker8',
  maxInsurancePct: 50,
  payout: 1,
  payoutMode: 'flat',
  settleOnTie: false,
  whoCanInsure: 'player-only'
});

function config(ins) {
  return { ...DEFAULT_CONFIG, ...(ins || {}) };
}

function seatBets(seat) {
  return seat && seat.bets ? seat.bets : {};
}

export function shouldOfferInsurance(bankerTwoCardTotal, playerBet, ins) {
  const cfg = config(ins);
  if (!cfg.enabled) return false;
  if (!playerBet || playerBet <= 0) return false;
  switch (cfg.offerCondition) {
    case 'banker7': return bankerTwoCardTotal >= 7;
    case 'banker8': return bankerTwoCardTotal >= 8;
    case 'always':  return true;
    default:        return false;
  }
}

export function insuranceMaxBet(playerBet, ins) {
  const cfg = config(ins);
  if (!playerBet) return 0;
  return Math.floor(playerBet * (cfg.maxInsurancePct / 100));
}

export function insuranceBaseBet(seat, ins) {
  const cfg = config(ins);
  const bets = seatBets(seat);
  const playerBet = Number(bets.player || 0);
  const bankerBet = Number(bets.banker || 0);

  switch (cfg.whoCanInsure) {
    case 'main-bets':
      return playerBet + bankerBet;
    case 'all-bets':
      return Object.values(bets).reduce(function (sum, amount) {
        return sum + Number(amount || 0);
      }, 0);
    case 'player-only':
    default:
      return playerBet;
  }
}

export function getEligibleInsuranceSeats(seats, ins) {
  if (!Array.isArray(seats)) return [];
  return seats.filter(function (seat) {
    return insuranceBaseBet(seat, ins) > 0;
  });
}

export function clampInsuranceAmount(seat, amount, ins) {
  const raw = Math.floor(Math.max(0, Number(amount || 0)));
  const baseBet = insuranceBaseBet(seat, ins);
  const maxBet = insuranceMaxBet(baseBet, ins);
  const balance = Number(seat && seat.balance || 0);
  return Math.min(raw, maxBet, balance);
}

export function calcInsurancePayoutForResult(insuranceBet, result, ins) {
  const cfg = config(ins);
  const amount = Number(insuranceBet || 0);
  const round = typeof result === 'string' ? { winner: result } : (result || {});

  if (amount <= 0) return 0;
  if (round.winner === 'tie' && !cfg.settleOnTie) return 0;

  const bankerWins = round.winner === 'banker';
  let wins = false;

  switch (cfg.payoutMode) {
    case 'onlyIfBankerNatural':
      wins = bankerWins && Boolean(round.bNatural);
      break;
    case 'onlyIfBankerWinsNon-tie':
      wins = bankerWins;
      break;
    case 'flat':
    default:
      wins = bankerWins;
      break;
  }

  return wins ? amount * cfg.payout : -amount;
}

export function calcInsurancePayout(insuranceBet, winner, ins) {
  return calcInsurancePayoutForResult(insuranceBet, winner, ins);
}

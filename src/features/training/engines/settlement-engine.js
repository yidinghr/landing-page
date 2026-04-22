import { calcInsurancePayoutForResult } from './insurance-engine.js';
import { betTotal, calcPayout } from './payout-engine.js';
import { ZONES } from './seat-engine.js';

function summarizeBets(bets) {
  const parts = ZONES.filter(function (zone) {
    return Number(bets[zone] || 0) > 0;
  }).map(function (zone) {
    return {
      zone: zone,
      amount: bets[zone]
    };
  });

  return parts;
}

function resolveOutcome(totalBet, net) {
  if (!totalBet) {
    return '—';
  }
  if (net > 0) {
    return 'WIN';
  }
  if (net < 0) {
    return 'LOSE';
  }
  return 'PUSH';
}

function resolveInsurance(seat, result, insuranceConfig) {
  const decision = seat.insurance || {};
  const amount = Number(decision.amount || 0);

  if (!decision.accepted || amount <= 0) {
    return {
      offered: Boolean(decision.offered),
      accepted: false,
      amount: 0,
      outcome: 'na',
      payout: 0
    };
  }

  const payout = calcInsurancePayoutForResult(amount, result, insuranceConfig);
  return {
    offered: Boolean(decision.offered),
    accepted: true,
    amount: amount,
    outcome: payout > 0 ? 'win' : payout < 0 ? 'lose' : 'push',
    payout: payout
  };
}

export function settleRound(seats, result, rules, insuranceConfig) {
  const rows = seats.map(function (seat) {
    const bets = Object.assign({}, seat.bets || {});
    const totalBet = betTotal(bets);
    const payouts = totalBet > 0 ? calcPayout(bets, result, rules) : { net: 0 };
    const insurance = resolveInsurance(seat, result, insuranceConfig);
    const betNet = Number(payouts.net || 0);
    const net = betNet + Number(insurance.payout || 0);
    const commission = Number(payouts.commission || 0);

    return {
      seatId: seat.id,
      bets: bets,
      betSummary: summarizeBets(bets),
      totalBet: totalBet,
      outcome: resolveOutcome(totalBet + insurance.amount, net),
      payout: betNet,
      payouts: payouts,
      commission: commission,
      insurance: insurance,
      net: net,
      creditAmount: totalBet + betNet + insurance.amount + insurance.payout
    };
  });

  return {
    seats: rows,
    totals: rows.reduce(function (totals, row) {
      totals.paidOut += Math.max(0, row.net);
      totals.collected += Math.max(0, -row.net);
      totals.commissionTotal += row.commission;
      return totals;
    }, {
      paidOut: 0,
      collected: 0,
      commissionTotal: 0,
      shortChange: 0
    })
  };
}

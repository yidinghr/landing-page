import { insuranceMaxBet } from '../engines/insurance-engine.js';
import { debitSeat, getSeat, setBet, setInsuranceDecision } from '../engines/seat-engine.js';

const ALL_SEAT_IDS = [1, 2, 3, 4, 5];
const NPC_MAIN_ZONES = ['player', 'banker'];
const MIN_BET = 10000;
const MAX_BET = 200000;
const BET_STEP = 1000;

function randomBetAmount() {
  const steps = Math.floor((MAX_BET - MIN_BET) / BET_STEP);
  return MIN_BET + Math.floor(Math.random() * (steps + 1)) * BET_STEP;
}

function randomMainZone() {
  return NPC_MAIN_ZONES[Math.floor(Math.random() * NPC_MAIN_ZONES.length)];
}

export function npcAutoBet(seats, activeSeatId, shoe, options = {}) {
  void shoe;

  const includeActiveSeat = Boolean(options.includeActiveSeat);
  const targetSeatIds = includeActiveSeat
    ? ALL_SEAT_IDS
    : ALL_SEAT_IDS.filter(function (seatId) {
      return Number(seatId) !== Number(activeSeatId);
    });

  return targetSeatIds.reduce(function (nextSeats, seatId) {
    const seat = getSeat(nextSeats, seatId);
    const existingBet = Object.values(seat.bets || {}).reduce(function (sum, value) {
      return sum + Number(value || 0);
    }, 0);
    if (existingBet > 0) {
      return nextSeats;
    }

    const amount = randomBetAmount();
    const zone = randomMainZone();
    nextSeats = debitSeat(nextSeats, seatId, amount);
    return setBet(nextSeats, seatId, zone, amount);
  }, seats);
}

export function npcResolveInsurance(seats, seatId, insuranceConfig, mode = 'decline') {
  const seat = getSeat(seats, seatId);
  const playerBet = Number(seat.bets.player || 0);
  const maxBet = insuranceMaxBet(playerBet, insuranceConfig);

  if (mode === 'maxAccept' && maxBet > 0 && seat.balance >= maxBet) {
    let nextSeats = debitSeat(seats, seatId, maxBet);
    return {
      seats: setInsuranceDecision(nextSeats, seatId, {
        offered: true,
        accepted: true,
        amount: maxBet,
        outcome: 'accepted',
        payout: 0
      }),
      amount: maxBet
    };
  }

  return {
    seats: setInsuranceDecision(seats, seatId, {
      offered: true,
      accepted: false,
      amount: 0,
      outcome: 'declined',
      payout: 0
    }),
    amount: 0
  };
}

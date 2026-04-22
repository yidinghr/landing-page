import { debitSeat, setBet } from '../engines/seat-engine.js';

const NPC_SEAT_IDS = [2, 3, 4, 5];
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

export function npcAutoBet(seats, activeSeatId, shoe) {
  void shoe;

  if (Number(activeSeatId) !== 1) {
    return seats;
  }

  return NPC_SEAT_IDS.reduce(function (nextSeats, seatId) {
    const amount = randomBetAmount();
    const zone = randomMainZone();
    nextSeats = debitSeat(nextSeats, seatId, amount);
    return setBet(nextSeats, seatId, zone, amount);
  }, seats);
}

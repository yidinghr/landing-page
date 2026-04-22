export const SEAT_COUNT = 5;
export const ZONES = Object.freeze(['playerPair', 'player', 'tie', 'banker', 'bankerPair', 'luckySix']);

const DEFAULT_BALANCE = 1000000;

function createEmptyBets() {
  return ZONES.reduce(function (bets, zone) {
    bets[zone] = 0;
    return bets;
  }, {});
}

function createEmptyInsurance() {
  return {
    offered: false,
    accepted: false,
    amount: 0,
    outcome: 'na',
    payout: 0
  };
}

function assertSeats(seats) {
  if (!Array.isArray(seats)) {
    throw new Error('Expected seats to be an array.');
  }
}

function assertZone(zone) {
  if (ZONES.indexOf(zone) < 0) {
    throw new Error('Unknown betting zone: ' + String(zone));
  }
}

function assertMoney(value, label) {
  if (!Number.isFinite(value) || value < 0 || Math.floor(value) !== value) {
    throw new Error(label + ' must be a non-negative integer.');
  }
}

function cloneSeat(seat) {
  return {
    id: seat.id,
    balance: seat.balance,
    bets: Object.assign(createEmptyBets(), seat.bets || {}),
    insurance: Object.assign(createEmptyInsurance(), seat.insurance || {})
  };
}

function mapSeat(seats, id, updater) {
  assertSeats(seats);
  let found = false;

  const nextSeats = seats.map(function (seat) {
    if (Number(seat && seat.id) !== Number(id)) {
      return cloneSeat(seat);
    }

    found = true;
    return updater(cloneSeat(seat));
  });

  if (!found) {
    throw new Error('Seat not found: ' + String(id));
  }

  return nextSeats;
}

export function createSeats(initialBalance = DEFAULT_BALANCE) {
  assertMoney(initialBalance, 'Initial balance');

  return Array.from({ length: SEAT_COUNT }, function (_, index) {
    return {
      id: index + 1,
      balance: initialBalance,
      bets: createEmptyBets(),
      insurance: createEmptyInsurance()
    };
  });
}

export function getSeat(seats, id) {
  assertSeats(seats);
  const seat = seats.find(function (item) {
    return Number(item && item.id) === Number(id);
  });

  if (!seat) {
    throw new Error('Seat not found: ' + String(id));
  }

  return seat;
}

export function setBet(seats, id, zone, amount) {
  assertZone(zone);
  assertMoney(amount, 'Bet amount');

  return mapSeat(seats, id, function (seat) {
    seat.bets[zone] += amount;
    return seat;
  });
}

export function clearBets(seats, id) {
  return mapSeat(seats, id, function (seat) {
    const totalBet = ZONES.reduce(function (sum, zone) {
      return sum + (seat.bets[zone] || 0);
    }, 0);

    seat.balance += totalBet;
    seat.bets = createEmptyBets();
    return seat;
  });
}

export function debitSeat(seats, id, amount) {
  assertMoney(amount, 'Debit amount');

  return mapSeat(seats, id, function (seat) {
    if (seat.balance < amount) {
      throw new Error('Insufficient balance for seat: ' + String(id));
    }

    seat.balance -= amount;
    return seat;
  });
}

export function creditSeat(seats, id, amount) {
  assertMoney(amount, 'Credit amount');

  return mapSeat(seats, id, function (seat) {
    seat.balance += amount;
    return seat;
  });
}

export function setInsuranceDecision(seats, id, decision) {
  return mapSeat(seats, id, function (seat) {
    seat.insurance = Object.assign(createEmptyInsurance(), seat.insurance, decision || {});
    return seat;
  });
}

const CHIP_UNIT = 5;

function candidateRows(settlement) {
  return (settlement && settlement.seats ? settlement.seats : []).filter(function (row) {
    return Number(row.totalBet || 0) > 0 || Boolean(row.insurance && row.insurance.accepted);
  });
}

function cloneSettlement(settlement) {
  return {
    ...settlement,
    seats: settlement.seats.map(function (row) {
      return {
        ...row,
        wrongPayout: row.wrongPayout ? { ...row.wrongPayout } : null
      };
    })
  };
}

export function seedWrongPayout(settlement) {
  const candidates = candidateRows(settlement);
  if (!settlement || !candidates.length) return settlement;

  const next = cloneSettlement(settlement);
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const direction = target.net >= 0 ? 1 : -1;
  const delta = CHIP_UNIT * direction;

  next.seats = next.seats.map(function (row) {
    if (Number(row.seatId) !== Number(target.seatId)) {
      return row;
    }

    return {
      ...row,
      wrongPayout: {
        seeded: true,
        caught: false,
        delta: delta,
        displayedPayout: row.payout + delta,
        displayedNet: row.net + delta
      }
    };
  });

  return next;
}

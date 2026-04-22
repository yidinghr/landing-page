import { handTotal, isNatural } from '../engines/baccarat-engine.js';
import { cardValue, shoePct, shoeRemaining, SUIT_SYMBOL } from '../engines/shoe-engine.js';
import { betTotal, fmtAmt, fmtBalance } from '../engines/payout-engine.js';
import { shoeValueCounts, approxNaturalRate, approxPairRate, sessionStats, fmtPct, fmtNet } from '../engines/prob-engine.js';
import { ZONES } from '../engines/seat-engine.js';

const WINNER_LABEL = { player: 'PLAYER WINS', banker: 'BANKER WINS', tie: 'TIE' };
const LOG_LETTER = { player: 'P', banker: 'B', tie: 'T' };
const STREAK_LABEL = { player: 'Player', banker: 'Banker', tie: 'Tie' };
const EV_ESTIMATES = [
  { label: 'Player', value: '-1.24%' },
  { label: 'Banker', value: '-1.06%' },
  { label: 'Tie', value: '-14.36%' },
  { label: 'Pairs', value: '-10.36%' }
];

function zoneLabel(zone) {
  return {
    playerPair: 'P.Pair',
    player: 'Player',
    tie: 'Tie',
    banker: 'Banker',
    bankerPair: 'B.Pair',
    luckySix: 'Lucky 6'
  }[zone] || zone;
}

function detailPayRow(label, val) {
  const cls = val > 0 ? 'payout-win' : val < 0 ? 'payout-lose' : '';
  return '<div class="detail-row"><span>' + label + '</span><span class="' + cls + '">' + fmtAmt(val) + '</span></div>';
}

function cardHTML(card, extraClass = '') {
  const sym = SUIT_SYMBOL[card.suit];
  const val = cardValue(card.rank);
  const red = card.suit === 'H' || card.suit === 'D';
  return [
    '<div class="bac-card' + (red ? ' bac-card--red' : '') + extraClass + '">',
    '<div class="bac-card__face">',
    '<span class="bac-card__rank">' + card.rank + '</span>',
    '<span class="bac-card__suit">' + sym + '</span>',
    '</div>',
    '<div class="bac-card__val">' + val + '</div>',
    '</div>'
  ].join('');
}

function shouldSqueezeCard(index, phase) {
  return index >= 2 || phase === 'reveal' || phase === 'settlement';
}

function streakText(stats) {
  if (!stats.streakSide || !stats.streakCount) return '-';
  return STREAK_LABEL[stats.streakSide] + ' x' + stats.streakCount;
}

function renderEvPanel(tablePrefs) {
  if (!tablePrefs || !tablePrefs.evPanelEnabled) return '';
  return [
    '<div class="stat-section-head">EV PER BET</div>',
    '<div class="stat-ev-grid">',
    EV_ESTIMATES.map(function (row) {
      return '<div class="stat-ev-cell"><span>' + row.label + '</span><strong>' + row.value + '</strong></div>';
    }).join(''),
    '</div>'
  ].join('');
}

function cardDesc(card) {
  if (!card) return '-';
  return card.rank + SUIT_SYMBOL[card.suit] + ' (' + cardValue(card.rank) + ')';
}

function renderPayoutDetail(payouts) {
  if (!payouts) return '';
  const rows = [];
  if (payouts.player !== undefined) rows.push(detailPayRow('Player bet', payouts.player));
  if (payouts.banker !== undefined) rows.push(detailPayRow('Banker bet', payouts.banker));
  if (payouts.tie !== undefined) rows.push(detailPayRow('Tie bet', payouts.tie));
  if (payouts.playerPair !== undefined) rows.push(detailPayRow('P. Pair', payouts.playerPair));
  if (payouts.bankerPair !== undefined) rows.push(detailPayRow('B. Pair', payouts.bankerPair));
  if (payouts.luckySix !== undefined) rows.push(detailPayRow('Lucky Six', payouts.luckySix));
  if (payouts.commission) {
    rows.push('<div class="detail-row detail-row--comm"><span>Commission</span><span>-' + payouts.commission.toLocaleString() + '</span></div>');
  }
  if (payouts.insuranceBet) {
    const insPay = payouts.insurance || 0;
    rows.push('<div class="detail-row detail-row--ins"><span>Insurance (' + payouts.insuranceBet.toLocaleString() + ')</span><span class="' + (insPay >= 0 ? 'payout-win' : 'payout-lose') + '">' + fmtAmt(insPay) + '</span></div>');
  }
  if (!rows.length) return '';
  return '<div class="detail-payout-section"><div class="detail-head">PAYOUT</div>' + rows.join('') + '</div>';
}

function renderShoeChart(shoe) {
  const rem = shoeRemaining(shoe);
  const vc = shoeValueCounts(shoe);
  const nat = approxNaturalRate(vc, rem);
  const maxCnt = Math.max(...vc, 1);
  const rows = vc.map(function (cnt, val) {
    const w = Math.round(cnt / maxCnt * 100);
    return [
      '<div class="shoe-bar-row">',
      '<span class="shoe-bar-val">' + val + '</span>',
      '<div class="shoe-bar-track">',
      '<div class="shoe-bar-fill' + (val === 0 ? ' shoe-bar-fill--zero' : val >= 8 ? ' shoe-bar-fill--nat' : '') + '" style="width:' + w + '%"></div>',
      '</div>',
      '<span class="shoe-bar-cnt">' + cnt + '</span>',
      '</div>'
    ].join('');
  }).join('');
  return [
    '<div class="stat-section-head">SHOE VALUES</div>',
    '<div class="stat-shoe-chart">' + rows + '</div>',
    '<div class="stat-row stat-natural">',
    '<span class="stat-label">Natural est.</span>',
    '<span class="stat-val-sm stat-val-sm--nat">' + (nat * 100).toFixed(1) + '%</span>',
    '</div>'
  ].join('');
}

export function renderChipTray(host, chips, selectedChip, balance) {
  if (!host) return;
  host.innerHTML = chips.map(function (c) {
    const active = selectedChip === c.value ? ' is-selected' : '';
    const disabled = balance < c.value ? ' is-disabled' : '';
    return [
      '<button class="tr-chip ' + c.cls + active + disabled + '" data-chip="' + c.value + '"',
      disabled ? ' disabled' : '',
      '><span class="tr-chip__label">' + c.label + '</span></button>'
    ].join('');
  }).join('');
}

export function renderBetZones(root, bets, payouts, totalBetEl) {
  if (totalBetEl) {
    const total = betTotal(bets);
    totalBetEl.textContent = total > 0 ? total.toLocaleString() : '-';
  }

  ZONES.forEach(function (zone) {
    const zoneEl = root ? root.querySelector('[data-zone="' + zone + '"]') : null;
    const betEl = document.getElementById('betAmt-' + zone);
    const payEl = document.getElementById('payoutAmt-' + zone);
    const betAmt = bets[zone] || 0;

    if (betEl) {
      betEl.textContent = betAmt > 0 ? betAmt.toLocaleString() : '';
      betEl.hidden = betAmt === 0;
    }

    if (payEl) {
      if (payouts && payouts[zone] !== undefined) {
        const p = payouts[zone];
        payEl.textContent = fmtAmt(p);
        payEl.className = 'tr-zone-payout ' + (p > 0 ? 'is-win' : p < 0 ? 'is-lose' : 'is-push');
        payEl.hidden = false;
      } else {
        payEl.hidden = true;
      }
    }

    if (!zoneEl) return;
    zoneEl.classList.remove('is-win', 'is-lose', 'is-push', 'has-bet');
    if (betAmt > 0) zoneEl.classList.add('has-bet');
    if (payouts && payouts[zone] !== undefined) {
      const p = payouts[zone];
      zoneEl.classList.add(p > 0 ? 'is-win' : p < 0 ? 'is-lose' : 'is-push');
    }
  });
}

export function renderSeats(host, seats, activeSeatId, settlement) {
  if (!host) return;
  const settledBySeat = new Map((settlement && settlement.seats ? settlement.seats : []).map(function (row) {
    return [row.seatId, row];
  }));

  seats.forEach(function (seat) {
    const seatEl = host.querySelector('[data-seat="' + seat.id + '"]');
    if (!seatEl) return;
    const row = settledBySeat.get(seat.id);
    seatEl.classList.toggle('tr-seat--active', seat.id === activeSeatId);
    seatEl.classList.toggle('tr-seat--winner', Boolean(row && row.net > 0));
    seatEl.classList.toggle('tr-seat--loser', Boolean(row && row.net < 0));

    const badge = seatEl.querySelector('.tr-seat__badge');
    if (badge) {
      badge.textContent = row
        ? row.outcome.toLowerCase()
        : seat.id === activeSeatId ? 'active' : betTotal(seat.bets) > 0 ? 'bet' : 'idle';
    }

    ZONES.forEach(function (zone) {
      const betEl = seatEl.querySelector('[data-seat-bet="' + zone + '"]');
      if (!betEl) return;
      const amt = seat.bets[zone] || 0;
      const strong = betEl.querySelector('strong');
      betEl.firstChild.textContent = zoneLabel(zone) + ' ';
      if (strong) strong.textContent = amt.toLocaleString();
      betEl.hidden = amt === 0;
    });

    const bal = seatEl.querySelector('.tr-seat__balance strong');
    if (bal) bal.textContent = fmtBalance(seat.balance);
  });
}

export function renderBalance(balanceAmt, rulesName, balance, rules) {
  if (balanceAmt) balanceAmt.textContent = fmtBalance(balance);
  if (rulesName) rulesName.textContent = rules.name || 'Standard Rules';
}

export function renderPayoutSummary(host, payouts) {
  if (!host) return;
  if (!payouts) {
    host.hidden = true;
    return;
  }
  const insPay = payouts.insurance || 0;
  const net = payouts.net + insPay;
  const comm = payouts.commission || 0;
  const parts = [
    '<span class="payout-net ' + (net > 0 ? 'is-win' : net < 0 ? 'is-lose' : 'is-push') + '">',
    'Net: ' + fmtAmt(net), '</span>'
  ];
  if (comm > 0) {
    parts.push('<span class="payout-comm">Commission: ' + comm.toLocaleString() + '</span>');
  }
  if (payouts.insuranceBet) {
    parts.push('<span class="payout-comm">Insurance: ' + fmtAmt(insPay) + '</span>');
  }
  host.innerHTML = parts.join('');
  host.hidden = false;
}

export function renderShoe(elements, shoe) {
  if (!shoe) return;
  const rem = shoeRemaining(shoe);
  if (elements.shoeRem) elements.shoeRem.textContent = rem;
  if (elements.shoeTotal) elements.shoeTotal.textContent = shoe.total;
  if (elements.shoeFill) elements.shoeFill.style.width = shoePct(shoe) + '%';
  if (elements.shoeWarn) elements.shoeWarn.hidden = rem >= 20;
}

export function renderHands(elements, pCards, bCards, options = {}) {
  const useSqueeze = options.squeezeEnabled && options.role === 'dealer';
  const phase = options.phase || 'idle';
  function renderCard(card, index) {
    const squeezeClass = useSqueeze && shouldSqueezeCard(index, phase) ? ' bac-card--squeeze' : '';
    return cardHTML(card, squeezeClass);
  }

  if (elements.pCards) elements.pCards.innerHTML = pCards.map(renderCard).join('');
  if (elements.bCards) elements.bCards.innerHTML = bCards.map(renderCard).join('');

  function applyScore(cards, scoreEl) {
    if (!scoreEl) return;
    if (cards.length >= 2) {
      const t = handTotal(cards);
      scoreEl.textContent = t;
      const nat = isNatural(handTotal(cards.slice(0, 2)));
      scoreEl.className = 'bac-score' + (nat ? ' bac-score--natural' : '');
    } else {
      scoreEl.textContent = '-';
      scoreEl.className = 'bac-score';
    }
  }

  applyScore(pCards, elements.pScore);
  applyScore(bCards, elements.bScore);
}

export function renderResult(host, result) {
  if (!host) return;
  if (!result) {
    host.hidden = true;
    return;
  }
  const badges = [];
  if (result.pNatural || result.bNatural) {
    const side = result.pNatural ? 'Player' : 'Banker';
    const nat = result.pNatural ? result.pTotal : result.bTotal;
    badges.push('<span class="res-badge res-badge--natural">Natural ' + nat + ' (' + side + ')</span>');
  }
  if (result.pPair) badges.push('<span class="res-badge res-badge--pair">Player Pair</span>');
  if (result.bPair) badges.push('<span class="res-badge res-badge--pair">Banker Pair</span>');
  if (result.luckySix) badges.push('<span class="res-badge res-badge--lucky6">Lucky Six (' + result.luckySix + ')</span>');
  host.innerHTML = [
    '<div class="res-winner res-winner--' + result.winner + '">' + WINNER_LABEL[result.winner] + '</div>',
    '<div class="res-score">' + result.pTotal + ' - ' + result.bTotal + '</div>',
    badges.length ? '<div class="res-badges">' + badges.join('') + '</div>' : ''
  ].join('');
  host.hidden = false;
}

export function renderDetail(host, state) {
  if (!host) return;
  const result = state.result;
  if (!result) {
    host.innerHTML = '<p class="hint-text">Deal a hand to see the breakdown.</p>';
    return;
  }
  host.innerHTML = [
    '<div class="detail-grid">',
    '<div class="detail-col">',
    '<div class="detail-head">PLAYER</div>',
    '<div class="detail-row"><span>Total</span><strong class="detail-val">' + result.pTotal + '</strong></div>',
    '<div class="detail-row"><span>Cards</span><span>' + state.pCards.length + '</span></div>',
    '<div class="detail-row"><span>Natural</span><span>' + (result.pNatural ? 'yes' : '-') + '</span></div>',
    '<div class="detail-row"><span>3rd card</span><span>' + cardDesc(state.pCards[2] || null) + '</span></div>',
    '<div class="detail-row"><span>Pair</span><span>' + (result.pPair ? 'yes' : '-') + '</span></div>',
    '</div>',
    '<div class="detail-col">',
    '<div class="detail-head">BANKER</div>',
    '<div class="detail-row"><span>Total</span><strong class="detail-val">' + result.bTotal + '</strong></div>',
    '<div class="detail-row"><span>Cards</span><span>' + state.bCards.length + '</span></div>',
    '<div class="detail-row"><span>Natural</span><span>' + (result.bNatural ? 'yes' : '-') + '</span></div>',
    '<div class="detail-row"><span>3rd card</span><span>' + cardDesc(state.bCards[2] || null) + '</span></div>',
    '<div class="detail-row"><span>Pair</span><span>' + (result.bPair ? 'yes' : '-') + '</span></div>',
    '</div>',
    '</div>',
    '<div class="detail-winner">Round ' + state.roundNum + ': <strong class="detail-winner--' + result.winner + '">' + WINNER_LABEL[result.winner] + '</strong></div>',
    result.luckySix ? '<div class="detail-row detail-row--full"><span>Lucky Six</span><span>' + result.luckySix + '</span></div>' : '',
    renderPayoutDetail(state.payouts)
  ].join('');
}

export function renderLog(host, log) {
  if (!host) return;
  if (!log.length) {
    host.innerHTML = '<p class="hint-text">No hands played yet.</p>';
    return;
  }
  host.innerHTML = log.map(function (e) {
    const chips = [];
    if (e.natural) chips.push('<span class="log-chip log-chip--n">N</span>');
    if (e.pPair) chips.push('<span class="log-chip log-chip--p">PP</span>');
    if (e.bPair) chips.push('<span class="log-chip log-chip--p">BP</span>');
    if (e.luckySix) chips.push('<span class="log-chip log-chip--l">L6</span>');
    if (e.insurance) {
      const insCount = Array.isArray(e.insuranceSeats) ? e.insuranceSeats.length : 1;
      chips.push('<span class="log-chip log-chip--ins">INS ' + insCount + '</span>');
    }
    if (e.wrongPayoutSeat) chips.push('<span class="log-chip log-chip--drill">DRILL</span>');
    if (e.procedureCatches) chips.push('<span class="log-chip log-chip--catch">CATCH ' + e.procedureCatches + '</span>');
    if (e.procedureErrors) chips.push('<span class="log-chip log-chip--err">ERR ' + e.procedureErrors + '</span>');
    const net = e.net;
    const netCls = net > 0 ? 'log-net-win' : net < 0 ? 'log-net-lose' : '';
    return [
      '<div class="log-entry">',
      '<span class="log-num">#' + e.round + '</span>',
      '<span class="log-dot log-dot--' + e.winner + '">' + LOG_LETTER[e.winner] + '</span>',
      '<span class="log-score">' + e.pTotal + ':' + e.bTotal + '</span>',
      chips.length ? '<div class="log-badges">' + chips.join('') + '</div>' : '',
      net !== null ? '<span class="log-net ' + netCls + '">' + fmtAmt(net) + '</span>' : '',
      '</div>'
    ].join('');
  }).join('');
}

export function renderStats(host, shoe, log, procedureStats = { errors: 0, catches: 0 }, tablePrefs = {}) {
  if (!host || !shoe) return;
  const stats = sessionStats(log);
  const pairEst = approxPairRate(shoe);
  const pairEstimateText = (pairEst.anyPairRate * 100).toFixed(1) + '% any pair';
  const procedure = {
    errors: Number(procedureStats.errors || 0),
    catches: Number(procedureStats.catches || 0)
  };

  if (!stats.rounds) {
    host.innerHTML = [
      '<p class="hint-text" style="margin-bottom:10px">No rounds played yet.</p>',
      '<div class="stat-row"><span class="stat-label">Streak</span><span class="stat-val-sm">-</span></div>',
      '<div class="stat-row"><span class="stat-label">Tie drought</span><span class="stat-val-sm">0 hands</span></div>',
      '<div class="stat-row"><span class="stat-label">Pair est.</span><span class="stat-val-sm">' + pairEstimateText + '</span></div>',
      '<div class="stat-row"><span class="stat-label">Dealer err.</span><span class="stat-val-sm">' + procedure.errors + '</span></div>',
      '<div class="stat-row"><span class="stat-label">Catches</span><span class="stat-val-sm">' + procedure.catches + '</span></div>',
      renderEvPanel(tablePrefs),
      renderShoeChart(shoe)
    ].join('');
    return;
  }

  const netCls = stats.net > 0 ? 'is-win' : stats.net < 0 ? 'is-lose' : '';
  host.innerHTML = [
    '<div class="stat-row">',
    '<span class="stat-label">Rounds</span>',
    '<strong class="stat-val">' + stats.rounds + '</strong>',
    '<span class="stat-net ' + netCls + '">' + fmtNet(stats.net) + '</span>',
    '</div>',
    '<div class="stat-wlt-row">',
    '<span class="stat-pill stat-pill--p">P ' + stats.playerWins + ' - ' + fmtPct(stats.playerWins, stats.rounds) + '</span>',
    '<span class="stat-pill stat-pill--b">B ' + stats.bankerWins + ' - ' + fmtPct(stats.bankerWins, stats.rounds) + '</span>',
    '<span class="stat-pill stat-pill--t">T ' + stats.ties + ' - ' + fmtPct(stats.ties, stats.rounds) + '</span>',
    '</div>',
    '<div class="stat-row" style="margin-top:4px">',
    '<span class="stat-label">Naturals</span>',
    '<span class="stat-val-sm">' + stats.naturals + ' (' + fmtPct(stats.naturals, stats.rounds) + ')</span>',
    '</div>',
    '<div class="stat-row">',
    '<span class="stat-label">Streak</span>',
    '<span class="stat-val-sm">' + streakText(stats) + '</span>',
    '</div>',
    '<div class="stat-row">',
    '<span class="stat-label">Tie drought</span>',
    '<span class="stat-val-sm">' + stats.tieDrought + ' hands</span>',
    '</div>',
    '<div class="stat-row">',
    '<span class="stat-label">Pair rate</span>',
    '<span class="stat-val-sm">' + stats.pairRounds + ' (' + fmtPct(stats.pairRounds, stats.rounds) + ') · est ' + pairEstimateText + '</span>',
    '</div>',
    '<div class="stat-row">',
    '<span class="stat-label">Dealer err.</span>',
    '<span class="stat-val-sm">' + procedure.errors + '</span>',
    '</div>',
    '<div class="stat-row">',
    '<span class="stat-label">Catches</span>',
    '<span class="stat-val-sm">' + procedure.catches + '</span>',
    '</div>',
    renderEvPanel(tablePrefs),
    renderShoeChart(shoe)
  ].join('');
}

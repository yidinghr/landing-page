import {
  initShoe, dealOne, shoeRemaining, shoePct, cardValue, SUIT_SYMBOL
} from './engines/shoe-engine.js';
import {
  handTotal, isNatural, playerDraws, bankerDraws, resolveRound
} from './engines/baccarat-engine.js';
import { calcPayout, betTotal, fmtAmt, fmtBalance } from './engines/payout-engine.js';
import {
  shouldOfferInsurance, insuranceMaxBet, calcInsurancePayout
} from './engines/insurance-engine.js';
import { getRules, getInsuranceConfig } from './config/config-manager.js';
import {
  shoeValueCounts, approxNaturalRate, sessionStats, fmtPct, fmtNet
} from './engines/prob-engine.js';

// --- Constants ---
const CHIPS = [
  { value: 100000, label: '100K', cls: 'tr-chip--100k' },
  { value: 50000,  label: '50K',  cls: 'tr-chip--50k'  },
  { value: 10000,  label: '10K',  cls: 'tr-chip--10k'  },
  { value: 5000,   label: '5K',   cls: 'tr-chip--5k'   },
  { value: 1000,   label: '1K',   cls: 'tr-chip--1k'   },
  { value: 500,    label: '500',  cls: 'tr-chip--500'  },
];

const ZONES = ['playerPair', 'player', 'tie', 'banker', 'bankerPair', 'luckySix'];

const WINNER_LABEL = { player: 'PLAYER WINS', banker: 'BANKER WINS', tie: 'TIE' };
const LOG_LETTER   = { player: 'P', banker: 'B', tie: 'T' };

// --- State ---
let shoe = null;
let pCards = [], bCards = [];
let result = null;
let roundNum = 0;
let log = [];
let phase = 'idle'; // 'idle' | 'insurance' | 'dealt'

let rules = {};
let insuranceConfig = {};
let bets = { player: 0, banker: 0, tie: 0, playerPair: 0, bankerPair: 0, luckySix: 0 };
let selectedChip = null;
let balance = 1000000;
let payouts = null;
let role = 'dealer';  // 'dealer' | 'customer' | 'insurance'
let insuranceBet = 0;

// --- DOM ---
const el = {
  shoeRem:        document.getElementById('shoeRem'),
  shoeTotal:      document.getElementById('shoeTotal'),
  shoeFill:       document.getElementById('shoeFill'),
  shoeWarn:       document.getElementById('shoeWarn'),
  pCards:         document.getElementById('pCards'),
  bCards:         document.getElementById('bCards'),
  pScore:         document.getElementById('pScore'),
  bScore:         document.getElementById('bScore'),
  resultBox:      document.getElementById('resultBox'),
  roundDetail:    document.getElementById('roundDetail'),
  sessionLog:     document.getElementById('sessionLog'),
  btnDeal:        document.getElementById('btnDeal'),
  btnNext:        document.getElementById('btnNext'),
  btnShoe:        document.getElementById('btnShoe'),
  balanceAmt:     document.getElementById('balanceAmt'),
  totalBetAmt:    document.getElementById('totalBetAmt'),
  payoutSummary:  document.getElementById('payoutSummary'),
  chipTray:       document.getElementById('chipTray'),
  betZones:       document.getElementById('betZones'),
  btnClearBets:   document.getElementById('btnClearBets'),
  rulesName:      document.getElementById('rulesName'),
  // Stats panel
  statsPanel:     document.getElementById('statsPanel'),
  // Insurance panel
  insurancePanel: document.getElementById('insurancePanel'),
  insBankerScore: document.getElementById('insBankerScore'),
  insPlayerBet:   document.getElementById('insPlayerBet'),
  insMaxBet:      document.getElementById('insMaxBet'),
  insCurrentBet:  document.getElementById('insCurrentBet'),
  btnInsDecline:  document.getElementById('btnInsDecline'),
  btnIns25:       document.getElementById('btnIns25'),
  btnIns50:       document.getElementById('btnIns50'),
  btnInsConfirm:  document.getElementById('btnInsConfirm'),
};

// --- Chip tray ---
function renderChipTray() {
  el.chipTray.innerHTML = CHIPS.map(function (c) {
    const active    = selectedChip === c.value ? ' is-selected' : '';
    const disabled  = balance < c.value ? ' is-disabled' : '';
    return [
      '<button class="tr-chip ' + c.cls + active + disabled + '" data-chip="' + c.value + '"',
      disabled ? ' disabled' : '',
      '><span class="tr-chip__label">' + c.label + '</span></button>'
    ].join('');
  }).join('');
}

// --- Bet zones ---
function renderBetZones() {
  const total = betTotal(bets);
  el.totalBetAmt.textContent = total > 0 ? total.toLocaleString() : '—';

  ZONES.forEach(function (zone) {
    const betEl = document.getElementById('betAmt-' + zone);
    const payEl = document.getElementById('payoutAmt-' + zone);
    if (!betEl || !payEl) return;

    const betAmt = bets[zone];
    betEl.textContent = betAmt > 0 ? betAmt.toLocaleString() : '';
    betEl.hidden = betAmt === 0;

    if (payouts) {
      const p = payouts[zone];
      if (p !== undefined) {
        payEl.textContent = fmtAmt(p);
        payEl.className = 'tr-zone-payout ' + (p > 0 ? 'is-win' : p < 0 ? 'is-lose' : 'is-push');
        payEl.hidden = false;
      } else {
        payEl.hidden = true;
      }
    } else {
      payEl.hidden = true;
    }

    const zoneEl = document.querySelector('[data-zone="' + zone + '"]');
    if (!zoneEl) return;
    zoneEl.classList.remove('is-win', 'is-lose', 'is-push', 'has-bet');
    if (betAmt > 0) zoneEl.classList.add('has-bet');
    if (payouts && payouts[zone] !== undefined) {
      const p = payouts[zone];
      zoneEl.classList.add(p > 0 ? 'is-win' : p < 0 ? 'is-lose' : 'is-push');
    }
  });
}

// --- Balance ---
function renderBalance() {
  el.balanceAmt.textContent = fmtBalance(balance);
  if (el.rulesName) el.rulesName.textContent = rules.name || 'Standard Rules';
}

// --- Payout summary ---
function renderPayoutSummary() {
  if (!payouts) { el.payoutSummary.hidden = true; return; }
  const insPay = payouts.insurance || 0;
  const net    = payouts.net + insPay;
  const comm   = payouts.commission || 0;
  const parts  = [
    '<span class="payout-net ' + (net > 0 ? 'is-win' : net < 0 ? 'is-lose' : 'is-push') + '">',
    'Net: ' + fmtAmt(net), '</span>'
  ];
  if (comm > 0) {
    parts.push('<span class="payout-comm">Commission: ' + comm.toLocaleString() + '</span>');
  }
  if (payouts.insuranceBet) {
    parts.push('<span class="payout-comm">Insurance: ' + fmtAmt(insPay) + '</span>');
  }
  el.payoutSummary.innerHTML = parts.join('');
  el.payoutSummary.hidden = false;
}

// --- Card HTML ---
function cardHTML(card) {
  const sym = SUIT_SYMBOL[card.suit];
  const val = cardValue(card.rank);
  const red = card.suit === 'H' || card.suit === 'D';
  return [
    '<div class="bac-card' + (red ? ' bac-card--red' : '') + '">',
    '<div class="bac-card__face">',
    '<span class="bac-card__rank">' + card.rank + '</span>',
    '<span class="bac-card__suit">' + sym + '</span>',
    '</div>',
    '<div class="bac-card__val">' + val + '</div>',
    '</div>'
  ].join('');
}

// --- Shoe ---
function renderShoe() {
  const rem = shoeRemaining(shoe);
  el.shoeRem.textContent = rem;
  el.shoeTotal.textContent = shoe.total;
  el.shoeFill.style.width = shoePct(shoe) + '%';
  el.shoeWarn.hidden = rem >= 20;
}

// --- Hands ---
function renderHands() {
  el.pCards.innerHTML = pCards.map(cardHTML).join('');
  el.bCards.innerHTML = bCards.map(cardHTML).join('');

  function applyScore(cards, scoreEl) {
    if (cards.length >= 2) {
      const t = handTotal(cards);
      scoreEl.textContent = t;
      const nat = isNatural(handTotal(cards.slice(0, 2)));
      scoreEl.className = 'bac-score' + (nat ? ' bac-score--natural' : '');
    } else {
      scoreEl.textContent = '—';
      scoreEl.className = 'bac-score';
    }
  }
  applyScore(pCards, el.pScore);
  applyScore(bCards, el.bScore);
}

// --- Result ---
function renderResult() {
  if (!result) { el.resultBox.hidden = true; return; }
  const r = result;
  const badges = [];
  if (r.pNatural || r.bNatural) {
    const side = r.pNatural ? 'Player' : 'Banker';
    const nat  = r.pNatural ? r.pTotal : r.bTotal;
    badges.push('<span class="res-badge res-badge--natural">Natural ' + nat + ' (' + side + ')</span>');
  }
  if (r.pPair)    badges.push('<span class="res-badge res-badge--pair">Player Pair</span>');
  if (r.bPair)    badges.push('<span class="res-badge res-badge--pair">Banker Pair</span>');
  if (r.luckySix) badges.push('<span class="res-badge res-badge--lucky6">Lucky Six (' + r.luckySix + ')</span>');
  el.resultBox.innerHTML = [
    '<div class="res-winner res-winner--' + r.winner + '">' + WINNER_LABEL[r.winner] + '</div>',
    '<div class="res-score">' + r.pTotal + ' — ' + r.bTotal + '</div>',
    badges.length ? '<div class="res-badges">' + badges.join('') + '</div>' : ''
  ].join('');
  el.resultBox.hidden = false;
}

// --- Round detail ---
function cardDesc(card) {
  if (!card) return '—';
  return card.rank + SUIT_SYMBOL[card.suit] + ' (' + cardValue(card.rank) + ')';
}

function renderPayoutDetail() {
  if (!payouts) return '';
  const rows = [];
  if (payouts.player     !== undefined) rows.push(detailPayRow('Player bet', payouts.player));
  if (payouts.banker     !== undefined) rows.push(detailPayRow('Banker bet', payouts.banker));
  if (payouts.tie        !== undefined) rows.push(detailPayRow('Tie bet',    payouts.tie));
  if (payouts.playerPair !== undefined) rows.push(detailPayRow('P. Pair',    payouts.playerPair));
  if (payouts.bankerPair !== undefined) rows.push(detailPayRow('B. Pair',    payouts.bankerPair));
  if (payouts.luckySix   !== undefined) rows.push(detailPayRow('Lucky Six',  payouts.luckySix));
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

function detailPayRow(label, val) {
  const cls = val > 0 ? 'payout-win' : val < 0 ? 'payout-lose' : '';
  return '<div class="detail-row"><span>' + label + '</span><span class="' + cls + '">' + fmtAmt(val) + '</span></div>';
}

function renderDetail() {
  if (!result) {
    el.roundDetail.innerHTML = '<p class="hint-text">Deal a hand to see the breakdown.</p>';
    return;
  }
  const r = result;
  el.roundDetail.innerHTML = [
    '<div class="detail-grid">',
    '<div class="detail-col">',
    '<div class="detail-head">PLAYER</div>',
    '<div class="detail-row"><span>Total</span><strong class="detail-val">' + r.pTotal + '</strong></div>',
    '<div class="detail-row"><span>Cards</span><span>' + pCards.length + '</span></div>',
    '<div class="detail-row"><span>Natural</span><span>' + (r.pNatural ? '✓' : '—') + '</span></div>',
    '<div class="detail-row"><span>3rd card</span><span>' + cardDesc(pCards[2] || null) + '</span></div>',
    '<div class="detail-row"><span>Pair</span><span>' + (r.pPair ? '✓' : '—') + '</span></div>',
    '</div>',
    '<div class="detail-col">',
    '<div class="detail-head">BANKER</div>',
    '<div class="detail-row"><span>Total</span><strong class="detail-val">' + r.bTotal + '</strong></div>',
    '<div class="detail-row"><span>Cards</span><span>' + bCards.length + '</span></div>',
    '<div class="detail-row"><span>Natural</span><span>' + (r.bNatural ? '✓' : '—') + '</span></div>',
    '<div class="detail-row"><span>3rd card</span><span>' + cardDesc(bCards[2] || null) + '</span></div>',
    '<div class="detail-row"><span>Pair</span><span>' + (r.bPair ? '✓' : '—') + '</span></div>',
    '</div>',
    '</div>',
    '<div class="detail-winner">Round ' + roundNum + ': <strong class="detail-winner--' + r.winner + '">' + WINNER_LABEL[r.winner] + '</strong></div>',
    r.luckySix ? '<div class="detail-row detail-row--full"><span>Lucky Six</span><span>' + r.luckySix + '</span></div>' : '',
    renderPayoutDetail()
  ].join('');
}

// --- Session log ---
function renderLog() {
  if (!log.length) {
    el.sessionLog.innerHTML = '<p class="hint-text">No hands played yet.</p>';
    return;
  }
  el.sessionLog.innerHTML = log.map(function (e) {
    const chips = [];
    if (e.natural)   chips.push('<span class="log-chip log-chip--n">N</span>');
    if (e.pPair)     chips.push('<span class="log-chip log-chip--p">PP</span>');
    if (e.bPair)     chips.push('<span class="log-chip log-chip--p">BP</span>');
    if (e.luckySix)  chips.push('<span class="log-chip log-chip--l">L6</span>');
    if (e.insurance) chips.push('<span class="log-chip log-chip--ins">INS</span>');
    const net    = e.net;
    const netCls = net > 0 ? 'log-net-win' : net < 0 ? 'log-net-lose' : '';
    return [
      '<div class="log-entry">',
      '<span class="log-num">#' + e.round + '</span>',
      '<span class="log-dot log-dot--' + e.winner + '">' + LOG_LETTER[e.winner] + '</span>',
      '<span class="log-score">' + e.pTotal + ':' + e.bTotal + '</span>',
      chips.join(''),
      net !== null ? '<span class="log-net ' + netCls + '">' + fmtAmt(net) + '</span>' : '',
      '</div>'
    ].join('');
  }).join('');
}

// --- Insurance panel ---
function renderInsurancePanel() {
  if (!el.insurancePanel) return;
  const bTotal    = handTotal(bCards);
  const playerBet = bets.player || 0;
  const maxBet    = insuranceMaxBet(playerBet, insuranceConfig);

  if (el.insBankerScore) el.insBankerScore.textContent = bTotal;
  if (el.insPlayerBet)   el.insPlayerBet.textContent   = playerBet.toLocaleString();
  if (el.insMaxBet)      el.insMaxBet.textContent       = maxBet.toLocaleString();
  if (el.insCurrentBet)  el.insCurrentBet.innerHTML     = 'Insurance bet: <strong>' + insuranceBet.toLocaleString() + '</strong>';

  const pct25 = Math.min(Math.floor(playerBet * 0.25), balance);
  const pct50 = Math.min(Math.floor(playerBet * 0.50), maxBet, balance);

  if (el.btnIns25) {
    el.btnIns25.textContent = '25% (' + pct25.toLocaleString() + ')';
    el.btnIns25.classList.toggle('is-selected', insuranceBet === pct25 && pct25 > 0);
    el.btnIns25.disabled = pct25 === 0;
  }
  if (el.btnIns50) {
    el.btnIns50.textContent = '50% (' + pct50.toLocaleString() + ')';
    el.btnIns50.classList.toggle('is-selected', insuranceBet === pct50 && pct50 > 0);
    el.btnIns50.disabled = pct50 === 0;
  }
}

// --- Role ---
function renderRole() {
  document.querySelectorAll('.tr-role-btn').forEach(function (btn) {
    btn.classList.toggle('is-active', btn.getAttribute('data-role') === role);
  });
  document.body.setAttribute('data-role', role);
}

// --- Stats panel ---
function renderStats() {
  if (!el.statsPanel) return;

  const stats = sessionStats(log);
  const rem   = shoeRemaining(shoe);
  const vc    = shoeValueCounts(shoe);
  const nat   = approxNaturalRate(vc, rem);

  if (!stats.rounds) {
    // Still show shoe composition even before any rounds
    el.statsPanel.innerHTML = [
      '<p class="hint-text" style="margin-bottom:10px">No rounds played yet.</p>',
      renderShoeChart(vc, rem, nat)
    ].join('');
    return;
  }

  const netCls = stats.net > 0 ? 'is-win' : stats.net < 0 ? 'is-lose' : '';
  el.statsPanel.innerHTML = [
    '<div class="stat-row">',
      '<span class="stat-label">Rounds</span>',
      '<strong class="stat-val">' + stats.rounds + '</strong>',
      '<span class="stat-net ' + netCls + '">' + fmtNet(stats.net) + '</span>',
    '</div>',
    '<div class="stat-wlt-row">',
      '<span class="stat-pill stat-pill--p">P ' + stats.playerWins + ' · ' + fmtPct(stats.playerWins, stats.rounds) + '</span>',
      '<span class="stat-pill stat-pill--b">B ' + stats.bankerWins + ' · ' + fmtPct(stats.bankerWins, stats.rounds) + '</span>',
      '<span class="stat-pill stat-pill--t">T ' + stats.ties + ' · ' + fmtPct(stats.ties, stats.rounds) + '</span>',
    '</div>',
    '<div class="stat-row" style="margin-top:4px">',
      '<span class="stat-label">Naturals</span>',
      '<span class="stat-val-sm">' + stats.naturals + ' (' + fmtPct(stats.naturals, stats.rounds) + ')</span>',
    '</div>',
    renderShoeChart(vc, rem, nat)
  ].join('');
}

function renderShoeChart(vc, rem, nat) {
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

function onRoleClick(e) {
  const btn = e.target.closest('.tr-role-btn');
  if (!btn) return;
  const r = btn.getAttribute('data-role');
  if (r) { role = r; renderRole(); }
}

// --- Phase control ---
function setPhase(p) {
  phase = p;
  const rem = shoeRemaining(shoe);
  el.btnDeal.disabled = p !== 'idle' || rem < 6;
  el.btnNext.disabled = p !== 'dealt';
  el.btnDeal.textContent = rem < 6 ? 'Shoe Empty' : 'DEAL';
  if (el.betZones) {
    el.betZones.classList.toggle('zones-locked', p !== 'idle');
  }
  if (el.insurancePanel) {
    el.insurancePanel.hidden = p !== 'insurance';
  }
}

// --- Chip selection ---
function onChipClick(e) {
  const btn = e.target.closest('[data-chip]');
  if (!btn || btn.disabled) return;
  const val = parseInt(btn.getAttribute('data-chip'), 10);
  selectedChip = selectedChip === val ? null : val;
  renderChipTray();
}

// --- Bet placement ---
function onZoneClick(e) {
  if (phase !== 'idle') return;
  const zone = e.currentTarget.getAttribute('data-zone');
  if (!zone || !Object.prototype.hasOwnProperty.call(bets, zone)) return;
  if (!selectedChip) {
    el.chipTray.classList.add('chip-tray-nudge');
    setTimeout(function () { el.chipTray.classList.remove('chip-tray-nudge'); }, 600);
    return;
  }
  if (balance < selectedChip) return;
  bets[zone] += selectedChip;
  balance -= selectedChip;
  renderBalance();
  renderBetZones();
  renderChipTray();
}

// --- Clear bets ---
function onClearBets() {
  if (phase !== 'idle') return;
  balance += betTotal(bets);
  ZONES.forEach(function (z) { bets[z] = 0; });
  payouts = null;
  renderBalance();
  renderBetZones();
  renderChipTray();
  el.payoutSummary.hidden = true;
}

// --- Insurance handlers ---
function onInsDecline() {
  insuranceBet = 0;
  finalizeDeal();
}

function onInsPercentClick(e) {
  const btn = e.target.closest('[data-ins-pct]');
  if (!btn || btn.disabled) return;
  const pct        = parseInt(btn.getAttribute('data-ins-pct'), 10);
  const playerBet  = bets.player || 0;
  const maxBet     = insuranceMaxBet(playerBet, insuranceConfig);
  const raw        = Math.floor(playerBet * pct / 100);
  insuranceBet     = Math.min(raw, maxBet, balance);
  renderInsurancePanel();
}

function onInsConfirm() {
  if (insuranceBet > 0) balance -= insuranceBet;
  finalizeDeal();
}

// --- Deal logic ---
function doDeal() {
  if (phase !== 'idle') return;

  let s = shoe;
  const dealt = [];
  for (let i = 0; i < 4; i++) {
    const { card, shoe: ns } = dealOne(s);
    if (!card) { alert('Shoe exhausted. Please start a new shoe.'); return; }
    dealt.push(card);
    s = ns;
  }

  pCards = [dealt[0], dealt[2]]; // P1 P2
  bCards = [dealt[1], dealt[3]]; // B1 B2
  shoe   = s;
  insuranceBet = 0;

  const bInit = handTotal(bCards);

  // Pause for insurance decision if condition is met
  if (shouldOfferInsurance(bInit, bets.player, insuranceConfig)) {
    renderShoe();
    renderHands();
    renderBalance();
    renderBetZones();
    renderInsurancePanel();
    setPhase('insurance');
    return;
  }

  finalizeDeal();
}

function finalizeDeal() {
  const pInit   = handTotal(pCards);
  const bInit   = handTotal(bCards);
  const natural = isNatural(pInit) || isNatural(bInit);

  if (!natural) {
    if (playerDraws(pInit)) {
      const { card, shoe: ns } = dealOne(shoe);
      if (card) { pCards = [...pCards, card]; shoe = ns; }
    }
    const pThird = pCards[2] ? cardValue(pCards[2].rank) : null;
    if (bankerDraws(handTotal(bCards), !!pCards[2], pThird)) {
      const { card, shoe: ns } = dealOne(shoe);
      if (card) { bCards = [...bCards, card]; shoe = ns; }
    }
  }

  roundNum++;
  result = resolveRound(pCards, bCards);

  const total = betTotal(bets);
  if (total > 0) {
    payouts = calcPayout(bets, result, rules);
    balance += total + payouts.net;
  } else {
    payouts = null;
  }

  // Settle insurance
  if (insuranceBet > 0) {
    const insPay = calcInsurancePayout(insuranceBet, result.winner, insuranceConfig);
    balance += insuranceBet + insPay;
    if (!payouts) payouts = { net: 0 };
    payouts.insurance    = insPay;
    payouts.insuranceBet = insuranceBet;
  }

  log.unshift({
    round:     roundNum,
    winner:    result.winner,
    pTotal:    result.pTotal,
    bTotal:    result.bTotal,
    natural:   result.pNatural || result.bNatural,
    pPair:     result.pPair,
    bPair:     result.bPair,
    luckySix:  result.luckySix,
    insurance: insuranceBet > 0,
    net:       payouts ? (payouts.net + (payouts.insurance || 0)) : null
  });
  if (log.length > 60) log.pop();

  setPhase('dealt');
  renderAll();
}

function doNext() {
  ZONES.forEach(function (z) { bets[z] = 0; });
  payouts = null;
  pCards  = [];
  bCards  = [];
  result  = null;
  insuranceBet = 0;
  setPhase('idle');
  renderAll();
}

function doNewShoe() {
  if (!confirm('Start a new shoe? Session log will be cleared.')) return;
  shoe     = initShoe();
  pCards   = [];
  bCards   = [];
  result   = null;
  roundNum = 0;
  log      = [];
  ZONES.forEach(function (z) { bets[z] = 0; });
  payouts      = null;
  balance      = 1000000;
  insuranceBet = 0;
  setPhase('idle');
  renderAll();
}

// --- Render all ---
function renderAll() {
  renderShoe();
  renderHands();
  renderResult();
  renderDetail();
  renderLog();
  renderBalance();
  renderBetZones();
  renderPayoutSummary();
  renderStats();
  renderRole();
}

// --- Init ---
export function init() {
  const authStore = window.YiDingAuthStore || null;
  if (!authStore || !authStore.getCurrentAccount()) {
    window.location.replace('/index.html');
    return;
  }

  rules           = getRules();
  insuranceConfig = getInsuranceConfig();
  shoe            = initShoe();

  renderChipTray();
  setPhase('idle');
  renderAll();

  // Bet zone listeners
  document.querySelectorAll('[data-zone]').forEach(function (zoneEl) {
    zoneEl.addEventListener('click', onZoneClick);
  });

  // Chip tray
  el.chipTray.addEventListener('click', onChipClick);

  // Controls
  el.btnDeal.addEventListener('click', doDeal);
  el.btnNext.addEventListener('click', doNext);
  el.btnShoe.addEventListener('click', doNewShoe);
  if (el.btnClearBets) el.btnClearBets.addEventListener('click', onClearBets);

  // Insurance
  if (el.btnInsDecline) el.btnInsDecline.addEventListener('click', onInsDecline);
  if (el.btnInsConfirm) el.btnInsConfirm.addEventListener('click', onInsConfirm);
  if (el.insurancePanel) el.insurancePanel.addEventListener('click', onInsPercentClick);

  // Role selector
  const roleSelector = document.querySelector('.tr-role-selector');
  if (roleSelector) roleSelector.addEventListener('click', onRoleClick);
}

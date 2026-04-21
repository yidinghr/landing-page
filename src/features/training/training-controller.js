import {
  initShoe, dealOne, shoeRemaining, shoePct, cardValue, SUIT_SYMBOL
} from './engines/shoe-engine.js';
import {
  handTotal, isNatural, playerDraws, bankerDraws, resolveRound
} from './engines/baccarat-engine.js';
import { calcPayout, betTotal, fmtAmt, fmtBalance } from './engines/payout-engine.js';
import { getRules } from './config/config-manager.js';

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

const ZONE_META = {
  playerPair: { label: 'P. Pair',  odds: '11:1'    },
  player:     { label: 'PLAYER',   odds: '1:1'     },
  tie:        { label: 'TIE',      odds: '8:1'     },
  banker:     { label: 'BANKER',   odds: '0.95:1'  },
  bankerPair: { label: 'B. Pair',  odds: '11:1'    },
  luckySix:   { label: 'Lucky 6',  odds: '12–20:1' },
};

const WINNER_LABEL = { player: 'PLAYER WINS', banker: 'BANKER WINS', tie: 'TIE' };
const LOG_LETTER   = { player: 'P', banker: 'B', tie: 'T' };

// --- State ---
let shoe = null;
let pCards = [], bCards = [];
let result = null;
let roundNum = 0;
let log = [];
let phase = 'idle'; // 'idle' | 'dealt'

let rules = {};
let bets = { player: 0, banker: 0, tie: 0, playerPair: 0, bankerPair: 0, luckySix: 0 };
let selectedChip = null;
let balance = 1000000;
let payouts = null;

// --- DOM ---
const el = {
  shoeRem:      document.getElementById('shoeRem'),
  shoeTotal:    document.getElementById('shoeTotal'),
  shoeFill:     document.getElementById('shoeFill'),
  shoeWarn:     document.getElementById('shoeWarn'),
  pCards:       document.getElementById('pCards'),
  bCards:       document.getElementById('bCards'),
  pScore:       document.getElementById('pScore'),
  bScore:       document.getElementById('bScore'),
  resultBox:    document.getElementById('resultBox'),
  roundDetail:  document.getElementById('roundDetail'),
  sessionLog:   document.getElementById('sessionLog'),
  btnDeal:      document.getElementById('btnDeal'),
  btnNext:      document.getElementById('btnNext'),
  btnShoe:      document.getElementById('btnShoe'),
  balanceAmt:   document.getElementById('balanceAmt'),
  totalBetAmt:  document.getElementById('totalBetAmt'),
  payoutSummary:document.getElementById('payoutSummary'),
  chipTray:     document.getElementById('chipTray'),
  betZones:     document.getElementById('betZones'),
  btnClearBets: document.getElementById('btnClearBets'),
  rulesName:    document.getElementById('rulesName'),
};

// --- Chip tray rendering ---
function renderChipTray() {
  el.chipTray.innerHTML = CHIPS.map(function (c) {
    const active = selectedChip === c.value ? ' is-selected' : '';
    const disabled = balance < c.value ? ' is-disabled' : '';
    return [
      '<button class="tr-chip ' + c.cls + active + disabled + '" data-chip="' + c.value + '"',
      disabled ? ' disabled' : '',
      '>',
      '<span class="tr-chip__label">' + c.label + '</span>',
      '</button>'
    ].join('');
  }).join('');
}

// --- Bet zones rendering ---
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

    // Highlight zone if active payout
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
  const net = payouts.net;
  const comm = payouts.commission || 0;
  const parts = [
    '<span class="payout-net ' + (net > 0 ? 'is-win' : net < 0 ? 'is-lose' : 'is-push') + '">',
    'Net: ' + fmtAmt(net),
    '</span>'
  ];
  if (comm > 0) {
    parts.push('<span class="payout-comm">Commission: ' + comm.toLocaleString() + '</span>');
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
  if (r.pPair)   badges.push('<span class="res-badge res-badge--pair">Player Pair</span>');
  if (r.bPair)   badges.push('<span class="res-badge res-badge--pair">Banker Pair</span>');
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
    payouts ? renderPayoutDetail() : ''
  ].join('');
}

function renderPayoutDetail() {
  if (!payouts) return '';
  const rows = [];
  if (payouts.player   !== undefined) rows.push('<div class="detail-row"><span>Player bet</span><span class="' + (payouts.player > 0 ? 'payout-win' : payouts.player < 0 ? 'payout-lose' : '') + '">' + fmtAmt(payouts.player) + '</span></div>');
  if (payouts.banker   !== undefined) rows.push('<div class="detail-row"><span>Banker bet</span><span class="' + (payouts.banker > 0 ? 'payout-win' : payouts.banker < 0 ? 'payout-lose' : '') + '">' + fmtAmt(payouts.banker) + '</span></div>');
  if (payouts.tie      !== undefined) rows.push('<div class="detail-row"><span>Tie bet</span><span class="' + (payouts.tie > 0 ? 'payout-win' : payouts.tie < 0 ? 'payout-lose' : '') + '">' + fmtAmt(payouts.tie) + '</span></div>');
  if (payouts.playerPair !== undefined) rows.push('<div class="detail-row"><span>P. Pair</span><span class="' + (payouts.playerPair > 0 ? 'payout-win' : 'payout-lose') + '">' + fmtAmt(payouts.playerPair) + '</span></div>');
  if (payouts.bankerPair !== undefined) rows.push('<div class="detail-row"><span>B. Pair</span><span class="' + (payouts.bankerPair > 0 ? 'payout-win' : 'payout-lose') + '">' + fmtAmt(payouts.bankerPair) + '</span></div>');
  if (payouts.luckySix !== undefined) rows.push('<div class="detail-row"><span>Lucky Six</span><span class="' + (payouts.luckySix > 0 ? 'payout-win' : 'payout-lose') + '">' + fmtAmt(payouts.luckySix) + '</span></div>');
  if (payouts.commission) rows.push('<div class="detail-row detail-row--comm"><span>Commission</span><span>-' + payouts.commission.toLocaleString() + '</span></div>');
  if (!rows.length) return '';
  return '<div class="detail-payout-section"><div class="detail-head">PAYOUT</div>' + rows.join('') + '</div>';
}

// --- Session log ---
function renderLog() {
  if (!log.length) {
    el.sessionLog.innerHTML = '<p class="hint-text">No hands played yet.</p>';
    return;
  }
  el.sessionLog.innerHTML = log.map(function (e) {
    const chips = [];
    if (e.natural) chips.push('<span class="log-chip log-chip--n">N</span>');
    if (e.pPair)   chips.push('<span class="log-chip log-chip--p">PP</span>');
    if (e.bPair)   chips.push('<span class="log-chip log-chip--p">BP</span>');
    if (e.luckySix) chips.push('<span class="log-chip log-chip--l">L6</span>');
    const net = e.net;
    const netCls = net > 0 ? 'log-net-win' : net < 0 ? 'log-net-lose' : '';
    const netStr = net !== null ? fmtAmt(net) : '';
    return [
      '<div class="log-entry">',
      '<span class="log-num">#' + e.round + '</span>',
      '<span class="log-dot log-dot--' + e.winner + '">' + LOG_LETTER[e.winner] + '</span>',
      '<span class="log-score">' + e.pTotal + ':' + e.bTotal + '</span>',
      chips.join(''),
      net !== null ? '<span class="log-net ' + netCls + '">' + netStr + '</span>' : '',
      '</div>'
    ].join('');
  }).join('');
}

// --- Controls ---
function setPhase(p) {
  phase = p;
  const rem = shoeRemaining(shoe);
  el.btnDeal.disabled = p !== 'idle' || rem < 6;
  el.btnNext.disabled = p !== 'dealt';
  el.btnDeal.textContent = rem < 6 ? 'Shoe Empty' : 'DEAL';
  if (el.betZones) {
    el.betZones.classList.toggle('zones-locked', p === 'dealt');
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
  if (phase === 'dealt') return;
  const zone = e.currentTarget.getAttribute('data-zone');
  if (!zone || !bets.hasOwnProperty(zone)) return;
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
  if (phase === 'dealt') return;
  const total = betTotal(bets);
  balance += total;
  ZONES.forEach(function (z) { bets[z] = 0; });
  payouts = null;
  renderBalance();
  renderBetZones();
  renderChipTray();
  el.payoutSummary.hidden = true;
}

// --- Deal round ---
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
  shoe = s;

  const pInit = handTotal(pCards);
  const bInit = handTotal(bCards);
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

  // Calculate payouts if any bets were placed
  const total = betTotal(bets);
  if (total > 0) {
    payouts = calcPayout(bets, result, rules);
    balance += total + payouts.net; // return stakes + net profit/loss
  } else {
    payouts = null;
  }

  log.unshift({
    round: roundNum,
    winner: result.winner,
    pTotal: result.pTotal,
    bTotal: result.bTotal,
    natural: result.pNatural || result.bNatural,
    pPair: result.pPair,
    bPair: result.bPair,
    luckySix: result.luckySix,
    net: payouts ? payouts.net : null
  });
  if (log.length > 60) log.pop();

  setPhase('dealt');
  renderAll();
}

function doNext() {
  // Clear bets after settlement (player places new bets each round)
  ZONES.forEach(function (z) { bets[z] = 0; });
  payouts = null;
  pCards = [];
  bCards = [];
  result = null;
  setPhase('idle');
  renderAll();
}

function doNewShoe() {
  if (!confirm('Start a new shoe? Session log will be cleared.')) return;
  shoe = initShoe();
  pCards = [];
  bCards = [];
  result = null;
  roundNum = 0;
  log = [];
  ZONES.forEach(function (z) { bets[z] = 0; });
  payouts = null;
  balance = 1000000;
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
}

// --- Init ---
export function init() {
  const authStore = window.YiDingAuthStore || null;
  if (!authStore || !authStore.getCurrentAccount()) {
    window.location.replace('/index.html');
    return;
  }

  rules = getRules();
  shoe = initShoe();

  // Build chip tray
  renderChipTray();
  setPhase('idle');
  renderAll();

  // Attach bet zone listeners
  document.querySelectorAll('[data-zone]').forEach(function (zoneEl) {
    zoneEl.addEventListener('click', onZoneClick);
  });

  // Chip tray (event delegation)
  el.chipTray.addEventListener('click', onChipClick);

  el.btnDeal.addEventListener('click', doDeal);
  el.btnNext.addEventListener('click', doNext);
  el.btnShoe.addEventListener('click', doNewShoe);
  el.btnClearBets && el.btnClearBets.addEventListener('click', onClearBets);
}

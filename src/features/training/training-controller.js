import {
  initShoe, dealOne, shoeRemaining, shoePct,
  cardValue, SUIT_SYMBOL
} from './engines/shoe-engine.js';
import {
  handTotal, isNatural, playerDraws, bankerDraws, resolveRound
} from './engines/baccarat-engine.js';

// --- State ---
let shoe = null;
let pCards = [];
let bCards = [];
let result = null;
let roundNum = 0;
let log = [];
let phase = 'idle'; // 'idle' | 'dealt'

// --- DOM ---
const el = {
  shoeRem:    document.getElementById('shoeRem'),
  shoeTotal:  document.getElementById('shoeTotal'),
  shoeFill:   document.getElementById('shoeFill'),
  shoeWarn:   document.getElementById('shoeWarn'),
  pCards:     document.getElementById('pCards'),
  bCards:     document.getElementById('bCards'),
  pScore:     document.getElementById('pScore'),
  bScore:     document.getElementById('bScore'),
  resultBox:  document.getElementById('resultBox'),
  roundDetail:document.getElementById('roundDetail'),
  sessionLog: document.getElementById('sessionLog'),
  btnDeal:    document.getElementById('btnDeal'),
  btnNext:    document.getElementById('btnNext'),
  btnShoe:    document.getElementById('btnShoe'),
};

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
  const pct = shoePct(shoe);
  el.shoeRem.textContent = rem;
  el.shoeTotal.textContent = shoe.total;
  el.shoeFill.style.width = pct + '%';
  el.shoeWarn.hidden = rem >= 20;
}

// --- Hands ---
function renderHands() {
  el.pCards.innerHTML = pCards.map(cardHTML).join('');
  el.bCards.innerHTML = bCards.map(cardHTML).join('');

  if (pCards.length >= 2) {
    const t = handTotal(pCards);
    el.pScore.textContent = t;
    el.pScore.className = 'bac-score' + (isNatural(handTotal(pCards.slice(0, 2))) ? ' bac-score--natural' : '');
  } else {
    el.pScore.textContent = '—';
    el.pScore.className = 'bac-score';
  }

  if (bCards.length >= 2) {
    const t = handTotal(bCards);
    el.bScore.textContent = t;
    el.bScore.className = 'bac-score' + (isNatural(handTotal(bCards.slice(0, 2))) ? ' bac-score--natural' : '');
  } else {
    el.bScore.textContent = '—';
    el.bScore.className = 'bac-score';
  }
}

// --- Result ---
const WINNER_LABEL = { player: 'PLAYER WINS', banker: 'BANKER WINS', tie: 'TIE' };

function renderResult() {
  if (!result) { el.resultBox.hidden = true; return; }
  const r = result;
  const badges = [];
  if (r.pNatural || r.bNatural) {
    const side = r.pNatural ? 'Player' : 'Banker';
    const nat = r.pNatural ? r.pTotal : r.bTotal;
    badges.push('<span class="res-badge res-badge--natural">Natural ' + nat + ' (' + side + ')</span>');
  }
  if (r.pPair) badges.push('<span class="res-badge res-badge--pair">Player Pair</span>');
  if (r.bPair) badges.push('<span class="res-badge res-badge--pair">Banker Pair</span>');
  if (r.luckySix) badges.push('<span class="res-badge res-badge--lucky6">Lucky Six (' + r.luckySix + ')</span>');

  el.resultBox.innerHTML = [
    '<div class="res-winner res-winner--' + r.winner + '">' + WINNER_LABEL[r.winner] + '</div>',
    '<div class="res-score">' + r.pTotal + ' — ' + r.bTotal + '</div>',
    badges.length ? '<div class="res-badges">' + badges.join('') + '</div>' : ''
  ].join('');
  el.resultBox.hidden = false;
}

// --- Round Detail ---
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
    r.luckySix ? '<div class="detail-row detail-row--full"><span>Lucky Six</span><span>' + r.luckySix + '</span></div>' : ''
  ].join('');
}

// --- Session Log ---
const LOG_LETTER = { player: 'P', banker: 'B', tie: 'T' };

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
    return [
      '<div class="log-entry">',
      '<span class="log-num">#' + e.round + '</span>',
      '<span class="log-dot log-dot--' + e.winner + '">' + LOG_LETTER[e.winner] + '</span>',
      '<span class="log-score">' + e.pTotal + ':' + e.bTotal + '</span>',
      chips.join(''),
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
}

// --- Round logic ---
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

  // Deal order: P1 B1 P2 B2
  pCards = [dealt[0], dealt[2]];
  bCards = [dealt[1], dealt[3]];
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

  log.unshift({
    round: roundNum,
    winner: result.winner,
    pTotal: result.pTotal,
    bTotal: result.bTotal,
    natural: result.pNatural || result.bNatural,
    pPair: result.pPair,
    bPair: result.bPair,
    luckySix: result.luckySix
  });
  if (log.length > 60) log.pop();

  setPhase('dealt');
  renderAll();
}

function doNext() {
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
  setPhase('idle');
  renderAll();
}

function renderAll() {
  renderShoe();
  renderHands();
  renderResult();
  renderDetail();
  renderLog();
}

// --- Init ---
export function init() {
  const authStore = window.YiDingAuthStore || null;
  if (!authStore || !authStore.getCurrentAccount()) {
    window.location.replace('/index.html');
    return;
  }

  shoe = initShoe();
  setPhase('idle');
  renderAll();

  el.btnDeal.addEventListener('click', doDeal);
  el.btnNext.addEventListener('click', doNext);
  el.btnShoe.addEventListener('click', doNewShoe);
}

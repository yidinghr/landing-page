import { handTotal, isNatural, playerDraws, bankerDraws, resolveRound } from './engines/baccarat-engine.js';
import { dealOne, initShoe, shoeRemaining, cardValue, SUIT_SYMBOL } from './engines/shoe-engine.js';
import { betTotal } from './engines/payout-engine.js';
import { insuranceMaxBet, shouldOfferInsurance } from './engines/insurance-engine.js';
import { getInsuranceConfig, getRules } from './config/config-manager.js';
import {
  ZONES,
  clearBets,
  createSeats,
  creditSeat,
  debitSeat,
  getSeat,
  setBet,
  setInsuranceDecision
} from './engines/seat-engine.js';
import { settleRound } from './engines/settlement-engine.js';
import { npcAutoBet } from './npc/npc-behavior.js';
import {
  renderBalance,
  renderBetZones,
  renderChipTray,
  renderDetail,
  renderHands,
  renderLog,
  renderPayoutSummary,
  renderResult,
  renderSeats,
  renderShoe,
  renderStats
} from './ui/table-renderer.js';
import { renderSettlementBoard } from './ui/settlement-renderer.js';

const CHIPS = [
  { value: 1000000, label: '1M', cls: 'tr-chip--1m' },
  { value: 500000, label: '500K', cls: 'tr-chip--500k' },
  { value: 100000, label: '100K', cls: 'tr-chip--100k' },
  { value: 50000, label: '50K', cls: 'tr-chip--50k' },
  { value: 10000, label: '10K', cls: 'tr-chip--10k' },
  { value: 5000, label: '5K', cls: 'tr-chip--5k' },
  { value: 1000, label: '1K', cls: 'tr-chip--1k' },
  { value: 500, label: '500', cls: 'tr-chip--500' },
  { value: 100, label: '100', cls: 'tr-chip--100' },
  { value: 25, label: '25', cls: 'tr-chip--25' },
  { value: 5, label: '5', cls: 'tr-chip--5' }
];

const DEAL_LABELS = {
  idle: 'DEAL',
  betting: 'DEAL',
  'deal-1': 'Deal P1',
  'deal-2': 'Deal B1',
  'deal-3': 'Deal P2',
  'deal-4': 'Deal B2',
  'draw-p3': 'Deal P3',
  'draw-b3': 'Deal B3',
  reveal: 'Reveal Ready',
  settlement: 'SETTLED',
  'round-end': 'SETTLED'
};

const DEAL_PHASES = ['idle', 'betting', 'deal-1', 'deal-2', 'deal-3', 'deal-4', 'draw-p3', 'draw-b3'];

let shoe = null;
let pCards = [];
let bCards = [];
let result = null;
let roundNum = 0;
let log = [];
let phase = 'idle';

let rules = {};
let insuranceConfig = {};
let seats = createSeats();
let activeSeatId = 1;
let selectedChip = null;
let payouts = null;
let settlement = null;
let role = 'dealer';
let insuranceBet = 0;
let npcBetsApplied = false;
let autoAfterInsurance = false;
let burnTimer = 0;

const el = {
  shoeRem: document.getElementById('shoeRem'),
  shoeTotal: document.getElementById('shoeTotal'),
  shoeFill: document.getElementById('shoeFill'),
  shoeWarn: document.getElementById('shoeWarn'),
  burnNotice: document.getElementById('burnNotice'),
  pCards: document.getElementById('pCards'),
  bCards: document.getElementById('bCards'),
  pScore: document.getElementById('pScore'),
  bScore: document.getElementById('bScore'),
  resultBox: document.getElementById('resultBox'),
  roundDetail: document.getElementById('roundDetail'),
  sessionLog: document.getElementById('sessionLog'),
  btnCloseBets: document.getElementById('btnCloseBets'),
  btnDeal: document.getElementById('btnDeal'),
  btnAutoDeal: document.getElementById('btnAutoDeal'),
  btnReveal: document.getElementById('btnReveal'),
  btnNext: document.getElementById('btnNext'),
  btnShoe: document.getElementById('btnShoe'),
  balanceAmt: document.getElementById('balanceAmt'),
  totalBetAmt: document.getElementById('totalBetAmt'),
  payoutSummary: document.getElementById('payoutSummary'),
  chipTray: document.getElementById('chipTray'),
  betZones: document.getElementById('betZones'),
  seatsRow: document.getElementById('seatsRow'),
  settlementBoard: document.getElementById('settlementBoard'),
  btnClearBets: document.getElementById('btnClearBets'),
  rulesName: document.getElementById('rulesName'),
  statsPanel: document.getElementById('statsPanel'),
  insurancePanel: document.getElementById('insurancePanel'),
  insBankerScore: document.getElementById('insBankerScore'),
  insPlayerBet: document.getElementById('insPlayerBet'),
  insMaxBet: document.getElementById('insMaxBet'),
  insCurrentBet: document.getElementById('insCurrentBet'),
  btnInsDecline: document.getElementById('btnInsDecline'),
  btnIns25: document.getElementById('btnIns25'),
  btnIns50: document.getElementById('btnIns50'),
  btnInsConfirm: document.getElementById('btnInsConfirm')
};

function activeSeat() {
  return getSeat(seats, activeSeatId);
}

function activeBets() {
  return activeSeat().bets;
}

function activeBalance() {
  return activeSeat().balance;
}

function emptyBets() {
  return ZONES.reduce(function (bets, zone) {
    bets[zone] = 0;
    return bets;
  }, {});
}

function emptyInsurance() {
  return {
    offered: false,
    accepted: false,
    amount: 0,
    outcome: 'na',
    payout: 0
  };
}

function resetRoundSeats(nextSeats) {
  return nextSeats.map(function (seat) {
    return Object.assign({}, seat, {
      bets: emptyBets(),
      insurance: emptyInsurance()
    });
  });
}

function formatBurnNotice() {
  if (!shoe || !shoe.burnCard) return '';
  return 'Burn card: ' + shoe.burnCard.rank + SUIT_SYMBOL[shoe.burnCard.suit] + ' - Burned ' + shoe.burnCount + ' cards';
}

function showBurnNotice() {
  if (!el.burnNotice) return;
  clearTimeout(burnTimer);
  el.burnNotice.textContent = formatBurnNotice();
  el.burnNotice.hidden = false;
  burnTimer = setTimeout(function () {
    el.burnNotice.hidden = true;
  }, 3000);
}

function renderRole() {
  document.querySelectorAll('.tr-role-btn').forEach(function (btn) {
    btn.classList.toggle('is-active', btn.getAttribute('data-role') === role);
  });
  document.body.setAttribute('data-role', role);
}

function renderInsurancePanel() {
  if (!el.insurancePanel) return;
  const seat = activeSeat();
  const bTotal = handTotal(bCards);
  const playerBet = seat.bets.player || 0;
  const maxBet = insuranceMaxBet(playerBet, insuranceConfig);
  const balance = seat.balance;

  if (el.insBankerScore) el.insBankerScore.textContent = bTotal;
  if (el.insPlayerBet) el.insPlayerBet.textContent = playerBet.toLocaleString();
  if (el.insMaxBet) el.insMaxBet.textContent = maxBet.toLocaleString();
  if (el.insCurrentBet) el.insCurrentBet.innerHTML = 'Insurance bet: <strong>' + insuranceBet.toLocaleString() + '</strong>';

  const pct25 = Math.min(Math.floor(playerBet * 0.25), maxBet, balance);
  const pct50 = Math.min(Math.floor(playerBet * 0.5), maxBet, balance);

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

function renderControls() {
  const rem = shoe ? shoeRemaining(shoe) : 0;
  const dealAllowed = DEAL_PHASES.indexOf(phase) >= 0 && rem > 0 && phase !== 'insurance';
  const idle = phase === 'idle' || phase === 'betting';

  if (el.btnDeal) {
    el.btnDeal.textContent = rem < 6 && idle ? 'Shoe Empty' : (DEAL_LABELS[phase] || 'DEAL');
    el.btnDeal.disabled = !dealAllowed || (idle && rem < 6);
  }
  if (el.btnCloseBets) el.btnCloseBets.disabled = !idle;
  if (el.btnAutoDeal) el.btnAutoDeal.disabled = !idle || rem < 6;
  if (el.btnReveal) el.btnReveal.disabled = phase !== 'reveal';
  if (el.btnNext) el.btnNext.disabled = phase !== 'settlement' && phase !== 'round-end';
  if (el.btnClearBets) el.btnClearBets.disabled = !idle;
  if (el.betZones) el.betZones.classList.toggle('zones-locked', !idle);
  if (el.insurancePanel) el.insurancePanel.hidden = phase !== 'insurance';
}

function setPhase(nextPhase) {
  phase = nextPhase;
  renderControls();
}

function renderAll() {
  const seat = activeSeat();
  renderShoe(el, shoe);
  renderHands(el, pCards, bCards);
  renderResult(el.resultBox, result);
  renderDetail(el.roundDetail, {
    result: result,
    pCards: pCards,
    bCards: bCards,
    roundNum: roundNum,
    payouts: payouts
  });
  renderLog(el.sessionLog, log);
  renderBalance(el.balanceAmt, el.rulesName, seat.balance, rules);
  renderChipTray(el.chipTray, CHIPS, selectedChip, seat.balance);
  renderBetZones(el.betZones, seat.bets, payouts, el.totalBetAmt);
  renderSeats(el.seatsRow, seats, activeSeatId, settlement);
  renderPayoutSummary(el.payoutSummary, payouts);
  renderStats(el.statsPanel, shoe, log);
  renderSettlementBoard(el.settlementBoard, settlement);
  renderInsurancePanel();
  renderRole();
  renderControls();
}

function ensureNpcBets() {
  if (npcBetsApplied || activeSeatId !== 1) return;
  seats = npcAutoBet(seats, activeSeatId, shoe);
  npcBetsApplied = true;
}

function onRoleClick(e) {
  const btn = e.target.closest('.tr-role-btn');
  if (!btn) return;
  const nextRole = btn.getAttribute('data-role');
  if (!nextRole) return;
  role = nextRole;
  renderRole();
}

function onChipClick(e) {
  const btn = e.target.closest('[data-chip]');
  if (!btn || btn.disabled) return;
  const val = parseInt(btn.getAttribute('data-chip'), 10);
  selectedChip = selectedChip === val ? null : val;
  renderChipTray(el.chipTray, CHIPS, selectedChip, activeBalance());
}

function onZoneClick(e) {
  if (phase !== 'idle' && phase !== 'betting') return;
  const zone = e.currentTarget.getAttribute('data-zone');
  if (!zone || ZONES.indexOf(zone) < 0) return;
  if (!selectedChip) {
    el.chipTray.classList.add('chip-tray-nudge');
    setTimeout(function () { el.chipTray.classList.remove('chip-tray-nudge'); }, 600);
    return;
  }
  if (activeBalance() < selectedChip) return;

  seats = debitSeat(seats, activeSeatId, selectedChip);
  seats = setBet(seats, activeSeatId, zone, selectedChip);
  payouts = null;
  settlement = null;
  ensureNpcBets();
  renderAll();
}

function onClearBets() {
  if (phase !== 'idle' && phase !== 'betting') return;
  seats = clearBets(seats, activeSeatId);
  payouts = null;
  settlement = null;
  renderAll();
}

function closeBets() {
  if (phase !== 'idle' && phase !== 'betting') return;
  ensureNpcBets();
  setPhase('deal-1');
  renderAll();
}

function takeCard() {
  const dealt = dealOne(shoe);
  if (!dealt.card) {
    alert('Shoe exhausted. Please start a new shoe.');
    return null;
  }
  shoe = dealt.shoe;
  return dealt.card;
}

function routeDrawPhase() {
  const pInit = handTotal(pCards);
  const bInit = handTotal(bCards);
  const natural = isNatural(pInit) || isNatural(bInit);

  if (natural) {
    setPhase('reveal');
    return;
  }
  if (playerDraws(pInit)) {
    setPhase('draw-p3');
    return;
  }
  if (bankerDraws(bInit, false, null)) {
    setPhase('draw-b3');
    return;
  }
  setPhase('reveal');
}

function maybeOfferInsurance() {
  const bInit = handTotal(bCards);
  const playerBet = activeBets().player || 0;
  if (!shouldOfferInsurance(bInit, playerBet, insuranceConfig)) {
    routeDrawPhase();
    return false;
  }

  insuranceBet = 0;
  seats = setInsuranceDecision(seats, activeSeatId, {
    offered: true,
    accepted: false,
    amount: 0,
    outcome: 'pending',
    payout: 0
  });
  setPhase('insurance');
  return true;
}

function dealCurrentPhase() {
  if (phase === 'idle' || phase === 'betting') {
    closeBets();
  }

  if (phase === 'deal-1') {
    const card = takeCard();
    if (!card) return;
    pCards = [card];
    setPhase('deal-2');
  } else if (phase === 'deal-2') {
    const card = takeCard();
    if (!card) return;
    bCards = [card];
    setPhase('deal-3');
  } else if (phase === 'deal-3') {
    const card = takeCard();
    if (!card) return;
    pCards = [pCards[0], card];
    setPhase('deal-4');
  } else if (phase === 'deal-4') {
    const card = takeCard();
    if (!card) return;
    bCards = [bCards[0], card];
    maybeOfferInsurance();
  } else if (phase === 'draw-p3') {
    const card = takeCard();
    if (!card) return;
    pCards = pCards.concat(card);
    const pThird = cardValue(card.rank);
    if (bankerDraws(handTotal(bCards), true, pThird)) {
      setPhase('draw-b3');
    } else {
      setPhase('reveal');
    }
  } else if (phase === 'draw-b3') {
    const card = takeCard();
    if (!card) return;
    bCards = bCards.concat(card);
    setPhase('reveal');
  }

  renderAll();
}

function autoDrawToReveal() {
  const pInit = handTotal(pCards);
  const bInit = handTotal(bCards);
  const natural = isNatural(pInit) || isNatural(bInit);

  if (!natural) {
    if (playerDraws(pInit)) {
      const card = takeCard();
      if (card) pCards = pCards.concat(card);
    }

    const pThird = pCards[2] ? cardValue(pCards[2].rank) : null;
    if (bankerDraws(handTotal(bCards), Boolean(pCards[2]), pThird)) {
      const card = takeCard();
      if (card) bCards = bCards.concat(card);
    }
  }

  setPhase('reveal');
  revealRound();
}

function dealOpeningFour() {
  const dealt = [];
  for (let i = 0; i < 4; i++) {
    const card = takeCard();
    if (!card) return false;
    dealt.push(card);
  }

  pCards = [dealt[0], dealt[2]];
  bCards = [dealt[1], dealt[3]];
  return true;
}

function doAutoDeal() {
  if (phase !== 'idle' && phase !== 'betting') return;
  ensureNpcBets();
  pCards = [];
  bCards = [];
  result = null;
  payouts = null;
  settlement = null;
  insuranceBet = 0;
  autoAfterInsurance = true;

  if (!dealOpeningFour()) {
    autoAfterInsurance = false;
    renderAll();
    return;
  }

  if (maybeOfferInsurance()) {
    renderAll();
    return;
  }

  autoDrawToReveal();
}

function continueAfterInsurance() {
  if (autoAfterInsurance) {
    autoAfterInsurance = false;
    autoDrawToReveal();
    return;
  }

  routeDrawPhase();
  renderAll();
}

function onInsDecline() {
  insuranceBet = 0;
  seats = setInsuranceDecision(seats, activeSeatId, {
    offered: true,
    accepted: false,
    amount: 0,
    outcome: 'declined',
    payout: 0
  });
  continueAfterInsurance();
}

function onInsPercentClick(e) {
  const btn = e.target.closest('[data-ins-pct]');
  if (!btn || btn.disabled) return;
  const pct = parseInt(btn.getAttribute('data-ins-pct'), 10);
  const playerBet = activeBets().player || 0;
  const maxBet = insuranceMaxBet(playerBet, insuranceConfig);
  const raw = Math.floor(playerBet * pct / 100);
  insuranceBet = Math.min(raw, maxBet, activeBalance());
  renderInsurancePanel();
}

function onInsConfirm() {
  if (insuranceBet > 0) {
    seats = debitSeat(seats, activeSeatId, insuranceBet);
  }
  seats = setInsuranceDecision(seats, activeSeatId, {
    offered: true,
    accepted: insuranceBet > 0,
    amount: insuranceBet,
    outcome: insuranceBet > 0 ? 'accepted' : 'declined',
    payout: 0
  });
  continueAfterInsurance();
}

function revealRound() {
  if (phase !== 'reveal' && phase !== 'settlement') return;
  if (phase === 'settlement') return;

  roundNum++;
  result = resolveRound(pCards, bCards);
  settlement = settleRound(seats, result, rules, insuranceConfig);

  settlement.seats.forEach(function (row) {
    if (row.creditAmount > 0) {
      seats = creditSeat(seats, row.seatId, row.creditAmount);
    }
    if (row.insurance) {
      seats = setInsuranceDecision(seats, row.seatId, row.insurance);
    }
  });

  const activeRow = settlement.seats.find(function (row) {
    return row.seatId === activeSeatId;
  });
  payouts = activeRow ? Object.assign({}, activeRow.payouts) : null;
  if (activeRow && activeRow.insurance && activeRow.insurance.accepted) {
    payouts = payouts || { net: 0 };
    payouts.insurance = activeRow.insurance.payout;
    payouts.insuranceBet = activeRow.insurance.amount;
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
    insurance: Boolean(activeRow && activeRow.insurance && activeRow.insurance.accepted),
    net: activeRow ? activeRow.net : null
  });
  if (log.length > 60) log.pop();

  setPhase('settlement');
  renderAll();
}

function doNext() {
  seats = resetRoundSeats(seats);
  pCards = [];
  bCards = [];
  result = null;
  payouts = null;
  settlement = null;
  insuranceBet = 0;
  npcBetsApplied = false;
  autoAfterInsurance = false;
  setPhase('idle');
  renderAll();
}

function doNewShoe() {
  if (!confirm('Start a new shoe? Session log will be cleared.')) return;
  shoe = initShoe();
  seats = createSeats();
  pCards = [];
  bCards = [];
  result = null;
  roundNum = 0;
  log = [];
  payouts = null;
  settlement = null;
  insuranceBet = 0;
  npcBetsApplied = false;
  autoAfterInsurance = false;
  setPhase('idle');
  renderAll();
  showBurnNotice();
}

// --- Init ---
export function init() {
  const authStore = window.YiDingAuthStore || null;
  if (!authStore || !authStore.getCurrentAccount()) {
    window.location.replace('/index.html');
    return;
  }

  rules = getRules();
  insuranceConfig = getInsuranceConfig();
  shoe = initShoe();
  seats = createSeats();

  renderChipTray(el.chipTray, CHIPS, selectedChip, activeBalance());
  setPhase('idle');
  renderAll();

  document.querySelectorAll('[data-zone]').forEach(function (zoneEl) {
    zoneEl.addEventListener('click', onZoneClick);
  });

  el.chipTray.addEventListener('click', onChipClick);
  el.btnDeal.addEventListener('click', dealCurrentPhase);
  el.btnNext.addEventListener('click', doNext);
  el.btnShoe.addEventListener('click', doNewShoe);
  if (el.btnCloseBets) el.btnCloseBets.addEventListener('click', closeBets);
  if (el.btnAutoDeal) el.btnAutoDeal.addEventListener('click', doAutoDeal);
  if (el.btnReveal) el.btnReveal.addEventListener('click', revealRound);
  if (el.btnClearBets) el.btnClearBets.addEventListener('click', onClearBets);

  if (el.btnInsDecline) el.btnInsDecline.addEventListener('click', onInsDecline);
  if (el.btnInsConfirm) el.btnInsConfirm.addEventListener('click', onInsConfirm);
  if (el.insurancePanel) el.insurancePanel.addEventListener('click', onInsPercentClick);

  const roleSelector = document.querySelector('.tr-role-selector');
  if (roleSelector) roleSelector.addEventListener('click', onRoleClick);
}

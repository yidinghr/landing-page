// photo-table-system.js
// Self-contained baccarat overlay sitting on top of the photo table.
// Handles: chip drag-to-bet (with balance deduction), card drag-to-deal
// (face-down with slide-in animation), card squeeze (drag-from-bottom-up
// reveal modal), and settle (winner detection + payout).
//
// Independent of the legacy training engine — it leaves the legacy
// controller running silently in the background.

(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------

  const SUITS = [
    { sym: '♠', red: false, key: 'S' },
    { sym: '♥', red: true,  key: 'H' },
    { sym: '♦', red: true,  key: 'D' },
    { sym: '♣', red: false, key: 'C' }
  ];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // Baccarat card values: A=1, 2-9=face, T-K=0
  function cardValue(rank) {
    if (rank === 'A') return 1;
    if (rank === '10' || rank === 'J' || rank === 'Q' || rank === 'K') return 0;
    return parseInt(rank, 10);
  }

  // Standard payout odds for each bet type
  const PAYOUTS = {
    player:     1,      // 1 : 1
    banker:     0.95,   // 1 : 1 minus 5% commission
    tie:        8,      // 8 : 1
    playerPair: 11,     // 11 : 1
    bankerPair: 11,     // 11 : 1
    lucky6:     12      // 12 : 1 (banker wins with 6)
  };

  const STARTING_BALANCE = 1000000;
  const HISTORY_STORAGE_KEY = 'yiding-baccarat-photo-history-v1';
  const BET_ZONES = [
    { key: 'player', label: 'PLAYER', left: 31, top: 55, width: 15, height: 12, chipX: 63, chipY: 64 },
    { key: 'banker', label: 'BANKER', left: 54, top: 55, width: 15, height: 12, chipX: 37, chipY: 64 },
    { key: 'tie', label: 'TIE', left: 43, top: 39, width: 14, height: 9, chipX: 50, chipY: 70 },
    { key: 'playerPair', label: 'P PAIR', left: 37, top: 33, width: 10, height: 10, chipX: 50, chipY: 70 },
    { key: 'bankerPair', label: 'B PAIR', left: 56, top: 33, width: 10, height: 10, chipX: 20, chipY: 70 },
    { key: 'lucky6', label: 'LUCKY 6', left: 24, top: 52, width: 9, height: 9, chipX: 45, chipY: 72 }
  ];

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------

  const state = {
    bets:    Object.create(null),  // { zoneKey: [{value,label,cls}, ...] }
    hands:   { player: [], banker: [] },  // { rank, suit, faceUp }
    balance: STARTING_BALANCE,
    phase:   'betting',  // 'betting' | 'dealing' | 'settled'
    autoDealing: false,
    drag:    null,
    squeeze: null,
    selectedChipValue: 0,  // chip currently selected for click-to-bet
    // Round history — appended on every settle, used by the roadmap modal
    // and by the right-panel empirical % update.
    // Each entry: { winner: 'P'|'B'|'T', pp: bool, bp: bool, l6: bool }
    history: []
  };

  // ---------------------------------------------------------------------
  // DOM helpers
  // ---------------------------------------------------------------------

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function fmt(n) { return Number(n || 0).toLocaleString(); }

  function flash(el) {
    if (!el) return;
    el.classList.remove('is-flashing');
    void el.offsetWidth;
    el.classList.add('is-flashing');
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function currentMode() {
    return document.body && document.body.getAttribute('data-role') === 'customer'
      ? 'player'
      : 'dealer';
  }

  function shake(el) {
    if (!el) return;
    el.classList.remove('is-shaking');
    void el.offsetWidth;
    el.classList.add('is-shaking');
  }

  // ---------------------------------------------------------------------
  // Chip helpers
  // ---------------------------------------------------------------------

  function chipShortLabel(value) {
    if (value >= 1000000) return (value / 1000000) + 'M';
    if (value >= 1000) return (value / 1000) + 'K';
    return String(value);
  }

  function chipClassFor(value) {
    if (value >= 1000000) return 'tr-chip--1m';
    if (value >= 500000)  return 'tr-chip--500k';
    if (value >= 100000)  return 'tr-chip--100k';
    if (value >= 50000)   return 'tr-chip--50k';
    if (value >= 10000)   return 'tr-chip--10k';
    if (value >= 5000)    return 'tr-chip--5k';
    if (value >= 1000)    return 'tr-chip--1k';
    if (value >= 500)     return 'tr-chip--500';
    if (value >= 100)     return 'tr-chip--100';
    if (value >= 25)      return 'tr-chip--25';
    return 'tr-chip--5';
  }

  // ---------------------------------------------------------------------
  // Render: balance / total bet
  // ---------------------------------------------------------------------

  function totalBet() {
    let t = 0;
    for (const k in state.bets) t += state.bets[k].reduce((s, c) => s + c.value, 0);
    return t;
  }

  function renderBalance() {
    const balEl = document.getElementById('balanceAmt');
    const betEl = document.getElementById('totalBetAmt');
    if (balEl) { balEl.textContent = fmt(state.balance); flash(balEl); }
    if (betEl) {
      const t = totalBet();
      betEl.textContent = t > 0 ? fmt(t) : '—';
      if (t > 0) flash(betEl);
    }
  }

  // ---------------------------------------------------------------------
  // Chip selection (click-to-bet mode)
  // ---------------------------------------------------------------------

  function selectChip(value) {
    state.selectedChipValue = value;
    $$('[data-chip], [data-chip-value]').forEach(function (btn) {
      const raw = btn.getAttribute('data-chip') || btn.getAttribute('data-chip-value');
      btn.classList.toggle('is-photo-selected', parseInt(raw, 10) === value);
    });
    document.body.classList.add('has-selected-chip');
  }

  function clearSelectedChip() {
    state.selectedChipValue = 0;
    $$('[data-chip], [data-chip-value]').forEach(function (btn) {
      btn.classList.remove('is-photo-selected');
    });
    document.body.classList.remove('has-selected-chip');
  }

  // ---------------------------------------------------------------------
  // Render: bet zones
  // ---------------------------------------------------------------------

  function renderZone(zoneKey) {
    const zoneEl = $('.tr-photo-zone[data-bet="' + zoneKey + '"]');
    if (!zoneEl) return;
    const stack = $('.tr-zone-stack', zoneEl);
    const amount = $('[data-zone-amount]', zoneEl);
    const chips = state.bets[zoneKey] || [];

    stack.innerHTML = '';
    let total = 0;
    chips.forEach((chip, i) => {
      total += chip.value;
      const dot = document.createElement('div');
      dot.className = 'tr-zone-chip ' + chip.cls;
      // Keep the pile compact around the zone's visual anchor so chips stay
      // inside the printed baccarat bet area instead of drifting below it.
      const row = Math.floor(i / 3);
      const col = i % 3;
      const offsetX = (col - 1) * 4;
      const offsetY = -row * 4;
      dot.style.transform =
        'translate(calc(-50% + ' + offsetX + 'px), calc(-50% + ' + offsetY + 'px))';
      dot.textContent = chip.label;
      stack.appendChild(dot);
    });
    amount.textContent = total > 0 ? fmt(total) : '';
  }

  function renderAllZones() {
    $$('.tr-photo-zone').forEach((z) => renderZone(z.getAttribute('data-bet')));
  }

  function createBetZones() {
    const overlay = document.getElementById('trPhotoOverlay');
    if (!overlay || $('.tr-photo-zone', overlay)) return;

    BET_ZONES.forEach(function (zone) {
      const el = document.createElement('div');
      el.className = 'tr-photo-zone';
      el.setAttribute('data-bet', zone.key);
      el.style.left = zone.left + '%';
      el.style.top = zone.top + '%';
      el.style.width = zone.width + '%';
      el.style.height = zone.height + '%';
      el.style.setProperty('--chip-x', (zone.chipX || 50) + '%');
      el.style.setProperty('--chip-y', (zone.chipY || 50) + '%');
      el.innerHTML =
        '<span class="tr-zone-tag">' + zone.label + '</span>' +
        '<div class="tr-zone-stack"></div>' +
        '<span class="tr-zone-amount" data-zone-amount></span>';
      overlay.appendChild(el);
    });
  }

  function placeBet(zoneKey, value) {
    if (state.phase === 'dealing') return; // betting closed once dealing starts
    if (state.balance < value) {
      hint('Không đủ số dư');
      return;
    }
    state.balance -= value;
    if (!state.bets[zoneKey]) state.bets[zoneKey] = [];
    state.bets[zoneKey].push({ value, label: chipShortLabel(value), cls: chipClassFor(value) });
    renderZone(zoneKey);
    renderBalance();
  }

  function refundAllBets() {
    for (const k in state.bets) {
      state.bets[k].forEach((c) => { state.balance += c.value; });
    }
    state.bets = Object.create(null);
    renderAllZones();
    renderBalance();
  }

  // ---------------------------------------------------------------------
  // Render: hands (cards)
  // ---------------------------------------------------------------------

  function randomCard() {
    return {
      rank: RANKS[Math.floor(Math.random() * RANKS.length)],
      suit: SUITS[Math.floor(Math.random() * SUITS.length)].key,
      faceUp: false
    };
  }

  function suitMeta(key) {
    const meta = {
      S: { sym: '&spades;', red: false, key: 'S' },
      H: { sym: '&hearts;', red: true, key: 'H' },
      D: { sym: '&diams;', red: true, key: 'D' },
      C: { sym: '&clubs;', red: false, key: 'C' }
    };
    return meta[key] || meta.S;
  }

  function cardFaceHtml(card) {
    const meta = suitMeta(card.suit);
    const isRoyal = card.rank === 'J' || card.rank === 'Q' || card.rank === 'K';
    const center = isRoyal
      ? '<span class="tr-card-royal tr-card-royal--' + card.rank.toLowerCase() + '">' +
          '<i class="tr-card-royal__crown"></i>' +
          '<i class="tr-card-royal__head"></i>' +
          '<i class="tr-card-royal__robe"></i>' +
          '<i class="tr-card-royal__sash"></i>' +
          '<b>' + card.rank + '</b>' +
        '</span>'
      : '<span class="tr-card-pip">' + meta.sym + '</span>';
    return (
      '<span class="tr-card-corner tr-card-corner--tl">' +
        '<strong>' + card.rank + '</strong><em>' + meta.sym + '</em>' +
      '</span>' +
      center +
      '<span class="tr-card-corner tr-card-corner--br">' +
        '<strong>' + card.rank + '</strong><em>' + meta.sym + '</em>' +
      '</span>'
    );
  }

  function allCardsFaceUp() {
    const cards = state.hands.player.concat(state.hands.banker);
    return cards.length > 0 && cards.every((card) => card.faceUp);
  }

  function settleIfPlayerRevealComplete() {
    if (currentMode() === 'player' && state.phase === 'dealing' && allCardsFaceUp()) {
      settle();
    }
  }

  function renderHand(handKey, animateLast) {
    const handEl = $('.tr-photo-hand[data-hand="' + handKey + '"]');
    if (!handEl) return;
    const wrap = $('.tr-hand-cards', handEl);
    const cards = state.hands[handKey];

    wrap.innerHTML = '';
    cards.forEach((card, idx) => {
      const el = document.createElement('div');
      el.className = 'tr-photo-card';
      el.dataset.handKey = handKey;
      el.dataset.cardIndex = String(idx);

      if (card.faceUp) {
        const meta = suitMeta(card.suit);
        if (meta.red) el.classList.add('is-red');
        el.innerHTML = cardFaceHtml(card);
      } else {
        el.classList.add('is-face-down');
        el.title = 'Bấm để nặn bài';
      }
      if (animateLast && idx === cards.length - 1) {
        el.classList.add('is-dealing');
      }
      wrap.appendChild(el);
    });

    // Render score badge if any cards face up and scores resolved
    let badge = $('.tr-hand-score', handEl);
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'tr-hand-score';
      handEl.appendChild(badge);
    }
    badge.textContent = state.phase === 'settled'
      ? String(handTotal(cards))
      : '';
  }

  function dealCard(from, to, speed, options) {
    const handKey = to || from;
    const opts = options || {};
    if (state.hands[handKey].length >= 3) return Promise.resolve();  // baccarat max 3 cards/hand
    if (state.phase === 'settled') resetForNextRound();
    if (state.phase === 'betting') state.phase = 'dealing';
    state.hands[handKey].push(randomCard());
    renderHand(handKey, /*animateLast=*/true);
    return delay(speed || 420).then(function () {
      const handEl = $('.tr-photo-hand[data-hand="' + handKey + '"]');
      const last = handEl ? $('.tr-photo-card:last-child', handEl) : null;
      if (last && !opts.quiet) shake(last);
    });
  }

  function clearAllCards() {
    state.hands.player = [];
    state.hands.banker = [];
    state.autoDealing = false;
    renderHand('player', false);
    renderHand('banker', false);
    if (state.phase !== 'betting') state.phase = 'betting';
    closeResultBanner();
  }

  // ---------------------------------------------------------------------
  // Baccarat rules
  // ---------------------------------------------------------------------

  function handTotal(cards) {
    return cards.reduce((s, c) => s + cardValue(c.rank), 0) % 10;
  }

  function playerNeedsThirdCard() {
    return handTotal(state.hands.player) <= 5;
  }

  function bankerNeedsThirdCard(playerThirdCard) {
    const bankerTotal = handTotal(state.hands.banker);
    if (!playerThirdCard) return bankerTotal <= 5;
    const p3 = cardValue(playerThirdCard.rank);
    if (bankerTotal <= 2) return true;
    if (bankerTotal === 3) return p3 !== 8;
    if (bankerTotal === 4) return p3 >= 2 && p3 <= 7;
    if (bankerTotal === 5) return p3 >= 4 && p3 <= 7;
    if (bankerTotal === 6) return p3 === 6 || p3 === 7;
    return false;
  }

  function expectedDealerHand() {
    const p = state.hands.player;
    const b = state.hands.banker;
    if (p.length === 0 && b.length === 0) return 'player';
    if (p.length === 1 && b.length === 0) return 'banker';
    if (p.length === 1 && b.length === 1) return 'player';
    if (p.length === 2 && b.length === 1) return 'banker';
    if (p.length < 2 || b.length < 2) return null;
    const pTotal = handTotal(p.slice(0, 2));
    const bTotal = handTotal(b.slice(0, 2));
    if (pTotal >= 8 || bTotal >= 8) return null;
    if (p.length === 2 && playerNeedsThirdCard()) return 'player';
    if (b.length === 2 && bankerNeedsThirdCard(p[2] || null)) return 'banker';
    return null;
  }

  function markReadyToSettle() {
    const expected = expectedDealerHand();
    if (!expected && state.phase === 'dealing') {
      hint('Đủ bài. Dealer có thể mở bài hoặc bấm Settle.');
    }
  }

  function determineWinners() {
    const p = state.hands.player;
    const b = state.hands.banker;
    const ps = handTotal(p);
    const bs = handTotal(b);
    const winners = new Set();

    if (ps > bs) winners.add('player');
    else if (bs > ps) {
      winners.add('banker');
      if (bs === 6) winners.add('lucky6');
    } else winners.add('tie');

    if (p.length >= 2 && p[0].rank === p[1].rank) winners.add('playerPair');
    if (b.length >= 2 && b[0].rank === b[1].rank) winners.add('bankerPair');

    return { winners, ps, bs };
  }

  function settle() {
    if (!state.hands.player.length || !state.hands.banker.length) {
      hint('Chia bài cho cả PLAYER và BANKER trước khi tính ván');
      return;
    }

    // Force-reveal all cards before settling
    state.hands.player.forEach((c) => { c.faceUp = true; });
    state.hands.banker.forEach((c) => { c.faceUp = true; });

    const { winners, ps, bs } = determineWinners();

    let payout = 0;
    let totalStake = 0;
    for (const zone in state.bets) {
      const stake = state.bets[zone].reduce((s, c) => s + c.value, 0);
      totalStake += stake;
      if (winners.has(zone)) {
        // Pay original stake + winnings
        payout += stake + Math.floor(stake * (PAYOUTS[zone] || 0));
      } else if (winners.has('tie') && (zone === 'player' || zone === 'banker')) {
        // Push: refund main bets on tie
        payout += stake;
      }
      // Otherwise: stake is lost
    }

    state.balance += payout;
    state.phase = 'settled';

    // Record the round in history (for roadmap + empirical odds)
    const winnerLetter = winners.has('player') ? 'P'
                       : winners.has('banker') ? 'B' : 'T';
    state.history.push({
      winner: winnerLetter,
      pp: winners.has('playerPair'),
      bp: winners.has('bankerPair'),
      l6: winners.has('lucky6'),
      playerScore: ps,
      bankerScore: bs,
      at: Date.now()
    });
    saveHistory();

    renderHand('player', false);
    renderHand('banker', false);
    renderBalance();
    refreshSettleLabel();
    updateLiveProb();
    renderRoadmapSign();
    showResultBanner(winners, ps, bs, payout, totalStake);
  }

  function resetForNextRound() {
    state.bets = Object.create(null);
    state.hands.player = [];
    state.hands.banker = [];
    state.phase = 'betting';
    state.autoDealing = false;
    renderAllZones();
    renderHand('player', false);
    renderHand('banker', false);
    renderBalance();
    refreshSettleLabel();
    closeResultBanner();
  }

  // ---------------------------------------------------------------------
  // Result banner & toast hint
  // ---------------------------------------------------------------------

  function showResultBanner(winners, ps, bs, payout, totalStake) {
    const overlay = document.getElementById('trPhotoOverlay');
    if (!overlay) return;
    closeResultBanner();
    const banner = document.createElement('div');
    banner.className = 'tr-photo-result';
    banner.id = 'trPhotoResultBanner';

    const winList = Array.from(winners).map(prettyZoneName).join(' · ');
    const net = payout - totalStake;
    const netStr = net > 0 ? '+' + fmt(net) : fmt(net);

    banner.innerHTML =
      '<div>P ' + ps + ' : ' + bs + ' B &nbsp;—&nbsp; ' + winList + '</div>' +
      '<span class="tr-result-payout">Payout ' + fmt(payout) + ' (Net ' + netStr + ')</span>';
    overlay.appendChild(banner);
  }

  function closeResultBanner() {
    const b = document.getElementById('trPhotoResultBanner');
    if (b) b.remove();
  }

  function prettyZoneName(z) {
    return ({ player: 'PLAYER', banker: 'BANKER', tie: 'TIE',
             playerPair: 'P.PAIR', bankerPair: 'B.PAIR',
             lucky6: 'LUCKY 6' })[z] || z;
  }

  let _hintTimer = 0;
  function hint(msg) {
    let el = document.getElementById('trPhotoHint');
    if (!el) {
      el = document.createElement('div');
      el.id = 'trPhotoHint';
      el.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);' +
        'padding:8px 16px;border-radius:8px;background:rgba(8,5,20,0.92);' +
        'border:1px solid rgba(242,212,134,0.55);color:#f2d486;font-weight:700;' +
        'font-size:13px;z-index:10001;pointer-events:none;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(_hintTimer);
    _hintTimer = setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.4s'; }, 1800);
  }

  // ---------------------------------------------------------------------
  // Live odds (right-panel) — empirical from history
  // ---------------------------------------------------------------------

  function updateLiveProb() {
    const host = document.getElementById('tr-live-prob');
    if (!host) return;

    const n = state.history.length;
    if (n === 0) return;  // keep whatever the legacy renderer wrote

    const counts = { P: 0, B: 0, T: 0, pp: 0, bp: 0, l6: 0 };
    state.history.forEach((r) => {
      counts[r.winner]++;
      if (r.pp) counts.pp++;
      if (r.bp) counts.bp++;
      if (r.l6) counts.l6++;
    });

    const pct = (k) => (counts[k] / n * 100).toFixed(2) + '%';
    const cells = [
      ['PLAYER',   pct('P')],
      ['BANKER',   pct('B')],
      ['TIE',      pct('T')],
      ['P PAIR',   pct('pp')],
      ['B PAIR',   pct('bp')],
      ['LUCKY 6',  pct('l6')]
    ];

    host.innerHTML = cells.map(([label, value]) =>
      '<div class="tr-prob-cell"><span class="tr-prob-label">' + label + '</span>' +
      '<strong class="tr-prob-value">' + value + '</strong></div>'
    ).join('');
    host.setAttribute('data-empirical', String(n));
  }

  // ---------------------------------------------------------------------
  // Roadmap modal (history overview)
  // ---------------------------------------------------------------------

  function readLimit(id, fallback) {
    const inp = document.getElementById(id);
    const v = inp ? Number(inp.value) : NaN;
    return Number.isFinite(v) && v > 0 ? '$' + fmt(v) : fallback;
  }

  function openRoadmap() {
    const modal = document.getElementById('trRoadmapModal');
    if (!modal) return;
    // Reflect the current bet limits (from the right panel inputs)
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setText('rmMin',   readLimit('trLimitMin', '$1,000'));
    setText('rmMax',   readLimit('trLimitMax', '$500,000'));
    setText('rmTie',   '0 - ' + readLimit('trLimitTie', '$100,000'));
    setText('rmPair',  '0 - ' + readLimit('trLimitPair', '$100,000'));
    setText('rmLucky', '0 - ' + readLimit('trLimitPair', '$100,000'));
    renderRoadmap();
    modal.hidden = false;
  }

  function closeRoadmap() {
    const modal = document.getElementById('trRoadmapModal');
    if (modal) modal.hidden = true;
  }

  function renderRoadmap() {
    renderBead();
    renderBigRoad();
    renderStats();
  }

  function renderBead() {
    const host = document.getElementById('rmBead');
    if (!host) return;
    const ROWS = 6, COLS = 16, MAX = ROWS * COLS;
    const slice = state.history.slice(-MAX);
    host.innerHTML = '';
    for (let i = 0; i < MAX; i++) {
      const r = slice[i];
      const cell = document.createElement('div');
      if (!r) {
        cell.className = 'tr-bead-cell tr-bead-cell--empty';
      } else {
        cell.className = 'tr-bead-cell tr-bead-cell--' + r.winner;
        cell.textContent = r.winner;
        if (r.pp) cell.classList.add('is-pair-p');
        if (r.bp) cell.classList.add('is-pair-b');
      }
      host.appendChild(cell);
    }
  }

  function renderBigRoad() {
    const host = document.getElementById('rmBig');
    if (!host) return;
    const ROWS = 6;
    // Build columns from history, ignoring ties (ties hang on the previous cell)
    const cols = [];
    let lastWinner = null;
    state.history.forEach((r) => {
      if (r.winner === 'T') {
        if (cols.length) {
          const col = cols[cols.length - 1];
          const lastCell = col[col.length - 1];
          if (lastCell) lastCell.tieCount = (lastCell.tieCount || 0) + 1;
        } else {
          cols.push([{ winner: 'T', tieCount: 1, pp: r.pp, bp: r.bp }]);
        }
        return;
      }
      if (r.winner !== lastWinner || (cols.length && cols[cols.length - 1].length >= ROWS)) {
        cols.push([{ winner: r.winner, pp: r.pp, bp: r.bp }]);
        lastWinner = r.winner;
      } else {
        cols[cols.length - 1].push({ winner: r.winner, pp: r.pp, bp: r.bp });
      }
    });

    host.innerHTML = '';
    // Render at least 12 columns so empty grid still shows
    const totalCols = Math.max(12, cols.length);
    for (let c = 0; c < totalCols; c++) {
      const col = cols[c] || [];
      for (let row = 0; row < ROWS; row++) {
        const cellData = col[row];
        const cell = document.createElement('div');
        if (!cellData) {
          cell.className = 'tr-big-cell tr-big-cell--empty';
        } else {
          cell.className = 'tr-big-cell tr-big-cell--' + cellData.winner;
          if (cellData.tieCount) cell.classList.add('has-tie');
          if (cellData.pp) cell.classList.add('is-pair-p');
          if (cellData.bp) cell.classList.add('is-pair-b');
        }
        host.appendChild(cell);
      }
    }
  }

  function renderStats() {
    const host = document.getElementById('rmStats');
    if (!host) return;
    const n = state.history.length;
    if (n === 0) {
      host.className = 'tr-roadmap-stats tr-roadmap-stats--empty';
      host.innerHTML = 'Chưa có ván nào — settle ván đầu tiên để xem dữ liệu.';
      return;
    }
    host.className = 'tr-roadmap-stats';
    const c = { P: 0, B: 0, T: 0, pp: 0, bp: 0, l6: 0 };
    state.history.forEach((r) => {
      c[r.winner]++;
      if (r.pp) c.pp++;
      if (r.bp) c.bp++;
      if (r.l6) c.l6++;
    });
    const pct = (k) => (c[k] / n * 100).toFixed(1) + '%';
    const items = [
      ['Player',  c.P,  pct('P')],
      ['Banker',  c.B,  pct('B')],
      ['Tie',     c.T,  pct('T')],
      ['P Pair',  c.pp, pct('pp')],
      ['B Pair',  c.bp, pct('bp')],
      ['Lucky 6', c.l6, pct('l6')]
    ];
    host.innerHTML = items.map(([label, count, pct]) =>
      '<div><span>' + label + '</span><strong>' + count + '</strong><small>' + pct + '</small></div>'
    ).join('') +
      '<div style="grid-column: 1 / -1;"><span>Tổng số ván</span><strong>' + n + '</strong></div>';
  }

  function loadHistory() {
    try {
      const raw = window.localStorage && window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      state.history = parsed.filter((r) => r && ['P', 'B', 'T'].includes(r.winner)).map((r) => ({
        winner: r.winner,
        pp: !!r.pp,
        bp: !!r.bp,
        l6: !!r.l6,
        playerScore: Number.isFinite(Number(r.playerScore)) ? Number(r.playerScore) : null,
        bankerScore: Number.isFinite(Number(r.bankerScore)) ? Number(r.bankerScore) : null,
        at: Number(r.at) || 0
      }));
    } catch (_) {
      state.history = [];
    }
  }

  function saveHistory() {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(state.history.slice(-500)));
      }
    } catch (_) {}
  }

  function renderRoadmap() {
    renderBead();
    renderBigRoad();
    renderDerivedRoads();
    renderStats();
    renderPrediction();
  }

  function renderRoadmapSign() {
    const host = document.getElementById('trPhotoSignBoard');
    if (!host) return;
    const ROWS = 5, COLS = 9, MAX = ROWS * COLS;
    const slice = state.history.slice(-MAX);
    host.innerHTML = '';
    for (let i = 0; i < MAX; i++) {
      const r = slice[i];
      const cell = document.createElement('i');
      cell.className = 'tr-photo-sign-dot' + (r ? ' tr-photo-sign-dot--' + r.winner : '');
      if (r) cell.textContent = r.winner;
      host.appendChild(cell);
    }
  }

  function renderBead() {
    const host = document.getElementById('rmBead');
    if (!host) return;
    const ROWS = 6, COLS = 44, MAX = ROWS * COLS;
    const slice = state.history.slice(-MAX);
    host.innerHTML = '';
    for (let i = 0; i < MAX; i++) {
      const r = slice[i];
      const cell = document.createElement('div');
      if (!r) {
        cell.className = 'tr-bead-cell tr-bead-cell--empty';
      } else {
        cell.className = 'tr-bead-cell tr-bead-cell--' + r.winner;
        cell.textContent = r.winner;
        if (r.pp) cell.classList.add('is-pair-p');
        if (r.bp) cell.classList.add('is-pair-b');
      }
      host.appendChild(cell);
    }
  }

  function buildBigRoadData() {
    const ROWS = 6;
    const cols = [];
    let lastWinner = null;
    state.history.forEach((r) => {
      if (r.winner === 'T') {
        if (cols.length) {
          const col = cols[cols.length - 1];
          const lastCell = col[col.length - 1];
          if (lastCell) lastCell.tieCount = (lastCell.tieCount || 0) + 1;
        } else {
          cols.push([{ winner: 'T', tieCount: 1, pp: r.pp, bp: r.bp }]);
        }
        return;
      }
      if (r.winner !== lastWinner || (cols.length && cols[cols.length - 1].length >= ROWS)) {
        cols.push([{ winner: r.winner, pp: r.pp, bp: r.bp }]);
        lastWinner = r.winner;
      } else {
        cols[cols.length - 1].push({ winner: r.winner, pp: r.pp, bp: r.bp });
      }
    });
    return cols;
  }

  function renderBigRoad() {
    const host = document.getElementById('rmBig');
    if (!host) return;
    const ROWS = 6;
    const cols = buildBigRoadData();
    host.innerHTML = '';
    const totalCols = Math.max(24, cols.length);
    for (let c = 0; c < totalCols; c++) {
      const col = cols[c] || [];
      for (let row = 0; row < ROWS; row++) {
        const cellData = col[row];
        const cell = document.createElement('div');
        if (!cellData) {
          cell.className = 'tr-big-cell tr-big-cell--empty';
        } else {
          cell.className = 'tr-big-cell tr-big-cell--' + cellData.winner;
          if (cellData.tieCount) cell.classList.add('has-tie');
          if (cellData.pp) cell.classList.add('is-pair-p');
          if (cellData.bp) cell.classList.add('is-pair-b');
        }
        host.appendChild(cell);
      }
    }
  }

  function derivedSequence(offset) {
    const base = buildBigRoadData();
    const seq = [];
    for (let c = offset + 1; c < base.length; c++) {
      const col = base[c] || [];
      for (let r = 0; r < col.length; r++) {
        const prev = base[c - offset] || [];
        const ref = base[c - offset - 1] || [];
        const red = r === 0 ? prev.length === ref.length : !!prev[r];
        seq.push(red ? 'R' : 'B');
      }
    }
    return seq;
  }

  function renderDerivedGrid(parent, title, seq, type) {
    const wrap = document.createElement('div');
    wrap.className = 'tr-derived-road tr-derived-road--' + type;
    wrap.innerHTML = '<span>' + title + '</span><div></div>';
    const grid = wrap.querySelector('div');
    const ROWS = 6, COLS = 44, MAX = ROWS * COLS;
    const slice = seq.slice(-MAX);
    for (let i = 0; i < MAX; i++) {
      const v = slice[i];
      const cell = document.createElement('i');
      cell.className = 'tr-derived-cell' + (v ? ' tr-derived-cell--' + v : '');
      grid.appendChild(cell);
    }
    parent.appendChild(wrap);
  }

  function renderDerivedRoads() {
    const host = document.getElementById('rmDerived');
    if (!host) return;
    host.innerHTML = '';
    renderDerivedGrid(host, 'Big Eye Road', derivedSequence(1), 'eye');
    renderDerivedGrid(host, 'Small Road', derivedSequence(2), 'small');
    renderDerivedGrid(host, 'Cockroach Road', derivedSequence(3), 'cockroach');
  }

  function renderStats() {
    const host = document.getElementById('rmStats');
    if (!host) return;
    const n = state.history.length;
    if (n === 0) {
      host.className = 'tr-roadmap-stats tr-roadmap-stats--empty';
      host.innerHTML = 'Chưa có ván nào.';
      return;
    }
    host.className = 'tr-roadmap-stats';
    const c = { P: 0, B: 0, T: 0, pp: 0, bp: 0, l6: 0 };
    state.history.forEach((r) => {
      c[r.winner]++;
      if (r.pp) c.pp++;
      if (r.bp) c.bp++;
      if (r.l6) c.l6++;
    });
    const pct = (k) => (c[k] / n * 100).toFixed(1) + '%';
    const items = [
      ['Table', 'VIP BACCARAT 1', ''],
      ['Shoe', '3', ''],
      ['Game', n, ''],
      ['Banker', c.B, pct('B')],
      ['Player', c.P, pct('P')],
      ['Tie', c.T, pct('T')],
      ['B.Pair', c.bp, pct('bp')],
      ['P.Pair', c.pp, pct('pp')],
      ['Lucky 6', c.l6, pct('l6')],
      ['Tổng số ván', n, '']
    ];
    host.innerHTML = items.map(([label, count, pctText]) =>
      '<div><span>' + label + '</span><strong>' + count + '</strong><small>' + pctText + '</small></div>'
    ).join('');
  }

  function renderPrediction() {
    const host = document.getElementById('rmPredict');
    if (!host) return;
    const n = state.history.length || 1;
    const p = state.history.filter((r) => r.winner === 'P').length;
    const b = state.history.filter((r) => r.winner === 'B').length;
    const pPct = Math.round(p / n * 100);
    const bPct = Math.round(b / n * 100);
    host.innerHTML =
      '<div class="tr-road-legend"><b class="is-b">B</b><b class="is-p">P</b><b class="is-t">T</b></div>' +
      '<span>NEXT GAME PREDICTION</span>' +
      '<div class="tr-road-predict-row"><strong class="is-b">B</strong><strong class="is-p">P</strong></div>' +
      '<div class="tr-road-predict-row"><small>' + bPct + '%</small><small>' + pPct + '%</small></div>';
  }

  // ---------------------------------------------------------------------
  // Drag engine (chip from tray, card from shoe)
  // ---------------------------------------------------------------------

  function makeChipGhost(value) {
    const ghost = document.createElement('div');
    ghost.className = 'tr-photo-ghost tr-photo-ghost--chip ' + chipClassFor(value);
    ghost.textContent = chipShortLabel(value);
    return ghost;
  }

  function makeCardGhost() {
    const ghost = document.createElement('div');
    ghost.className = 'tr-photo-ghost tr-photo-ghost--card';
    return ghost;
  }

  function positionGhost(ghost, x, y) {
    ghost.style.left = x + 'px';
    ghost.style.top  = y + 'px';
  }

  function startDrag(opts) {
    if (state.drag) return;

    const ghost = opts.makeGhost();
    document.body.appendChild(ghost);
    positionGhost(ghost, opts.startX, opts.startY);
    document.body.classList.add(opts.dragBodyClass);
    let lastTarget = null;

    function onMove(e) {
      positionGhost(ghost, e.clientX, e.clientY);
      ghost.style.display = 'none';
      const under = document.elementFromPoint(e.clientX, e.clientY);
      ghost.style.display = '';
      const target = under ? under.closest(opts.targetSelector) : null;
      if (target !== lastTarget) {
        if (lastTarget) lastTarget.classList.remove('is-drag-over');
        if (target) target.classList.add('is-drag-over');
        lastTarget = target;
      }
    }

    function onUp(e) {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('mouseup', onUp, true);

      ghost.style.display = 'none';
      const under = document.elementFromPoint(e.clientX, e.clientY);
      ghost.style.display = '';
      const target = under ? under.closest(opts.targetSelector) : null;
      document.body.classList.remove(opts.dragBodyClass);

      if (lastTarget) lastTarget.classList.remove('is-drag-over');
      ghost.remove();
      state.drag = null;

      if (target) opts.onDrop(target);
    }

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', onUp, true);
    state.drag = { ghost };
  }

  // ---------------------------------------------------------------------
  // Squeeze modal (click face-down card → drag-from-bottom-up to reveal)
  // ---------------------------------------------------------------------

  function openSqueeze(handKey, idx) {
    const card = state.hands[handKey][idx];
    if (!card || card.faceUp) return;

    const modal = document.getElementById('trSqueezeModal');
    const cardEl = document.getElementById('trSqueezeCard');
    const faceEl = document.getElementById('trSqueezeFace');
    if (!modal || !cardEl || !faceEl) return;

    const meta = suitMeta(card.suit);
    cardEl.classList.toggle('is-red', meta.red);
    faceEl.innerHTML = cardFaceHtml(card);
    cardEl.style.setProperty('--reveal', '0');
    faceEl.style.clipPath = '';
    cardEl.classList.remove('is-squeezing', 'is-squeeze-complete');

    state.squeeze = { handKey, idx, reveal: 0, dragging: false, startY: 0 };
    modal.hidden = false;

    function onDown(e) {
      if (e.touches === undefined && e.button !== 0 && e.button !== 2) return;
      e.preventDefault();
      e.stopPropagation();
      state.squeeze.dragging = true;
      state.squeeze.startY = (e.touches ? e.touches[0].clientY : e.clientY);
    }

    function onMove(e) {
      if (!state.squeeze || !state.squeeze.dragging) return;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const dy = state.squeeze.startY - y;
      const r = Math.max(state.squeeze.reveal, Math.max(0, Math.min(1, dy / 260)));
      state.squeeze.reveal = r;
      cardEl.style.setProperty('--reveal', String(r));
      cardEl.style.transform = 'translateY(' + (-r * 60) + 'px)';
    }

    function onUp() {
      if (!state.squeeze) return;
      state.squeeze.dragging = false;
      // If revealed past threshold, flip card permanently and close
      if (state.squeeze.reveal >= 0.85) {
        const { handKey: hk, idx: ix } = state.squeeze;
        if (state.hands[hk] && state.hands[hk][ix]) {
          state.hands[hk][ix].faceUp = true;
          renderHand(hk, false);
        }
        cardEl.style.setProperty('--reveal', '1');
        cardEl.classList.remove('is-squeezing');
        cardEl.classList.add('is-squeeze-complete');
        setTimeout(function () {
          closeSqueeze();
          settleIfPlayerRevealComplete();
        }, 450);
      }
    }

    cardEl.addEventListener('mousedown', onDown);
    cardEl.addEventListener('touchstart', onDown, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);

    // Stash listeners so closeSqueeze can detach them
    state.squeeze.cleanup = () => {
      cardEl.removeEventListener('mousedown', onDown);
      cardEl.removeEventListener('touchstart', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    };
  }

  function closeSqueeze() {
    const modal = document.getElementById('trSqueezeModal');
    const cardEl = document.getElementById('trSqueezeCard');
    if (state.squeeze && state.squeeze.cleanup) state.squeeze.cleanup();
    if (cardEl) {
      cardEl.style.setProperty('--reveal', '0');
      cardEl.style.transform = '';
      cardEl.classList.remove('is-squeezing', 'is-squeeze-complete');
      const faceEl = document.getElementById('trSqueezeFace');
      if (faceEl) faceEl.style.clipPath = '';
    }
    if (modal) modal.hidden = true;
    state.squeeze = null;
  }

  function flipCard(cardElement) {
    if (!cardElement || !cardElement.classList.contains('is-face-down')) return Promise.resolve();
    const handKey = cardElement.dataset.handKey;
    const idx = parseInt(cardElement.dataset.cardIndex, 10);
    const card = state.hands[handKey] && state.hands[handKey][idx];
    if (!card || card.faceUp) return Promise.resolve();
    cardElement.classList.add('is-flipping');
    return delay(620).then(function () {
      card.faceUp = true;
      renderHand(handKey, false);
    });
  }

  function squeezeCard(cardElement) {
    if (!cardElement || !cardElement.classList.contains('is-face-down')) return;
    openSqueeze(cardElement.dataset.handKey, parseInt(cardElement.dataset.cardIndex, 10));
  }

  async function autoDealRound() {
    if (state.autoDealing) return;
    if (state.phase === 'settled') resetForNextRound();
    clearAllCards();
    state.phase = 'dealing';
    state.autoDealing = true;
    refreshSettleLabel();

    await dealCard('shoe', 'player', 460, { quiet: true });
    await dealCard('shoe', 'banker', 460, { quiet: true });
    await dealCard('shoe', 'player', 460, { quiet: true });
    await dealCard('shoe', 'banker', 520, { quiet: true });

    const pInitial = handTotal(state.hands.player);
    const bInitial = handTotal(state.hands.banker);
    if (pInitial < 8 && bInitial < 8) {
      if (playerNeedsThirdCard()) {
        await dealCard('shoe', 'player', 520, { quiet: true });
      }
      if (bankerNeedsThirdCard(state.hands.player[2] || null)) {
        await dealCard('shoe', 'banker', 520, { quiet: true });
      }
    }

    state.autoDealing = false;
    hint('Đã chia bài. Bấm từng lá để mở lớn và kéo lộ bài.');
    refreshSettleLabel();
  }

  // ---------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------

  function wireChipTray() {
    const tray = document.getElementById('tr-chip-tray');
    if (!tray) return;

    // DRAG: chip → zone (drag-and-drop)
    tray.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      const chipBtn = e.target.closest('[data-chip], [data-chip-value]');
      if (!chipBtn) return;
      const raw = chipBtn.getAttribute('data-chip') || chipBtn.getAttribute('data-chip-value');
      const value = parseInt(raw, 10);
      if (!value) return;

      let dragged = false;
      function onFirstMove() { dragged = true; }
      document.addEventListener('mousemove', onFirstMove, { once: true, capture: true });

      e.preventDefault();
      e.stopPropagation();

      startDrag({
        makeGhost: () => makeChipGhost(value),
        targetSelector: '.tr-photo-zone',
        dragBodyClass: 'is-photo-drag',
        startX: e.clientX, startY: e.clientY,
        onDrop: (zoneEl) => {
          placeBet(zoneEl.getAttribute('data-bet'), value);
          clearSelectedChip();
        }
      });
    }, true);

    // CLICK: select chip for click-to-bet mode
    tray.addEventListener('click', function (e) {
      const chipBtn = e.target.closest('[data-chip], [data-chip-value]');
      if (!chipBtn) return;
      const raw = chipBtn.getAttribute('data-chip') || chipBtn.getAttribute('data-chip-value');
      const value = parseInt(raw, 10);
      if (!value) return;
      if (state.selectedChipValue === value) {
        clearSelectedChip();
      } else {
        selectChip(value);
      }
    });
  }

  function wireShoe() {
    const shoe = document.getElementById('trPhotoShoe');
    if (!shoe) return;
    shoe.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      if (currentMode() !== 'dealer') {
        hint('Player Mode tự chia bài bằng nút Deal.');
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      startDrag({
        makeGhost: makeCardGhost,
        targetSelector: '.tr-photo-hand',
        dragBodyClass: 'is-photo-drag-card',
        startX: e.clientX, startY: e.clientY,
        onDrop: (handEl) => {
          const targetHand = handEl.getAttribute('data-hand');
          const expected = expectedDealerHand();
          if (!expected || targetHand !== expected) {
            hint('Sai vị trí chia bài');
            shake(shoe);
            shake(handEl);
            return;
          }
          dealCard('shoe', targetHand, 420).then(markReadyToSettle);
        }
      });
    }, true);
  }

  function wireToolbar() {
    const settleBtn  = document.getElementById('trPhotoSettle');
    const clearBets  = document.getElementById('trPhotoClearBets');
    const clearCards = document.getElementById('trPhotoClearCards');
    if (settleBtn) {
      settleBtn.addEventListener('click', () => {
        settleBtn.blur();
        if (currentMode() === 'player') {
          autoDealRound();
          return;
        }
        if (state.phase === 'settled') resetForNextRound();
        else settle();
        refreshSettleLabel();
      });
    }
    if (clearBets)  clearBets.addEventListener('click', refundAllBets);
    if (clearCards) clearCards.addEventListener('click', clearAllCards);
  }

  function refreshSettleLabel() {
    const btn = document.getElementById('trPhotoSettle');
    if (!btn) return;
    if (currentMode() === 'player') {
      btn.textContent = state.autoDealing
        ? 'Dealing...'
        : (state.phase === 'dealing' ? 'Reveal Cards' : 'Deal');
      btn.disabled = state.autoDealing || state.phase === 'dealing';
      return;
    }
    btn.disabled = false;
    btn.textContent = state.phase === 'settled' ? 'New Round' : 'Settle';
  }

  function wireZoneClicks() {
    // Click-to-bet: if a chip is selected, clicking a zone places it
    $$('.tr-photo-zone').forEach(function (zoneEl) {
      zoneEl.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!state.selectedChipValue) return;
        if (state.phase === 'dealing') { hint('Đã đóng cược'); return; }
        placeBet(zoneEl.getAttribute('data-bet'), state.selectedChipValue);
        // Keep chip selected so player can quickly multi-bet
      });
    });
    // Click outside zones + tray → deselect chip
    document.addEventListener('click', function (e) {
      if (!state.selectedChipValue) return;
      if (e.target.closest('.tr-photo-zone') || e.target.closest('#tr-chip-tray')) return;
      clearSelectedChip();
    });
  }

  function wireCardClicks() {
    document.addEventListener('contextmenu', function (e) {
      if (e.target.closest('.tr-photo-card.is-face-down') || e.target.closest('#trSqueezeCard')) {
        e.preventDefault();
      }
    });

    document.addEventListener('mousedown', function (e) {
      const cardEl = e.target.closest('.tr-photo-card.is-face-down');
      if (!cardEl || e.button !== 2) return;
      e.preventDefault();
      squeezeCard(cardEl);
    });

    document.addEventListener('click', function (e) {
      const cardEl = e.target.closest('.tr-photo-card.is-face-down');
      if (!cardEl) return;
      squeezeCard(cardEl);
    });
  }

  function wireSqueezeClose() {
    const close = document.getElementById('trSqueezeClose');
    const modal = document.getElementById('trSqueezeModal');
    if (close) close.addEventListener('click', closeSqueeze);
    if (modal) modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSqueeze();
    });
  }

  function wireRoadmap() {
    const sign = document.getElementById('trPhotoSignBtn');
    const close = document.getElementById('trRoadmapClose');
    const modal = document.getElementById('trRoadmapModal');
    if (sign)  sign.addEventListener('click', openRoadmap);
    if (close) close.addEventListener('click', closeRoadmap);
    if (modal) modal.addEventListener('click', (e) => {
      if (e.target === modal) closeRoadmap();
    });
    // ESC closes whichever modal is open
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeRoadmap();
        closeSqueeze();
      }
    });
  }

  function wireTableChat() {
    const form = document.getElementById('trTableChatForm');
    const input = document.getElementById('trTableChatInput');
    const messages = document.getElementById('trTableChatMessages');
    if (!form || !input || !messages) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      const msg = document.createElement('div');
      msg.className = 'tr-chat-message tr-chat-message--me';
      msg.textContent = text;
      messages.appendChild(msg);
      input.value = '';
      messages.scrollTop = messages.scrollHeight;
    });
  }

  function wireModeControls() {
    $$('.tr-photo-hand').forEach(function (hand) {
      hand.style.pointerEvents = 'auto';
    });

    const roleSelector = document.querySelector('.tr-role-selector');
    if (roleSelector) {
      roleSelector.addEventListener('click', function () {
        setTimeout(refreshSettleLabel, 0);
      });
    }

    const legacyDeal = document.getElementById('btnDeal');
    if (legacyDeal) {
      legacyDeal.addEventListener('click', function (e) {
        if (currentMode() !== 'player') return;
        e.preventDefault();
        e.stopImmediatePropagation();
        autoDealRound();
      }, true);
    }
  }

  function exposeAnimationApi() {
    window.BaccaratPhotoTable = {
      dealCard: dealCard,
      flipCard: flipCard,
      squeezeCard: squeezeCard,
      state: state
    };
  }

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------

  function init() {
    loadHistory();
    createBetZones();
    wireChipTray();
    wireShoe();
    wireToolbar();
    wireZoneClicks();
    wireCardClicks();
    wireSqueezeClose();
    wireRoadmap();
    wireTableChat();
    wireModeControls();
    exposeAnimationApi();
    renderBalance();
    renderAllZones();
    renderRoadmapSign();
    updateLiveProb();
    refreshSettleLabel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

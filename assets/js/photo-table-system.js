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

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------

  const state = {
    bets:    Object.create(null),  // { zoneKey: [{value,label,cls}, ...] }
    hands:   { player: [], banker: [] },  // { rank, suit, faceUp }
    balance: STARTING_BALANCE,
    phase:   'betting',  // 'betting' | 'dealing' | 'settled'
    drag:    null,
    squeeze: null,
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
      // Center the chip on the zone (offsetting by -50% of its own size)
      // and stagger upward as more chips are added so the pile looks 3D.
      const offsetY = -i * 4;
      const offsetX = (i % 2 === 0 ? -1 : 1) * Math.min(i, 4);
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
    return SUITS.find((s) => s.key === key) || SUITS[0];
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
        el.textContent = card.rank + meta.sym;
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

  function dealCard(handKey) {
    if (state.hands[handKey].length >= 3) return;  // baccarat max 3 cards/hand
    if (state.phase === 'settled') resetForNextRound();
    if (state.phase === 'betting') state.phase = 'dealing';
    state.hands[handKey].push(randomCard());
    renderHand(handKey, /*animateLast=*/true);
  }

  function clearAllCards() {
    state.hands.player = [];
    state.hands.banker = [];
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
      l6: winners.has('lucky6')
    });

    renderHand('player', false);
    renderHand('banker', false);
    renderBalance();
    refreshSettleLabel();
    updateLiveProb();
    showResultBanner(winners, ps, bs, payout, totalStake);
  }

  function resetForNextRound() {
    state.bets = Object.create(null);
    state.hands.player = [];
    state.hands.banker = [];
    state.phase = 'betting';
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
      document.body.classList.remove(opts.dragBodyClass);

      ghost.style.display = 'none';
      const under = document.elementFromPoint(e.clientX, e.clientY);
      ghost.style.display = '';
      const target = under ? under.closest(opts.targetSelector) : null;

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
    faceEl.textContent = card.rank + meta.sym;
    cardEl.style.setProperty('--reveal', '0');

    state.squeeze = { handKey, idx, reveal: 0, dragging: false, startY: 0 };
    modal.hidden = false;

    function onDown(e) {
      if (e.button !== 0 && e.touches === undefined) return;
      e.preventDefault();
      state.squeeze.dragging = true;
      state.squeeze.startY = (e.touches ? e.touches[0].clientY : e.clientY);
    }

    function onMove(e) {
      if (!state.squeeze || !state.squeeze.dragging) return;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const dy = state.squeeze.startY - y;
      // Reveal scales over a 260px drag window. Persist max reveal so the
      // player can pull the card up gradually.
      const r = Math.max(state.squeeze.reveal, Math.max(0, Math.min(1, dy / 260)));
      state.squeeze.reveal = r;
      cardEl.style.setProperty('--reveal', String(r));
      // Translate the card upward as the player pulls
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
        setTimeout(closeSqueeze, 450);
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
    }
    if (modal) modal.hidden = true;
    state.squeeze = null;
  }

  // ---------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------

  function wireChipTray() {
    const tray = document.getElementById('tr-chip-tray');
    if (!tray) return;

    tray.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      const chipBtn = e.target.closest('[data-chip], [data-chip-value]');
      if (!chipBtn) return;
      const raw = chipBtn.getAttribute('data-chip') || chipBtn.getAttribute('data-chip-value');
      const value = parseInt(raw, 10);
      if (!value) return;

      e.preventDefault();
      e.stopPropagation();

      startDrag({
        makeGhost: () => makeChipGhost(value),
        targetSelector: '.tr-photo-zone',
        dragBodyClass: 'is-photo-drag',
        startX: e.clientX, startY: e.clientY,
        onDrop: (zoneEl) => placeBet(zoneEl.getAttribute('data-bet'), value)
      });
    }, true);
  }

  function wireShoe() {
    const shoe = document.getElementById('trPhotoShoe');
    if (!shoe) return;
    shoe.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      startDrag({
        makeGhost: makeCardGhost,
        targetSelector: '.tr-photo-hand',
        dragBodyClass: 'is-photo-drag-card',
        startX: e.clientX, startY: e.clientY,
        onDrop: (handEl) => dealCard(handEl.getAttribute('data-hand'))
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
        if (state.phase === 'settled') resetForNextRound();
        else settle();
        settleBtn.textContent = state.phase === 'settled' ? 'New Round' : 'Settle';
      });
    }
    if (clearBets)  clearBets.addEventListener('click', refundAllBets);
    if (clearCards) clearCards.addEventListener('click', clearAllCards);
  }

  function refreshSettleLabel() {
    const btn = document.getElementById('trPhotoSettle');
    if (btn) btn.textContent = state.phase === 'settled' ? 'New Round' : 'Settle';
  }

  function wireCardClicks() {
    // Delegate clicks from hand zones to open squeeze modal on face-down cards
    document.addEventListener('click', function (e) {
      const cardEl = e.target.closest('.tr-photo-card.is-face-down');
      if (!cardEl) return;
      const hk = cardEl.dataset.handKey;
      const ix = parseInt(cardEl.dataset.cardIndex, 10);
      openSqueeze(hk, ix);
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

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------

  function init() {
    wireChipTray();
    wireShoe();
    wireToolbar();
    wireCardClicks();
    wireSqueezeClose();
    wireRoadmap();
    renderBalance();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

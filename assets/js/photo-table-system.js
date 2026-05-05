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
    squeeze: null
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
      const offsetY = -i * 4;
      const offsetX = (i % 2 === 0 ? -1 : 1) * Math.min(i, 4);
      dot.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
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
    renderHand('player', false);
    renderHand('banker', false);
    renderBalance();
    refreshSettleLabel();
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
      // Click outside the card (on the dimmed backdrop) closes the modal
      if (e.target === modal) closeSqueeze();
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
    renderBalance();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

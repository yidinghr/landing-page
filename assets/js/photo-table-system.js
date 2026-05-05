// photo-table-system.js
// Lightweight drag-and-drop overlay for the photo baccarat table.
// Independent of the legacy training engine — handles chip placement and
// manual card dealing on top of /image/baccarat-table.png.

(function () {
  'use strict';

  const SUITS = [
    { sym: '♠', red: false },
    { sym: '♥', red: true },
    { sym: '♦', red: true },
    { sym: '♣', red: false }
  ];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const state = {
    bets: Object.create(null),     // { zoneKey: [{ value, label, cls }, ...] }
    drag: null                     // active drag descriptor
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function fmtMoney(n) { return Number(n || 0).toLocaleString(); }

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

  // -------------------------------------------------------------------------
  // Bet rendering
  // -------------------------------------------------------------------------
  function renderZone(zoneKey) {
    const zoneEl = $('.tr-photo-zone[data-bet="' + zoneKey + '"]');
    if (!zoneEl) return;
    const stack = $('.tr-zone-stack', zoneEl);
    const amount = $('[data-zone-amount]', zoneEl);
    const chips = state.bets[zoneKey] || [];

    stack.innerHTML = '';
    let total = 0;
    chips.forEach(function (chip, i) {
      total += chip.value;
      const dot = document.createElement('div');
      dot.className = 'tr-zone-chip ' + chip.cls;
      // Stagger chips into a small fanned pile
      const offsetY = -i * 4;
      const offsetX = (i % 2 === 0 ? -1 : 1) * Math.min(i, 4);
      dot.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
      dot.textContent = chip.label;
      stack.appendChild(dot);
    });

    amount.textContent = total > 0 ? fmtMoney(total) : '';
  }

  function renderAllZones() {
    $$('.tr-photo-zone').forEach(function (zoneEl) {
      renderZone(zoneEl.getAttribute('data-bet'));
    });
  }

  function placeBet(zoneKey, value) {
    if (!state.bets[zoneKey]) state.bets[zoneKey] = [];
    state.bets[zoneKey].push({
      value: value,
      label: chipShortLabel(value),
      cls: chipClassFor(value)
    });
    renderZone(zoneKey);
  }

  function clearAllBets() {
    state.bets = Object.create(null);
    renderAllZones();
  }

  // -------------------------------------------------------------------------
  // Card rendering
  // -------------------------------------------------------------------------
  function dealRandomCard(handEl) {
    const cardsContainer = $('.tr-hand-cards', handEl);
    if (!cardsContainer) return;
    if (cardsContainer.children.length >= 3) return; // baccarat max 3 cards/hand

    const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];

    const card = document.createElement('div');
    card.className = 'tr-photo-card' + (suit.red ? ' is-red' : '');
    card.textContent = rank + suit.sym;
    cardsContainer.appendChild(card);
  }

  function clearAllCards() {
    $$('.tr-hand-cards').forEach(function (c) { c.innerHTML = ''; });
  }

  // -------------------------------------------------------------------------
  // Drag engine (chip from tray OR card from shoe)
  // -------------------------------------------------------------------------
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

    let lastTarget = null;

    function onMove(e) {
      positionGhost(ghost, e.clientX, e.clientY);
      // Hide ghost briefly so elementFromPoint sees what's underneath
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

      if (lastTarget) lastTarget.classList.remove('is-drag-over');
      ghost.remove();
      state.drag = null;

      if (target) opts.onDrop(target);
    }

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', onUp, true);

    state.drag = { ghost: ghost };
  }

  // -------------------------------------------------------------------------
  // Wiring
  // -------------------------------------------------------------------------
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
        makeGhost: function () { return makeChipGhost(value); },
        targetSelector: '.tr-photo-zone',
        startX: e.clientX,
        startY: e.clientY,
        onDrop: function (zoneEl) {
          const zoneKey = zoneEl.getAttribute('data-bet');
          if (zoneKey) placeBet(zoneKey, value);
        }
      });
    }, true);  // capture so we run before the legacy chip-drag listener
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
        startX: e.clientX,
        startY: e.clientY,
        onDrop: function (handEl) { dealRandomCard(handEl); }
      });
    }, true);
  }

  function wireToolbar() {
    const clearBets = document.getElementById('trPhotoClearBets');
    const clearCards = document.getElementById('trPhotoClearCards');
    if (clearBets) clearBets.addEventListener('click', clearAllBets);
    if (clearCards) clearCards.addEventListener('click', clearAllCards);
  }

  // -------------------------------------------------------------------------
  // Init (wait for DOM + chip tray to be populated by the legacy controller)
  // -------------------------------------------------------------------------
  function init() {
    wireChipTray();
    wireShoe();
    wireToolbar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

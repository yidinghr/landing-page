// drag-engine.js — manages all drag-and-drop interactions for cards and chips
// Owns: mousedown/mousemove/mouseup events, ghost element, drop zone detection
// Does NOT own: game state, baccarat rules, DOM outside drag context
import { DEALING_PHASES } from '../phase-machine.js';

// ---------------------------------------------------------------------------
// Internal drag state (module-level, reset on each drag start)
// ---------------------------------------------------------------------------

const _drag = {
  active:       false,
  type:         null,      // 'card' | 'chip'
  chipValue:    null,      // denomination if type === 'chip'
  ghost:        null,      // HTMLElement following cursor
  dropZones:    [],        // [{ el, zoneKey, rect }] populated on drag start
  hoveredZone:  null,      // current highlighted zone key
  originEl:     null,      // element drag started from (for return animation)
  onDrop:       null,      // callback(zoneKey)
  onCancel:     null       // callback()
};

// ---------------------------------------------------------------------------
// Ghost element helpers
// ---------------------------------------------------------------------------

function createGhost(type, chipValue) {
  // TODO[Phase6]: create and style the ghost element
  // type === 'card': styled as face-down card (dark rectangle with border radius)
  // type === 'chip': styled as circular chip with denomination text
  const ghost = document.createElement('div');
  ghost.className = 'tr-drag-ghost tr-drag-ghost--' + type;
  ghost.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;transition:none;';

  if (type === 'card') {
    ghost.style.cssText += 'width:52px;height:72px;border-radius:6px;background:#1a3a2a;border:2px solid #c8a04a;';
  } else if (type === 'chip') {
    ghost.style.cssText += 'width:40px;height:40px;border-radius:50%;background:#c8a04a;color:#000;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;';
    ghost.textContent = chipValue >= 1000 ? (chipValue / 1000) + 'K' : chipValue;
  }

  document.body.appendChild(ghost);
  return ghost;
}

function positionGhost(ghost, x, y) {
  // TODO[Phase6]: center ghost on cursor
  ghost.style.left = (x - ghost.offsetWidth / 2) + 'px';
  ghost.style.top  = (y - ghost.offsetHeight / 2) + 'px';
}

function removeGhost() {
  if (_drag.ghost && _drag.ghost.parentNode) {
    _drag.ghost.parentNode.removeChild(_drag.ghost);
  }
  _drag.ghost = null;
}

// ---------------------------------------------------------------------------
// Drop zone detection
// ---------------------------------------------------------------------------

function cacheDropZoneRects() {
  // TODO[Phase6]: called on dragstart — cache getBoundingClientRect for all drop zones
  // Caching avoids layout thrash on every mousemove
  _drag.dropZones.forEach(function (zone) {
    zone.rect = zone.el.getBoundingClientRect();
  });
}

function hitTestZones(x, y) {
  // TODO[Phase6]: returns the zoneKey of the first zone that contains (x, y), or null
  for (const zone of _drag.dropZones) {
    const r = zone.rect;
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return zone.zoneKey;
    }
  }
  return null;
}

function highlightZone(zoneKey) {
  // TODO[Phase6]: add highlight class to hovered zone, remove from others
  _drag.dropZones.forEach(function (zone) {
    zone.el.classList.toggle('tr-drop-zone--hovered', zone.zoneKey === zoneKey);
  });
  _drag.hoveredZone = zoneKey;
}

function clearHighlights() {
  _drag.dropZones.forEach(function (zone) {
    zone.el.classList.remove('tr-drop-zone--hovered');
  });
  _drag.hoveredZone = null;
}

function resolveDropZones(dropZoneEls) {
  const zones = typeof dropZoneEls === 'function' ? dropZoneEls() : dropZoneEls;
  return Array.isArray(zones) ? zones.filter(function (item) {
    return item && item.el && item.zoneKey;
  }) : [];
}

// ---------------------------------------------------------------------------
// Mouse event handlers
// ---------------------------------------------------------------------------

function onMouseMove(e) {
  if (!_drag.active) return;
  positionGhost(_drag.ghost, e.clientX, e.clientY);
  const hit = hitTestZones(e.clientX, e.clientY);
  if (hit !== _drag.hoveredZone) highlightZone(hit);
}

function onMouseUp(e) {
  if (!_drag.active) return;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);

  const hit = hitTestZones(e.clientX, e.clientY);
  clearHighlights();
  removeGhost();
  _drag.active = false;

  if (hit && _drag.onDrop) {
    _drag.onDrop(hit);
  } else if (_drag.onCancel) {
    _drag.onCancel();
  }
}

function startDrag(type, chipValue, originEl, dropZoneEls, onDrop, onCancel, startX, startY) {
  // TODO[Phase6]: initialize drag state, create ghost, attach global events
  const zones = resolveDropZones(dropZoneEls);
  _drag.active      = true;
  _drag.type        = type;
  _drag.chipValue   = chipValue;
  _drag.originEl    = originEl;
  _drag.onDrop      = onDrop;
  _drag.onCancel    = onCancel;
  _drag.dropZones   = zones.map(function (item) {
    return { el: item.el, zoneKey: item.zoneKey, rect: null };
  });

  _drag.ghost = createGhost(type, chipValue);
  positionGhost(_drag.ghost, startX, startY);
  cacheDropZoneRects();

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// ---------------------------------------------------------------------------
// Public API: Card Drag (Phase6)
// ---------------------------------------------------------------------------

/**
 * initCardDrag — attaches drag behavior to the card source element.
 *
 * @param {object} options
 * @param {HTMLElement}   options.sourceEl     - The #tr-card-source element
 * @param {HTMLElement[]} options.dropZoneEls  - [{ el, zoneKey }] — banker + player zones
 * @param {Function}      options.getPhase     - () => currentPhase string
 * @param {Function}      options.onCardDrop   - (zoneKey) => void — called on valid drop
 */
export function initCardDrag(options) {
  // TODO[Phase6]: implement
  const { sourceEl, dropZoneEls, getPhase, onCardDrop } = options;

  sourceEl.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;              // left click only
    const phase = getPhase();
    if (!DEALING_PHASES.has(phase)) return;  // only during dealing phases

    e.preventDefault();
    sourceEl.style.cursor = 'grabbing';

    startDrag(
      'card',
      null,
      sourceEl,
      dropZoneEls,
      function (zoneKey) {
        sourceEl.style.cursor = 'grab';
        onCardDrop(zoneKey);
      },
      function () {
        sourceEl.style.cursor = 'grab';
        // No action on cancel — card stays in source
      },
      e.clientX,
      e.clientY
    );
  });

  sourceEl.style.cursor = 'grab';
  sourceEl.title = 'Kéo thả lá bài vào vùng Banker hoặc Player';
}

// ---------------------------------------------------------------------------
// Public API: Chip Drag (Phase9)
// ---------------------------------------------------------------------------

/**
 * initChipDrag — attaches drag behavior to chip denomination buttons.
 *
 * @param {object} options
 * @param {HTMLElement}   options.trayEl         - #tr-chip-tray container
 * @param {HTMLElement[]} options.seatZoneEls    - [{ el, zoneKey }] — winning seat drop zones
 * @param {Function}      options.getPhase       - () => currentPhase string
 * @param {Function}      options.getSelectedChip - () => number | null
 * @param {HTMLElement}   options.collectSourceRoot - settlement board root for losing-seat collection drags
 * @param {Function}      options.onInvalidStart - () => void when collect drag cannot start
 * @param {Function}      options.onChipDrop     - (zoneKey, denomination) => void
 */
export function initChipDrag(options) {
  const { trayEl, seatZoneEls, getPhase, getSelectedChip, collectSourceRoot, onInvalidStart, onChipDrop } = options;

  trayEl.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    if (getPhase() !== 'settlement') return;

    const chipBtn = e.target.closest('[data-chip-value], [data-chip]');
    if (!chipBtn) return;

    const denomination = parseInt(chipBtn.getAttribute('data-chip-value') || chipBtn.getAttribute('data-chip'), 10);
    if (!denomination) return;

    e.preventDefault();

    startDrag(
      'chip',
      denomination,
      chipBtn,
      seatZoneEls,
      function (zoneKey) { onChipDrop('pay:' + zoneKey, denomination); },
      function () { /* cancelled — no action */ },
      e.clientX,
      e.clientY
    );
  });

  if (!collectSourceRoot) return;

  collectSourceRoot.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    if (getPhase() !== 'settlement') return;

    const sourceEl = e.target.closest('[data-chip-source]');
    if (!sourceEl || !collectSourceRoot.contains(sourceEl)) return;

    const seatZoneKey = sourceEl.getAttribute('data-chip-source');
    if (!seatZoneKey) return;

    const denomination = Number(getSelectedChip && getSelectedChip());
    if (!denomination) {
      e.preventDefault();
      if (typeof onInvalidStart === 'function') onInvalidStart();
      return;
    }

    e.preventDefault();

    startDrag(
      'chip',
      denomination,
      sourceEl,
      [{ el: trayEl, zoneKey: 'tray' }],
      function (zoneKey) {
        if (zoneKey === 'tray') onChipDrop('collect:' + seatZoneKey, denomination);
      },
      function () { /* cancelled — no action */ },
      e.clientX,
      e.clientY
    );
  });
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

export function destroyDragEngine() {
  // TODO[Phase6]: remove all global event listeners, clean up ghost if active
  if (_drag.active) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    removeGhost();
    clearHighlights();
    _drag.active = false;
  }
}

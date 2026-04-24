// customer-request-panel.js — shows a request panel when role=customer
// during deal-4, insurance, or reveal phases.
// Owns: panel DOM creation, button rendering, visibility toggle.
// Does NOT own: state, orchestrator logic, CSS redesign.
// Phase11: minimal implementation.

import { NPC_REQUEST_TYPES, REQUEST_LABELS } from '../npc/npc-request-engine.js';
import { PHASES } from '../phase-machine.js';

// Which phases allow customer requests
const ACTIVE_PHASES = new Set([PHASES.DEAL_4, PHASES.INSURANCE, PHASES.REVEAL]);

// Buttons shown in the panel — ordered by UX priority
const PANEL_BUTTONS = [
  { type: NPC_REQUEST_TYPES.FLIP_PLAYER_FIRST,  label: '▶ ' + REQUEST_LABELS[NPC_REQUEST_TYPES.FLIP_PLAYER_FIRST]  },
  { type: NPC_REQUEST_TYPES.FLIP_BANKER_FIRST,  label: '▶ ' + REQUEST_LABELS[NPC_REQUEST_TYPES.FLIP_BANKER_FIRST]  },
  { type: NPC_REQUEST_TYPES.FLIP_ALL_TOGETHER,  label: '⬛ ' + REQUEST_LABELS[NPC_REQUEST_TYPES.FLIP_ALL_TOGETHER] },
  { type: NPC_REQUEST_TYPES.SQUEEZE_P1,         label: '🤏 ' + REQUEST_LABELS[NPC_REQUEST_TYPES.SQUEEZE_P1]        },
  { type: NPC_REQUEST_TYPES.SQUEEZE_P2,         label: '🤏 ' + REQUEST_LABELS[NPC_REQUEST_TYPES.SQUEEZE_P2]        },
  { type: NPC_REQUEST_TYPES.SQUEEZE_B1,         label: '🤏 ' + REQUEST_LABELS[NPC_REQUEST_TYPES.SQUEEZE_B1]        },
  { type: NPC_REQUEST_TYPES.SQUEEZE_B2,         label: '🤏 ' + REQUEST_LABELS[NPC_REQUEST_TYPES.SQUEEZE_B2]        },
  { type: NPC_REQUEST_TYPES.WAIT_A_MOMENT,      label: '⏸ '  + REQUEST_LABELS[NPC_REQUEST_TYPES.WAIT_A_MOMENT]    },
];

// Inject styles once
let _styleInjected = false;
function ensureStyles() {
  if (_styleInjected) return;
  _styleInjected = true;
  const s = document.createElement('style');
  s.textContent = `
.tr-customer-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(10, 20, 40, 0.88);
  border: 1px solid rgba(120, 180, 255, 0.3);
  border-radius: 10px;
  animation: tr-panel-in 0.2s ease;
}
.tr-customer-panel__title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(150, 200, 255, 0.7);
  text-transform: uppercase;
  margin-bottom: 2px;
}
.tr-customer-panel__btn {
  padding: 5px 10px;
  font-size: 11px;
  border-radius: 6px;
  border: 1px solid rgba(120, 180, 255, 0.35);
  background: rgba(30, 60, 120, 0.5);
  color: #c8e0ff;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.tr-customer-panel__btn:hover {
  background: rgba(50, 100, 200, 0.6);
  border-color: rgba(120, 180, 255, 0.7);
}
.tr-customer-panel__btn:active {
  background: rgba(80, 140, 255, 0.4);
}
@keyframes tr-panel-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
  `;
  document.head.appendChild(s);
}

/**
 * Creates and manages the customer request panel inside hostEl.
 *
 * @param {HTMLElement} hostEl        — container to mount panel into (e.g. left aside)
 * @param {function}    onRequest     — callback(requestType: string)
 * @returns {{ update(state): void, destroy(): void }}
 */
export function createCustomerRequestPanel(hostEl, onRequest) {
  ensureStyles();

  let panelEl = null;

  function buildPanel() {
    const div = document.createElement('div');
    div.className = 'tr-customer-panel';
    div.setAttribute('id', 'tr-customer-panel');

    const title = document.createElement('div');
    title.className = 'tr-customer-panel__title';
    title.textContent = 'Yêu cầu của khách';
    div.appendChild(title);

    PANEL_BUTTONS.forEach(function (btn) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tr-customer-panel__btn';
      b.setAttribute('data-customer-req', btn.type);
      b.textContent = btn.label;
      b.addEventListener('click', function () {
        if (typeof onRequest === 'function') onRequest(btn.type);
      });
      div.appendChild(b);
    });

    return div;
  }

  function shouldShow(state) {
    return state.role === 'customer' && ACTIVE_PHASES.has(state.phase);
  }

  function update(state) {
    if (shouldShow(state)) {
      if (!panelEl) {
        panelEl = buildPanel();
        hostEl.appendChild(panelEl);
      }
      // Update button availability — in reveal phase, only show flip/squeeze types
      // (WAIT is always available; HOLD_MY_CARD not in list)
      panelEl.querySelectorAll('.tr-customer-panel__btn').forEach(function (btn) {
        const type = btn.getAttribute('data-customer-req');
        // Squeeze requests: only relevant after cards are dealt (deal-4+)
        const isSqueezeType = type && type.startsWith('squeeze');
        btn.disabled = isSqueezeType && state.phase === PHASES.DEAL_4;
        btn.style.opacity = btn.disabled ? '0.4' : '';
      });
    } else {
      if (panelEl) {
        panelEl.parentNode && panelEl.parentNode.removeChild(panelEl);
        panelEl = null;
      }
    }
  }

  function destroy() {
    if (panelEl && panelEl.parentNode) {
      panelEl.parentNode.removeChild(panelEl);
    }
    panelEl = null;
  }

  return { update, destroy };
}

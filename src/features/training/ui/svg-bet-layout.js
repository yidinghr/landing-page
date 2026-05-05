/**
 * svg-bet-layout.js — Curved baccarat bet layout drawn as SVG arcs.
 *
 * Replaces the static .tr-matrix-cell DIV grid with a fan of donut-slice
 * paths so the felt looks like a real casino baccarat table. Each zone
 * keeps the same `data-seat` / `data-zone` attributes and child
 * `.tr-zone-bet-amt` / `.tr-zone-payout` text nodes the existing
 * renderer reaches for, so no game-logic changes are needed.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

const VIEW = { w: 1000, h: 720 };
const FELT_CX = 500;
const FELT_CY = 110;            // top center, just below the dealer strip

const SECTOR_COUNT = 5;
const SECTOR_HALF_SPAN = 70;    // total fan = ±70°
const SECTOR_GAP = 1.5;         // degrees between sectors

// Concentric radial bands (px in viewBox units)
const R_PAIR_IN  = 110;
const R_PAIR_OUT = 200;
const R_PTB_OUT  = 320;
const R_L6_OUT   = 380;
const R_SEAT     = 420;

const ZONE_KEY = {
  playerPair: "ppair",
  bankerPair: "bpair",
  luckySix:   "lucky6",
  player:     "player",
  banker:     "banker",
  tie:        "tie"
};

function el(tag, attrs, text) {
  const node = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    for (const k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined) continue;
      node.setAttribute(k, attrs[k]);
    }
  }
  if (text !== undefined) node.textContent = text;
  return node;
}

// 0° = straight down (toward seat 3), positive angle goes right.
function pol(angleDeg, r) {
  const a = (angleDeg * Math.PI) / 180;
  return {
    x: FELT_CX + r * Math.sin(a),
    y: FELT_CY + r * Math.cos(a)
  };
}

function donutPath(rIn, rOut, aStart, aEnd) {
  const p1 = pol(aStart, rIn);
  const p2 = pol(aStart, rOut);
  const p3 = pol(aEnd,   rOut);
  const p4 = pol(aEnd,   rIn);
  const large = Math.abs(aEnd - aStart) > 180 ? 1 : 0;
  return [
    `M${p1.x.toFixed(2)},${p1.y.toFixed(2)}`,
    `L${p2.x.toFixed(2)},${p2.y.toFixed(2)}`,
    `A${rOut},${rOut} 0 ${large} 1 ${p3.x.toFixed(2)},${p3.y.toFixed(2)}`,
    `L${p4.x.toFixed(2)},${p4.y.toFixed(2)}`,
    `A${rIn},${rIn} 0 ${large} 0 ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`,
    "Z"
  ].join(" ");
}

function makeZone(seatId, zone, pathD, label, labelPos) {
  const cls = `tr-matrix-cell tr-svg-zone tr-zone--${ZONE_KEY[zone]}`;
  const g = el("g", { class: cls, "data-seat": String(seatId), "data-zone": zone });
  g.appendChild(el("path", { d: pathD, class: "tr-svg-zone__shape" }));
  g.appendChild(el("text", {
    class: "tr-svg-zone__label",
    x: labelPos.x.toFixed(2),
    y: labelPos.y.toFixed(2),
    "text-anchor": "middle",
    "dominant-baseline": "middle"
  }, label));
  // Bet amount + payout share the centre of the wedge so the existing
  // renderer's textContent / hidden toggling still works.
  g.appendChild(el("text", {
    class: "tr-zone-bet-amt",
    x: labelPos.x.toFixed(2),
    y: (labelPos.y + 16).toFixed(2),
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    hidden: ""
  }));
  g.appendChild(el("text", {
    class: "tr-zone-payout",
    x: labelPos.x.toFixed(2),
    y: (labelPos.y + 30).toFixed(2),
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    hidden: ""
  }));
  return g;
}

function buildDefs() {
  const defs = el("defs");

  const feltGrad = el("radialGradient", {
    id: "tr-felt-grad", cx: "50%", cy: "0%", r: "100%", fx: "50%", fy: "0%"
  });
  feltGrad.appendChild(el("stop", { offset: "0%",  "stop-color": "#1a6b3c" }));
  feltGrad.appendChild(el("stop", { offset: "55%", "stop-color": "#0e3a1c" }));
  feltGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#06210f" }));
  defs.appendChild(feltGrad);

  const woodGrad = el("linearGradient", {
    id: "tr-wood-grad", x1: "0%", y1: "0%", x2: "0%", y2: "100%"
  });
  woodGrad.appendChild(el("stop", { offset: "0%",  "stop-color": "#7a4c1c" }));
  woodGrad.appendChild(el("stop", { offset: "50%", "stop-color": "#4a2c10" }));
  woodGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#2a1808" }));
  defs.appendChild(woodGrad);

  const trayGrad = el("linearGradient", {
    id: "tr-tray-grad", x1: "0%", y1: "0%", x2: "0%", y2: "100%"
  });
  trayGrad.appendChild(el("stop", { offset: "0%",  "stop-color": "#3a2a1a" }));
  trayGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#1a0e06" }));
  defs.appendChild(trayGrad);

  return defs;
}

function buildTableShell(svg) {
  // Outer wood rim (the table edge)
  svg.appendChild(el("path", {
    class: "tr-svg-rim",
    d: `
      M 6,80
      H 994
      V 110
      A 494,610 0 0 1 500,720
      A 494,610 0 0 1 6,110
      Z
    `,
    fill: "url(#tr-wood-grad)"
  }));
  // Gold inlay just inside the rim
  svg.appendChild(el("path", {
    class: "tr-svg-inlay",
    d: `
      M 22,80
      H 978
      V 110
      A 478,594 0 0 1 500,704
      A 478,594 0 0 1 22,110
      Z
    `,
    fill: "none",
    stroke: "#d4af55",
    "stroke-width": 2,
    opacity: 0.55
  }));
  // Felt body
  svg.appendChild(el("path", {
    class: "tr-svg-felt",
    d: `
      M 32,80
      H 968
      V 110
      A 468,584 0 0 1 500,694
      A 468,584 0 0 1 32,110
      Z
    `,
    fill: "url(#tr-felt-grad)"
  }));
}

function buildDealerStrip(svg) {
  // Dealer plate (top straight edge)
  svg.appendChild(el("rect", {
    class: "tr-svg-dealer-plate",
    x: 32, y: 18, width: 936, height: 64, rx: 10,
    fill: "rgba(8, 5, 20, 0.85)",
    stroke: "rgba(212, 175, 85, 0.35)"
  }));

  // Discard tray (left)
  svg.appendChild(el("rect", {
    class: "tr-svg-pocket",
    x: 60, y: 28, width: 150, height: 44, rx: 6,
    fill: "url(#tr-tray-grad)",
    stroke: "rgba(212, 175, 85, 0.32)"
  }));
  svg.appendChild(el("text", {
    class: "tr-svg-pocket__label",
    x: 135, y: 52, "text-anchor": "middle", "dominant-baseline": "middle"
  }, "DISCARD"));

  // Long curved chip tray (centre)
  svg.appendChild(el("path", {
    class: "tr-svg-chip-tray",
    d: "M 250,30 Q 500,82 750,30 L 750,72 Q 500,108 250,72 Z",
    fill: "url(#tr-tray-grad)",
    stroke: "rgba(212, 175, 85, 0.45)"
  }));
  // Decorative dealer chip stacks dotted along the tray
  const trayChipColors = ["#d4af55", "#4a9eff", "#50d890", "#ff5a5a", "#c484ff", "#f2d486"];
  for (let i = 0; i < trayChipColors.length; i++) {
    const t = (i + 1) / (trayChipColors.length + 1);
    const x = 280 + t * 440;
    const y = 64 - Math.sin(t * Math.PI) * 16;
    const chip = el("g", { class: "tr-svg-tray-chip" });
    chip.appendChild(el("ellipse", {
      cx: x, cy: y + 4, rx: 12, ry: 4,
      fill: "rgba(0,0,0,0.45)"
    }));
    chip.appendChild(el("circle", {
      cx: x, cy: y, r: 10,
      fill: trayChipColors[i],
      stroke: "rgba(0,0,0,0.7)",
      "stroke-width": 1.2
    }));
    chip.appendChild(el("circle", {
      cx: x, cy: y, r: 5,
      fill: "rgba(255,255,255,0.18)",
      stroke: "rgba(0,0,0,0.4)"
    }));
    svg.appendChild(chip);
  }

  // Card shoe (right)
  svg.appendChild(el("rect", {
    class: "tr-svg-shoe",
    x: 790, y: 24, width: 150, height: 56, rx: 8,
    fill: "url(#tr-tray-grad)",
    stroke: "rgba(212, 175, 85, 0.45)"
  }));
  svg.appendChild(el("rect", {
    class: "tr-svg-shoe-deck",
    x: 802, y: 32, width: 60, height: 40, rx: 4,
    fill: "#ffffff",
    stroke: "#1a1a2e", "stroke-width": 1.5
  }));
  svg.appendChild(el("text", {
    class: "tr-svg-pocket__label",
    x: 902, y: 52, "text-anchor": "middle", "dominant-baseline": "middle"
  }, "SHOE"));

  // Dealer label (centred above the chip tray)
  svg.appendChild(el("text", {
    class: "tr-svg-dealer-label",
    x: 500, y: 100, "text-anchor": "middle", "dominant-baseline": "middle"
  }, "◆ DEALER ◆"));
}

function buildCenterDisplay(svg) {
  // Dim background ellipse where PLAYER/BANKER cards land
  svg.appendChild(el("ellipse", {
    class: "tr-svg-card-zone",
    cx: 500, cy: 175, rx: 240, ry: 60,
    fill: "rgba(2, 18, 12, 0.55)",
    stroke: "rgba(212, 175, 85, 0.32)"
  }));
  svg.appendChild(el("text", {
    class: "tr-svg-card-zone__label tr-svg-card-zone__label--banker",
    x: 360, y: 168, "text-anchor": "middle"
  }, "BANKER"));
  svg.appendChild(el("text", {
    class: "tr-svg-card-zone__label tr-svg-card-zone__label--player",
    x: 640, y: 168, "text-anchor": "middle"
  }, "PLAYER"));
  svg.appendChild(el("text", {
    class: "tr-svg-vs",
    x: 500, y: 192, "text-anchor": "middle"
  }, "VS"));
}

function buildSeatFan(svg) {
  const totalSpan = SECTOR_HALF_SPAN * 2;
  const sectorWidth = (totalSpan - SECTOR_GAP * (SECTOR_COUNT - 1)) / SECTOR_COUNT;

  for (let i = 0; i < SECTOR_COUNT; i++) {
    const seatId = i + 1;
    const aStart = -SECTOR_HALF_SPAN + i * (sectorWidth + SECTOR_GAP);
    const aEnd   = aStart + sectorWidth;
    const aMid   = (aStart + aEnd) / 2;

    // --- Pair band (innermost): playerPair | bankerPair ---
    svg.appendChild(makeZone(
      seatId, "playerPair",
      donutPath(R_PAIR_IN, R_PAIR_OUT, aStart, aMid),
      "P.PAIR",
      pol((aStart + aMid) / 2, (R_PAIR_IN + R_PAIR_OUT) / 2)
    ));
    svg.appendChild(makeZone(
      seatId, "bankerPair",
      donutPath(R_PAIR_IN, R_PAIR_OUT, aMid, aEnd),
      "B.PAIR",
      pol((aMid + aEnd) / 2, (R_PAIR_IN + R_PAIR_OUT) / 2)
    ));

    // --- PTB band: PLAYER | TIE | BANKER ---
    const a1 = aStart + sectorWidth * 0.36;
    const a2 = aEnd   - sectorWidth * 0.36;
    svg.appendChild(makeZone(
      seatId, "player",
      donutPath(R_PAIR_OUT, R_PTB_OUT, aStart, a1),
      "P",
      pol((aStart + a1) / 2, (R_PAIR_OUT + R_PTB_OUT) / 2)
    ));
    svg.appendChild(makeZone(
      seatId, "tie",
      donutPath(R_PAIR_OUT, R_PTB_OUT, a1, a2),
      "T",
      pol(aMid, (R_PAIR_OUT + R_PTB_OUT) / 2)
    ));
    svg.appendChild(makeZone(
      seatId, "banker",
      donutPath(R_PAIR_OUT, R_PTB_OUT, a2, aEnd),
      "B",
      pol((a2 + aEnd) / 2, (R_PAIR_OUT + R_PTB_OUT) / 2)
    ));

    // --- Lucky 6 band ---
    svg.appendChild(makeZone(
      seatId, "luckySix",
      donutPath(R_PTB_OUT, R_L6_OUT, aStart, aEnd),
      "LUCKY 6",
      pol(aMid, (R_PTB_OUT + R_L6_OUT) / 2)
    ));

    // --- Seat label ring (purely decorative, no data-zone) ---
    const seatLabelPos = pol(aMid, R_SEAT);
    svg.appendChild(el("text", {
      class: "tr-svg-seat-num",
      x: seatLabelPos.x.toFixed(2),
      y: seatLabelPos.y.toFixed(2),
      "text-anchor": "middle",
      "dominant-baseline": "middle"
    }, "Seat " + seatId));
  }
}

export function buildSvgBetLayout(host) {
  if (!host) return;
  // Wipe whatever the static markup left behind.
  while (host.firstChild) host.removeChild(host.firstChild);

  const svg = el("svg", {
    class: "tr-bet-svg",
    viewBox: `0 0 ${VIEW.w} ${VIEW.h}`,
    preserveAspectRatio: "xMidYMid meet",
    xmlns: SVG_NS
  });

  svg.appendChild(buildDefs());
  buildTableShell(svg);
  buildDealerStrip(svg);
  buildCenterDisplay(svg);
  buildSeatFan(svg);

  host.appendChild(svg);
}

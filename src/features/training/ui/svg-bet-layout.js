/**
 * svg-bet-layout.js - vector baccarat table layout.
 *
 * Each betting cell is an SVG path with data-seat/data-zone attributes. The
 * game renderer updates those nodes directly, while this module owns only the
 * table geometry and visuals.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

const VIEW = { w: 1000, h: 560 };
const CX = 500;
const CY = 120;
const Y_SCALE = 0.7;
const SEAT_COUNT = 5;

const BANDS = {
  pairIn: 112,
  pairOut: 180,
  mainOut: 304,
  luckyOut: 346,
  seat: 382
};

const SEAT_ARCS = [
  [-58, -35],
  [-34, -12],
  [-11, 11],
  [12, 34],
  [35, 58]
];

const ZONE_KEY = {
  playerPair: "ppair",
  bankerPair: "bpair",
  luckySix: "lucky6",
  player: "player",
  banker: "banker",
  tie: "tie"
};

function el(tag, attrs, text) {
  const node = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    for (const key in attrs) {
      if (attrs[key] === null || attrs[key] === undefined) continue;
      node.setAttribute(key, attrs[key]);
    }
  }
  if (text !== undefined) node.textContent = text;
  return node;
}

function point(angleDeg, radius) {
  const a = angleDeg * Math.PI / 180;
  return {
    x: CX + radius * Math.sin(a),
    y: CY + radius * Math.cos(a) * Y_SCALE
  };
}

function pathFromPoints(points) {
  return points.map(function (p, index) {
    return (index ? "L" : "M") + p.x.toFixed(1) + "," + p.y.toFixed(1);
  }).join(" ") + " Z";
}

function arcPoints(radius, aStart, aEnd, steps) {
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    out.push(point(aStart + (aEnd - aStart) * t, radius));
  }
  return out;
}

function bandPath(rIn, rOut, aStart, aEnd) {
  const outer = arcPoints(rOut, aStart, aEnd, 8);
  const inner = arcPoints(rIn, aEnd, aStart, 8);
  return pathFromPoints(outer.concat(inner));
}

function midPoint(rIn, rOut, aStart, aEnd) {
  return point((aStart + aEnd) / 2, (rIn + rOut) / 2);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function labelRotation(aStart, aEnd, scale, max) {
  return clamp(((aStart + aEnd) / 2) * scale, -max, max);
}

function rotatedTextAttrs(labelPos, rotateDeg) {
  const attrs = {
    x: labelPos.x.toFixed(1),
    y: labelPos.y.toFixed(1),
    "text-anchor": "middle",
    "dominant-baseline": "middle"
  };
  if (rotateDeg) {
    attrs.transform = "rotate(" + rotateDeg.toFixed(1) + " " + labelPos.x.toFixed(1) + " " + labelPos.y.toFixed(1) + ")";
  }
  return attrs;
}

function makeZone(seatId, zone, d, label, labelPos, extraClass, rotateDeg) {
  const cls = "tr-matrix-cell tr-svg-zone tr-zone--" + ZONE_KEY[zone] + (extraClass ? " " + extraClass : "");
  const g = el("g", { class: cls, "data-seat": String(seatId), "data-zone": zone });
  g.appendChild(el("path", { d, class: "tr-svg-zone__shape" }));
  g.appendChild(el("text", Object.assign({ class: "tr-svg-zone__label" }, rotatedTextAttrs(labelPos, rotateDeg)), label));

  const betPos = { x: labelPos.x, y: labelPos.y + 17 };
  g.appendChild(el("text", Object.assign({ class: "tr-zone-bet-amt", hidden: "" }, rotatedTextAttrs(betPos, rotateDeg)), ""));

  const payoutPos = { x: labelPos.x, y: labelPos.y + 32 };
  g.appendChild(el("text", Object.assign({ class: "tr-zone-payout", hidden: "" }, rotatedTextAttrs(payoutPos, rotateDeg)), ""));
  return g;
}

function buildDefs() {
  const defs = el("defs");

  const felt = el("radialGradient", { id: "tr-felt-casino", cx: "50%", cy: "36%", r: "78%" });
  felt.appendChild(el("stop", { offset: "0%", "stop-color": "#2ac1e8" }));
  felt.appendChild(el("stop", { offset: "56%", "stop-color": "#1293cc" }));
  felt.appendChild(el("stop", { offset: "100%", "stop-color": "#0b5b84" }));
  defs.appendChild(felt);

  const feltDark = el("linearGradient", { id: "tr-felt-depth", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  feltDark.appendChild(el("stop", { offset: "0%", "stop-color": "rgba(255,255,255,0.16)" }));
  feltDark.appendChild(el("stop", { offset: "60%", "stop-color": "rgba(255,255,255,0)" }));
  feltDark.appendChild(el("stop", { offset: "100%", "stop-color": "rgba(0,0,0,0.22)" }));
  defs.appendChild(feltDark);

  const feltTexture = el("filter", { id: "tr-felt-texture", x: "-8%", y: "-8%", width: "116%", height: "116%" });
  feltTexture.appendChild(el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.8 0.18", numOctaves: "2", seed: "22", result: "noise" }));
  feltTexture.appendChild(el("feColorMatrix", { in: "noise", type: "matrix", values: "0.05 0 0 0 0  0 0.09 0 0 0.02  0 0 0.12 0 0.04  0 0 0 0.2 0", result: "grain" }));
  feltTexture.appendChild(el("feComposite", { in: "grain", in2: "SourceAlpha", operator: "in", result: "grainClip" }));
  feltTexture.appendChild(el("feBlend", { in: "SourceGraphic", in2: "grainClip", mode: "multiply" }));
  defs.appendChild(feltTexture);

  const wood = el("linearGradient", { id: "tr-wood-rail", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  wood.appendChild(el("stop", { offset: "0%", "stop-color": "#b86d27" }));
  wood.appendChild(el("stop", { offset: "44%", "stop-color": "#713812" }));
  wood.appendChild(el("stop", { offset: "100%", "stop-color": "#2c1406" }));
  defs.appendChild(wood);

  const woodFine = el("linearGradient", { id: "tr-wood-fine", x1: "0%", y1: "0%", x2: "100%", y2: "0%" });
  woodFine.appendChild(el("stop", { offset: "0%", "stop-color": "rgba(255, 210, 126, 0)" }));
  woodFine.appendChild(el("stop", { offset: "45%", "stop-color": "rgba(255, 210, 126, 0.18)" }));
  woodFine.appendChild(el("stop", { offset: "100%", "stop-color": "rgba(65, 24, 6, 0)" }));
  defs.appendChild(woodFine);

  const leather = el("linearGradient", { id: "tr-black-leather", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  leather.appendChild(el("stop", { offset: "0%", "stop-color": "#313238" }));
  leather.appendChild(el("stop", { offset: "50%", "stop-color": "#111218" }));
  leather.appendChild(el("stop", { offset: "100%", "stop-color": "#030305" }));
  defs.appendChild(leather);

  const seatLeather = el("linearGradient", { id: "tr-seat-leather", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  seatLeather.appendChild(el("stop", { offset: "0%", "stop-color": "#2c2e34" }));
  seatLeather.appendChild(el("stop", { offset: "48%", "stop-color": "#0d0f14" }));
  seatLeather.appendChild(el("stop", { offset: "100%", "stop-color": "#030406" }));
  defs.appendChild(seatLeather);

  const woodTexture = el("filter", { id: "tr-wood-texture", x: "-8%", y: "-8%", width: "116%", height: "116%" });
  woodTexture.appendChild(el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.018 0.22", numOctaves: "3", seed: "8", result: "noise" }));
  woodTexture.appendChild(el("feColorMatrix", { in: "noise", type: "matrix", values: "0.32 0 0 0 0.1  0 0.16 0 0 0.04  0 0 0.05 0 0.01  0 0 0 0.34 0", result: "grain" }));
  woodTexture.appendChild(el("feComposite", { in: "grain", in2: "SourceAlpha", operator: "in", result: "grainClip" }));
  woodTexture.appendChild(el("feBlend", { in: "SourceGraphic", in2: "grainClip", mode: "multiply" }));
  defs.appendChild(woodTexture);

  const leatherTexture = el("filter", { id: "tr-leather-texture", x: "-8%", y: "-8%", width: "116%", height: "116%" });
  leatherTexture.appendChild(el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.9", numOctaves: "2", seed: "12", result: "noise" }));
  leatherTexture.appendChild(el("feColorMatrix", { in: "noise", type: "matrix", values: "0.12 0 0 0 0  0 0.12 0 0 0  0 0 0.12 0 0  0 0 0 0.22 0", result: "grain" }));
  leatherTexture.appendChild(el("feComposite", { in: "grain", in2: "SourceAlpha", operator: "in", result: "grainClip" }));
  leatherTexture.appendChild(el("feBlend", { in: "SourceGraphic", in2: "grainClip", mode: "screen" }));
  defs.appendChild(leatherTexture);

  const tray = el("linearGradient", { id: "tr-chip-tray-dark", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  tray.appendChild(el("stop", { offset: "0%", "stop-color": "#302018" }));
  tray.appendChild(el("stop", { offset: "100%", "stop-color": "#0b0705" }));
  defs.appendChild(tray);

  return defs;
}

function buildPlayerChairs(svg) {
  const chairs = [
    { x: 95, y: 432, r: -30, w: 120, h: 112 },
    { x: 300, y: 512, r: -14, w: 128, h: 100 },
    { x: 500, y: 540, r: 0, w: 132, h: 98 },
    { x: 700, y: 512, r: 14, w: 128, h: 100 },
    { x: 905, y: 432, r: 30, w: 120, h: 112 }
  ];

  chairs.forEach(function (chair) {
    const g = el("g", { class: "tr-svg-player-chair", transform: "translate(" + chair.x + " " + chair.y + ") rotate(" + chair.r + ")" });
    g.appendChild(el("rect", {
      x: (-chair.w / 2).toFixed(1),
      y: (-chair.h / 2).toFixed(1),
      width: chair.w,
      height: chair.h,
      rx: 26,
      fill: "url(#tr-seat-leather)",
      stroke: "rgba(0,0,0,0.72)",
      "stroke-width": 4,
      filter: "url(#tr-leather-texture)"
    }));
    g.appendChild(el("path", {
      d: "M " + (-chair.w / 2 + 16) + "," + (-chair.h / 2 + 28) + " Q 0," + (-chair.h / 2 + 8) + " " + (chair.w / 2 - 16) + "," + (-chair.h / 2 + 28),
      fill: "none",
      stroke: "rgba(255,255,255,0.13)",
      "stroke-width": 3,
      "stroke-linecap": "round"
    }));
    [-28, 0, 28].forEach(function (x) {
      g.appendChild(el("path", {
        d: "M " + x + "," + (-chair.h / 2 + 24) + " L " + (x * 0.58) + "," + (chair.h / 2 - 16),
        fill: "none",
        stroke: "rgba(255,255,255,0.08)",
        "stroke-width": 2
      }));
    });
    svg.appendChild(g);
  });
}

function buildTableShell(svg) {
  svg.appendChild(el("ellipse", {
    class: "tr-svg-floor-shadow",
    cx: 500,
    cy: 486,
    rx: 416,
    ry: 64,
    fill: "rgba(0,0,0,0.55)"
  }));
  svg.appendChild(el("path", {
    class: "tr-svg-leather",
    d: [
      "M 78,102",
      "C 160,42 840,42 922,102",
      "L 960,160",
      "C 936,302 840,452 650,514",
      "C 558,544 442,544 350,514",
      "C 160,452 64,302 40,160",
      "Z"
    ].join(" "),
    fill: "url(#tr-black-leather)",
    filter: "url(#tr-leather-texture)"
  }));
  svg.appendChild(el("path", {
    class: "tr-svg-wood",
    d: [
      "M 120,122",
      "C 210,72 790,72 880,122",
      "L 904,164",
      "C 874,292 790,408 632,464",
      "C 552,492 448,492 368,464",
      "C 210,408 126,292 96,164",
      "Z"
    ].join(" "),
    fill: "url(#tr-wood-rail)",
    filter: "url(#tr-wood-texture)"
  }));
  svg.appendChild(el("path", {
    class: "tr-svg-wood-highlight",
    d: [
      "M 130,144",
      "C 224,92 776,92 870,144",
      "C 864,166 852,188 834,212",
      "C 736,154 264,154 166,212",
      "C 148,188 136,166 130,144",
      "Z"
    ].join(" "),
    fill: "url(#tr-wood-fine)",
    opacity: 0.75
  }));
  svg.appendChild(el("path", {
    class: "tr-svg-felt",
    d: [
      "M 154,142",
      "C 248,108 752,108 846,142",
      "L 850,164",
      "C 824,268 744,356 610,412",
      "C 540,440 460,440 390,412",
      "C 256,356 176,268 150,164",
      "Z"
    ].join(" "),
    fill: "url(#tr-felt-casino)"
  }));
  svg.appendChild(el("path", {
    class: "tr-svg-felt-sheen",
    d: [
      "M 154,142",
      "C 248,108 752,108 846,142",
      "L 850,164",
      "C 824,268 744,356 610,412",
      "C 540,440 460,440 390,412",
      "C 256,356 176,268 150,164",
      "Z"
    ].join(" "),
    fill: "url(#tr-felt-depth)"
  }));
}

function buildPlayerChipSlots(svg) {
  const slots = [
    { a: -47, len: 17, label: "Seat 1" },
    { a: -24, len: 16, label: "Seat 2" },
    { a: 0, len: 16, label: "Seat 3" },
    { a: 24, len: 16, label: "Seat 4" },
    { a: 47, len: 17, label: "Seat 5" }
  ];

  slots.forEach(function (slot, index) {
    const start = point(slot.a - slot.len / 2, 410);
    const mid = point(slot.a, 430);
    const end = point(slot.a + slot.len / 2, 410);
    const chip = point(slot.a, 386);
    const plate = point(slot.a, 415);
    svg.appendChild(el("path", {
      class: "tr-svg-money-slot",
      d: "M " + start.x.toFixed(1) + "," + start.y.toFixed(1) + " Q " + mid.x.toFixed(1) + "," + mid.y.toFixed(1) + " " + end.x.toFixed(1) + "," + end.y.toFixed(1),
      fill: "none",
      stroke: "rgba(8, 5, 3, 0.92)",
      "stroke-width": 20,
      "stroke-linecap": "round"
    }));
    svg.appendChild(el("path", {
      class: "tr-svg-money-slot-hi",
      d: "M " + start.x.toFixed(1) + "," + (start.y - 3).toFixed(1) + " Q " + mid.x.toFixed(1) + "," + (mid.y - 4).toFixed(1) + " " + end.x.toFixed(1) + "," + (end.y - 3).toFixed(1),
      fill: "none",
      stroke: "rgba(226, 145, 45, 0.48)",
      "stroke-width": 2.4,
      "stroke-linecap": "round"
    }));

    const colors = ["#e73a55", "#34b75f", "#2e85d5", "#ef982f", "#8f45cf"];
    svg.appendChild(el("ellipse", { class: "tr-svg-slot-plate", cx: plate.x, cy: plate.y - 10, rx: 28, ry: 6, fill: "rgba(255, 173, 65, 0.13)" }));
    svg.appendChild(el("circle", { class: "tr-svg-front-chip", cx: chip.x, cy: chip.y - 18, r: 15, fill: colors[index], stroke: "#fff", "stroke-width": 1.6 }));
    svg.appendChild(el("circle", { class: "tr-svg-front-chip-gloss", cx: chip.x - 4, cy: chip.y - 23, r: 5, fill: "rgba(255,255,255,0.28)" }));
    svg.appendChild(el("text", { class: "tr-svg-front-chip-label", x: chip.x, y: chip.y - 14, "text-anchor": "middle" }, index === 0 ? "1K" : index === 1 ? "5K" : index === 2 ? "10K" : index === 3 ? "50K" : "100K"));
  });
}

function buildDealerArea(svg) {
  svg.appendChild(el("text", {
    class: "tr-svg-brand",
    x: 500, y: 150,
    "text-anchor": "middle",
    "dominant-baseline": "middle"
  }, "BACCARIST"));

  svg.appendChild(el("path", {
    class: "tr-svg-chip-tray",
    d: "M 328,162 Q 500,144 672,162 L 662,196 Q 500,176 338,196 Z",
    fill: "url(#tr-chip-tray-dark)",
    stroke: "rgba(242, 212, 134, 0.58)",
    "stroke-width": 2
  }));
  svg.appendChild(el("path", {
    class: "tr-svg-chip-tray-hi",
    d: "M 344,166 Q 500,154 656,166",
    fill: "none",
    stroke: "rgba(255,255,255,0.26)",
    "stroke-width": 2,
    "stroke-linecap": "round"
  }));

  ["#e93c55", "#28bd64", "#2a83d8", "#f4a53a", "#8d44d8", "#e93c55", "#28bd64", "#2a83d8", "#f4a53a"].forEach(function (color, i) {
    const x = 354 + i * 36.5;
    const y = 176 - Math.sin((i + 1) / 9 * Math.PI) * 8;
    for (let s = 0; s < 4; s++) {
      svg.appendChild(el("rect", {
        class: "tr-svg-tray-chip",
        x: (x - 10).toFixed(1),
        y: (y + 6 - s * 5).toFixed(1),
        width: 20,
        height: 9,
        rx: 4,
        fill: color,
        stroke: "rgba(255,255,255,0.72)",
        "stroke-width": 0.8
      }));
    }
    svg.appendChild(el("rect", {
      x: (x - 7).toFixed(1),
      y: (y - 13).toFixed(1),
      width: 14,
      height: 4,
      rx: 2,
      fill: "rgba(255,255,255,0.28)"
    }));
  });

}

function buildBetHeaders(svg) {
  [
    ["tr-svg-header-player", 382, 198, "PLAYER"],
    ["tr-svg-header-banker", 618, 198, "BANKER"]
  ].forEach(function (row) {
    svg.appendChild(el("text", {
      class: row[0],
      x: row[1],
      y: row[2],
      "text-anchor": "middle",
      "dominant-baseline": "middle"
    }, row[3]));
  });
}

function buildSeatFan(svg) {
  for (let i = 0; i < SEAT_COUNT; i++) {
    const seatId = i + 1;
    const aStart = SEAT_ARCS[i][0];
    const aEnd = SEAT_ARCS[i][1];
    const seatSpan = aEnd - aStart;
    const aMid = (aStart + aEnd) / 2;
    const aPairMid = aStart + seatSpan * 0.5;
    const aMain1 = aStart + seatSpan * 0.34;
    const aMain2 = aEnd - seatSpan * 0.34;

    svg.appendChild(makeZone(
      seatId,
      "playerPair",
      bandPath(BANDS.pairIn, BANDS.pairOut, aStart, aPairMid),
      "P.PAIR",
      midPoint(BANDS.pairIn, BANDS.pairOut, aStart, aPairMid),
      null,
      labelRotation(aStart, aPairMid, 0.62, 28)
    ));
    svg.appendChild(makeZone(
      seatId,
      "bankerPair",
      bandPath(BANDS.pairIn, BANDS.pairOut, aPairMid, aEnd),
      "B.PAIR",
      midPoint(BANDS.pairIn, BANDS.pairOut, aPairMid, aEnd),
      null,
      labelRotation(aPairMid, aEnd, 0.62, 28)
    ));
    svg.appendChild(makeZone(
      seatId,
      "player",
      bandPath(BANDS.pairOut, BANDS.mainOut, aStart, aMain1),
      "P",
      midPoint(BANDS.pairOut, BANDS.mainOut, aStart, aMain1),
      "tr-svg-zone--main",
      labelRotation(aStart, aMain1, 0.48, 22)
    ));
    svg.appendChild(makeZone(
      seatId,
      "tie",
      bandPath(BANDS.pairOut, BANDS.mainOut, aMain1, aMain2),
      "T",
      midPoint(BANDS.pairOut, BANDS.mainOut, aMain1, aMain2),
      "tr-svg-zone--tie-main",
      labelRotation(aMain1, aMain2, 0.38, 16)
    ));
    svg.appendChild(makeZone(
      seatId,
      "banker",
      bandPath(BANDS.pairOut, BANDS.mainOut, aMain2, aEnd),
      "B",
      midPoint(BANDS.pairOut, BANDS.mainOut, aMain2, aEnd),
      "tr-svg-zone--main",
      labelRotation(aMain2, aEnd, 0.48, 22)
    ));
    svg.appendChild(makeZone(
      seatId,
      "luckySix",
      bandPath(BANDS.mainOut, BANDS.luckyOut, aStart, aEnd),
      "LUCKY 6",
      midPoint(BANDS.mainOut, BANDS.luckyOut, aStart, aEnd),
      null,
      labelRotation(aStart, aEnd, 0.5, 22)
    ));

    const seatPos = point(aMid, BANDS.seat);
    svg.appendChild(el("text", {
      class: "tr-svg-seat-num",
      x: seatPos.x.toFixed(1),
      y: seatPos.y.toFixed(1),
      "text-anchor": "middle",
      "dominant-baseline": "middle"
    }, "Seat " + seatId));
  }
}

function buildCenterPlaque(svg) {
  svg.appendChild(el("path", {
    class: "tr-svg-center-plaque",
    d: "M 424,218 Q 500,206 576,218 L 564,254 Q 500,246 436,254 Z",
    fill: "rgba(5, 68, 111, 0.58)",
    stroke: "rgba(220, 244, 255, 0.58)",
    "stroke-width": 1.4
  }));
  svg.appendChild(el("text", {
    class: "tr-svg-plaque-title",
    x: 500,
    y: 231,
    "text-anchor": "middle",
    "dominant-baseline": "middle"
  }, "BACCARAT"));
  svg.appendChild(el("text", {
    class: "tr-svg-plaque-sub",
    x: 500,
    y: 246,
    "text-anchor": "middle",
    "dominant-baseline": "middle"
  }, "TIE 8 TO 1"));
}

function buildFrontRail(svg) {
  buildPlayerChipSlots(svg);
}

export function buildSvgBetLayout(host) {
  if (!host) return;
  while (host.firstChild) host.removeChild(host.firstChild);

  const svg = el("svg", {
    class: "tr-bet-svg",
    viewBox: "0 0 " + VIEW.w + " " + VIEW.h,
    preserveAspectRatio: "xMidYMid meet",
    xmlns: SVG_NS
  });

  svg.appendChild(buildDefs());
  buildPlayerChairs(svg);
  buildTableShell(svg);
  buildDealerArea(svg);
  buildSeatFan(svg);
  buildCenterPlaque(svg);
  buildBetHeaders(svg);
  buildFrontRail(svg);

  host.appendChild(svg);
}

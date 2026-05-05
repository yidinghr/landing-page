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
const CY = 132;
const Y_SCALE = 0.58;
const SEAT_COUNT = 5;
const FAN_HALF_SPAN = 66;
const SEAT_GAP = 1.4;

const BANDS = {
  pairIn: 118,
  pairOut: 190,
  mainOut: 318,
  luckyOut: 370,
  seat: 420
};

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

function makeZone(seatId, zone, d, label, labelPos, extraClass) {
  const cls = "tr-matrix-cell tr-svg-zone tr-zone--" + ZONE_KEY[zone] + (extraClass ? " " + extraClass : "");
  const g = el("g", { class: cls, "data-seat": String(seatId), "data-zone": zone });
  g.appendChild(el("path", { d, class: "tr-svg-zone__shape" }));
  g.appendChild(el("text", {
    class: "tr-svg-zone__label",
    x: labelPos.x.toFixed(1),
    y: labelPos.y.toFixed(1),
    "text-anchor": "middle",
    "dominant-baseline": "middle"
  }, label));
  g.appendChild(el("text", {
    class: "tr-zone-bet-amt",
    x: labelPos.x.toFixed(1),
    y: (labelPos.y + 17).toFixed(1),
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    hidden: ""
  }));
  g.appendChild(el("text", {
    class: "tr-zone-payout",
    x: labelPos.x.toFixed(1),
    y: (labelPos.y + 32).toFixed(1),
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    hidden: ""
  }));
  return g;
}

function buildDefs() {
  const defs = el("defs");

  const felt = el("radialGradient", { id: "tr-felt-casino", cx: "50%", cy: "36%", r: "78%" });
  felt.appendChild(el("stop", { offset: "0%", "stop-color": "#2ac1e8" }));
  felt.appendChild(el("stop", { offset: "56%", "stop-color": "#1293cc" }));
  felt.appendChild(el("stop", { offset: "100%", "stop-color": "#0b5b84" }));
  defs.appendChild(felt);

  const wood = el("linearGradient", { id: "tr-wood-rail", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  wood.appendChild(el("stop", { offset: "0%", "stop-color": "#b86d27" }));
  wood.appendChild(el("stop", { offset: "44%", "stop-color": "#713812" }));
  wood.appendChild(el("stop", { offset: "100%", "stop-color": "#2c1406" }));
  defs.appendChild(wood);

  const leather = el("linearGradient", { id: "tr-black-leather", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  leather.appendChild(el("stop", { offset: "0%", "stop-color": "#313238" }));
  leather.appendChild(el("stop", { offset: "50%", "stop-color": "#111218" }));
  leather.appendChild(el("stop", { offset: "100%", "stop-color": "#030305" }));
  defs.appendChild(leather);

  const tray = el("linearGradient", { id: "tr-chip-tray-dark", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  tray.appendChild(el("stop", { offset: "0%", "stop-color": "#302018" }));
  tray.appendChild(el("stop", { offset: "100%", "stop-color": "#0b0705" }));
  defs.appendChild(tray);

  return defs;
}

function buildTableShell(svg) {
  svg.appendChild(el("path", {
    class: "tr-svg-leather",
    d: [
      "M 38,118",
      "C 138,28 862,28 962,118",
      "C 942,230 880,410 650,485",
      "C 572,512 428,512 350,485",
      "C 120,410 58,230 38,118",
      "Z"
    ].join(" "),
    fill: "url(#tr-black-leather)"
  }));
  svg.appendChild(el("path", {
    class: "tr-svg-wood",
    d: [
      "M 86,128",
      "C 188,62 812,62 914,128",
      "C 892,232 812,350 640,426",
      "C 558,462 442,462 360,426",
      "C 188,350 108,232 86,128",
      "Z"
    ].join(" "),
    fill: "url(#tr-wood-rail)"
  }));
  svg.appendChild(el("path", {
    class: "tr-svg-felt",
    d: [
      "M 138,146",
      "C 238,100 762,100 862,146",
      "C 838,236 750,312 620,372",
      "C 548,404 452,404 380,372",
      "C 250,312 162,236 138,146",
      "Z"
    ].join(" "),
    fill: "url(#tr-felt-casino)"
  }));

  [
    { y: 205, bend: -34, start: 110, end: 890 },
    { y: 420, bend: 58, start: 128, end: 872 }
  ].forEach(function (slot) {
    svg.appendChild(el("path", {
      class: "tr-svg-rail-slot",
      d: "M " + slot.start + " " + slot.y + " Q 500 " + (slot.y + slot.bend) + " " + slot.end + " " + slot.y,
      fill: "none",
      stroke: "rgba(15, 8, 4, 0.84)",
      "stroke-width": 20,
      "stroke-linecap": "round"
    }));
    svg.appendChild(el("path", {
      class: "tr-svg-rail-slot-hi",
      d: "M " + (slot.start + 8) + " " + slot.y + " Q 500 " + (slot.y + slot.bend * 0.86) + " " + (slot.end - 8) + " " + slot.y,
      fill: "none",
      stroke: "rgba(230, 145, 45, 0.5)",
      "stroke-width": 3,
      "stroke-linecap": "round"
    }));
  });

  [
    [88, 318],
    [198, 370],
    [802, 370],
    [912, 318]
  ].forEach(function (pos) {
    svg.appendChild(el("circle", {
      class: "tr-svg-rail-light",
      cx: pos[0], cy: pos[1], r: 18,
      fill: "#f4b530",
      stroke: "rgba(0,0,0,0.62)",
      "stroke-width": 4
    }));
  });
}

function buildDealerNpc(svg) {
  const npc = el("g", { class: "tr-svg-npc-dealer" });

  npc.appendChild(el("path", {
    d: "M 424,18 C 448,4 552,4 576,18 L 606,132 C 562,150 438,150 394,132 Z",
    fill: "#2f343a",
    stroke: "rgba(0,0,0,0.45)",
    "stroke-width": 2
  }));
  npc.appendChild(el("path", {
    d: "M 438,24 L 478,132 L 522,132 L 562,24 C 532,14 468,14 438,24 Z",
    fill: "#d8dde3",
    opacity: 0.92
  }));
  npc.appendChild(el("path", {
    d: "M 468,48 L 492,132 L 508,132 L 532,48 C 512,56 488,56 468,48 Z",
    fill: "#1c2026",
    opacity: 0.9
  }));
  npc.appendChild(el("circle", {
    cx: 500, cy: 38, r: 28,
    fill: "#d8a57d",
    stroke: "rgba(0,0,0,0.45)",
    "stroke-width": 2
  }));
  npc.appendChild(el("path", {
    d: "M 470,34 C 474,6 526,6 532,34 C 520,22 488,22 470,34 Z",
    fill: "#191717"
  }));
  npc.appendChild(el("path", {
    d: "M 384,106 C 324,112 286,132 254,168",
    fill: "none",
    stroke: "#d8a57d",
    "stroke-width": 18,
    "stroke-linecap": "round"
  }));
  npc.appendChild(el("path", {
    d: "M 616,106 C 676,112 714,132 746,168",
    fill: "none",
    stroke: "#d8a57d",
    "stroke-width": 18,
    "stroke-linecap": "round"
  }));
  npc.appendChild(el("ellipse", { cx: 246, cy: 172, rx: 20, ry: 11, fill: "#e2b08a" }));
  npc.appendChild(el("ellipse", { cx: 754, cy: 172, rx: 20, ry: 11, fill: "#e2b08a" }));

  svg.appendChild(npc);
}

function buildDealerArea(svg) {
  svg.appendChild(el("text", {
    class: "tr-svg-brand",
    x: 500, y: 144,
    "text-anchor": "middle",
    "dominant-baseline": "middle"
  }, "BACCARIST"));

  svg.appendChild(el("path", {
    class: "tr-svg-chip-tray",
    d: "M 360,158 Q 500,144 640,158 L 635,182 Q 500,168 365,182 Z",
    fill: "url(#tr-chip-tray-dark)",
    stroke: "rgba(242, 212, 134, 0.48)"
  }));

  ["#e93c55", "#28bd64", "#2a83d8", "#f4a53a", "#8d44d8", "#e93c55", "#28bd64", "#2a83d8"].forEach(function (color, i) {
    const x = 384 + i * 33;
    svg.appendChild(el("circle", { cx: x, cy: 166, r: 11, fill: color, stroke: "#fff", "stroke-width": 1.5 }));
    svg.appendChild(el("circle", { cx: x, cy: 166, r: 5, fill: "rgba(255,255,255,0.22)" }));
  });

  const shoe = el("g", { class: "tr-svg-shoe-drawn" });
  shoe.appendChild(el("polygon", {
    points: "735,122 856,158 816,236 696,202",
    fill: "#dfe5e7",
    stroke: "rgba(0,0,0,0.65)",
    "stroke-width": 3
  }));
  shoe.appendChild(el("polygon", {
    points: "758,146 826,166 805,210 738,190",
    fill: "#e34040",
    opacity: 0.82
  }));
  svg.appendChild(shoe);
}

function buildBetHeaders(svg) {
  [
    ["tr-svg-header-player", 382, 198, "PLAYER"],
    ["tr-svg-header-banker", 618, 198, "BANKER"],
    ["tr-svg-header-tie", 500, 228, "TIE"],
    ["tr-svg-header-small", 452, 244, "SMALL"],
    ["tr-svg-header-big", 548, 244, "BIG"]
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
  const total = FAN_HALF_SPAN * 2;
  const seatSpan = (total - SEAT_GAP * (SEAT_COUNT - 1)) / SEAT_COUNT;

  for (let i = 0; i < SEAT_COUNT; i++) {
    const seatId = i + 1;
    const aStart = -FAN_HALF_SPAN + i * (seatSpan + SEAT_GAP);
    const aEnd = aStart + seatSpan;
    const aMid = (aStart + aEnd) / 2;
    const aPairMid = aStart + seatSpan * 0.5;
    const aMain1 = aStart + seatSpan * 0.36;
    const aMain2 = aEnd - seatSpan * 0.36;

    svg.appendChild(makeZone(
      seatId,
      "playerPair",
      bandPath(BANDS.pairIn, BANDS.pairOut, aStart, aPairMid),
      "P.PAIR",
      midPoint(BANDS.pairIn, BANDS.pairOut, aStart, aPairMid)
    ));
    svg.appendChild(makeZone(
      seatId,
      "bankerPair",
      bandPath(BANDS.pairIn, BANDS.pairOut, aPairMid, aEnd),
      "B.PAIR",
      midPoint(BANDS.pairIn, BANDS.pairOut, aPairMid, aEnd)
    ));
    svg.appendChild(makeZone(
      seatId,
      "player",
      bandPath(BANDS.pairOut, BANDS.mainOut, aStart, aMain1),
      "P",
      midPoint(BANDS.pairOut, BANDS.mainOut, aStart, aMain1),
      "tr-svg-zone--main"
    ));
    svg.appendChild(makeZone(
      seatId,
      "tie",
      bandPath(BANDS.pairOut, BANDS.mainOut, aMain1, aMain2),
      "T",
      midPoint(BANDS.pairOut, BANDS.mainOut, aMain1, aMain2),
      "tr-svg-zone--tie-main"
    ));
    svg.appendChild(makeZone(
      seatId,
      "banker",
      bandPath(BANDS.pairOut, BANDS.mainOut, aMain2, aEnd),
      "B",
      midPoint(BANDS.pairOut, BANDS.mainOut, aMain2, aEnd),
      "tr-svg-zone--main"
    ));
    svg.appendChild(makeZone(
      seatId,
      "luckySix",
      bandPath(BANDS.mainOut, BANDS.luckyOut, aStart, aEnd),
      "LUCKY 6",
      midPoint(BANDS.mainOut, BANDS.luckyOut, aStart, aEnd)
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

function buildFrontRail(svg) {
  ["#e93c55", "#28bd64", "#2a83d8", "#f4a53a", "#8d44d8"].forEach(function (color, i) {
    const p = point(-30 + i * 15, 420);
    svg.appendChild(el("circle", { class: "tr-svg-front-chip", cx: p.x, cy: p.y - 14, r: 14, fill: color, stroke: "#fff", "stroke-width": 1.5 }));
    svg.appendChild(el("text", {
      class: "tr-svg-front-chip-label",
      x: p.x,
      y: p.y - 10,
      "text-anchor": "middle"
    }, i === 0 ? "1K" : i === 1 ? "5K" : i === 2 ? "10K" : i === 3 ? "50K" : "100K"));
  });
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
  buildTableShell(svg);
  buildDealerNpc(svg);
  buildDealerArea(svg);
  buildBetHeaders(svg);
  buildSeatFan(svg);
  buildFrontRail(svg);

  host.appendChild(svg);
}

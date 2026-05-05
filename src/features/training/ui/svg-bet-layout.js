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

function ellipsePath(cx, cy, rx, ry) {
  return [
    "M", cx - rx, cy,
    "A", rx, ry, "0 1 0", cx + rx, cy,
    "A", rx, ry, "0 1 0", cx - rx, cy,
    "Z"
  ].join(" ");
}

function buildTableShell(svg) {
  svg.appendChild(el("path", {
    class: "tr-svg-leather",
    d: ellipsePath(500, 318, 492, 250),
    fill: "url(#tr-black-leather)"
  }));
  svg.appendChild(el("path", {
    class: "tr-svg-wood",
    d: ellipsePath(500, 310, 452, 214),
    fill: "url(#tr-wood-rail)"
  }));
  svg.appendChild(el("path", {
    class: "tr-svg-felt",
    d: ellipsePath(500, 302, 398, 172),
    fill: "url(#tr-felt-casino)"
  }));

  [
    { y: 214, bend: -46 },
    { y: 404, bend: 42 }
  ].forEach(function (slot) {
    svg.appendChild(el("path", {
      class: "tr-svg-rail-slot",
      d: "M 108 " + slot.y + " Q 500 " + (slot.y + slot.bend) + " 892 " + slot.y,
      fill: "none",
      stroke: "rgba(15, 8, 4, 0.84)",
      "stroke-width": 20,
      "stroke-linecap": "round"
    }));
    svg.appendChild(el("path", {
      class: "tr-svg-rail-slot-hi",
      d: "M 116 " + slot.y + " Q 500 " + (slot.y + slot.bend * 0.86) + " 884 " + slot.y,
      fill: "none",
      stroke: "rgba(230, 145, 45, 0.5)",
      "stroke-width": 3,
      "stroke-linecap": "round"
    }));
  });

  [92, 208, 792, 908].forEach(function (x) {
    svg.appendChild(el("circle", {
      class: "tr-svg-rail-light",
      cx: x, cy: 334, r: 18,
      fill: "#f4b530",
      stroke: "rgba(0,0,0,0.62)",
      "stroke-width": 4
    }));
  });
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
  buildDealerArea(svg);
  buildBetHeaders(svg);
  buildSeatFan(svg);
  buildFrontRail(svg);

  host.appendChild(svg);
}

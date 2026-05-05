/**
 * svg-bet-layout.js - SVG baccarat table layout.
 *
 * The game renderer talks to elements through data-seat/data-zone and the
 * .tr-zone-bet-amt/.tr-zone-payout text nodes, so this file owns only the
 * casino table drawing and hit zones.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

const VIEW = { w: 1000, h: 560 };
const TABLE = { cx: 500, cy: 300, rx: 486, ry: 250 };
const ZONE_TOP = 190;
const ZONE_LEFT = 170;
const SEAT_W = 132;
const SEAT_GAP = 8;

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
    for (const k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined) continue;
      node.setAttribute(k, attrs[k]);
    }
  }
  if (text !== undefined) node.textContent = text;
  return node;
}

function polygon(points) {
  return points.map(function (p) {
    return p[0].toFixed(1) + "," + p[1].toFixed(1);
  }).join(" ");
}

function makeZone(seatId, zone, points, label, labelPos, labelClass) {
  const cls = "tr-matrix-cell tr-svg-zone tr-zone--" + ZONE_KEY[zone] + (labelClass ? " " + labelClass : "");
  const g = el("g", { class: cls, "data-seat": String(seatId), "data-zone": zone });
  g.appendChild(el("polygon", { points: polygon(points), class: "tr-svg-zone__shape" }));
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

  const felt = el("radialGradient", { id: "tr-felt-blue", cx: "50%", cy: "46%", r: "78%" });
  felt.appendChild(el("stop", { offset: "0%", "stop-color": "#2bb4e5" }));
  felt.appendChild(el("stop", { offset: "54%", "stop-color": "#1689c8" }));
  felt.appendChild(el("stop", { offset: "100%", "stop-color": "#096094" }));
  defs.appendChild(felt);

  const wood = el("linearGradient", { id: "tr-wood-rail", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  wood.appendChild(el("stop", { offset: "0%", "stop-color": "#b66b25" }));
  wood.appendChild(el("stop", { offset: "45%", "stop-color": "#6a3615" }));
  wood.appendChild(el("stop", { offset: "100%", "stop-color": "#2d1609" }));
  defs.appendChild(wood);

  const leather = el("linearGradient", { id: "tr-black-leather", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  leather.appendChild(el("stop", { offset: "0%", "stop-color": "#2a2b31" }));
  leather.appendChild(el("stop", { offset: "52%", "stop-color": "#111217" }));
  leather.appendChild(el("stop", { offset: "100%", "stop-color": "#050507" }));
  defs.appendChild(leather);

  const tray = el("linearGradient", { id: "tr-chip-tray-dark", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  tray.appendChild(el("stop", { offset: "0%", "stop-color": "#2f2018" }));
  tray.appendChild(el("stop", { offset: "100%", "stop-color": "#0b0705" }));
  defs.appendChild(tray);

  return defs;
}

function buildTableShell(svg) {
  svg.appendChild(el("ellipse", {
    class: "tr-svg-leather",
    cx: TABLE.cx, cy: TABLE.cy, rx: TABLE.rx, ry: TABLE.ry,
    fill: "url(#tr-black-leather)"
  }));
  svg.appendChild(el("ellipse", {
    class: "tr-svg-wood",
    cx: TABLE.cx, cy: TABLE.cy - 4, rx: 452, ry: 218,
    fill: "url(#tr-wood-rail)"
  }));
  svg.appendChild(el("ellipse", {
    class: "tr-svg-felt",
    cx: TABLE.cx, cy: TABLE.cy - 8, rx: 405, ry: 174,
    fill: "url(#tr-felt-blue)"
  }));

  const slotY = [168, 392];
  slotY.forEach(function (y) {
    svg.appendChild(el("path", {
      class: "tr-svg-rail-slot",
      d: "M 116 " + y + " Q 500 " + (y + (y < 280 ? -58 : 58)) + " 884 " + y,
      fill: "none",
      stroke: "rgba(14, 10, 6, 0.82)",
      "stroke-width": 20,
      "stroke-linecap": "round"
    }));
    svg.appendChild(el("path", {
      class: "tr-svg-rail-slot-hi",
      d: "M 124 " + y + " Q 500 " + (y + (y < 280 ? -50 : 50)) + " 876 " + y,
      fill: "none",
      stroke: "rgba(224, 141, 49, 0.48)",
      "stroke-width": 3,
      "stroke-linecap": "round"
    }));
  });

  [104, 210, 790, 896].forEach(function (x) {
    svg.appendChild(el("circle", {
      class: "tr-svg-rail-light",
      cx: x, cy: x < 500 ? 308 : 308, r: 18,
      fill: "#f2b532",
      stroke: "rgba(0,0,0,0.6)",
      "stroke-width": 4
    }));
  });
}

function buildDealerArea(svg) {
  svg.appendChild(el("text", {
    class: "tr-svg-brand",
    x: 500, y: 118,
    "text-anchor": "middle",
    "dominant-baseline": "middle"
  }, "BACCARIST"));

  svg.appendChild(el("rect", {
    class: "tr-svg-chip-tray",
    x: 368, y: 128, width: 264, height: 30, rx: 10,
    fill: "url(#tr-chip-tray-dark)",
    stroke: "rgba(242, 212, 134, 0.42)"
  }));

  const colors = ["#e93c55", "#28bd64", "#2a83d8", "#f4a53a", "#8d44d8", "#e93c55", "#28bd64", "#2a83d8"];
  colors.forEach(function (color, i) {
    const x = 390 + i * 31;
    svg.appendChild(el("circle", { cx: x, cy: 144, r: 11, fill: color, stroke: "#fff", "stroke-width": 1.5 }));
    svg.appendChild(el("circle", { cx: x, cy: 144, r: 5, fill: "rgba(255,255,255,0.22)" }));
  });

  svg.appendChild(el("g", { class: "tr-svg-shoe-drawn" }));
  const shoe = svg.lastChild;
  shoe.appendChild(el("polygon", {
    points: polygon([[730, 106], [835, 130], [808, 205], [704, 178]]),
    fill: "#dfe5e7",
    stroke: "rgba(0,0,0,0.65)",
    "stroke-width": 3
  }));
  shoe.appendChild(el("polygon", {
    points: polygon([[750, 124], [813, 138], [798, 176], [735, 162]]),
    fill: "#e34040",
    opacity: 0.8
  }));
}

function buildBetHeader(svg) {
  svg.appendChild(el("text", {
    class: "tr-svg-header-player",
    x: 382, y: 178,
    "text-anchor": "middle"
  }, "PLAYER"));
  svg.appendChild(el("text", {
    class: "tr-svg-header-banker",
    x: 618, y: 178,
    "text-anchor": "middle"
  }, "BANKER"));
  svg.appendChild(el("text", {
    class: "tr-svg-header-tie",
    x: 500, y: 222,
    "text-anchor": "middle"
  }, "TIE"));
}

function buildSeatGrid(svg) {
  for (let i = 0; i < 5; i++) {
    const seatId = i + 1;
    const x = ZONE_LEFT + i * (SEAT_W + SEAT_GAP);
    const skew = (i - 2) * 11;
    const topL = x + skew;
    const topR = x + SEAT_W + skew;
    const botL = x - skew * 0.42;
    const botR = x + SEAT_W - skew * 0.42;
    const midX = (topL + topR + botL + botR) / 4;

    svg.appendChild(makeZone(seatId, "playerPair", [
      [topL, ZONE_TOP], [midX, ZONE_TOP + 10], [midX - 4, ZONE_TOP + 76], [topL - 10, ZONE_TOP + 68]
    ], "P PAIR", { x: (topL + midX) / 2 - 4, y: ZONE_TOP + 38 }));

    svg.appendChild(makeZone(seatId, "bankerPair", [
      [midX, ZONE_TOP + 10], [topR, ZONE_TOP], [topR + 10, ZONE_TOP + 68], [midX + 4, ZONE_TOP + 76]
    ], "B PAIR", { x: (topR + midX) / 2 + 4, y: ZONE_TOP + 38 }));

    svg.appendChild(makeZone(seatId, "player", [
      [topL - 10, ZONE_TOP + 68], [midX - 4, ZONE_TOP + 76], [midX - 16, ZONE_TOP + 182], [botL, ZONE_TOP + 162]
    ], "P", { x: (topL + botL + midX) / 3 - 10, y: ZONE_TOP + 124 }, "tr-svg-zone--main"));

    svg.appendChild(makeZone(seatId, "tie", [
      [midX - 4, ZONE_TOP + 76], [midX + 4, ZONE_TOP + 76], [midX + 16, ZONE_TOP + 182], [midX - 16, ZONE_TOP + 182]
    ], "TIE", { x: midX, y: ZONE_TOP + 126 }, "tr-svg-zone--tie-main"));

    svg.appendChild(makeZone(seatId, "banker", [
      [midX + 4, ZONE_TOP + 76], [topR + 10, ZONE_TOP + 68], [botR, ZONE_TOP + 162], [midX + 16, ZONE_TOP + 182]
    ], "B", { x: (topR + botR + midX) / 3 + 10, y: ZONE_TOP + 124 }, "tr-svg-zone--main"));

    svg.appendChild(makeZone(seatId, "luckySix", [
      [botL, ZONE_TOP + 162], [midX - 16, ZONE_TOP + 182], [midX + 16, ZONE_TOP + 182], [botR, ZONE_TOP + 162],
      [botR - 10, ZONE_TOP + 204], [botL + 10, ZONE_TOP + 204]
    ], "LUCKY 6", { x: midX, y: ZONE_TOP + 191 }));

    svg.appendChild(el("text", {
      class: "tr-svg-seat-num",
      x: midX.toFixed(1), y: 444,
      "text-anchor": "middle",
      "dominant-baseline": "middle"
    }, "Seat " + seatId));
  }
}

function buildFrontRail(svg) {
  const colors = ["#e93c55", "#28bd64", "#2a83d8", "#f4a53a", "#8d44d8"];
  colors.forEach(function (color, i) {
    const x = 330 + i * 85;
    svg.appendChild(el("circle", { class: "tr-svg-front-chip", cx: x, cy: 456, r: 14, fill: color, stroke: "#fff", "stroke-width": 1.5 }));
    svg.appendChild(el("text", {
      class: "tr-svg-front-chip-label",
      x: x, y: 460,
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
  buildBetHeader(svg);
  buildSeatGrid(svg);
  buildFrontRail(svg);

  host.appendChild(svg);
}

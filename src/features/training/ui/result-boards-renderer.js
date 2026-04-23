// result-boards-renderer.js — renders baccarat roadmap boards from session log.
// Pure canvas renderer: no state mutation, no event handling, no engine calls.

export const ROAD_CONFIG = Object.freeze({
  CELL: 12,
  DERIVED_CELL: 8,
  ROWS: 6,
  PADDING: 2,
  BANKER_COLOR: '#3b82f6',
  PLAYER_COLOR: '#ef4444',
  TIE_COLOR: '#22c55e',
  REPEAT_COLOR: '#ef4444',
  NONREP_COLOR: '#3b82f6',
  PAIR_P_COLOR: '#ef4444',
  PAIR_B_COLOR: '#3b82f6'
});

function orderedLog(log) {
  return Array.isArray(log) ? log.slice().reverse() : [];
}

function outcomeColor(outcome) {
  if (outcome === 'banker') return ROAD_CONFIG.BANKER_COLOR;
  if (outcome === 'player') return ROAD_CONFIG.PLAYER_COLOR;
  return ROAD_CONFIG.TIE_COLOR;
}

function sizeCanvas(canvas, width, height) {
  const w = Math.max(1, Math.ceil(width));
  const h = Math.max(1, Math.ceil(height));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  return ctx;
}

function drawPairDots(ctx, cell, x, y, cellSize) {
  const dotR = 2;
  if (cell.pPair) {
    ctx.beginPath();
    ctx.arc(x + cellSize - 3, y + 3, dotR, 0, Math.PI * 2);
    ctx.fillStyle = ROAD_CONFIG.PAIR_P_COLOR;
    ctx.fill();
  }
  if (cell.bPair) {
    ctx.beginPath();
    ctx.arc(x + cellSize - 3, y + cellSize - 3, dotR, 0, Math.PI * 2);
    ctx.fillStyle = ROAD_CONFIG.PAIR_B_COLOR;
    ctx.fill();
  }
}

function appendColumnar(cells, payload, cellIndex) {
  return cells.concat(Object.assign({}, payload, {
    col: Math.floor(cellIndex / ROAD_CONFIG.ROWS),
    row: cellIndex % ROAD_CONFIG.ROWS
  }));
}

export function buildBeadRoadData(log) {
  return orderedLog(log).map(function (entry, i) {
    return {
      col: Math.floor(i / ROAD_CONFIG.ROWS),
      row: i % ROAD_CONFIG.ROWS,
      outcome: entry.winner,
      pPair: Boolean(entry.pPair),
      bPair: Boolean(entry.bPair),
      luckySix: entry.luckySix || null
    };
  });
}

export function renderBeadRoad(canvas, data) {
  if (!canvas) return;
  const cfg = ROAD_CONFIG;
  const maxCol = data.length ? data.reduce(function (m, c) { return Math.max(m, c.col); }, 0) : 5;
  const ctx = sizeCanvas(canvas, (maxCol + 1) * cfg.CELL, cfg.ROWS * cfg.CELL);

  data.forEach(function (cell) {
    const x = cell.col * cfg.CELL;
    const y = cell.row * cfg.CELL;
    const r = (cfg.CELL - cfg.PADDING * 2) / 2;
    const cx = x + cfg.CELL / 2;
    const cy = y + cfg.CELL / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = outcomeColor(cell.outcome);
    ctx.fill();
    drawPairDots(ctx, cell, x, y, cfg.CELL);
  });
}

export function buildBigRoadData(log) {
  const cells = [];
  let col = 0;
  let row = 0;
  let lastOutcome = null;
  let lastNonTieCell = null;

  orderedLog(log).forEach(function (entry) {
    if (entry.winner === 'tie') {
      if (lastNonTieCell) {
        cells.push({
          col: lastNonTieCell.col,
          row: lastNonTieCell.row,
          outcome: 'tie',
          pPair: Boolean(entry.pPair),
          bPair: Boolean(entry.bPair),
          luckySix: entry.luckySix || null,
          isTieMark: true
        });
      }
      return;
    }

    if (lastOutcome === null) {
      col = 0;
      row = 0;
    } else if (entry.winner === lastOutcome) {
      if (row < ROAD_CONFIG.ROWS - 1) row += 1;
      else col += 1;
    } else {
      col += 1;
      row = 0;
    }

    lastOutcome = entry.winner;
    lastNonTieCell = {
      col,
      row,
      outcome: entry.winner,
      pPair: Boolean(entry.pPair),
      bPair: Boolean(entry.bPair),
      luckySix: entry.luckySix || null,
      isTieMark: false
    };
    cells.push(lastNonTieCell);
  });

  return cells;
}

export function renderBigRoad(canvas, data) {
  if (!canvas) return;
  const cfg = ROAD_CONFIG;
  const maxCol = data.length ? data.reduce(function (m, c) { return Math.max(m, c.col); }, 0) : 5;
  const ctx = sizeCanvas(canvas, (maxCol + 1) * cfg.CELL, cfg.ROWS * cfg.CELL);

  data.forEach(function (cell) {
    const x = cell.col * cfg.CELL;
    const y = cell.row * cfg.CELL;
    const r = (cfg.CELL - cfg.PADDING * 2) / 2;
    const cx = x + cfg.CELL / 2;
    const cy = y + cfg.CELL / 2;

    if (cell.isTieMark) {
      ctx.beginPath();
      ctx.moveTo(x + cfg.PADDING, y + cfg.PADDING);
      ctx.lineTo(x + cfg.CELL - cfg.PADDING, y + cfg.CELL - cfg.PADDING);
      ctx.strokeStyle = cfg.TIE_COLOR;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawPairDots(ctx, cell, x, y, cfg.CELL);
      return;
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = outcomeColor(cell.outcome);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawPairDots(ctx, cell, x, y, cfg.CELL);
  });
}

function columnCells(nonTie) {
  return nonTie.reduce(function (map, cell) {
    if (!map.has(cell.col)) map.set(cell.col, []);
    map.get(cell.col).push(cell);
    return map;
  }, new Map());
}

function countAtRow(cells, row) {
  return (cells || []).filter(function (cell) {
    return cell.row <= row;
  }).length;
}

function buildDerivedRoadData(bigRoadData, compareOffset) {
  const nonTie = bigRoadData.filter(function (cell) { return !cell.isTieMark; });
  if (!nonTie.length) return [];

  const byCol = columnCells(nonTie);
  const maxCol = nonTie.reduce(function (m, cell) { return Math.max(m, cell.col); }, 0);
  if (maxCol < compareOffset) return [];

  let derived = [];
  nonTie.forEach(function (cell) {
    if (cell.col < compareOffset) return;
    const currentDepthAtRow = countAtRow(byCol.get(cell.col), cell.row);
    const referenceDepth = (byCol.get(cell.col - compareOffset) || []).length;
    derived = appendColumnar(derived, {
      repeat: currentDepthAtRow === referenceDepth
    }, derived.length);
  });

  return derived;
}

export function buildBigEyeBoyData(bigRoadData) {
  return buildDerivedRoadData(bigRoadData, 1);
}

export function buildSmallRoadData(bigRoadData) {
  return buildDerivedRoadData(bigRoadData, 2);
}

export function buildCockroachRoadData(bigRoadData) {
  return buildDerivedRoadData(bigRoadData, 3);
}

export function renderDerivedRoad(canvas, data) {
  if (!canvas) return;
  const cell = ROAD_CONFIG.DERIVED_CELL;
  const maxCol = data.length ? data.reduce(function (m, c) { return Math.max(m, c.col); }, 0) : 5;
  const ctx = sizeCanvas(canvas, (maxCol + 1) * cell, ROAD_CONFIG.ROWS * cell);

  data.forEach(function (roadCell) {
    const cx = roadCell.col * cell + cell / 2;
    const cy = roadCell.row * cell + cell / 2;
    const r = cell / 2 - 1;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = roadCell.repeat ? ROAD_CONFIG.REPEAT_COLOR : ROAD_CONFIG.NONREP_COLOR;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

export function renderAllRoads(canvasEls, log) {
  if (!canvasEls) return;
  const beadData = buildBeadRoadData(log || []);
  const bigData = buildBigRoadData(log || []);
  const eyeData = buildBigEyeBoyData(bigData);
  const smallData = buildSmallRoadData(bigData);

  renderBeadRoad(canvasEls.bead, beadData);
  renderBigRoad(canvasEls.bigRoad, bigData);
  renderDerivedRoad(canvasEls.bigEye, eyeData);
  renderDerivedRoad(canvasEls.smallRoad, smallData);
}

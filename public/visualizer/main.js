// ─── Geometry ────────────────────────────────────────────────────────────────

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ─── State ───────────────────────────────────────────────────────────────────

const DRONE_COLORS = ['#378ADD', '#1D9E75', '#D85A30', '#D4537E', '#7F77DD', '#BA7517'];

let sourcePos = { x: 0, y: 5 };

let drones = [
  { idx: 0, x: 2,  y: 2, rate: 4.0 },
  { idx: 1, x: 6,  y: 3, rate: 3.9 },
  { idx: 2, x: 11, y: 2, rate: 3.8 },
  { idx: 3, x: 17, y: 3, rate: 3.7 },
  { idx: 4, x: 24, y: 2, rate: 3.6 },
  { idx: 5, x: 32, y: 1, rate: 3.5 },
];

let pickerIdx = 0;
let blocks    = [];
let xMax      = 50;
let targetX   = 30;
let showRaw      = true;
let showExchange = false;
let showKinks    = true;

let mapView  = null;
let costView = null;
let defaultCostYMax = 200;

// ─── Cost functions ───────────────────────────────────────────────────────────

function pickerCost(drone, qx) {
  return drone.rate * (dist({ x: drone.x, y: drone.y }, sourcePos) + dist(sourcePos, { x: qx, y: 0 }));
}

function rawCost(drone, qx) {
  return drone.rate * dist({ x: drone.x, y: drone.y }, { x: qx, y: 0 });
}

// ─── Algorithm ────────────────────────────────────────────────────────────────

function bisectRoot(eqn, lo, hi, tol = 1e-9, iters = 60) {
  const flo = eqn(lo), fhi = eqn(hi);
  if ((flo > 0 && fhi > 0) || (flo < 0 && fhi < 0)) return null;
  let a = lo, b = hi;
  for (let i = 0; i < iters; i++) {
    const m = (a + b) / 2;
    const fm = eqn(m);
    if (Math.abs(fm) < tol) return m;
    if ((flo < 0) ^ (fm < 0)) b = m; else a = m;
  }
  return (a + b) / 2;
}

/** Closed form when parent block j ≠ P: f'_j = r(j) constant. */
function exchangePointNonPicker(rI, rJ, a, b) {
  if (rI === rJ) return null;
  const delta = rI - rJ;
  const radicand = (rI * rI) / (delta * delta) - 1;
  if (radicand <= 0) return null;
  return a - Math.abs(b) / Math.sqrt(radicand);
}

/** Parent is picker: f'_P(e) = r(P)·(e−s_x)/‖e−s‖ plus drone-i leg. */
function exchangePointPicker(rP, rI, a, b) {
  const sx = sourcePos.x, sy = sourcePos.y;
  function eqn(e) {
    const dSource = Math.hypot(e - sx, sy);
    const dDrone  = Math.hypot(e - a, b);
    if (dSource < 1e-12 || dDrone < 1e-12) return NaN;
    return rP * (e - sx) / dSource + rI * (e - a) / dDrone - rI;
  }
  const lo = Math.min(a, sx) - 500;
  const hi = Math.max(a, sx) + 500;
  return bisectRoot(eqn, lo, hi);
}

function computeExchangePoint(block, droneI, pIdx) {
  const { rate: rI, x: a, y: b } = droneI;
  if (block.droneIdx === pIdx) {
    return exchangePointPicker(drones[pIdx].rate, rI, a, b);
  }
  const rJ = drones[block.droneIdx].rate;
  return exchangePointNonPicker(rI, rJ, a, b);
}

function tangentB(block, droneI, e) {
  const dSe = dist({ x: droneI.x, y: droneI.y }, { x: e, y: 0 });
  const fe  = block.fn(e);
  const rI  = droneI.rate;
  return x => fe + rI * (dSe + (x - e));
}

function findCrossover(fi, fj, Lj, Rj) {
  function g(x) { return fi(x) - fj(x); }
  const gL = g(Lj);
  if (Math.abs(gL) < 1e-9) return Lj;

  let effR = Rj;
  if (Rj === Infinity) {
    effR = Math.max(Lj + 1, 1);
    while (g(effR) >= 0 && effR < 1e5) effR *= 2;
    if (effR >= 1e5) return Infinity;
  } else {
    const gR = g(effR);
    if (gL * gR > 0) return gL < 0 ? Lj : effR;
  }

  let a = Lj, b = effR;
  const gaSign = g(a) < 0;
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    const gm = g(m);
    if (Math.abs(gm) < 1e-9) return m;
    if (gaSign ^ (gm < 0)) b = m; else a = m;
  }
  return (a + b) / 2;
}

function computeBlockList(pIdx) {
  const P  = drones[pIdx];
  const fP = x => pickerCost(P, x);
  const blks = [{
    droneIdx: P.idx, L: 0, R: Infinity,
    parentIdx: null, parentEx: null, fn: fP,
    yIntercept: fP(0),
  }];

  for (let i = pIdx + 1; i < drones.length; i++) {
    const D = drones[i];

    let bestFn = null, bestE = null, bestParentIdx = null, bestB0 = Infinity;
    for (const blk of blks) {
      const e = computeExchangePoint(blk, D, pIdx);
      if (e === null) continue;
      const B = tangentB(blk, D, e);
      const b0 = B(0);
      if (b0 < bestB0) {
        bestB0 = b0; bestFn = B; bestE = e; bestParentIdx = blk.droneIdx;
      }
    }
    if (bestFn === null) continue;

    while (blks.length > 0) {
      const top = blks[blks.length - 1];
      if (bestFn(top.L) <= top.fn(top.L)) blks.pop();
      else break;
    }

    const newBlock = {
      droneIdx: D.idx, L: 0, R: Infinity,
      parentIdx: bestParentIdx, parentEx: bestE, fn: bestFn,
      yIntercept: bestFn(0),
    };

    if (blks.length === 0) {
      blks.push(newBlock);
      continue;
    }

    const top = blks[blks.length - 1];
    const Li  = findCrossover(bestFn, top.fn, top.L, top.R);
    blks[blks.length - 1] = { ...top, R: Li };
    newBlock.L = Li;
    blks.push(newBlock);
  }
  return blks;
}

function envelopeCost(x, blks) {
  for (const b of blks) {
    if (x >= b.L && (b.R === Infinity || x < b.R)) return b.fn(x);
  }
  if (blks.length) return blks[blks.length - 1].fn(x);
  return Infinity;
}

function getBlockAtX(x, blks) {
  return blks.find(b => x >= b.L && (b.R === Infinity || x < b.R)) ?? null;
}

function blockAtTarget(x, blks) {
  const block = getBlockAtX(x, blks);
  const index = block ? blks.indexOf(block) : -1;
  return { block, index };
}

function formatOptimalBlockSummary(block, index) {
  if (!block || index < 0) return 'none';
  return `Block ${index} · D${block.droneIdx} · ${formatBlockRange(block.L, block.R)}`;
}

function targetAnalysis(x, blks, pIdx = pickerIdx) {
  const { block, index } = blockAtTarget(x, blks);
  const route = optimalRouteContext(x, blks, pIdx);
  const cmp = costComparisonAtTarget(x, blks);
  return { block, blockIndex: index, route, cmp, pickerIdx: pIdx };
}

function pickerOptionAtTarget(x, pIdx) {
  const blks = computeBlockList(pIdx);
  const cost = envelopeCost(x, blks);
  const { block, index } = blockAtTarget(x, blks);
  const seq = sequenceAtTarget(x, blks, pIdx);
  return { pickerIdx: pIdx, blocks: blks, cost, block, blockIndex: index, seq };
}

/** Min collaborative cost at x over all n picker choices (each induces its own block list). */
function globalOptimumAtTarget(x) {
  const all = [];
  let best = null;
  for (let p = 0; p < drones.length; p++) {
    const opt = pickerOptionAtTarget(x, p);
    all.push(opt);
    if (
      best === null
      || opt.cost < best.cost - 1e-9
      || (Math.abs(opt.cost - best.cost) < 1e-9 && p < best.pickerIdx)
    ) best = opt;
  }
  return { best, all };
}

function costComparisonAtTarget(x, blks) {
  const collab = envelopeCost(x, blks);
  let bestRaw = Infinity, bestDroneIdx = null;
  for (const d of drones) {
    const rc = rawCost(d, x);
    if (rc < bestRaw) { bestRaw = rc; bestDroneIdx = d.idx; }
  }
  const savings = bestRaw - collab;
  const pct = bestRaw > 0 ? (savings / bestRaw) * 100 : 0;
  const owner = getBlockAtX(x, blks);
  return { collab, bestRaw, bestDroneIdx, savings, pct, ownerDroneIdx: owner?.droneIdx ?? null };
}

/** Optimal drone chain S_P(x): picker first, last carrier delivers at x. */
function sequenceAtTarget(x, blks, pIdx = pickerIdx) {
  const b = getBlockAtX(x, blks);
  if (!b) return [{ droneIdx: pIdx, exchange: x }];
  const seq = [{ droneIdx: b.droneIdx, exchange: x }];
  let cur = b;
  while (cur.parentIdx !== null) {
    seq.unshift({ droneIdx: cur.parentIdx, exchange: cur.parentEx });
    const parentBlk = blks.find(blk => blk.droneIdx === cur.parentIdx);
    if (!parentBlk) break;
    cur = parentBlk;
  }
  return seq;
}

function formatBlockRange(L, R) {
  const l = L.toFixed(1);
  const r = R === Infinity ? '∞' : R.toFixed(1);
  return `[${l}, ${r})`;
}

function formatSequence(seq, compact = false) {
  if (!seq.length) return '—';
  if (compact) return seq.map(s => `D${s.droneIdx}`).join(' → ');
  return seq.map((s, i) => {
    const isLast = i === seq.length - 1;
    const ex = isLast && s.exchange !== null ? `@${s.exchange.toFixed(1)}` : '';
    return `D${s.droneIdx}${ex}`;
  }).join(' → ');
}

function blockOwnerLabel(b) {
  if (b.parentIdx === null) return `D${b.droneIdx} (picker)`;
  return `D${b.droneIdx} ← D${b.parentIdx}`;
}

function optimalRouteContext(x, blks, pIdx = pickerIdx) {
  const seq = sequenceAtTarget(x, blks, pIdx);
  const droneSet = new Set(seq.map(s => s.droneIdx));
  const lastCarrier = seq.length ? seq[seq.length - 1].droneIdx : null;
  const owner = getBlockAtX(x, blks);
  return { seq, droneSet, lastCarrier, owner, pickerIdx: pIdx };
}

function drawOptimalRouteToTarget(routeCtx) {
  const { seq, lastCarrier, pickerIdx: pIdx } = routeCtx;
  if (!seq.length || lastCarrier === null) return;

  const tp = worldToMap(targetX, 0);
  const sp = worldToMap(sourcePos.x, sourcePos.y);
  const p0 = worldToMap(0, 0);
  const ownerColor = DRONE_COLORS[lastCarrier % DRONE_COLORS.length];
  const lastDrone = drones[lastCarrier];

  ctx.lineCap = 'round';
  ctx.strokeStyle = hexToRgba(ownerColor, 0.7);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p0.px, p0.py);
  ctx.lineTo(tp.px, tp.py);
  ctx.stroke();

  if (seq[0]?.droneIdx === pIdx) {
    const pp = worldToMap(drones[pIdx].x, drones[pIdx].y);
    const pColor = DRONE_COLORS[pIdx % DRONE_COLORS.length];
    ctx.strokeStyle = hexToRgba(pColor, 0.75);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pp.px, pp.py);
    ctx.lineTo(sp.px, sp.py);
    ctx.lineTo(p0.px, p0.py);
    ctx.stroke();
  }

  if (lastDrone && lastCarrier !== pIdx) {
    const dp = worldToMap(lastDrone.x, lastDrone.y);
    ctx.strokeStyle = hexToRgba(ownerColor, 0.85);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(dp.px, dp.py);
    ctx.lineTo(tp.px, tp.py);
    ctx.stroke();
  }
}

function mapDeliveryLineY() {
  return worldToMap(mapView.xMin, 0).py;
}

function isNearMapDeliveryLine(px, py, margin = 14) {
  const mH = mapH();
  if (py < PAD.t || py > PAD.t + mH - PAD.b) return false;
  if (px < PAD.l || px > VP.W - PAD.r) return false;
  return Math.abs(py - mapDeliveryLineY()) <= margin;
}

// ─── Canvas setup ─────────────────────────────────────────────────────────────

const canvas = document.getElementById('main-canvas');
const ctx    = canvas.getContext('2d');
const wrap   = document.getElementById('canvas-container');
let VP = { W: 800, H: 600 };

const MAP_FRAC = 0.35;
const PAD = { l: 52, r: 20, t: 14, b: 24 };

function mapH()  { return Math.floor(VP.H * MAP_FRAC); }
function costH() { return VP.H - mapH(); }
function costY0(){ return mapH(); }

function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const { W, H } = VP;
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function computeMapDataBounds() {
  let maxX = xMax + 4;
  let maxY = Math.max(sourcePos.y + 2, 8);
  let minY = -1;
  for (const d of drones) {
    maxX = Math.max(maxX, d.x + 4);
    maxY = Math.max(maxY, d.y + 2);
    minY = Math.min(minY, d.y - 1);
  }
  return { xMin: -3, xMax: maxX, yMin: Math.min(-1, minY), yMax: maxY };
}

function mapDragBounds() {
  const b = computeMapDataBounds();
  return {
    xMin: -3,
    xMax: Math.max(xMax + 8, b.xMax + 4),
    yMin: 0,
    yMax: Math.max(12, b.yMax + 2),
  };
}

function resetMapView() {
  mapView = computeMapDataBounds();
}

function resetCostView(yMax) {
  defaultCostYMax = yMax;
  const yPad = yMax * 0.1 || 10;
  costView = { xMin: -xMax * 0.05, xMax: xMax * 1.05, yMin: -yPad, yMax: yMax + yPad };
}

function zoomViewAround(view, wx, wy, factor, { minXSpan, minYSpan, maxXSpan = Infinity, maxYSpan = Infinity }) {
  let xMin = wx - (wx - view.xMin) * factor;
  let xMax = wx + (view.xMax - wx) * factor;
  let yMin = wy - (wy - view.yMin) * factor;
  let yMax = wy + (view.yMax - wy) * factor;

  let xSpan = xMax - xMin;
  if (xSpan < minXSpan) {
    const cx = (xMin + xMax) / 2;
    xMin = cx - minXSpan / 2;
    xMax = cx + minXSpan / 2;
    xSpan = minXSpan;
  }
  if (Number.isFinite(maxXSpan) && xSpan > maxXSpan) {
    const cx = (xMin + xMax) / 2;
    xMin = cx - maxXSpan / 2;
    xMax = cx + maxXSpan / 2;
  }

  let ySpan = yMax - yMin;
  if (ySpan < minYSpan) {
    const cy = (yMin + yMax) / 2;
    yMin = cy - minYSpan / 2;
    yMax = cy + minYSpan / 2;
    ySpan = minYSpan;
  }
  if (Number.isFinite(maxYSpan) && ySpan > maxYSpan) {
    const cy = (yMin + yMax) / 2;
    yMin = cy - maxYSpan / 2;
    yMax = cy + maxYSpan / 2;
  }

  view.xMin = xMin;
  view.xMax = xMax;
  view.yMin = yMin;
  view.yMax = yMax;
}

function panMapView(dpx, dpy) {
  const pW = VP.W - PAD.l - PAD.r;
  const pH = mapH() - PAD.t - PAD.b;
  const xSpan = mapView.xMax - mapView.xMin;
  const ySpan = mapView.yMax - mapView.yMin;
  mapView.xMin -= dpx / pW * xSpan;
  mapView.xMax -= dpx / pW * xSpan;
  mapView.yMin += dpy / pH * ySpan;
  mapView.yMax += dpy / pH * ySpan;
}

function panCostView(dpx, dpy) {
  const pW = VP.W - PAD.l - PAD.r;
  const pH = costH() - PAD.t - PAD.b;
  const xSpan = costView.xMax - costView.xMin;
  const ySpan = costView.yMax - costView.yMin;
  costView.xMin -= dpx / pW * xSpan;
  costView.xMax -= dpx / pW * xSpan;
  costView.yMin += dpy / pH * ySpan;
  costView.yMax += dpy / pH * ySpan;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Coordinate transforms ────────────────────────────────────────────────────

function worldToMap(wx, wy) {
  const { xMin, xMax, yMin, yMax } = mapView;
  const pW = VP.W - PAD.l - PAD.r;
  const pH = mapH() - PAD.t - PAD.b;
  return {
    px: PAD.l + (wx - xMin) / (xMax - xMin) * pW,
    py: PAD.t + (1 - (wy - yMin) / (yMax - yMin)) * pH,
  };
}

function mapPxToWorld(px, py) {
  const { xMin, xMax, yMin, yMax } = mapView;
  const pW = VP.W - PAD.l - PAD.r;
  const pH = mapH() - PAD.t - PAD.b;
  return {
    x: xMin + (px - PAD.l) / pW * (xMax - xMin),
    y: yMax - (py - PAD.t) / pH * (yMax - yMin),
  };
}

function worldToCost(wx, wy) {
  const { xMin, xMax, yMin, yMax } = costView;
  const pW = VP.W - PAD.l - PAD.r;
  const pH = costH() - PAD.t - PAD.b;
  return {
    px: PAD.l + (wx - xMin) / (xMax - xMin) * pW,
    py: costY0() + PAD.t + (1 - (wy - yMin) / (yMax - yMin)) * pH,
  };
}

function costPxToWorld(px, py) {
  const { xMin, xMax, yMin, yMax } = costView;
  const pW = VP.W - PAD.l - PAD.r;
  const pH = costH() - PAD.t - PAD.b;
  const y0 = costY0();
  return {
    x: xMin + (px - PAD.l) / pW * (xMax - xMin),
    y: yMax - (py - y0 - PAD.t) / pH * (yMax - yMin),
  };
}

// ─── Drawing ─────────────────────────────────────────────────────────────────

function drawGrid(x0, y0, w, h, nX, nY, xLo, xHi, yLo, yHi) {
  const xSpan = xHi - xLo;
  const ySpan = yHi - yLo;
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= nX; i++) {
    const px = x0 + i / nX * w;
    ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y0 + h); ctx.stroke();
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText((xLo + i / nX * xSpan).toFixed(0), px, y0 + h + 14);
    }
  }
  for (let i = 0; i <= nY; i++) {
    const py = y0 + i / nY * h;
    ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x0 + w, py); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText((yHi - i / nY * ySpan).toFixed(0), x0 - 4, py + 3);
  }
}

function drawMapPanel() {
  const mH = mapH();
  const pW = VP.W - PAD.l - PAD.r;
  const pH = mH - PAD.t - PAD.b;
  const global = globalOptimumAtTarget(targetX);
  const viewing = targetAnalysis(targetX, blocks);
  const activeBlock = viewing.block;
  const route = optimalRouteContext(targetX, global.best.blocks, global.best.pickerIdx);

  ctx.fillStyle = 'rgba(0,0,0,0.025)';
  ctx.fillRect(PAD.l, PAD.t, pW, pH);

  drawGrid(PAD.l, PAD.t, pW, pH, 10, 4,
    mapView.xMin, mapView.xMax, mapView.yMin, mapView.yMax);

  const p0 = worldToMap(mapView.xMin, 0), p1 = worldToMap(mapView.xMax, 0);
  const lineY = p0.py;
  const lineH = 6;

  // Block intervals on delivery line
  blocks.forEach(b => {
    const L = Math.max(0, b.L);
    const R = b.R === Infinity ? xMax : Math.min(b.R, xMax);
    if (L > xMax) return;
    const lp = worldToMap(L, 0), rp = worldToMap(R, 0);
    const segW = rp.px - lp.px;
    const color = DRONE_COLORS[b.droneIdx % DRONE_COLORS.length];
    const isActive = activeBlock && activeBlock.droneIdx === b.droneIdx;
    ctx.fillStyle = hexToRgba(color, isActive ? 0.5 : 0.22);
    ctx.fillRect(lp.px, lineY - lineH / 2, segW, lineH);
    if (isActive) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(lp.px, lineY - lineH / 2, segW, lineH);
    }
    if (showKinks && b.L > 0 && b.L <= xMax) {
      const kp = worldToMap(b.L, 0);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(kp.px, lineY - lineH - 2); ctx.lineTo(kp.px, lineY + lineH + 2); ctx.stroke();
    }
  });

  // Delivery line baseline
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(p0.px, p0.py); ctx.lineTo(p1.px, p1.py); ctx.stroke();
  ctx.setLineDash([]);

  drawOptimalRouteToTarget(route);

  if (showExchange) {
    blocks.forEach(b => {
      if (b.parentEx === null || !route.droneSet.has(b.droneIdx)) return;
      const ep = worldToMap(b.parentEx, 0);
      const dp = worldToMap(drones[b.droneIdx].x, drones[b.droneIdx].y);
      ctx.strokeStyle = DRONE_COLORS[b.droneIdx % DRONE_COLORS.length] + '44';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(dp.px, dp.py); ctx.lineTo(ep.px, ep.py); ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  drones.forEach((d, i) => {
    const pt    = worldToMap(d.x, d.y);
    const color = DRONE_COLORS[i % DRONE_COLORS.length];
    const isP   = i === pickerIdx;
    const outOfScope = i < pickerIdx;
    const inRoute = route.droneSet.has(i);
    const delivers = route.lastCarrier === i;
    const radius = delivers ? 8 : inRoute ? 7 : (isP ? 7 : 5);

    if (inRoute) {
      ctx.strokeStyle = delivers ? color : 'rgba(0,0,0,0.2)';
      ctx.lineWidth = delivers ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(pt.px, pt.py, radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (outOfScope) ctx.fillStyle = color + '55';
    else if (!inRoute) ctx.fillStyle = color + '44';
    else ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(pt.px, pt.py, radius, 0, Math.PI * 2); ctx.fill();
    if (isP) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.fillStyle = outOfScope ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.65)';
    ctx.font = `${isP || delivers ? '600 ' : ''}10px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`D${d.idx}`, pt.px, pt.py - (radius + 2));
  });

  const tpt = worldToMap(targetX, 0);
  ctx.fillStyle = '#E24B4A';
  ctx.beginPath(); ctx.arc(tpt.px, tpt.py, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('T', tpt.px, tpt.py);
  ctx.textBaseline = 'alphabetic';
  if (activeBlock && viewing.blockIndex >= 0) {
    const color = DRONE_COLORS[activeBlock.droneIdx % DRONE_COLORS.length];
    ctx.fillStyle = color;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    const viewingLabel = pickerIdx === global.best.pickerIdx
      ? `B${viewing.blockIndex} · D${activeBlock.droneIdx}`
      : `view B${viewing.blockIndex}`;
    ctx.fillText(viewingLabel, tpt.px, tpt.py - 12);
    if (pickerIdx !== global.best.pickerIdx) {
      ctx.fillStyle = '#1D9E75';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`★ P${global.best.pickerIdx}`, tpt.px, tpt.py - 22);
    }
  }

  const spt = worldToMap(sourcePos.x, sourcePos.y);
  ctx.fillStyle = '#E24B4A';
  ctx.beginPath(); ctx.arc(spt.px, spt.py, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('S', spt.px, spt.py);
  ctx.textBaseline = 'alphabetic';
}

function drawCostPanel() {
  const y0 = costY0();
  const cH = costH();
  const pW = VP.W - PAD.l - PAD.r;
  const pH = cH - PAD.t - PAD.b;
  const analysis = targetAnalysis(targetX, blocks);
  const activeBlock = analysis.block;
  const activeBlockIndex = analysis.blockIndex;
  const N = 400;
  const { xMin: cvXMin, xMax: cvXMax, yMin: cvYMin, yMax: cvYMax } = costView;
  const sampleXLo = Math.max(0, cvXMin);
  const sampleXHi = Math.max(sampleXLo + 0.01, cvXMax);

  ctx.fillStyle = 'rgba(0,0,0,0.025)';
  ctx.fillRect(PAD.l, y0 + PAD.t, pW, pH);

  drawGrid(PAD.l, y0 + PAD.t, pW, pH, 10, 5, cvXMin, cvXMax, cvYMin, cvYMax);

  if (showRaw) {
    drones.forEach((d, i) => {
      ctx.strokeStyle = DRONE_COLORS[i % DRONE_COLORS.length] + '40';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      for (let j = 0; j <= N; j++) {
        const x = sampleXLo + (sampleXHi - sampleXLo) * j / N;
        const c = rawCost(d, x);
        const pt = worldToCost(x, Math.min(c, cvYMax));
        j === 0 ? ctx.moveTo(pt.px, pt.py) : ctx.lineTo(pt.px, pt.py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  blocks.forEach((b, bi) => {
    const color = DRONE_COLORS[b.droneIdx % DRONE_COLORS.length];
    const L = Math.max(0, b.L);
    const R = b.R === Infinity ? sampleXHi : Math.min(b.R, sampleXHi);
    if (L > sampleXHi) return;
    const drawL = Math.max(L, sampleXLo);
    const drawR = Math.min(R, sampleXHi);
    if (drawL > drawR) return;
    const isActive = activeBlock && activeBlock.droneIdx === b.droneIdx;
    const isOptimalAtT = bi === activeBlockIndex;

    ctx.strokeStyle = color;
    ctx.lineWidth = isOptimalAtT ? 4.5 : isActive ? 3 : 2;
    const steps = Math.max(2, Math.floor((drawR - drawL) / Math.max(sampleXHi - sampleXLo, 1) * N));
    ctx.beginPath();
    for (let j = 0; j <= steps; j++) {
      const x  = drawL + (drawR - drawL) * j / steps;
      const c  = b.fn(x);
      if (!isFinite(c)) continue;
      const pt = worldToCost(x, Math.min(c, cvYMax));
      j === 0 ? ctx.moveTo(pt.px, pt.py) : ctx.lineTo(pt.px, pt.py);
    }
    ctx.stroke();

    if (showKinks && b.L > 0 && b.L <= xMax && b.L >= cvXMin && b.L <= cvXMax) {
      const kpt = worldToCost(b.L, Math.min(b.fn(b.L), cvYMax));
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(kpt.px, y0 + PAD.t); ctx.lineTo(kpt.px, y0 + PAD.t + pH); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(kpt.px, kpt.py, 3.5, 0, Math.PI * 2); ctx.fill();
    }

    if (showExchange && b.parentEx !== null && b.parentEx >= cvXMin && b.parentEx <= cvXMax) {
      const ec = b.fn(b.parentEx);
      if (isFinite(ec)) {
        const ept = worldToCost(b.parentEx, Math.min(ec, cvYMax));
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        const s = 6;
        ctx.beginPath();
        ctx.moveTo(ept.px - s, ept.py - s); ctx.lineTo(ept.px + s, ept.py + s);
        ctx.moveTo(ept.px + s, ept.py - s); ctx.lineTo(ept.px - s, ept.py + s);
        ctx.stroke();
      }
    }
  });

  if (targetX >= 0 && targetX <= xMax) {
    const tpt = worldToCost(targetX, cvYMin);
    ctx.strokeStyle = 'rgba(226,75,74,0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(tpt.px, y0 + PAD.t); ctx.lineTo(tpt.px, y0 + PAD.t + pH); ctx.stroke();
    ctx.setLineDash([]);

    const tc = envelopeCost(targetX, blocks);
    if (isFinite(tc) && tc <= cvYMax) {
      const tcdot = worldToCost(targetX, tc);
      const dotColor = activeBlock
        ? DRONE_COLORS[activeBlock.droneIdx % DRONE_COLORS.length]
        : '#E24B4A';
      ctx.fillStyle = dotColor;
      ctx.beginPath(); ctx.arc(tcdot.px, tcdot.py, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      const blockLabel = activeBlockIndex >= 0
        ? `B${activeBlockIndex} · D${activeBlock.droneIdx} · `
        : '';
      ctx.fillText(`${blockLabel}cost = ${tc.toFixed(2)}`, tcdot.px + 10, tcdot.py - 4);
    }
  }

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Cost — click/drag to set target', PAD.l + 4, y0 + PAD.t + 12);

  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('delivery position x', PAD.l + pW / 2, y0 + PAD.t + pH + 22);

  let lgX = PAD.l + pW - 6;
  ctx.textAlign = 'right';
  blocks.slice().reverse().forEach((b, revIdx) => {
    const bi = blocks.length - 1 - revIdx;
    const c = DRONE_COLORS[b.droneIdx % DRONE_COLORS.length];
    ctx.fillStyle = c;
    ctx.fillRect(lgX - 24, y0 + PAD.t + 7, 16, 3);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = bi === activeBlockIndex ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)';
    const mark = bi === activeBlockIndex ? '▸ ' : '';
    ctx.fillText(`${mark}B${bi} D${b.droneIdx}`, lgX, y0 + PAD.t + 18);
    lgX -= 52;
  });
}

function computeYMax() {
  let yMax = 0;
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const x = i / N * xMax;
    const c = envelopeCost(x, blocks);
    if (isFinite(c) && c > yMax) yMax = c;
    if (showRaw) {
      drones.forEach(d => {
        const rc = rawCost(d, x);
        if (rc > yMax) yMax = rc;
      });
    }
  }
  return Math.ceil(yMax * 1.1 / 10) * 10 || 200;
}

function draw() {
  setupCanvas();
  const { W, H } = VP;
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  drawMapPanel();

  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, mapH()); ctx.lineTo(W, mapH()); ctx.stroke();

  drawCostPanel();
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function buildSidebar() {
  const el = document.getElementById('entity-list');
  el.innerHTML = '';
  const global = globalOptimumAtTarget(targetX);
  const viewing = targetAnalysis(targetX, blocks);
  const route = viewing.route;
  const activeBlock = viewing.block;
  const activeBlockIndex = viewing.blockIndex;
  const isGlobalPicker = pickerIdx === global.best.pickerIdx;

  const addRow = (color, label, val, opts = {}) => {
    const row = document.createElement('div');
    row.className = 'entity-row' +
      (opts.outOfScope ? ' drone-out-of-scope' : '') +
      (opts.active ? ' block-active' : '') +
      (opts.inRoute ? ' route-to-target' : '') +
      (opts.delivers ? ' route-delivers' : '');
    if (opts.clickable) {
      row.classList.add('block-clickable');
      row.addEventListener('click', opts.onClick);
    }
    row.innerHTML = `<div class="entity-dot" style="background:${color}"></div>
      <span class="entity-label">${label}</span>
      <span class="entity-val">${val}</span>`;
    el.appendChild(row);
    return row;
  };

  addRow('#E24B4A', 'Source S', `(0, ${sourcePos.y.toFixed(1)})`);

  drones.forEach((d, i) => {
    const isP = i === pickerIdx;
    const inRoute = route.droneSet.has(i);
    const delivers = route.lastCarrier === i;
    let tag = isP ? 'picker' : '';
    if (delivers) tag = 'delivers';
    else if (inRoute) tag = 'in route';
    addRow(DRONE_COLORS[i % DRONE_COLORS.length],
      `Drone ${d.idx}${tag ? ` · ${tag}` : ''}`,
      `r=${d.rate}`,
      { outOfScope: i < pickerIdx, inRoute, delivers });
  });

  const hdr = document.createElement('div');
  hdr.className = 'section-hdr';
  hdr.textContent = `Block list · picker D${pickerIdx}${isGlobalPicker ? ' (global min)' : ''}`;
  el.appendChild(hdr);

  if (activeBlock && activeBlockIndex >= 0) {
    const banner = document.createElement('div');
    banner.className = 'optimal-block-banner' + (isGlobalPicker ? ' global-match' : '');
    const blockSummary = formatOptimalBlockSummary(activeBlock, activeBlockIndex);
    banner.innerHTML = isGlobalPicker
      ? `<span class="optimal-badge">Global optimum</span> Picker D${pickerIdx} · ${blockSummary} · cost ${viewing.cmp.collab.toFixed(2)}`
      : `<span class="optimal-badge viewing">Viewing</span> Picker D${pickerIdx} · ${blockSummary} · cost ${viewing.cmp.collab.toFixed(2)}`;
    el.appendChild(banner);
  }

  blocks.forEach((b, i) => {
    const parentStr = b.parentIdx === null
      ? '— (picker)'
      : `Drone ${b.parentIdx}`;
    const exStr = b.parentEx !== null ? `e=${b.parentEx.toFixed(2)}` : '';
    const isOptimalAtT = i === activeBlockIndex;
    const mid = b.R === Infinity ? (b.L + xMax) / 2 : (b.L + Math.min(b.R, xMax)) / 2;

    const blockRow = document.createElement('div');
    blockRow.className = 'block-group' + (isOptimalAtT ? ' block-active block-optimal-at-t' : '');

    const mainRow = document.createElement('div');
    mainRow.className = 'entity-row block-clickable';
    mainRow.innerHTML = `<div class="entity-dot" style="background:${DRONE_COLORS[b.droneIdx % DRONE_COLORS.length]}"></div>
      <span class="entity-label">Block ${i}: D${b.droneIdx}${isOptimalAtT && isGlobalPicker ? ' <span class="optimal-tag">at T</span>' : isOptimalAtT ? ' <span class="optimal-tag viewing">at T</span>' : ''}</span>
      <span class="entity-val">${formatBlockRange(b.L, b.R)}</span>`;
    mainRow.addEventListener('click', () => {
      targetX = Math.max(0, Math.min(xMax, mid));
      refreshTarget();
    });
    blockRow.appendChild(mainRow);

    const detail = document.createElement('div');
    detail.className = 'block-detail';
    detail.textContent = `parent: ${parentStr}${exStr ? `  |  ${exStr}` : ''}`;
    blockRow.appendChild(detail);

    el.appendChild(blockRow);
  });

  updateSidebarStatus();
}

function buildTargetInspection() {
  const el = document.getElementById('target-inspection');
  if (!el) return;

  const global = globalOptimumAtTarget(targetX);
  const viewing = targetAnalysis(targetX, blocks);
  const g = global.best;
  const gSeq = formatSequence(g.seq, true);
  const gBlock = formatOptimalBlockSummary(g.block, g.blockIndex);
  const vSeq = formatSequence(viewing.route.seq, true);
  const isGlobalPicker = pickerIdx === g.pickerIdx;
  const delta = viewing.cmp.collab - g.cost;

  let compareHtml = '';
  if (!isGlobalPicker) {
    compareHtml = `
      <div class="target-line target-viewing">Viewing picker D${pickerIdx}: cost ${viewing.cmp.collab.toFixed(2)} (+${delta.toFixed(2)} vs global)</div>
      <div class="target-line target-viewing">S<sub>P</sub>(T): ${vSeq}</div>
      <button type="button" id="use-optimal-picker-btn" class="action-btn optimal-picker-btn">Use optimal picker D${g.pickerIdx}</button>
    `;
  }

  el.innerHTML = `
    <div class="target-inspection-title">Target T · x = ${targetX.toFixed(1)}</div>
    <div class="target-optimal-block global-optimum">
      <span class="optimal-badge">Global optimum</span>
      <div class="target-optimal-body">
        <div class="target-optimal-val">Picker D${g.pickerIdx} · ${gBlock}</div>
        <div class="target-line">S<sub>P</sub>(T): ${gSeq} · cost <strong>${g.cost.toFixed(2)}</strong></div>
      </div>
    </div>
    ${compareHtml}
  `;

  const btn = document.getElementById('use-optimal-picker-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      pickerIdx = g.pickerIdx;
      document.getElementById('picker-sel').value = String(pickerIdx);
      recompute(false, true);
    });
  }
}

function buildPickerComparison() {
  const el = document.getElementById('picker-comparison');
  if (!el) return;

  const global = globalOptimumAtTarget(targetX);
  const rows = global.all.map(opt => {
    const isBest = opt.pickerIdx === global.best.pickerIdx;
    const isViewing = opt.pickerIdx === pickerIdx;
    const blockStr = opt.blockIndex >= 0
      ? `B${opt.blockIndex}·D${opt.block.droneIdx}`
      : '—';
    const tags = [
      isBest ? '<span class="picker-tag best">min</span>' : '',
      isViewing ? '<span class="picker-tag viewing">view</span>' : '',
    ].filter(Boolean).join(' ');
    return `<tr class="${isBest ? 'picker-row-best' : ''}${isViewing ? ' picker-row-viewing' : ''}">
      <td>D${opt.pickerIdx}${tags ? ' ' + tags : ''}</td>
      <td>${opt.cost.toFixed(2)}</td>
      <td>${blockStr}</td>
      <td>${formatSequence(opt.seq, true)}</td>
    </tr>`;
  }).join('');

  el.innerHTML = `
    <div class="section-hdr">All pickers at T</div>
    <table class="picker-comparison-table">
      <thead><tr><th>P</th><th>cost</th><th>block</th><th>S<sub>P</sub>(T)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function updateSidebarStatus() {
  const el = document.getElementById('sidebar-status');
  if (!el) return;
  const global = globalOptimumAtTarget(targetX);
  const g = global.best;
  const gSeq = formatSequence(g.seq, true);
  const gBlock = formatOptimalBlockSummary(g.block, g.blockIndex);
  if (pickerIdx === g.pickerIdx) {
    el.textContent = `Global min at T: Picker D${g.pickerIdx} · ${gBlock} · cost ${g.cost.toFixed(2)} · ${gSeq}`;
  } else {
    const viewing = targetAnalysis(targetX, blocks);
    el.textContent = `Global min: D${g.pickerIdx} · ${g.cost.toFixed(2)} · viewing D${pickerIdx} · ${viewing.cmp.collab.toFixed(2)}`;
  }
}

function recomputeDuringDrag() {
  blocks = computeBlockList(pickerIdx);
  buildPickerSelect();
  buildSidebar();
  buildTargetInspection();
  buildPickerComparison();
  draw();
}

function recompute(resetMap = false, resetCost = true) {
  blocks = computeBlockList(pickerIdx);
  if (resetMap) resetMapView();
  if (resetCost) resetCostView(computeYMax());
  buildPickerSelect();
  buildSidebar();
  buildTargetInspection();
  buildPickerComparison();
  draw();
}

function refreshTarget() {
  syncTargetSlider();
  buildPickerSelect();
  buildSidebar();
  buildTargetInspection();
  buildPickerComparison();
  draw();
}

function randomizeDrones(n) {
  n = Math.max(2, Math.min(30, Math.round(n)));
  const topRate = 3.5 + Math.random() * 1.5;
  const newDrones = [];
  let rate = topRate;
  for (let i = 0; i < n; i++) {
    const xSpread = Math.max(8, xMax * 0.85);
    const x = 1 + (i + 0.2 + Math.random() * 0.6) / n * xSpread;
    const y = 0.5 + Math.random() * Math.min(7, Math.max(4, topRate));
    newDrones.push({ idx: i, x, y, rate: Math.round(rate * 100) / 100 });
    rate -= 0.03 + Math.random() * 0.12;
    if (rate < 0.5) rate = 0.5;
  }
  newDrones.sort((a, b) => b.rate - a.rate);
  newDrones.forEach((d, i) => { d.idx = i; });
  drones.length = 0;
  drones.push(...newDrones);
  pickerIdx = Math.min(pickerIdx, drones.length - 1);
  targetX = Math.min(targetX, xMax);
}

function buildPickerSelect() {
  const sel = document.getElementById('picker-sel');
  sel.innerHTML = '';
  const global = globalOptimumAtTarget(targetX);
  drones.forEach((d, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    const star = i === global.best.pickerIdx ? ' ★' : '';
    opt.textContent = `Drone ${d.idx}  (r=${d.rate})${star}`;
    if (i === pickerIdx) opt.selected = true;
    sel.appendChild(opt);
  });
}

// ─── Interaction ─────────────────────────────────────────────────────────────

let dragging = null;

function getPanel(py) { return py < mapH() ? 'map' : 'cost'; }

function mapHitRadiusPx() {
  const pW = VP.W - PAD.l - PAD.r;
  const xSpan = mapView.xMax - mapView.xMin;
  return Math.max(14, (0.9 / xSpan) * pW);
}

function hitTest(px, py) {
  const panel = getPanel(py);
  if (panel === 'cost') return { type: 'background', panel: 'cost' };
  const r = mapHitRadiusPx();
  const sp = worldToMap(sourcePos.x, sourcePos.y);
  if (Math.hypot(px - sp.px, py - sp.py) < r) return { type: 'source' };
  const tp = worldToMap(targetX, 0);
  if (Math.hypot(px - tp.px, py - tp.py) < r) return { type: 'target' };
  for (let i = drones.length - 1; i >= 0; i--) {
    const d  = drones[i];
    const pt = worldToMap(d.x, d.y);
    if (Math.hypot(px - pt.px, py - pt.py) < r) return { type: 'drone', idx: i };
  }
  return null;
}

function startPanDrag(panel, px, py) {
  return { type: 'pan', panel, lastPx: px, lastPy: py };
}

function startPanOrTargetDrag(px, py) {
  return { type: 'panOrTarget', panel: 'cost', startPx: px, startPy: py, lastPx: px, lastPy: py, moved: false };
}

function updateCursor(hit, activeDrag, buttons, panel) {
  if (activeDrag?.type === 'pan' || (activeDrag?.type === 'panOrTarget' && activeDrag.moved)) {
    canvas.style.cursor = 'grabbing';
  } else if (activeDrag && buttons === 1) {
    canvas.style.cursor = 'grabbing';
  } else if (hit && hit.type !== 'background') {
    canvas.style.cursor = 'grab';
  } else {
    canvas.style.cursor = panel === 'cost' ? 'grab' : 'grab';
  }
}

canvas.addEventListener('mousedown', e => {
  const r  = canvas.getBoundingClientRect();
  const px = e.clientX - r.left, py = e.clientY - r.top;
  const panel = getPanel(py);

  if (e.button === 1) {
    e.preventDefault();
    dragging = startPanDrag(panel, px, py);
    return;
  }
  if (e.button !== 0) return;

  const hit = hitTest(px, py);
  if (!hit) {
    dragging = startPanDrag('map', px, py);
  } else if (hit.type === 'background') {
    dragging = startPanOrTargetDrag(px, py);
  } else {
    dragging = hit;
  }
});

canvas.addEventListener('mousemove', e => {
  const r  = canvas.getBoundingClientRect();
  const px = e.clientX - r.left, py = e.clientY - r.top;
  const panel = getPanel(py);

  const hit = hitTest(px, py);
  updateCursor(hit, dragging, e.buttons, panel);

  if (dragging && e.buttons === 1) {
    if (dragging.type === 'pan') {
      const dpx = px - dragging.lastPx;
      const dpy = py - dragging.lastPy;
      if (dragging.panel === 'map') panMapView(dpx, dpy);
      else panCostView(dpx, dpy);
      dragging.lastPx = px;
      dragging.lastPy = py;
      document.getElementById('tooltip').style.display = 'none';
      draw();
      return;
    }
    if (dragging.type === 'panOrTarget') {
      if (Math.hypot(px - dragging.startPx, py - dragging.startPy) > 4) dragging.moved = true;
      if (dragging.moved) {
        const dpx = px - dragging.lastPx;
        const dpy = py - dragging.lastPy;
        panCostView(dpx, dpy);
        dragging.lastPx = px;
        dragging.lastPy = py;
        document.getElementById('tooltip').style.display = 'none';
        draw();
      }
      return;
    }
    if (dragging.type === 'drone') {
      const w = mapPxToWorld(px, py);
      const b = mapDragBounds();
      drones[dragging.idx].x = Math.max(b.xMin, Math.min(b.xMax, w.x));
      drones[dragging.idx].y = Math.max(b.yMin, Math.min(b.yMax, w.y));
      recomputeDuringDrag(); return;
    }
    if (dragging.type === 'source') {
      sourcePos.x = 0;
      const b = mapDragBounds();
      sourcePos.y = Math.max(b.yMin, Math.min(b.yMax, mapPxToWorld(px, py).y));
      recomputeDuringDrag(); return;
    }
    if (dragging.type === 'target') {
      const w = mapPxToWorld(px, py);
      targetX = Math.max(0, Math.min(xMax, w.x));
      syncTargetSlider();
      recomputeDuringDrag(); return;
    }
  }

  if (!dragging) {
    const tt = document.getElementById('tooltip');
    const blockInfo = document.getElementById('block-info');

    if (panel === 'cost') {
      const x  = costPxToWorld(px, py).x;
      const c  = envelopeCost(x, blocks);
      const b  = getBlockAtX(x, blocks);
      let blkInfo = 'No block at this x.';
      if (b) {
        const { index } = blockAtTarget(x, blocks);
        blkInfo = index >= 0
          ? `Optimal: Block ${index} · D${b.droneIdx} · ${formatBlockRange(b.L, b.R)}`
          : `Owner: D${b.droneIdx}`;
      }
      tt.classList.remove('tooltip-multiline');
      tt.style.display = 'block';
      tt.style.left = Math.min(px + 14, VP.W - 160) + 'px';
      tt.style.top  = (py - 36) + 'px';
      tt.textContent = `x = ${x.toFixed(2)},  cost = ${isFinite(c) ? c.toFixed(3) : '∞'}`;
      blockInfo.textContent = blkInfo;
    } else if (panel === 'map' && isNearMapDeliveryLine(px, py)) {
      const x = Math.max(0, Math.min(xMax, mapPxToWorld(px, py).x));
      const b = getBlockAtX(x, blocks);
      const seq = formatSequence(sequenceAtTarget(x, blocks), true);
      const ownerStr = b ? `D${b.droneIdx}` : 'none';
      tt.classList.add('tooltip-multiline');
      tt.style.display = 'block';
      tt.style.left = Math.min(px + 14, VP.W - 220) + 'px';
      tt.style.top  = (py + 14) + 'px';
      tt.textContent = `x = ${x.toFixed(1)}\nS_P: ${seq}\nCarrier: D${ownerStr}`;
      blockInfo.textContent = b
        ? `x=${x.toFixed(1)} · S_P: ${seq}`
        : `x=${x.toFixed(1)} · no block`;
    } else {
      tt.style.display = 'none';
      if (panel === 'map') blockInfo.textContent = 'Hover delivery line for S_P(x).';
    }
  }
});

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const r  = canvas.getBoundingClientRect();
  const px = e.clientX - r.left;
  const py = e.clientY - r.top;
  const factor = Math.exp(-e.deltaY * 0.001);

  if (getPanel(py) === 'map') {
    const w = mapPxToWorld(px, py);
    zoomViewAround(mapView, w.x, w.y, factor, {
      minXSpan: 1,
      minYSpan: 0.5,
    });
  } else {
    const w = costPxToWorld(px, py);
    zoomViewAround(costView, w.x, w.y, factor, {
      minXSpan: 0.5,
      minYSpan: 5,
    });
  }
  draw();
}, { passive: false });

canvas.addEventListener('dblclick', e => {
  const r  = canvas.getBoundingClientRect();
  const py = e.clientY - r.top;
  if (getPanel(py) === 'map') {
    resetMapView();
  } else {
    resetCostView(computeYMax());
  }
  draw();
});

canvas.addEventListener('mouseup', e => {
  if (dragging?.type === 'panOrTarget' && !dragging.moved) {
    targetX = Math.max(0, Math.min(xMax, costPxToWorld(dragging.startPx, dragging.startPy).x));
    syncTargetSlider();
    recomputeDuringDrag();
  }
  if (dragging && (dragging.type === 'drone' || dragging.type === 'source' || dragging.type === 'target')) {
    recompute(false, true);
  }
  dragging = null;
});

canvas.addEventListener('mouseleave', () => {
  document.getElementById('tooltip').style.display = 'none';
});

function syncXMaxInput() {
  const el = document.getElementById('xmax-input');
  if (el) el.value = xMax;
  document.getElementById('target-slider').max = xMax;
}

function syncTargetSlider() {
  document.getElementById('target-slider').value = targetX.toFixed(1);
  document.getElementById('target-val').textContent = targetX.toFixed(1);
}

// ─── Control wiring ───────────────────────────────────────────────────────────

document.getElementById('picker-sel').addEventListener('change', e => {
  pickerIdx = parseInt(e.target.value);
  recompute(false, true);
});

document.getElementById('xmax-input').addEventListener('change', e => {
  xMax = Math.max(10, Math.min(200, parseInt(e.target.value, 10) || 50));
  syncXMaxInput();
  targetX = Math.min(targetX, xMax);
  syncTargetSlider();
  recompute(true, true);
});

document.getElementById('xmax-input').addEventListener('input', e => {
  const v = parseInt(e.target.value, 10);
  if (!Number.isFinite(v)) return;
  xMax = Math.max(10, Math.min(200, v));
  targetX = Math.min(targetX, xMax);
  document.getElementById('target-slider').max = xMax;
  syncTargetSlider();
  recomputeDuringDrag();
});

document.getElementById('target-slider').addEventListener('input', e => {
  targetX = parseFloat(e.target.value);
  document.getElementById('target-val').textContent = targetX.toFixed(1);
  refreshTarget();
});

document.getElementById('show-raw').addEventListener('change', e => { showRaw = e.target.checked; draw(); });
document.getElementById('show-exchange').addEventListener('change', e => { showExchange = e.target.checked; draw(); });
document.getElementById('show-kinks').addEventListener('change', e => { showKinks = e.target.checked; draw(); });

document.getElementById('randomize-btn').addEventListener('click', () => {
  const n = parseInt(document.getElementById('drone-count').value, 10);
  randomizeDrones(n);
  document.getElementById('drone-count').value = drones.length;
  buildPickerSelect();
  recompute(true);
});

// ─── Resize ───────────────────────────────────────────────────────────────────

function resize() {
  const r = wrap.getBoundingClientRect();
  VP = { W: Math.floor(r.width), H: Math.floor(r.height) };
}

const ro = new ResizeObserver(() => { resize(); draw(); });
ro.observe(wrap);

// ─── Boot ─────────────────────────────────────────────────────────────────────

buildPickerSelect();
syncXMaxInput();
resetMapView();
resize();
recompute();

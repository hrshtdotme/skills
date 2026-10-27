#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const USAGE = `Usage: zoom-map.mjs <command> <map.json> [arg]

  check   <map.json>            validate the map and list its steps
  step    <map.json> <step-id>  print the SVG for one step (inline widget)
  tour    <map.json>            print an HTML stepper fragment (inline widget)
  mermaid <map.json>            print a Mermaid copy of the map
  save    <map.json> <out-dir>  write map.html (stepper) and map.svg (level 1)`;

const W = 680;
const MARGIN = 32;
const BOX_H = 56;
const GAP = 64;
const PITCH = BOX_H + GAP;
const HEADER = 40;
const PAD = 14;
const LANE = 10;
const FRAME = "#BA7517";

function fail(message) {
  console.error(`zoom-map: ${message}`);
  process.exit(1);
}

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsString(text) {
  return esc(String(text).replace(/\\/g, "\\\\").replace(/'/g, "\\'"));
}

function load(path) {
  let map;
  try {
    map = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`cannot read ${path}: ${error.message}`);
  }
  const errors = [];
  const warnings = [];
  map.nodes ??= [];
  map.edges ??= [];
  map.groups ??= [];
  if (!map.title) errors.push("map needs a title");
  if (map.nodes.length === 0) errors.push("map needs at least one node");
  if (map.nodes.length > 12) warnings.push(`${map.nodes.length} nodes; keep a map at 12 or fewer and split the rest into a child map`);

  const byId = new Map();
  const cells = new Map();
  for (const node of map.nodes) {
    if (!node.id || !node.label) errors.push(`every node needs an id and a label: ${JSON.stringify(node)}`);
    if (byId.has(node.id)) errors.push(`duplicate node id ${node.id}`);
    byId.set(node.id, node);
    if (!Number.isInteger(node.col) || !Number.isInteger(node.row) || node.col < 0 || node.row < 0) {
      errors.push(`node ${node.id} needs integer col and row, 0 or more`);
    }
    if (node.col > 3) errors.push(`node ${node.id} is in col ${node.col}; use cols 0 to 3`);
    const cell = `${node.col},${node.row}`;
    if (cells.has(cell)) errors.push(`nodes ${cells.get(cell)} and ${node.id} share col ${node.col}, row ${node.row}`);
    cells.set(cell, node.id);
    if (node.kind && !["service", "store", "external"].includes(node.kind)) {
      errors.push(`node ${node.id} has kind ${node.kind}; use service, store or external`);
    }
  }
  for (const edge of map.edges) {
    if (!byId.has(edge.from)) errors.push(`edge from unknown node ${edge.from}`);
    if (!byId.has(edge.to)) errors.push(`edge to unknown node ${edge.to}`);
    if (edge.from === edge.to) errors.push(`edge from ${edge.from} to itself`);
  }
  const owner = new Map();
  for (const group of map.groups) {
    if (!group.id || !group.label || !Array.isArray(group.nodes) || group.nodes.length === 0) {
      errors.push(`every group needs an id, a label and nodes: ${JSON.stringify(group)}`);
      continue;
    }
    for (const id of group.nodes) {
      if (!byId.has(id)) errors.push(`group ${group.id} lists unknown node ${id}`);
      if (owner.has(id)) errors.push(`node ${id} is in groups ${owner.get(id)} and ${group.id}; a node belongs to one group`);
      owner.set(id, group.id);
    }
  }
  if (errors.length) fail(errors.join("\n"));

  for (const node of map.nodes) {
    if (node.kind !== "external" && !owner.has(node.id)) warnings.push(`node ${node.id} is in no group, so no sub-system step covers it`);
  }
  for (const group of map.groups) {
    const members = group.nodes.map((id) => byId.get(id));
    const c0 = Math.min(...members.map((n) => n.col));
    const c1 = Math.max(...members.map((n) => n.col));
    const r0 = Math.min(...members.map((n) => n.row));
    const r1 = Math.max(...members.map((n) => n.row));
    for (const node of map.nodes) {
      if (group.nodes.includes(node.id)) continue;
      if (node.col >= c0 && node.col <= c1 && node.row >= r0 && node.row <= r1) {
        errors.push(`node ${node.id} sits inside the frame of group ${group.id}; move it out of cols ${c0}-${c1}, rows ${r0}-${r1}`);
      }
    }
  }
  if (errors.length) fail(errors.join("\n"));

  map.cols = Math.max(...map.nodes.map((n) => n.col)) + 1;
  map.rows = Math.max(...map.nodes.map((n) => n.row)) + 1;
  map.byId = byId;
  map.warnings = warnings;
  return map;
}

function steps(map) {
  const list = [{ id: "1", level: 1, label: map.title, nodes: map.nodes.map((n) => n.id) }];
  map.groups.forEach((group, i) => {
    list.push({ id: `2.${i + 1}`, level: 2, label: group.label, nodes: group.nodes, of: map.groups.length, index: i + 1 });
  });
  const ordered = [...map.groups.flatMap((g) => g.nodes), ...map.nodes.map((n) => n.id).filter((id) => !map.groups.some((g) => g.nodes.includes(id)))]
    .filter((id) => map.byId.get(id).kind !== "external");
  ordered.forEach((id, i) => {
    list.push({ id: `3.${i + 1}`, level: 3, label: map.byId.get(id).label, nodes: [id], node: id, of: ordered.length, index: i + 1 });
  });
  return list;
}

function between(map, a, b, axis) {
  return map.nodes.some((n) => {
    if (axis === "row") return n.row === a.row && n.col > Math.min(a.col, b.col) && n.col < Math.max(a.col, b.col);
    return n.col === a.col && n.row > Math.min(a.row, b.row) && n.row < Math.max(a.row, b.row);
  });
}

function columnFree(map, col, fromRow, toRow) {
  const lo = Math.min(fromRow, toRow);
  const hi = Math.max(fromRow, toRow);
  return !map.nodes.some((n) => n.col === col && n.row > lo && n.row < hi);
}

function route(map, edge) {
  const a = map.byId.get(edge.from);
  const b = map.byId.get(edge.to);
  if (a.row === b.row) {
    if (!between(map, a, b, "row")) {
      return b.col > a.col ? { type: "h", src: "right", dst: "left" } : { type: "h", src: "left", dst: "right" };
    }
    const below = a.row < map.rows - 1 || a.row === 0;
    return below
      ? { type: "lane", src: "bottom", dst: "bottom", gap: a.row + 1 }
      : { type: "lane", src: "top", dst: "top", gap: a.row };
  }
  if (a.col === b.col) {
    if (!between(map, a, b, "col")) {
      return b.row > a.row ? { type: "v", src: "bottom", dst: "top" } : { type: "v", src: "top", dst: "bottom" };
    }
    return { type: "gutter", src: "right", dst: "right", col: a.col };
  }
  const down = b.row > a.row;
  const src = down ? "bottom" : "top";
  const dst = down ? "top" : "bottom";
  const nearTarget = down ? b.row : b.row + 1;
  const nearSource = down ? a.row + 1 : a.row;
  if (columnFree(map, a.col, a.row, b.row)) return { type: "lane", src, dst, gap: nearTarget };
  if (columnFree(map, b.col, a.row, b.row)) return { type: "lane", src, dst, gap: nearSource };
  fail(`no clear path for edge ${edge.from} -> ${edge.to}; move one of them so a column between their rows is empty`);
}

function layout(map) {
  const cellW = (W - 2 * MARGIN) / map.cols;
  const boxW = Math.min(cellW - (map.cols > 3 ? 36 : 56), 180);
  const routes = map.edges.map((edge) => route(map, edge));
  const usesTopGap = routes.some((r) => r.type === "lane" && r.gap === 0);
  const y0 = HEADER + (usesTopGap ? GAP : 24);
  const boxes = new Map();
  for (const node of map.nodes) {
    boxes.set(node.id, {
      x: MARGIN + node.col * cellW + (cellW - boxW) / 2,
      y: y0 + node.row * PITCH,
      w: boxW,
      h: BOX_H,
    });
    const room = boxW - 16;
    if (node.label.length * 8 > room) map.warnings.push(`label "${node.label}" may overflow its ${Math.round(boxW)}px box; shorten it`);
    if (node.note && node.note.length * 6.8 > room) map.warnings.push(`note "${node.note}" may overflow its ${Math.round(boxW)}px box; shorten it`);
  }

  const ports = new Map();
  const addPort = (id, side, key, other) => {
    const list = ports.get(`${id}:${side}`) ?? [];
    list.push({ key, other });
    ports.set(`${id}:${side}`, list);
  };
  routes.forEach((r, i) => {
    const a = boxes.get(map.edges[i].from);
    const b = boxes.get(map.edges[i].to);
    const vertical = (side) => side === "top" || side === "bottom";
    addPort(map.edges[i].from, r.src, `${i}:s`, vertical(r.src) ? b.x + b.w / 2 : b.y + b.h / 2);
    addPort(map.edges[i].to, r.dst, `${i}:d`, vertical(r.dst) ? a.x + a.w / 2 : a.y + a.h / 2);
  });
  const portAt = new Map();
  for (const [slot, list] of ports) {
    const [id, side] = slot.split(":");
    const box = boxes.get(id);
    list.sort((p, q) => p.other - q.other);
    list.forEach((p, i) => {
      const t = (i + 1) / (list.length + 1);
      if (side === "top") portAt.set(p.key, { x: box.x + box.w * t, y: box.y });
      if (side === "bottom") portAt.set(p.key, { x: box.x + box.w * t, y: box.y + box.h });
      if (side === "left") portAt.set(p.key, { x: box.x, y: box.y + box.h * t });
      if (side === "right") portAt.set(p.key, { x: box.x + box.w, y: box.y + box.h * t });
    });
  }

  const gapTop = (g) => (g === 0 ? HEADER : y0 + (g - 1) * PITCH + BOX_H);
  const laneCount = new Map();
  routes.forEach((r) => {
    const key = r.type === "lane" ? `g${r.gap}` : r.type === "gutter" ? `c${r.col}` : null;
    if (key) laneCount.set(key, (laneCount.get(key) ?? 0) + 1);
  });
  const laneNext = new Map();
  const nextLane = (key) => {
    const n = laneCount.get(key);
    const i = laneNext.get(key) ?? 0;
    laneNext.set(key, i + 1);
    return (i - (n - 1) / 2) * LANE;
  };

  const edges = routes.map((r, i) => {
    const edge = map.edges[i];
    const s = portAt.get(`${i}:s`);
    const d = portAt.get(`${i}:d`);
    let points;
    if (r.type === "h") points = [s, { x: d.x, y: s.y }];
    else if (r.type === "v") points = [s, { x: s.x, y: d.y }];
    else if (r.type === "lane") {
      const y = gapTop(r.gap) + GAP / 2 + nextLane(`g${r.gap}`);
      points = [s, { x: s.x, y }, { x: d.x, y }, d];
    } else {
      const x = s.x + 14 + nextLane(`c${r.col}`) + LANE;
      points = [s, { x, y: s.y }, { x, y: d.y }, d];
    }
    return { edge, points, type: r.type };
  });

  const bottom = y0 + (map.rows - 1) * PITCH + BOX_H;
  const usesBottomGap = routes.some((r) => r.type === "lane" && r.gap === map.rows);
  const kinds = new Set(map.nodes.map((n) => n.kind ?? "service"));
  const legend = kinds.has("store") || kinds.has("external") || map.edges.some((e) => e.dashed);
  const legendY = bottom + (usesBottomGap ? GAP : PAD + 22);
  const height = Math.ceil(legend ? legendY + 20 : bottom + (usesBottomGap ? GAP : PAD) + 20);
  return { boxes, edges, height, legend, legendY };
}

function frameRect(geo, ids) {
  const list = ids.map((id) => geo.boxes.get(id));
  const x0 = Math.min(...list.map((b) => b.x)) - PAD;
  const y0 = Math.min(...list.map((b) => b.y)) - PAD;
  const x1 = Math.max(...list.map((b) => b.x + b.w)) + PAD;
  const y1 = Math.max(...list.map((b) => b.y + b.h)) + PAD;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function levelText(step) {
  if (step.level === 1) return "Level 1 · whole system";
  if (step.level === 2) return `Level 2 · sub-system ${step.index} of ${step.of}`;
  return `Level 3 · node ${step.index} of ${step.of}`;
}

function heading(step) {
  return step.level === 1 ? `1 Whole system: ${step.label}` : `${step.id} ${step.label}`;
}

function svg(map, geo, { step, all, nodeClick }) {
  const out = [];
  out.push(`<svg width="100%" viewBox="0 0 ${W} ${geo.height}" role="img" xmlns="http://www.w3.org/2000/svg">`);
  out.push(`<title>${esc(map.title)} map</title>`);
  out.push(`<desc>${esc(`${map.title}: ${map.nodes.length} parts. Focus ${heading(step)}.`)}</desc>`);
  out.push(`<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>`);
  out.push(`<g class="c-amber"><text class="th" id="zm-heading" x="${MARGIN}" y="24" dominant-baseline="central">${esc(heading(step))}</text></g>`);
  out.push(`<text class="ts" id="zm-level" x="${W - MARGIN}" y="24" text-anchor="end" dominant-baseline="central">${esc(levelText(step))}</text>`);

  for (const { edge, points, type } of geo.edges) {
    const d = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const start = edge.both ? ` marker-start="url(#arrow)"` : "";
    out.push(`<path class="arr" d="${d}" fill="none" stroke-width="1"${edge.dashed ? ` stroke-dasharray="4 3"` : ""} marker-end="url(#arrow)"${start}/>`);
    if (edge.label) {
      let lx, ly, anchor;
      if (type === "v") {
        lx = points[0].x + 6;
        ly = points[0].y + (points[1].y > points[0].y ? 18 : -18);
        anchor = "start";
      } else if (type === "gutter") {
        lx = points[1].x + 6;
        ly = (points[1].y + points[2].y) / 2;
        anchor = "start";
      } else {
        const [p, q] = type === "h" ? [points[0], points[1]] : [points[1], points[2]];
        lx = (p.x + q.x) / 2;
        ly = p.y - 9;
        anchor = "middle";
      }
      out.push(`<text class="ts" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="central">${esc(edge.label)}</text>`);
    }
  }

  for (const node of map.nodes) {
    const b = geo.boxes.get(node.id);
    const kind = node.kind ?? "service";
    const handler = nodeClick?.(node);
    const click = handler ? ` onclick="${handler}"` : "";
    const groupClass = [handler ? "node" : "", kind === "store" ? "c-teal" : ""].filter(Boolean).join(" ") || "zm-plain";
    const rectClass = kind === "store" ? "" : ` class="box"`;
    const dash = kind === "external" ? ` stroke-dasharray="4 3"` : "";
    const cx = b.x + b.w / 2;
    out.push(`<g class="${groupClass}" data-node="${esc(node.id)}"${click}>`);
    out.push(`<rect${rectClass} x="${b.x.toFixed(1)}" y="${b.y}" width="${b.w.toFixed(1)}" height="${b.h}" rx="8" stroke-width="0.5"${dash}/>`);
    if (node.note) {
      out.push(`<text class="th" x="${cx.toFixed(1)}" y="${b.y + 19}" text-anchor="middle" dominant-baseline="central">${esc(node.label)}</text>`);
      out.push(`<text class="ts" x="${cx.toFixed(1)}" y="${b.y + 38}" text-anchor="middle" dominant-baseline="central">${esc(node.note)}</text>`);
    } else {
      out.push(`<text class="th" x="${cx.toFixed(1)}" y="${b.y + b.h / 2}" text-anchor="middle" dominant-baseline="central">${esc(node.label)}</text>`);
    }
    out.push(`</g>`);
  }

  const frames = all ?? [step];
  for (const s of frames) {
    const f = frameRect(geo, s.nodes);
    const hidden = all && s.id !== step.id ? ` style="display:none"` : "";
    out.push(`<rect data-step="${s.id}" x="${f.x.toFixed(1)}" y="${f.y.toFixed(1)}" width="${f.w.toFixed(1)}" height="${f.h.toFixed(1)}" rx="12" fill="none" stroke="${FRAME}" stroke-width="1.5" pointer-events="none"${hidden}/>`);
  }

  if (geo.legend) {
    const parts = [];
    if (map.nodes.some((n) => n.kind === "store")) parts.push("teal = stores data");
    if (map.nodes.some((n) => n.kind === "external")) parts.push("dashed box = outside the system");
    if (map.edges.some((e) => e.dashed)) parts.push("dashed arrow = async or optional");
    out.push(`<text class="ts" x="${MARGIN}" y="${geo.legendY}" dominant-baseline="central">${esc(parts.join(" · "))}</text>`);
  }
  out.push(`</svg>`);
  return out.join("\n");
}

function stepper(map, geo, list, { standalone }) {
  const nodeClick = (node) => {
    const target = list.find((s) => s.node === node.id);
    return target ? `zmGo('${target.id}')` : null;
  };
  const body = svg(map, geo, { step: list[0], all: list, nodeClick });
  const data = JSON.stringify(list.map((s) => ({ id: s.id, heading: heading(s), level: levelText(s) })));
  const pills = list
    .map((s) => `<button type="button" class="zm-pill" data-pill="${s.id}" onclick="zmGo('${s.id}')">${s.id}</button>`)
    .join("");
  const ask = standalone
    ? ""
    : `<button type="button" onclick="zmAsk()">Teach me this step ↗</button>`;
  return `<style>
.zm-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:12px 0 0;font-size:13px}
.zm-pill{min-width:36px;padding:2px 8px}
.zm-pill[aria-current="step"]{border-color:${FRAME};color:${FRAME}}
</style>
<h2 class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">${esc(map.title)}: a map you can step through, from the whole system to each part.</h2>
${body}
<div class="zm-bar">
<button type="button" onclick="zmMove(-1)" aria-label="Previous step">←</button>
<button type="button" onclick="zmMove(1)" aria-label="Next step">→</button>
${pills}
${ask}
</div>
<script>
const zmSteps = ${data};
let zmIndex = 0;
function zmShow(i) {
  zmIndex = (i + zmSteps.length) % zmSteps.length;
  const step = zmSteps[zmIndex];
  document.querySelectorAll('rect[data-step]').forEach((r) => { r.style.display = r.dataset.step === step.id ? '' : 'none'; });
  document.querySelectorAll('[data-pill]').forEach((b) => { if (b.dataset.pill === step.id) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  document.getElementById('zm-heading').textContent = step.heading;
  document.getElementById('zm-level').textContent = step.level;
  ${standalone ? "if (location.hash !== '#' + step.id) history.replaceState(null, '', '#' + step.id);" : ""}
}
function zmGo(id) { const i = zmSteps.findIndex((s) => s.id === id); if (i >= 0) zmShow(i); }
function zmMove(d) { zmShow(zmIndex + d); }
${standalone ? "" : "function zmAsk() { const s = zmSteps[zmIndex]; sendPrompt('Teach me step ' + s.heading); }"}
${standalone ? "document.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') zmMove(1); if (e.key === 'ArrowLeft') zmMove(-1); });\nzmGo(decodeURIComponent(location.hash.slice(1)) || '1');" : "zmShow(0);"}
</script>`;
}

const PAGE_STYLE = `:root{--zm-bg:#faf9f5;--zm-fg:#1f1e1d;--zm-muted:#5f5e5a;--zm-card:#ffffff;--zm-line:#b4b2a9;--zm-edge:#73726c;--zm-amber:#633806}
@media (prefers-color-scheme: dark){:root{--zm-bg:#1f1e1d;--zm-fg:#f1efe8;--zm-muted:#b4b2a9;--zm-card:#2c2c2a;--zm-line:#5f5e5a;--zm-edge:#9c9a92;--zm-amber:#fac775}}
body{margin:0;padding:24px 16px;background:var(--zm-bg);color:var(--zm-fg);font-family:system-ui,-apple-system,sans-serif}
main{max-width:720px;margin:0 auto}
.t,.th,.ts{font-family:system-ui,-apple-system,sans-serif}
.t,.th{font-size:14px;fill:var(--zm-fg)}.th{font-weight:500}.ts{font-size:12px;fill:var(--zm-muted)}
.box{fill:var(--zm-card);stroke:var(--zm-line)}
.c-teal>rect{fill:#e1f5ee;stroke:#0f6e56}.c-teal>.th{fill:#085041}.c-teal>.ts{fill:#0f6e56}
@media (prefers-color-scheme: dark){.c-teal>rect{fill:#085041;stroke:#5dcaa5}.c-teal>.th{fill:#e1f5ee}.c-teal>.ts{fill:#9fe1cb}}
.c-amber>.th{fill:var(--zm-amber)}
.arr{stroke:var(--zm-edge)}marker path{stroke:var(--zm-edge)}
.node{cursor:pointer}
button{font:inherit;color:inherit;background:transparent;border:0.5px solid var(--zm-line);border-radius:8px;padding:4px 10px;cursor:pointer}`;

function page(map, inner) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(map.title)} map</title>
<style>${PAGE_STYLE}</style>
</head>
<body>
<main>
${inner}
</main>
</body>
</html>
`;
}

function mermaid(map) {
  const id = (s) => s.replace(/[^A-Za-z0-9_]/g, "_");
  const shape = (n) => {
    const text = `"${n.label.replace(/"/g, "'")}${n.note ? `<br/><small>${n.note.replace(/"/g, "'")}</small>` : ""}"`;
    if (n.kind === "store") return `${id(n.id)}[(${text})]`;
    if (n.kind === "external") return `${id(n.id)}([${text}])`;
    return `${id(n.id)}[${text}]`;
  };
  const lines = ["flowchart TB"];
  const grouped = new Set(map.groups.flatMap((g) => g.nodes));
  map.groups.forEach((g, i) => {
    lines.push(`  subgraph ${id(g.id)}["2.${i + 1} ${g.label.replace(/"/g, "'")}"]`);
    for (const nid of g.nodes) lines.push(`    ${shape(map.byId.get(nid))}`);
    lines.push("  end");
  });
  for (const n of map.nodes) if (!grouped.has(n.id)) lines.push(`  ${shape(n)}`);
  for (const e of map.edges) {
    const arrow = e.both ? "<-->" : e.dashed ? "-.->" : "-->";
    lines.push(`  ${id(e.from)} ${arrow}${e.label ? `|"${e.label.replace(/"/g, "'")}"|` : ""} ${id(e.to)}`);
  }
  return lines.join("\n");
}

const [command, file, arg] = process.argv.slice(2);
if (!command || !file || ["-h", "--help"].includes(command)) {
  console.log(USAGE);
  process.exit(command ? 0 : 1);
}
const map = load(file);
const geo = layout(map);
const list = steps(map);
for (const warning of map.warnings) console.error(`zoom-map: warning: ${warning}`);

if (command === "check") {
  for (const s of list) console.log(`${s.id.padEnd(5)} ${levelText(s).padEnd(28)} ${s.label}`);
} else if (command === "step") {
  const step = list.find((s) => s.id === arg);
  if (!step) fail(`no step ${arg}; steps are ${list.map((s) => s.id).join(", ")}`);
  const nodeClick = (node) => {
    const target = list.find((s) => s.node === node.id);
    return target ? `sendPrompt('Jump to ${jsString(target.id)} ${jsString(node.label)}')` : null;
  };
  console.log(svg(map, geo, { step, nodeClick }));
} else if (command === "tour") {
  console.log(stepper(map, geo, list, { standalone: false }));
} else if (command === "mermaid") {
  console.log(mermaid(map));
} else if (command === "save") {
  if (!arg) fail("save needs an output directory");
  mkdirSync(arg, { recursive: true });
  writeFileSync(join(arg, "map.html"), page(map, stepper(map, geo, list, { standalone: true })));
  const level1 = svg(map, geo, { step: list[0] }).replace("<defs>", `<style>${PAGE_STYLE.replace(/body\{[^}]*\}|main\{[^}]*\}|button\{[^}]*\}/g, "")}</style><defs>`);
  writeFileSync(join(arg, "map.svg"), `${level1}\n`);
  console.log(`wrote ${join(arg, "map.html")} and ${join(arg, "map.svg")}`);
} else {
  fail(`unknown command ${command}\n${USAGE}`);
}

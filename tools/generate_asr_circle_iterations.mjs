import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('output/logo');
fs.mkdirSync(outDir, { recursive: true });

const orange = '#ED5A00';
const ink = '#202020';
const muted = '#727272';

// Fixed perimeter points carry the recognisable geography. Interior cells are
// subordinate, so changing their density never turns the mark into an oval.
const australiaPerimeter = [
  [28,14],[39,10],[50,15],[60,13],[70,18],[77,7], // north + Cape York
  [80,24],[87,29],[94,39],[98,50],[94,60],[89,68],[83,76],[76,82], // east
  [67,78],[60,82],[53,77],[44,74],[37,70],[29,74], // Victoria + Bight
  [21,67],[15,61],[11,52],[8,43],[11,34],[17,27],[22,20] // west + Kimberley
];

const australiaInterior = [
  [30,25],[41,24],[52,26],[63,27],[72,29],
  [23,36],[35,35],[47,37],[59,37],[71,39],[82,39],
  [20,48],[32,47],[44,49],[56,49],[68,50],[80,50],[89,51],
  [25,59],[37,58],[49,60],[61,60],[73,61],[83,59],
  [33,66],[46,66],[58,69],[71,70]
];

const hash = (x,y,seed) => {
  const v = Math.sin(x*12.9898 + y*78.233 + seed*19.19) * 43758.5453;
  return v - Math.floor(v);
};

const sizeFor = (x,y,seed,mode) => {
  let h = hash(x,y,seed);
  if (mode === 'core') h += 0.28 * (1 - Math.min(1, Math.hypot(x-56,y-48)/48));
  if (mode === 'coast') h += 0.18 * Math.min(1, Math.hypot(x-56,y-48)/48);
  if (h > 0.72) return 8;      // 2 mm diameter
  if (h > 0.34) return 5.6;    // 1.4 mm diameter
  return 4;                    // 1 mm diameter
};

function pointsFor(kind) {
  const pts = [...australiaPerimeter];
  australiaInterior.forEach((p,i) => {
    if (kind === 'airy' && i%3===0) return;
    if (kind === 'channels' && [7,13,19,23].includes(i)) return;
    // Coastline wins whenever an internal point would visually merge with it.
    if (australiaPerimeter.some(q => Math.hypot(p[0]-q[0],p[1]-q[1]) < 9.5)) return;
    pts.push(p);
  });
  // Tasmania is a small independent cluster, not a mainland tail.
  pts.push([73,94],[78,99]);
  return pts;
}

const concepts = [
  {id:'G', name:'Balanced landform', note:'Full silhouette; balanced size mix', kind:'full', seed:2, mode:'core'},
  {id:'H', name:'Contour bands', note:'Australian outline with page-7 rhythm', kind:'full', seed:5, mode:'core'},
  {id:'I', name:'Airy interior', note:'Coastline retained; quieter internal field', kind:'airy', seed:7, mode:'core'},
  {id:'J', name:'Dense core', note:'Accurate outline; colony gathers centrally', kind:'full', seed:11, mode:'core'},
  {id:'K', name:'Coastal emphasis', note:'Larger edge cells reinforce the landmass', kind:'full', seed:17, mode:'coast'},
  {id:'L', name:'Negative channels', note:'Australian perimeter with internal paths', kind:'channels', seed:23, mode:'core'}
];

function mark(c, x=0, y=0, scale=1, withRing=true) {
  const pts = pointsFor(c.kind);
  const circles = pts.map(([px,py]) => {
    const d = py > 90 ? 4 : sizeFor(px,py,c.seed,c.mode);
    return `<circle cx="${px}" cy="${py}" r="${d/2}"/>`;
  }).join('');
  const ring = withRing ? '<circle class="ring" cx="55" cy="51" r="53"/>' : '';
  return `<g transform="translate(${x} ${y}) scale(${scale})">${ring}<g class="cells">${circles}</g></g>`;
}

function standalone(c) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="120mm" height="120mm" viewBox="-4 -6 118 118">
  <style>.ring{fill:none;stroke:${orange};stroke-width:2.4}.cells{fill:${orange}}</style>
  ${mark(c)}
</svg>\n`;
}

for (const c of concepts) {
  fs.writeFileSync(path.join(outDir, `ASR_circle_${c.id}_${c.name.toLowerCase().replaceAll(' ','_')}.svg`), standalone(c));
}

const cards = concepts.map((c,i) => {
  const col=i%2, row=Math.floor(i/2);
  const x=70+col*570, y=155+row*325;
  return `<g>
    ${mark(c,x,y,1.55)}
    <text class="option" x="${x+200}" y="${y+27}">${c.id}</text>
    <text class="name" x="${x+200}" y="${y+61}">${c.name}</text>
    <text class="note" x="${x+200}" y="${y+91}">${c.note}</text>
  </g>`;
}).join('\n');

const board = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <rect width="1200" height="1200" fill="#fff"/>
  <style>
    text{font-family:Arial,Helvetica,sans-serif;fill:${ink}}
    .title{font-size:28px;font-weight:700}.subtitle{font-size:15px;fill:${muted}}
    .option{font-size:15px;font-weight:700;fill:${orange}}
    .name{font-size:24px;font-weight:700}.note{font-size:14px;fill:${muted}}
    .ring{fill:none;stroke:${orange};stroke-width:2.4}.cells{fill:${orange}}
  </style>
  <text class="title" x="70" y="62">Australian Pluripotent Stem Cell Registry</text>
  <text class="subtitle" x="70" y="92">Circular-cell iterations inspired by Issue A page 7 (bottom right) and Issue B options E/F</text>
  <text class="subtitle" x="1130" y="92" text-anchor="end">Cell diameters: 1 / 1.4 / 2 mm · no touching or overlap</text>
  <line x1="70" y1="112" x2="1130" y2="112" stroke="#E5E5E5"/>
  ${cards}
  <line x1="70" y1="1140" x2="1130" y2="1140" stroke="#E5E5E5"/>
  <text class="subtitle" x="70" y="1172">Exploration set G–L · editable SVG artwork</text>
</svg>\n`;

fs.writeFileSync(path.join(outDir,'ASR_circle_iterations_G-L.svg'),board);
console.log(`Wrote ${concepts.length + 1} SVG files to ${outDir}`);

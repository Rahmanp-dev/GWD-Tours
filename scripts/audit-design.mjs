#!/usr/bin/env node
/**
 * audit-design.mjs
 *
 * Enforces the blocklist in references/design-system.md. No dependencies.
 *
 *   node scripts/audit-design.mjs            audit ./app ./components ./lib
 *   node scripts/audit-design.mjs src ui     audit those directories instead
 *
 * Two severities, deliberately:
 *
 *   FAIL    unambiguous. Either a recognised slop signature with no legitimate
 *           use in this system, or a contract violation. Exits non-zero.
 *   REVIEW  a pattern that is usually wrong here but has real exceptions, so a
 *           human decides. Printed, does not gate.
 *
 * The split matters. An audit that fails on everything trains the next agent to
 * paper the codebase in escape comments, which is worse than having no audit.
 *
 * Escape hatch: put `gwd-allow` in a comment on the offending line or the line
 * above it. Deliberate exceptions should be visible in the diff.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const DIRS = ROOTS.length ? ROOTS : ['app', 'components', 'lib'];
const CODE = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs']);
const STYLE = new Set(['.css']);

const BANNED_DISPLAY_FONTS = ['inter', 'poppins', 'montserrat', 'roboto', 'open sans', 'lato', 'nunito'];
const FILLER = ['elevate', 'unleash', 'seamless', 'game-changing', 'game changing', 'cutting-edge',
  'cutting edge', 'revolutionize', 'revolutionise', "in today's world", "we don't just"];

const SEV = {
  'multi-hue-gradient': 'FAIL', 'coloured-glow': 'FAIL', 'fat-radius': 'FAIL',
  'emoji': 'FAIL', 'em-dash': 'FAIL', 'marketing-filler': 'FAIL',
  'numbered-sections': 'FAIL', 'default-display-font': 'FAIL', 'too-many-families': 'FAIL',
  'single-duration': 'FAIL', 'auto-fit-grid': 'FAIL', 'overflow-hidden': 'FAIL',
  'missing-credit': 'FAIL',
  'glassmorphism': 'REVIEW', 'centred-copy': 'REVIEW', 'hex-outside-tokens': 'REVIEW',
};

const WHY = {
  'multi-hue-gradient': 'two genuinely different hues in one gradient, the purple-to-pink signature',
  'coloured-glow': 'a saturated shadow is neon, which is the opposite of expensive',
  'fat-radius': 'the template-era rounded card. under 8px, or a true pill, nothing between',
  'emoji': 'reads as machine-written',
  'em-dash': 'house style',
  'marketing-filler': 'says nothing',
  'numbered-sections': 'slide deck habit',
  'default-display-font': 'industry default used as the voice of the page',
  'too-many-families': 'two families is the count',
  'single-duration': 'reactive and reveal motion need different bands',
  'auto-fit-grid': 'orphaned cells with a known item count, use repeat(N, 1fr)',
  'overflow-hidden': 'breaks position: sticky, which the horizontal layer depends on',
  'missing-credit': 'Contract 4, every site says who built it',
  'glassmorphism': 'blur alone is fine over film. blur plus a translucent card plus a pale border is not',
  'centred-copy': 'centred body copy signals a generated hero. centred labels and dialogs are fine',
  'hex-outside-tokens': 'colour outside the token block. structural black and white are exempt',
};

/* ---------------------------- colour helpers ---------------------------- */

function toRgb(str) {
  let m = str.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('');
    if (h.length < 6) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  m = str.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (m) return [+m[1], +m[2], +m[3]];
  return null;
}

/** hue 0..360, sat 0..1, light 0..1 */
function toHsl(rgb) {
  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  if (!d) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = h * 60; if (h < 0) h += 360;
  return { h, s, l };
}

const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const coloursIn = (s) => [...s.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)].map((m) => m[0]);
const isStructural = (str) => /^#(0{3,4}|0{6}|0{8}|f{3,4}|f{6}|f{8})$/i.test(str.trim());

/* -------------------------------- scan -------------------------------- */

const hits = [];
const files = [];

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (CODE.has(extname(p)) || STYLE.has(extname(p))) files.push(p);
  }
}
DIRS.forEach(walk);

const flag = (file, line, rule, detail) => hits.push({ file, line, rule, detail });

function auditLine(file, line, prev, i, isCss, inRoot) {
  if (/gwd-allow/.test(line) || /gwd-allow/.test(prev || '')) return;
  const lower = line.toLowerCase();
  const at = i + 1;

  // gradient across two genuinely different hues. a ramp within one hue, or a
  // colour fading to transparent, is how scrims are built and is correct.
  const grad = lower.match(/(?:linear|radial|conic)-gradient\(([^;]*)\)/);
  if (grad) {
    const hs = coloursIn(grad[1]).map(toRgb).filter(Boolean).map(toHsl)
      .filter((c) => c.s > 0.12 && c.l > 0.04 && c.l < 0.96);
    let worst = 0, pair = null;
    for (let a = 0; a < hs.length; a++) {
      for (let b = a + 1; b < hs.length; b++) {
        const g = hueGap(hs[a].h, hs[b].h);
        if (g > worst) { worst = g; pair = [hs[a].h, hs[b].h]; }
      }
    }
    if (worst > 25) flag(file, at, 'multi-hue-gradient', `hues ${pair.map((h) => Math.round(h)).join(' and ')}, gap ${Math.round(worst)} deg`);
  }

  if (/backdrop-filter\s*:\s*[^;]*blur/.test(lower)) flag(file, at, 'glassmorphism', line.trim().slice(0, 60));

  const shadow = lower.match(/box-shadow\s*:\s*([^;]+)/);
  if (shadow) {
    const sat = coloursIn(shadow[1]).map(toRgb).filter(Boolean).map(toHsl)
      .find((c) => c.s > 0.25 && c.l > 0.2);
    if (sat) flag(file, at, 'coloured-glow', line.trim().slice(0, 70));
  }

  // 9px to 40px is the template card. under 9 is the system, 100px+ and 50% are
  // deliberate pills and circles.
  for (const m of line.matchAll(/border-radius\s*:\s*([^;]+)/gi)) {
    for (const px of m[1].matchAll(/(\d+(?:\.\d+)?)px/g)) {
      const v = parseFloat(px[1]);
      if (v > 8 && v < 100) flag(file, at, 'fat-radius', `${v}px, use 8px or less, or a full pill`);
    }
  }

  if (/\p{Extended_Pictographic}/u.test(line)) flag(file, at, 'emoji', line.trim().slice(0, 60));
  if (/text-align\s*:\s*center/.test(lower)) flag(file, at, 'centred-copy', line.trim().slice(0, 60));
  if (/repeat\(\s*auto-(fit|fill)/.test(lower)) flag(file, at, 'auto-fit-grid', line.trim().slice(0, 60));
  if (/overflow-x\s*:\s*hidden/.test(lower)) flag(file, at, 'overflow-hidden', 'use overflow-x: clip');

  if (isCss && !inRoot) {
    const stray = coloursIn(line).filter((c) => c.startsWith('#') && !isStructural(c));
    if (stray.length) flag(file, at, 'hex-outside-tokens', stray.join(' '));
  }

  if (!isCss) {
    if (line.includes('—')) flag(file, at, 'em-dash', line.trim().slice(0, 60));
    for (const w of FILLER) if (lower.includes(w)) flag(file, at, 'marketing-filler', w);
  }
}

let allCss = '', allCode = '';
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const isCss = STYLE.has(extname(file));
  if (isCss) allCss += '\n' + src; else allCode += '\n' + src;

  const lines = src.split(/\r?\n/);
  let depth = 0, inRoot = false;
  for (let i = 0; i < lines.length; i++) {
    if (isCss) {
      if (/:root\b/.test(lines[i])) inRoot = true;
      depth += (lines[i].match(/{/g) || []).length - (lines[i].match(/}/g) || []).length;
      if (inRoot && depth <= 0 && i && !/:root\b/.test(lines[i])) inRoot = false;
    }
    auditLine(file, lines[i], lines[i - 1], i, isCss, inRoot);
  }

  if (!isCss && /['"`]01['"`]/.test(src) && /['"`]02['"`]/.test(src) && /['"`]03['"`]/.test(src)) {
    flag(file, 0, 'numbered-sections', 'found 01, 02 and 03 as literals in one file');
  }
}

const disp = allCss.match(/--font-display\s*:\s*([^;]+)/);
if (disp) {
  const v = disp[1].toLowerCase();
  for (const f of BANNED_DISPLAY_FONTS) {
    if (v.includes(f)) flag('globals.css', 0, 'default-display-font', `${f} used as --font-display`);
  }
}

const fams = new Set([...allCss.matchAll(/--font-([a-z0-9-]+)\s*:/g)].map((m) => m[1]));
if (fams.size > 2) flag('globals.css', 0, 'too-many-families', `${fams.size} font tokens: ${[...fams].join(', ')}`);

const durs = new Set([...allCss.matchAll(/(\d+(?:\.\d+)?)(ms|s)\b/g)]
  .map((m) => (m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1])))
  .filter((n) => n >= 40));
if (durs.size === 1) flag('globals.css', 0, 'single-duration', `every motion uses ${[...durs][0]}ms`);

if (!/Developed by/i.test(allCode) || !/GWD Global/i.test(allCode)) {
  flag('(project)', 0, 'missing-credit', 'no "Developed by GWD Global" found in any component');
}

/* ------------------------------- report ------------------------------- */

if (!files.length) {
  console.error(`no files found under ${DIRS.join(', ')}. run from the project root.`);
  process.exit(2);
}

const fails = hits.filter((h) => SEV[h.rule] === 'FAIL');
const reviews = hits.filter((h) => SEV[h.rule] !== 'FAIL');

function section(title, list) {
  if (!list.length) return;
  const byRule = new Map();
  for (const h of list) {
    if (!byRule.has(h.rule)) byRule.set(h.rule, []);
    byRule.get(h.rule).push(h);
  }
  console.log(`${title}\n`);
  for (const [rule, rs] of [...byRule].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${rule}  (${rs.length})`);
    console.log(`    ${WHY[rule] || ''}`);
    for (const h of rs.slice(0, 6)) console.log(`      ${h.file}${h.line ? ':' + h.line : ''}  ${h.detail}`);
    if (rs.length > 6) console.log(`      ... and ${rs.length - 6} more`);
    console.log('');
  }
}

console.log(`design audit, ${files.length} files\n`);
section(`FAIL  ${fails.length} hits, these gate handover`, fails);
section(`REVIEW  ${reviews.length} hits, a human decides`, reviews);

if (!fails.length) {
  console.log(reviews.length
    ? 'no failures. read the review list and confirm each one is deliberate.'
    : 'design audit clean.');
  process.exit(0);
}
console.log('fix these rather than adding exceptions. `gwd-allow` on the line is for');
console.log('the rare deliberate case and should be visible in the diff.');
process.exit(1);

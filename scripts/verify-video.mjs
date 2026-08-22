#!/usr/bin/env node
/**
 * verify-video.mjs
 *
 * The acceptance test for Contract 2: the picture never blanks and never
 * freezes. Drives a real browser, jumps to a spread of scroll positions, reads
 * the pixels the video element actually painted at each one, and fails on:
 *
 *   blank   a frame whose luminance range is flat, i.e. nothing is rendered
 *   frozen  too few distinct frames across the sweep, i.e. scrolling does not
 *           move the film
 *
 *   npm i --no-save puppeteer-core
 *   node scripts/verify-video.mjs --url http://localhost:3000
 *   node scripts/verify-video.mjs --url http://localhost:3000 --mobile
 *
 * Options
 *   --url      page to test                    default http://localhost:3000
 *   --chrome   browser binary                  default $CHROME_PATH or a guess
 *   --begin    selector for the preloader gate default [data-begin]
 *   --samples  scroll positions to test        default 24
 *   --video    selector for the video element  default video
 *
 * Note on held frames: the architecture deliberately holds the last frame of a
 * segment during a horizontal interlude, so a few identical neighbours are
 * correct, not a bug. That is why the gate is a ratio of distinct frames rather
 * than "every neighbour must differ", and why the longest identical run is
 * reported for a human to sanity check.
 */

import { existsSync } from 'node:fs';

let puppeteer;
try {
  ({ default: puppeteer } = await import('puppeteer-core'));
} catch {
  console.error('puppeteer-core is not installed. run:\n\n  npm i --no-save puppeteer-core\n');
  process.exit(2);
}

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const has = (k) => process.argv.includes(`--${k}`);

const URL = arg('url', 'http://localhost:3000');
const BEGIN = arg('begin', '[data-begin]');
const VIDEO = arg('video', 'video');
const SAMPLES = parseInt(arg('samples', '24'), 10);
const MOBILE = has('mobile');

const GUESSES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const CHROME = arg('chrome', GUESSES.find((p) => existsSync(p)));

if (!CHROME) {
  console.error('no browser found. pass --chrome /path/to/chrome or set CHROME_PATH.');
  process.exit(2);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: [
    '--autoplay-policy=no-user-gesture-required',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--mute-audio',
  ],
});

const page = await browser.newPage();
await page.setViewport(
  MOBILE
    ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { width: 1440, height: 900, deviceScaleFactor: 1 }
);

const problems = [];
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });

console.log(`opening ${URL} at ${MOBILE ? 'mobile' : 'desktop'} viewport`);
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 120000 });

// clear the preloader if there is one. it doubles as the gesture unlock.
try {
  await page.waitForSelector(BEGIN, { timeout: 8000 });
  await page.click(BEGIN);
  console.log(`clicked ${BEGIN}`);
} catch {
  console.log(`no ${BEGIN} gate found, continuing`);
}

await page.waitForFunction(
  (sel) => { const v = document.querySelector(sel); return v && v.readyState >= 2; },
  { timeout: 120000 }, VIDEO
);

const height = await page.evaluate(() => Math.max(
  document.body.scrollHeight, document.documentElement.scrollHeight
) - window.innerHeight);
console.log(`scrollable height ${height}px, sampling ${SAMPLES} positions\n`);

/** scroll, wait for the lerp to settle, then read the painted frame */
async function sampleAt(y) {
  await page.evaluate((to) => {
    if (window.__scroll?.scrollTo) window.__scroll.scrollTo(to, { immediate: true });
    else window.scrollTo(0, to);
  }, y);

  // wait until currentTime stops moving, rather than guessing a delay
  await page.evaluate(async (sel) => {
    const v = document.querySelector(sel);
    let last = -1, still = 0;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      if (Math.abs(v.currentTime - last) < 0.002) still++; else still = 0;
      last = v.currentTime;
      if (still > 6) break;
    }
  }, VIDEO);

  return page.evaluate((sel) => {
    const v = document.querySelector(sel);
    const c = document.createElement('canvas');
    c.width = 16; c.height = 9;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    let data;
    try {
      ctx.drawImage(v, 0, 0, 16, 9);
      data = ctx.getImageData(0, 0, 16, 9).data;
    } catch (e) {
      return { error: String(e && e.message) };
    }
    const lum = [];
    for (let i = 0; i < data.length; i += 4) {
      lum.push((data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000);
    }
    const min = Math.min(...lum), max = Math.max(...lum);
    // coarse signature, quantised so decoder noise does not read as a new frame
    const sig = lum.map((l) => Math.round(l / 8)).join(',');
    return {
      t: +v.currentTime.toFixed(3),
      mode: document.querySelector('[data-mode]')?.dataset.mode || 'video',
      min: Math.round(min), max: Math.round(max), range: Math.round(max - min),
      sig,
    };
  }, VIDEO);
}

const rows = [];
for (let i = 0; i < SAMPLES; i++) {
  const y = Math.round((height * i) / (SAMPLES - 1));
  const s = await sampleAt(y);
  if (s.error) { problems.push(`canvas read failed: ${s.error}`); break; }
  rows.push({ y, ...s });
  const blank = s.range < 4;
  console.log(
    `  y=${String(y).padStart(6)}  film=${String(s.t).padStart(7)}s  ` +
    `range=${String(s.range).padStart(3)}  ${s.mode}${blank ? '   <-- BLANK' : ''}`
  );
}

await browser.close();

/* ------------------------------ verdict ------------------------------ */

const blanks = rows.filter((r) => r.range < 4);
const distinct = new Set(rows.map((r) => r.sig)).size;
const ratio = rows.length ? distinct / rows.length : 0;

let run = 1, longest = 1;
for (let i = 1; i < rows.length; i++) {
  if (rows[i].sig === rows[i - 1].sig) { run++; longest = Math.max(longest, run); } else run = 1;
}

console.log('');
console.log(`  samples          ${rows.length}`);
console.log(`  blank frames     ${blanks.length}`);
console.log(`  distinct frames  ${distinct} (${(ratio * 100).toFixed(0)}%)`);
console.log(`  longest identical run  ${longest}`);
if (rows.some((r) => r.mode === 'stills')) {
  console.log('  note: the still-frame fallback engaged, so video decode failed. that is');
  console.log('  a pass for "never blank" and a problem worth investigating separately.');
}
if (problems.length) {
  console.log('\n  page errors:');
  for (const p of [...new Set(problems)].slice(0, 10)) console.log(`    ${p}`);
}

const fail = [];
if (!rows.length) fail.push('no samples captured');
if (blanks.length) fail.push(`${blanks.length} blank frames`);
if (ratio < 0.6) fail.push(`only ${(ratio * 100).toFixed(0)}% distinct frames, the film is not moving with scroll`);
if (longest > 4) fail.push(`${longest} identical frames in a row, longer than any interlude should hold`);

console.log('');
if (fail.length) {
  console.log(`VIDEO VERIFY FAILED (${MOBILE ? 'mobile' : 'desktop'}): ` + fail.join('; '));
  console.log('see references/video-playback.md, the fallback ladder is what fixes this.');
  process.exit(1);
}
console.log(`video verify passed (${MOBILE ? 'mobile' : 'desktop'}).`);

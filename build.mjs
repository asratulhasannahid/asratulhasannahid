#!/usr/bin/env node
/**
 * Generates every animated SVG used in the profile README.
 *
 *   ✏️  Edit the CONFIG block, then run:   node build.mjs
 *       All SVGs are written to ./assets/
 *
 * Zero dependencies (Node 18+). SVGs shown through <img> cannot load external files, so the
 * fonts (Jost for headings, Inter for body, JetBrains Mono for code — all OFL, from Google Fonts)
 * are subset to exactly the characters each SVG uses and embedded as base64 woff2.
 * Downloads are cached in .cache/fonts, so rebuilding without changes works offline.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// ============================ CONFIG ============================
const NAME = "Asratul Hasan Nahid";
const ROLE = "Full-Stack Engineer @ Exprovia";
const DOMAIN = "github.com/asratulhasannahid";
// ================================================================

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "assets");
const CACHE = join(ROOT, ".cache", "fonts");
mkdirSync(OUT, { recursive: true });
mkdirSync(CACHE, { recursive: true });

// ---------------------------------------------------------------- PALETTE (light, green primary)
const BG = "#FFFFFF", CARD = "#F7FAF8", PANEL = "#EEF5F0", LINE = "#E3E8E5";
const INK = "#0F1A14", INK2 = "#43524A", MUTE = "#6B7A72";
const G = "#16A34A", G_L = "#22C55E", G_D = "#15803D", TINT = "#DCFCE7", TINT2 = "#F0FDF4", MINT = "#BBF7D0";
const TEAL = "#0D9488", EMERALD = "#047857", CYAN = "#0E7490";
// code editor (light)
const C_KEY = G, C_PROP = "#475569", C_STR = "#B45309", C_COM = "#94A3B8", C_ID = "#0F766E", C_TYPE = CYAN, C_PUN = INK2;
// brand colors, only on brand items
const WP = "#21759B", SHOP = "#7AB55C", NEST = "#E0234E", LINKEDIN = "#0A66C2", FACEBOOK = "#1877F2", GMAIL = "#D14836";

// ---------------------------------------------------------------- FONTS
const FAMILIES = {
  inter: { google: "Inter", css: "xInter", fallback: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  jost: { google: "Jost", css: "xJost", fallback: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  mono: { google: "JetBrains Mono", css: "xMono", fallback: "Consolas, Menlo, 'Liberation Mono', monospace" },
};
// faces whose metrics are loaded for text measuring
const MEASURED = { inter: [400, 500, 600, 700, 800], jost: [500, 600, 700], mono: [400] };
const UA_WOFF2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const UA_TTF = "curl/8.0";

const sha = (s) => createHash("sha1").update(s).digest("hex").slice(0, 20);

async function cached(key, ext, make) {
  const f = join(CACHE, sha(key) + ext);
  if (existsSync(f)) return readFileSync(f);
  const buf = await make();
  writeFileSync(f, buf);
  return buf;
}

async function googleFont(fam, wt, text, ua) {
  let url = `https://fonts.googleapis.com/css2?family=${FAMILIES[fam].google.replace(/ /g, "+")}:wght@${wt}&display=block`;
  if (text) url += `&text=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { "User-Agent": ua } });
  const css = await res.text();
  const m = css.match(/src:\s*url\(([^)]+)\)/);
  if (!res.ok || !m) throw new Error(`Google Fonts gave no font for ${fam} ${wt}: ${css.slice(0, 200)}`);
  const font = await fetch(m[1]);
  if (!font.ok) throw new Error(`Font download failed (${font.status}) for ${fam} ${wt}`);
  return Buffer.from(await font.arrayBuffer());
}

/** Minimal TrueType reader: advance width per code point (cmap + hmtx). Kerning is ignored. */
function parseTTF(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const tables = {};
  for (let i = 0, n = dv.getUint16(4); i < n; i++) {
    const o = 12 + 16 * i;
    const tag = String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
    tables[tag] = dv.getUint32(o + 8);
  }
  const upm = dv.getUint16(tables.head + 18);
  const nh = dv.getUint16(tables.hhea + 34);
  const adv = (gid) => dv.getUint16(tables.hmtx + 4 * Math.min(gid, nh - 1));
  const cm = tables.cmap;
  let lookup = null;
  const subs = [];
  for (let i = 0, n = dv.getUint16(cm + 2); i < n; i++) {
    subs.push({ p: dv.getUint16(cm + 4 + 8 * i), e: dv.getUint16(cm + 6 + 8 * i), o: cm + dv.getUint32(cm + 8 + 8 * i) });
  }
  const pick = subs.find((s) => dv.getUint16(s.o) === 12) || subs.find((s) => dv.getUint16(s.o) === 4);
  if (dv.getUint16(pick.o) === 12) {
    const o = pick.o, n = dv.getUint32(o + 12);
    lookup = (cp) => {
      for (let i = 0; i < n; i++) {
        const s = dv.getUint32(o + 16 + 12 * i), e = dv.getUint32(o + 20 + 12 * i);
        if (cp >= s && cp <= e) return dv.getUint32(o + 24 + 12 * i) + cp - s;
      }
      return 0;
    };
  } else {
    const o = pick.o, segX2 = dv.getUint16(o + 6), seg = segX2 / 2;
    const endO = o + 14, startO = endO + segX2 + 2, deltaO = startO + segX2, rangeO = deltaO + segX2;
    lookup = (cp) => {
      if (cp > 0xffff) return 0;
      for (let i = 0; i < seg; i++) {
        if (cp > dv.getUint16(endO + 2 * i)) continue;
        const start = dv.getUint16(startO + 2 * i);
        if (cp < start) return 0;
        const delta = dv.getInt16(deltaO + 2 * i), ro = dv.getUint16(rangeO + 2 * i);
        if (ro === 0) return (cp + delta) & 0xffff;
        const gi = dv.getUint16(rangeO + 2 * i + ro + 2 * (cp - start));
        return gi ? (gi + delta) & 0xffff : 0;
      }
      return 0;
    };
  }
  const memo = new Map();
  return (cp) => {
    if (!memo.has(cp)) memo.set(cp, adv(lookup(cp)) / upm);
    return memo.get(cp);
  };
}

const METRICS = {};
async function loadMetrics() {
  const jobs = [];
  for (const [fam, wts] of Object.entries(MEASURED))
    for (const wt of wts)
      jobs.push(cached(`ttf|${fam}|${wt}`, ".ttf", () => googleFont(fam, wt, null, UA_TTF)).then((b) => (METRICS[fam + wt] = parseTTF(b))));
  await Promise.all(jobs);
}

const unesc = (s) =>
  String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

/** Real text width in px, measured from the font file. `s` may contain XML entities. */
function tw(s, size, wt = 400, fam = "inter", letterSpacing = 0) {
  const m = METRICS[fam + wt];
  if (!m) throw new Error(`Add ${fam} ${wt} to MEASURED`);
  const chars = [...unesc(s)];
  return chars.reduce((a, c) => a + m(c.codePointAt(0)) * size, 0) + letterSpacing * chars.length;
}

/** Largest font size (≤ size) at which `s` fits in maxW. */
const fit = (s, maxW, size, wt = 400, fam = "inter") => Math.min(size, +(size * maxW / tw(s, size, wt, fam)).toFixed(2));

/** Works out which (family, weight) faces an SVG uses and the characters of each. */
function fontUsage(svgStr) {
  const use = new Map();
  const stack = [];
  const re = /<(\/?)(text|tspan)\b([^>]*?)(\/?)>|<[^>]+>|([^<]+)/g;
  let m;
  while ((m = re.exec(svgStr))) {
    if (m[2]) {
      if (m[1]) { stack.pop(); continue; }
      const parent = stack.at(-1) || { fam: "inter", wt: 400 };
      const cls = ((m[3].match(/\bclass="([^"]*)"/) || [])[1] || "").split(/\s+/);
      const fam = cls.includes("mono") ? "mono" : cls.includes("h") ? "jost" : parent.fam;
      const wm = m[3].match(/\bfont-weight="(\d+)"/);
      if (!m[4]) stack.push({ fam, wt: wm ? +wm[1] : parent.wt });
    } else if (m[5] && stack.length) {
      const { fam, wt } = stack.at(-1);
      const k = `${fam}|${wt}`;
      if (!use.has(k)) use.set(k, new Set(" "));
      for (const c of unesc(m[5])) use.get(k).add(c);
    }
  }
  return use;
}

async function embedFonts(svgStr) {
  const faces = await Promise.all(
    [...fontUsage(svgStr)].map(async ([k, set]) => {
      const [fam, wt] = k.split("|");
      const text = [...set].sort().join("");
      const woff2 = await cached(`woff2|${fam}|${wt}|${text}`, ".woff2", () => googleFont(fam, +wt, text, UA_WOFF2));
      return `@font-face{font-family:'${FAMILIES[fam].css}';font-style:normal;font-weight:${wt};src:url(data:font/woff2;base64,${woff2.toString("base64")}) format('woff2')}`;
    }),
  );
  return svgStr.replace("/*FONTS*/", faces.join(""));
}

// ---------------------------------------------------------------- SVG HELPERS
const ff = (f) => `'${FAMILIES[f].css}', ${FAMILIES[f].fallback}`;
const BASE_CSS = `/*FONTS*/
text{font-family:${ff("inter")}}
.h{font-family:${ff("jost")}}
.mono{font-family:${ff("mono")}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes ring{0%{r:5;opacity:.8}100%{r:16;opacity:0}}
@keyframes dash{to{stroke-dashoffset:-400}}
@keyframes twinkle{0%,100%{opacity:.15}50%{opacity:.9}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const f0 = (n) => (+n).toFixed(0);

const svg = (w, h, body, css = "", defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">` +
  `<style>${BASE_CSS}${css}</style><defs>${defs}</defs>${body}</svg>`;

const PAGES = [];
const save = (name, content) => PAGES.push([name, content]);

function shimmerGrad(id, width = 600, colors = [G_D, G_L, TEAL, G_D], dur = 6) {
  const stops = colors.map((c, i) => `<stop offset="${(i / (colors.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join("");
  return (
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${width}" y2="0" spreadMethod="repeat">${stops}` +
    `<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="${width} 0" dur="${dur}s" repeatCount="indefinite"/></linearGradient>`
  );
}

const shadow = (id, dy = 8, blur = 12, op = 0.07) =>
  `<filter id="${id}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="${dy}" stdDeviation="${blur}" flood-color="#0B3B1E" flood-opacity="${op}"/></filter>`;

/** Four-point sparkle. */
const sparkle = (cx, cy, s, fill, extra = "") =>
  `<path d="M${cx} ${cy - s}Q${cx} ${cy} ${cx + s} ${cy}Q${cx} ${cy} ${cx} ${cy + s}Q${cx} ${cy} ${cx - s} ${cy}Q${cx} ${cy} ${cx} ${cy - s}Z" fill="${fill}" ${extra}/>`;

/** Typing animation for code lines: each line is revealed by a growing clip rect. */
function typedLines(lines, { x, y0, step, size, dur, idPrefix, numX, start = 0.3, per = 0.75, hold = 0.94 }) {
  const out = [];
  lines.forEach((ln, i) => {
    const y = y0 + i * step;
    const plain = ln.map(([t]) => t).join("");
    const ww = tw(plain, size, 400, "mono") + 10;
    const t0 = (start + i * per) / dur, t1 = (start + i * per + 0.6) / dur;
    out.push(`<text class="mono" x="${numX}" y="${y}" font-size="${size - 1.5}" fill="${MUTE}" opacity=".55">${String(i + 1).padStart(2, " ")}</text>`);
    out.push(
      `<clipPath id="${idPrefix}${i}"><rect x="${x}" y="${y - size - 3}" height="${size + 9}" width="0">` +
        `<animate attributeName="width" values="0;0;${f0(ww)};${f0(ww)};0" keyTimes="0;${t0.toFixed(3)};${t1.toFixed(3)};${hold};1" dur="${dur}s" repeatCount="indefinite"/></rect></clipPath>`,
    );
    const spans = ln.map(([t, c]) => `<tspan fill="${c}">${t}</tspan>`).join("");
    out.push(`<text class="mono" clip-path="url(#${idPrefix}${i})" x="${x}" y="${y}" font-size="${size}" xml:space="preserve">${spans}</text>`);
  });
  return out.join("");
}

// --------------------------------------------------------------- HERO
function hero() {
  const W = 1000, H = 472;
  const X = 12, Y = 8, WW = W - 24, WH = 440;
  const defs = `
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG}"/><stop offset="1" stop-color="${TINT2}"/></linearGradient>
    ${shimmerGrad("name", 560)}
    <linearGradient id="btn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${G_L}"/><stop offset="1" stop-color="${G_D}"/></linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="50"/></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    ${shadow("win", 10, 12, 0.08)}${shadow("card", 10, 14, 0.1)}${shadow("chip", 4, 5, 0.08)}
    <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" stroke="${G}" stroke-opacity=".08"/></pattern>
    <radialGradient id="fade" cx=".72" cy=".35" r=".75"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <mask id="gm"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
    <clipPath id="clip"><rect x="${X}" y="${Y}" width="${WW}" height="${WH}" rx="20"/></clipPath>`;
  const css = `
    .float1{animation:float 6s ease-in-out infinite}
    .float2{animation:float 5s ease-in-out infinite;animation-delay:-2s}
    .float3{animation:float 7s ease-in-out infinite;animation-delay:-4s}
    .blink{animation:blink 1s step-end infinite}
    .tw{animation:twinkle 3s ease-in-out infinite}
    .in1{animation:up .8s ease both .1s}.in2{animation:up .8s ease both .3s}.in3{animation:up .8s ease both .5s}
    .in4{animation:up .8s ease both .7s}.in5{animation:up .8s ease both .9s}
    .ring{animation:ring 2s ease-out infinite}
    .btnglow{animation:pulse 2.6s ease-in-out infinite}`;
  const b = [];
  b.push(`<rect x="${X}" y="${Y}" width="${WW}" height="${WH}" rx="20" fill="${BG}" filter="url(#win)"/>`);
  b.push(`<g clip-path="url(#clip)"><rect width="${W}" height="${H}" fill="url(#bg)"/>`);
  // soft blobs
  b.push(`<g filter="url(#blur)">
      <circle cx="800" cy="190" r="150" fill="${G_L}" opacity=".16"><animateTransform attributeName="transform" type="translate" values="0 0;-60 40;0 0" dur="14s" repeatCount="indefinite"/></circle>
      <circle cx="640" cy="430" r="130" fill="${TEAL}" opacity=".12"><animateTransform attributeName="transform" type="translate" values="0 0;70 -30;0 0" dur="11s" repeatCount="indefinite"/></circle>
      <circle cx="120" cy="450" r="110" fill="${MINT}" opacity=".35"><animateTransform attributeName="transform" type="translate" values="0 0;40 -40;0 0" dur="16s" repeatCount="indefinite"/></circle>
    </g>`);
  b.push(`<rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gm)"/>`);
  // tiny green particles
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 16; i++) {
    const x = 40 + rnd() * 920, y = 80 + rnd() * 350, r = [1.2, 1.5, 2][Math.floor(rnd() * 3)];
    b.push(`<circle class="tw" cx="${f0(x)}" cy="${f0(y)}" r="${r}" fill="${G}" style="animation-delay:-${(rnd() * 3).toFixed(1)}s;animation-duration:${(2 + rnd() * 3).toFixed(1)}s"/>`);
  }
  // browser chrome
  b.push(`<rect x="${X}" y="${Y}" width="${WW}" height="46" fill="${BG}" fill-opacity=".85"/><line x1="${X}" y1="${Y + 46}" x2="${X + WW}" y2="${Y + 46}" stroke="${LINE}"/>`);
  ["#FF5F57", "#FEBC2E", "#28C840"].forEach((c, i) => b.push(`<circle cx="${X + 26 + i * 20}" cy="${Y + 23}" r="6" fill="${c}"/>`));
  b.push(`<rect x="300" y="${Y + 10}" width="400" height="26" rx="13" fill="${CARD}" stroke="${LINE}"/>`);
  b.push(`<path d="M324 ${Y + 20}v-2a4 4 0 0 1 8 0v2" stroke="${G}" stroke-width="1.6"/><rect x="322" y="${Y + 20}" width="12" height="9" rx="2" fill="${G}"/>`);
  b.push(`<text x="500" y="${Y + 28}" text-anchor="middle" font-size="13" font-weight="500" fill="${INK2}">${esc(DOMAIN)}</text>`);
  let nx = X + WW - 24;
  for (const t of ["Contact", "Services", "Stack", "About"]) {
    b.push(`<text x="${f0(nx)}" y="${Y + 28}" text-anchor="end" font-size="12.5" font-weight="500" fill="${MUTE}">${t}</text>`);
    nx -= tw(t, 12.5, 500) + 22;
  }
  b.push("</g>");
  b.push(`<rect x="${X}" y="${Y}" width="${WW}" height="${WH}" rx="20" stroke="${LINE}" stroke-width="1.2"/>`);

  // left content
  const pillW = tw(ROLE, 13.5, 600) + 52;
  b.push(`<g class="in1"><rect x="50" y="88" width="${f0(pillW)}" height="32" rx="16" fill="${TINT2}" stroke="${G}" stroke-opacity=".35"/>
      <circle cx="68" cy="104" r="4.5" fill="${G}"/><circle class="ring" cx="68" cy="104" r="5" stroke="${G}" stroke-width="1.6"/>
      <text x="82" y="109" font-size="13.5" font-weight="600" fill="${G_D}">${esc(ROLE)}</text></g>`);
  b.push(`<text class="in2" x="50" y="164" font-size="21" font-weight="500" fill="${INK2}">Hi there, I&#8217;m</text>`);
  const nameSize = fit(NAME, 530, 56, 700, "jost");
  b.push(`<text class="h in2" x="48" y="224" font-size="${nameSize}" font-weight="700" fill="url(#name)" letter-spacing="-.5">${esc(NAME)}</text>`);

  // rotating typed words
  const words = ["WordPress experiences", "Shopify themes", "headless CMS sites", "full-stack apps", "scalable APIs"];
  const cyc = words.length * 3;
  b.push(`<g class="in3"><text x="50" y="272" font-size="24" font-weight="600" fill="${INK}">I build</text>`);
  const x0 = 50 + tw("I build", 24, 600) + 9;
  words.forEach((wd, i) => {
    const ww = tw(wd, 24, 700) + 4;
    const a = (i * 3) / cyc, s1 = (i * 3 + 1.1) / cyc, s2 = (i * 3 + 2.4) / cyc, e = (i * 3 + 2.9) / cyc;
    const kt = [...new Set([0, a, s1, s2, e, 1])].sort((p, q) => p - q);
    const v = kt.map((k) => (k === s1 || k === s2 ? ww : 0));
    const kts = kt.map((k) => k.toFixed(4)).join(";");
    b.push(`<clipPath id="cw${i}"><rect x="${f0(x0)}" y="244" height="38" width="0"><animate attributeName="width" values="${v.map((n) => n.toFixed(1)).join(";")}" keyTimes="${kts}" dur="${cyc}s" repeatCount="indefinite" calcMode="linear"/></rect></clipPath>`);
    b.push(`<text clip-path="url(#cw${i})" x="${f0(x0)}" y="272" font-size="24" font-weight="700" fill="${G}">${esc(wd)}</text>`);
    b.push(
      `<rect y="251" width="2.5" height="28" rx="1" fill="${G}" opacity="0"><animate attributeName="x" values="${v.map((n) => (x0 + n + 1).toFixed(1)).join(";")}" keyTimes="${kts}" dur="${cyc}s" repeatCount="indefinite"/>` +
        `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;${(a + 0.0001).toFixed(4)};${e.toFixed(4)};1" dur="${cyc}s" repeatCount="indefinite" calcMode="discrete"/></rect>`,
    );
  });
  b.push("</g>");
  b.push(`<g class="in4"><text x="50" y="316" font-size="15.5" fill="${INK2}">2+ years shipping fast, secure web apps, stores &amp; CMS sites.</text>
      <text x="50" y="340" font-size="15.5" fill="${INK2}">Next.js · NestJS · PostgreSQL · Docker · AWS · WordPress · Shopify</text></g>`);
  const b1 = "See what I do &#8594;", b2 = "Let&#8217;s connect";
  const b1w = tw(b1, 15, 600) + 48, b2w = tw(b2, 15, 600) + 44;
  b.push(`<g class="in5">
      <rect class="btnglow" x="54" y="378" width="${f0(b1w - 8)}" height="40" rx="20" fill="${G}" opacity=".45" filter="url(#glow)"/>
      <rect x="50" y="368" width="${f0(b1w)}" height="46" rx="23" fill="url(#btn)"/>
      <text x="${f0(50 + b1w / 2)}" y="396" text-anchor="middle" font-size="15" font-weight="600" fill="#fff">${b1}</text>
      <rect x="${f0(50 + b1w + 14)}" y="368" width="${f0(b2w)}" height="46" rx="23" fill="${BG}" stroke="${LINE}" stroke-width="1.2"/>
      <text x="${f0(50 + b1w + 14 + b2w / 2)}" y="396" text-anchor="middle" font-size="15" font-weight="600" fill="${INK}">${b2}</text></g>`);

  // code card
  const P = C_PUN;
  const lines = [
    [["const ", C_KEY], ["nahid", C_ID], [" = {", P]],
    [["  role", C_PROP], [": ", P], ['"Full-Stack Engineer"', C_STR], [",", P]],
    [["  company", C_PROP], [": ", P], ['"Exprovia"', C_STR], [",", P]],
    [["  stack", C_PROP], [": [", P], ['"WP"', C_STR], [", ", P], ['"Shopify"', C_STR], ["],", P]],
    [["  backend", C_PROP], [": [", P], ['"NestJS"', C_STR], [", ", P], ['"AWS"', C_STR], ["],", P]],
    [["  cha", C_PROP], [": ", P], ["Infinity", TEAL], [",", P]],
    [["};", P]],
  ];
  const cx = 612, cy = 100, cw = 340, ch = 250;
  b.push(`<g class="float1"><rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="16" fill="${BG}" stroke="${LINE}" filter="url(#card)"/>`);
  b.push(`<path d="M${cx} ${cy + 40}V${cy + 16}a16 16 0 0 1 16-16h${cw - 32}a16 16 0 0 1 16 16V${cy + 40}z" fill="${CARD}"/><line x1="${cx}" y1="${cy + 40}" x2="${cx + cw}" y2="${cy + 40}" stroke="${LINE}"/>`);
  b.push(`<rect x="${cx + 12}" y="${cy + 8}" width="100" height="32" rx="7" fill="${BG}" stroke="${LINE}"/><rect x="${cx + 13}" y="${cy + 34}" width="98" height="8" fill="${BG}"/><circle cx="${cx + 27}" cy="${cy + 24}" r="4" fill="${G}"/>`);
  b.push(`<text class="mono" x="${cx + 38}" y="${cy + 29}" font-size="12.5" fill="${INK}">nahid.ts</text>`);
  b.push(`<text class="mono" x="${cx + cw - 16}" y="${cy + 28}" text-anchor="end" font-size="11" fill="${MUTE}">TypeScript</text>`);
  b.push(typedLines(lines, { x: cx + 42, y0: cy + 68, step: 25, size: 13.5, dur: 11, idPrefix: "cl", numX: cx + 12 }));
  b.push(`<rect class="blink" x="${cx + 62}" y="${cy + 68 + 6 * 25 - 14}" width="8" height="17" rx="1" fill="${G}"/>`);
  b.push("</g>");
  // floating brand badges
  const badges = [[556, 86, "WordPress", WP, "float2"], [872, 356, "Shopify", SHOP, "float3"], [588, 378, "Next.js", INK, "float3"], [880, 72, "NestJS", NEST, "float2"]];
  for (const [x, y, t, c, cl] of badges) {
    const w = tw(t, 13, 600) + 40;
    b.push(
      `<g class="${cl}"><rect x="${x}" y="${y}" width="${f0(w)}" height="32" rx="16" fill="${BG}" stroke="${c}" stroke-opacity=".4" filter="url(#chip)"/>` +
        `<circle cx="${x + 16}" cy="${y + 16}" r="4.5" fill="${c}"/><text x="${x + 27}" y="${y + 21}" font-size="13" font-weight="600" fill="${INK}">${t}</text></g>`,
    );
  }
  save("hero.svg", svg(W, H, b.join(""), css, defs));
}

// --------------------------------------------------------------- NAV BUTTONS
function nav() {
  const items = [["about", "About", "01"], ["stack", "Tech Stack", "02"], ["services", "What I Do", "03"],
    ["stats", "Stats", "04"], ["projects", "Projects", "05"], ["contact", "Contact", "06"]];
  items.forEach(([slug, label, n], i) => {
    const W = 150, H = 48;
    const defs = `<linearGradient id="bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${G_L}"/><stop offset=".5" stop-color="${G_D}"/><stop offset="1" stop-color="${TEAL}"/></linearGradient>`;
    const css = `.run{stroke-dasharray:60 340;animation:dash 4s linear infinite;animation-delay:-${(i * 0.6).toFixed(1)}s}`;
    const nw = tw(n, 11.5, 400, "mono"), lw = tw(label, 14.5, 600), gap = 8;
    const sx = (W - (nw + gap + lw)) / 2;
    const body =
      `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="24" fill="${BG}" stroke="${LINE}"/>` +
      `<rect class="run" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="24" stroke="url(#bd)" stroke-width="2"/>` +
      `<text class="mono" x="${sx.toFixed(1)}" y="29" font-size="11.5" fill="${G}">${n}</text>` +
      `<text x="${(sx + nw + gap).toFixed(1)}" y="30" font-size="14.5" font-weight="600" fill="${INK}">${esc(label)}</text>`;
    save(`nav-${slug}.svg`, svg(W, H, body, css, defs));
  });
  // back to top
  const W = 150, H = 40, lw = tw("Back to top", 13, 600);
  const sx = (W - (12 + 8 + lw)) / 2;
  const body =
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20" fill="${BG}" stroke="${LINE}"/>` +
    `<path d="M${sx + 6} 26V14M${sx} 19.5l6-6 6 6" stroke="${G}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<text x="${(sx + 20).toFixed(1)}" y="25" font-size="13" font-weight="600" fill="${INK2}">Back to top</text>`;
  save("nav-top.svg", svg(W, H, body));
}

// --------------------------------------------------------------- TICKER
function ticker() {
  const W = 1000, H = 58;
  const items = ["WordPress", "Shopify", "Liquid", "PHP", "Headless CMS", "Next.js", "React", "TypeScript",
    "NestJS", "PostgreSQL", "Prisma", "Redis", "BullMQ", "Docker", "AWS", "Linux", "Nginx", "GitHub Actions"];
  const colors = [G, TEAL, G_L, G_D];
  const xs = [];
  let x = 0;
  for (const t of items) { xs.push(x); x += tw(t, 17, 600, "jost") + 52; }
  const GAP = Math.round(x);
  const row = (off) =>
    items.map((t, i) => {
      const px = xs[i] + off, tx = px + tw(t, 17, 600, "jost");
      return `<text class="h" x="${f0(px)}" y="35" font-size="17" font-weight="600" fill="${INK}">${esc(t)}</text>` + sparkle(+(tx + 26).toFixed(1), 29, 6, colors[i % 4]);
    }).join("");
  const defs =
    `<linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="${BG}"/><stop offset=".08" stop-color="${BG}" stop-opacity="0"/>` +
    `<stop offset=".92" stop-color="${BG}" stop-opacity="0"/><stop offset="1" stop-color="${BG}"/></linearGradient>` +
    `<clipPath id="c"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14"/></clipPath>`;
  const body =
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="${BG}" stroke="${LINE}"/>` +
    `<g clip-path="url(#c)"><g>${row(24)}${row(24 + GAP)}${row(24 + 2 * GAP)}` +
    `<animateTransform attributeName="transform" type="translate" from="0 0" to="-${GAP} 0" dur="${(GAP / 45).toFixed(1)}s" repeatCount="indefinite"/></g>` +
    `<rect width="${W}" height="${H}" fill="url(#edge)"/></g>`;
  save("ticker.svg", svg(W, H, body, "", defs));
}

// --------------------------------------------------------------- SECTION HEADERS
function headers() {
  const secs = [["about", "01", "About Me", "Who I am and what I do every day"],
    ["stack", "02", "Tech Stack", "The tools I use to design, build and ship"],
    ["services", "03", "What I Do", "From CMS builds to full-stack apps, end to end"],
    ["stats", "04", "GitHub Stats", "Consistency beats intensity"],
    ["projects", "05", "Featured Work", "Things I've built and shipped"],
    ["contact", "06", "Let's Connect", "Open to collaborate and build together"]];
  for (const [slug, n, title, sub] of secs) {
    const W = 1000, H = 110;
    const defs =
      shimmerGrad("tg", 420, [INK, G, INK], 5) +
      `<linearGradient id="ln" x1="0" x2="1"><stop offset="0" stop-color="${G}"/><stop offset=".55" stop-color="${G_L}"/><stop offset="1" stop-color="${G_L}" stop-opacity="0"/></linearGradient>` +
      `<filter id="gl" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3"/></filter>`;
    const css = `.draw{stroke-dasharray:1000;stroke-dashoffset:1000;animation:drawl 2.2s ease forwards .2s}
      @keyframes drawl{to{stroke-dashoffset:0}}
      .t{animation:up .8s ease both}.s{animation:up .8s ease both .25s}
      .bx{animation:up .6s ease both}.pl{animation:pulse 3s ease-in-out infinite}`;
    const body =
      `<g class="bx"><rect x="1" y="16" width="62" height="62" rx="16" fill="${TINT2}" stroke="${TINT}" stroke-width="1.5"/>` +
      `<rect class="pl" x="1" y="16" width="62" height="62" rx="16" stroke="${G}" stroke-opacity=".35" stroke-width="1.5"/>` +
      `<text class="h" x="32" y="56" text-anchor="middle" font-size="24" font-weight="700" fill="${G}">${n}</text></g>` +
      `<text class="h t" x="84" y="50" font-size="32" font-weight="700" fill="url(#tg)">${esc(title)}</text>` +
      `<text class="s" x="85" y="77" font-size="15" fill="${MUTE}">${esc(sub)}</text>` +
      `<line x1="0" y1="100" x2="${W}" y2="100" stroke="${LINE}"/>` +
      `<line class="draw" x1="0" y1="100" x2="${W}" y2="100" stroke="url(#ln)" stroke-width="2.5"/>` +
      `<circle cy="100" r="7" fill="${G_L}" opacity=".45" filter="url(#gl)"><animate attributeName="cx" values="0;${W * 0.7};0" dur="7s" repeatCount="indefinite"/></circle>` +
      `<circle cy="100" r="3.5" fill="${G}"><animate attributeName="cx" values="0;${W * 0.7};0" dur="7s" repeatCount="indefinite"/></circle>`;
    save(`h-${slug}.svg`, svg(W, H, body, css, defs));
  }
}

// --------------------------------------------------------------- ABOUT
function about() {
  const W = 1000, H = 380;
  const css = `.blink{animation:blink 1s step-end infinite}
    .c1{animation:up .7s ease both .2s}.c2{animation:up .7s ease both .4s}.c3{animation:up .7s ease both .6s}.c4{animation:up .7s ease both .8s}
    .bar{animation:grow 2.5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:left}
    @keyframes grow{from{transform:scaleX(.25)}to{transform:scaleX(1)}}
    .glow{animation:pulse 3s ease-in-out infinite}`;
  const ex = 1, ey = 1, ew = 540, eh = 376;
  const defs = `<clipPath id="ed"><rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" rx="16"/></clipPath>`;
  const b = [];
  // editor
  b.push(`<rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" rx="16" fill="${BG}"/>`);
  b.push(`<g clip-path="url(#ed)"><rect x="${ex}" y="${ey}" width="${ew}" height="44" fill="${CARD}"/>`);
  b.push(`<rect x="${ex}" y="${ey + eh - 30}" width="${ew}" height="30" fill="${G}"/></g>`);
  b.push(`<line x1="${ex}" y1="${ey + 44}" x2="${ex + ew}" y2="${ey + 44}" stroke="${LINE}"/>`);
  ["#FF5F57", "#FEBC2E", "#28C840"].forEach((c, i) => b.push(`<circle cx="${ex + 24 + i * 18}" cy="${ey + 22}" r="5.5" fill="${c}"/>`));
  b.push(`<rect x="${ex + 90}" y="${ey + 8}" width="128" height="37" rx="7" fill="${BG}" stroke="${LINE}"/><rect x="${ex + 91}" y="${ey + 38}" width="126" height="8" fill="${BG}"/>`);
  b.push(`<circle cx="${ex + 106}" cy="${ey + 26}" r="4" fill="${G}"/><text class="mono" x="${ex + 117}" y="${ey + 31}" font-size="13" fill="${INK}">about-me.ts</text>`);
  const K = C_PROP, S = C_STR, I = C_PUN;
  const lines = [
    [["// hello world, I'm Nahid", C_COM]],
    [["const ", C_KEY], ["nahid", C_ID], [": ", I], ["Developer", C_TYPE], [" = {", I]],
    [["  name", K], [": ", I], ['"Asratul Hasan Nahid"', S], [",", I]],
    [["  role", K], [": ", I], ['"Full-Stack Engineer"', S], [",", I]],
    [["  company", K], [": ", I], ['"@exprovia"', S], [",", I]],
    [["  experience", K], [": ", I], ['"2+ years"', S], [",", I]],
    [["  craft", K], [": [", I], ['"WordPress"', S], [", ", I], ['"Shopify"', S], [", ", I], ['"Headless"', S], ["],", I]],
    [["  fullStack", K], [": [", I], ['"Next.js"', S], [", ", I], ['"NestJS"', S], [", ", I], ['"AWS"', S], ["],", I]],
    [["  motto", K], [": ", I], ['"Build things people love"', S], [",", I]],
    [["};", I]],
  ];
  b.push(typedLines(lines, { x: ex + 52, y0: ey + 80, step: 28, size: 14, dur: 14, idPrefix: "a", numX: ex + 18, start: 0.4, per: 0.8, hold: 0.95 }));
  b.push(`<rect class="blink" x="${ex + 72}" y="${ey + 80 + 9 * 28 - 15}" width="8" height="18" rx="1" fill="${G}"/>`);
  b.push(`<circle cx="${ex + 22}" cy="${ey + eh - 15}" r="3.5" fill="#fff"/>`);
  b.push(`<text class="mono" x="${ex + 33}" y="${ey + eh - 11}" font-size="11.5" fill="#fff" xml:space="preserve">main   UTF-8   TypeScript   Ln 10, Col 3</text>`);
  b.push(`<rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" rx="16" stroke="${LINE}"/>`);
  // stat cards
  const cards = [["2+", "Years", "building for the web", G],
    ["WP", "WordPress", "themes, plugins &amp; speed", WP],
    ["SH", "Shopify", "Liquid theme development", SHOP],
    ["FS", "Full-Stack", "Next.js · NestJS · PostgreSQL", TEAL]];
  const cw = 214, ch = 180, gx = 16;
  cards.forEach(([big, title, sub, col], i) => {
    const x = 555 + (i % 2) * (cw + gx), y = 1 + Math.floor(i / 2) * (ch + 16);
    const subSize = fit(sub, cw - 40, 12.5);
    b.push(
      `<g class="c${i + 1}"><rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="16" fill="${BG}" stroke="${LINE}"/>` +
        `<rect class="glow" x="${x}" y="${y}" width="${cw}" height="${ch}" rx="16" stroke="${col}" stroke-opacity=".45" style="animation-delay:-${(i * 0.75).toFixed(2)}s"/>` +
        `<rect x="${x + cw - 46}" y="${y + 18}" width="28" height="28" rx="8" fill="${col}" fill-opacity=".1"/>` +
        `<path d="M${x + cw - 37} ${y + 37}l10-10M${x + cw - 35} ${y + 27}h8v8" stroke="${col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<text class="h" x="${x + 20}" y="${y + 64}" font-size="40" font-weight="700" fill="${col}">${big}</text>` +
        `<text x="${x + 20}" y="${y + 104}" font-size="17" font-weight="700" fill="${INK}">${title}</text>` +
        `<text x="${x + 20}" y="${y + 127}" font-size="${subSize}" fill="${MUTE}">${sub}</text>` +
        `<rect x="${x + 20}" y="${y + 148}" width="${cw - 40}" height="6" rx="3" fill="${PANEL}"/>` +
        `<rect class="bar" x="${x + 20}" y="${y + 148}" width="${cw - 40}" height="6" rx="3" fill="${col}" style="animation-delay:-${(i * 0.6).toFixed(1)}s"/></g>`,
    );
  });
  save("about.svg", svg(W, H, b.join(""), css, defs));
}

// --------------------------------------------------------------- STACK
function stack() {
  const W = 1000;
  const cols = [
    ["Daily Driver", "What I ship with every week", G,
      ["WordPress", "PHP", "Shopify", "Liquid", "WooCommerce", "JavaScript", "React", "Next.js", "Tailwind CSS", "MySQL"]],
    ["Full-Stack", "Apps, APIs &amp; databases", TEAL,
      ["TypeScript", "Node.js", "NestJS", "PostgreSQL", "Prisma", "Redis", "BullMQ", "Docker", "AWS", "GitHub Actions", "Jest", "Playwright"]],
    ["Server &amp; Craft", "Keeping things fast &amp; secure", EMERALD,
      ["Linux", "Nginx", "Git", "Server Security", "Performance", "Headless CMS", "REST APIs", "System Design", "Figma", "AI Pair-Programming"]],
  ];
  const cw = 318, gap = 23, pad = 20;
  let maxh = 0;
  const layouts = cols.map(([, , , chips]) => {
    let x = pad, y = 104;
    const pos = [];
    for (const c of chips) {
      const w = tw(c, 13, 600) + 36;
      if (x + w > cw - pad) { x = pad; y += 38; }
      pos.push([x, y, w, c]);
      x += w + 8;
    }
    maxh = Math.max(maxh, y + 30 + 22);
    return pos;
  });
  const H = maxh + 4;
  let css = ".run{stroke-dasharray:90 1400;animation:dash2 6s linear infinite}@keyframes dash2{to{stroke-dashoffset:-1490}}";
  for (let i = 0; i < 40; i++) css += `.k${i}{animation:up .6s ease both ${(0.15 + i * 0.06).toFixed(2)}s}`;
  let defs = "", k = 0;
  const b = [];
  cols.forEach(([title, sub, col], ci) => {
    const ox = 1 + ci * (cw + gap);
    defs += `<linearGradient id="hd${ci}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".09"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient>`;
    b.push(
      `<g transform="translate(${ox} 1)"><rect width="${cw}" height="${H - 2}" rx="18" fill="${BG}" stroke="${LINE}"/>` +
        `<rect width="${cw}" height="90" rx="18" fill="url(#hd${ci})"/>` +
        `<rect class="run" width="${cw}" height="${H - 2}" rx="18" stroke="${col}" stroke-width="2" style="animation-delay:-${ci * 2}s"/>` +
        `<rect x="${pad}" y="26" width="38" height="38" rx="11" fill="${col}" fill-opacity=".1" stroke="${col}" stroke-opacity=".35"/>` +
        `<text class="h" x="${pad + 19}" y="51" text-anchor="middle" font-size="18" font-weight="700" fill="${col}">${ci + 1}</text>` +
        `<text class="h" x="${pad + 52}" y="42" font-size="20" font-weight="700" fill="${INK}">${title}</text>` +
        `<text x="${pad + 52}" y="62" font-size="12.5" fill="${MUTE}">${sub}</text>` +
        `<line x1="${pad}" y1="86" x2="${cw - pad}" y2="86" stroke="${LINE}"/>`,
    );
    for (const [x, y, w, c] of layouts[ci]) {
      b.push(
        `<g class="k${k}"><rect x="${f0(x)}" y="${y}" width="${f0(w)}" height="30" rx="15" fill="${CARD}" stroke="${col}" stroke-opacity=".25"/>` +
          `<circle cx="${f0(x + 15)}" cy="${y + 15}" r="3.5" fill="${col}"/>` +
          `<text x="${f0(x + 25)}" y="${y + 20}" font-size="13" font-weight="600" fill="${INK2}">${esc(c)}</text></g>`,
      );
      k++;
    }
    b.push("</g>");
  });
  save("stack.svg", svg(W, H, b.join(""), css, defs));
}

// --------------------------------------------------------------- SERVICES
function services() {
  const W = 1000;
  const items = [
    ["WP", "WordPress Development", WP, ["Custom themes &amp; plugins", "Speed &amp; Core Web Vitals", "Server setup &amp; hardening"]],
    ["SH", "Shopify Development", SHOP, ["Liquid theme development", "Store customization", "Third-party app integration"]],
    ["HL", "Headless CMS", TEAL, ["WordPress as a backend", "Next.js frontends", "SEO-friendly, blazing fast"]],
    ["FS", "Full-Stack Apps", G, ["Next.js + NestJS", "PostgreSQL + Prisma", "Auth, payments &amp; webhooks"]],
    ["API", "Backend &amp; APIs", G_D, ["REST APIs with Swagger docs", "BullMQ queues &amp; Redis caching", "Tested &amp; secure by default"]],
    ["OPS", "DevOps &amp; Cloud", CYAN, ["Docker &amp; Docker Compose", "AWS: EC2, RDS, S3", "CI/CD with GitHub Actions"]],
  ];
  const cw = 322, ch = 236, g = 16;
  const H = 2 * ch + g + 2;
  let css = ".run{stroke-dasharray:110 1000;animation:d 7s linear infinite}@keyframes d{to{stroke-dashoffset:-1110}}.float{animation:float 5s ease-in-out infinite}";
  for (let i = 0; i < 6; i++) css += `.s${i}{animation:up .7s ease both ${(0.1 + i * 0.12).toFixed(2)}s}`;
  let defs = "";
  const b = [];
  items.forEach(([ic, title, col, pts], i) => {
    const x = 1 + (i % 3) * (cw + g), y = 1 + Math.floor(i / 3) * (ch + g);
    defs += `<radialGradient id="rg${i}" cx="1" cy="0" r="1"><stop offset="0" stop-color="${col}" stop-opacity=".1"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`;
    const tSize = fit(title, cw - 44, 20, 600, "jost");
    b.push(
      `<g class="s${i}"><rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="18" fill="${BG}" stroke="${LINE}"/>` +
        `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="18" fill="url(#rg${i})"/>` +
        `<rect class="run" x="${x}" y="${y}" width="${cw}" height="${ch}" rx="18" stroke="${col}" stroke-width="2" style="animation-delay:-${(i * 1.1).toFixed(1)}s"/>` +
        `<g class="float" style="animation-delay:-${(i * 0.8).toFixed(1)}s"><rect x="${x + 22}" y="${y + 22}" width="52" height="52" rx="14" fill="${col}" fill-opacity=".1" stroke="${col}" stroke-opacity=".4"/>` +
        `<text class="h" x="${x + 48}" y="${y + 54}" text-anchor="middle" font-size="${ic.length < 3 ? 18 : 15}" font-weight="700" fill="${col}">${ic}</text></g>` +
        `<text class="mono" x="${x + cw - 22}" y="${y + 44}" text-anchor="end" font-size="13" fill="${MUTE}">0${i + 1}</text>` +
        `<text class="h" x="${x + 22}" y="${y + 112}" font-size="${tSize}" font-weight="600" fill="${INK}">${title}</text>`,
    );
    pts.forEach((p, j) => {
      const py = y + 148 + j * 28;
      b.push(
        `<circle cx="${x + 31}" cy="${py - 5}" r="9" fill="${col}" fill-opacity=".1"/>` +
          `<path d="M${x + 27} ${py - 5}l3 3 5.5-6" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
          `<text x="${x + 48}" y="${py}" font-size="${fit(p, cw - 68, 14)}" fill="${INK2}">${p}</text>`,
      );
    });
    b.push("</g>");
  });
  save("services.svg", svg(W, H, b.join(""), css, defs));
}

// --------------------------------------------------------------- CONTACT BUTTONS
function contact() {
  const globe = `<circle cx="36" cy="34" r="9" stroke="#fff" stroke-width="1.8"/><ellipse cx="36" cy="34" rx="4" ry="9" stroke="#fff" stroke-width="1.6"/><path d="M27 34h18" stroke="#fff" stroke-width="1.6"/>`;
  const items = [["linkedin", "LinkedIn", "Let's network", LINKEDIN, "in"],
    ["facebook", "Facebook", "Say hello", FACEBOOK, "f"],
    ["email", "Email", "Drop a message", GMAIL, "@"],
    ["portfolio", "Portfolio", "See my work", G, null]];
  items.forEach(([slug, label, sub, col, ic], i) => {
    const W = 220, H = 68;
    const defs =
      `<linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="${col}" stop-opacity="0"/><stop offset=".5" stop-color="${col}" stop-opacity=".12"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient>` +
      `<clipPath id="c"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18"/></clipPath>`;
    const icon = ic ? `<text x="36" y="40.5" text-anchor="middle" font-size="${ic === "@" ? 18 : 19}" font-weight="700" fill="#fff">${ic}</text>` : globe;
    const body =
      `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${BG}" stroke="${LINE}"/>` +
      `<g clip-path="url(#c)"><rect x="-80" y="0" width="70" height="${H}" fill="url(#sh)" transform="skewX(-20)">` +
      `<animate attributeName="x" values="-80;300;300" keyTimes="0;.35;1" dur="4s" begin="${i * 0.5}s" repeatCount="indefinite"/></rect></g>` +
      `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" stroke="${col}" stroke-opacity=".25"/>` +
      `<rect x="16" y="14" width="40" height="40" rx="12" fill="${col}"/>${icon}` +
      `<text x="70" y="32" font-size="16" font-weight="700" fill="${INK}">${label}</text>` +
      `<text x="70" y="51" font-size="12.5" fill="${MUTE}">${sub}</text>` +
      `<path d="M${W - 30} 40l9-9M${W - 28} 31h7v7" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    save(`btn-${slug}.svg`, svg(W, H, body, "", defs));
  });
}

// --------------------------------------------------------------- FOOTER
function footer() {
  const W = 1000, H = 230;
  const defs = shimmerGrad("fg", 520, [G_D, G_L, TEAL, G_D], 6);
  const wave = (amp, y, col, op, dur, rev = false) => {
    let d = `M0 ${y}`;
    for (let i = 0; i < 8; i++) { const x = i * 250; d += ` Q${x + 62} ${y - amp} ${x + 125} ${y} T${x + 250} ${y}`; }
    d += ` V${H} H0Z`;
    const [fr, to] = rev ? ["-500 0", "0 0"] : ["0 0", "-500 0"];
    return `<path d="${d}" fill="${col}" fill-opacity="${op}"><animateTransform attributeName="transform" type="translate" from="${fr}" to="${to}" dur="${dur}s" repeatCount="indefinite"/></path>`;
  };
  const body =
    wave(18, 150, TINT, 0.9, 10) + wave(14, 165, MINT, 0.55, 7, true) + wave(10, 182, G_L, 0.14, 13) +
    sparkle(W / 2 - 215, 50, 7, G_L, `opacity=".8"`) + sparkle(W / 2 + 215, 50, 7, G, `opacity=".8"`) +
    `<text class="h" x="${W / 2}" y="62" text-anchor="middle" font-size="36" font-weight="700" fill="url(#fg)">Thanks for stopping by!</text>` +
    `<text x="${W / 2}" y="96" text-anchor="middle" font-size="16" fill="${INK2}">Let&#8217;s build something amazing together.</text>` +
    `<text x="${W / 2}" y="214" text-anchor="middle" font-size="12.5" font-weight="500" fill="${G_D}">${esc(NAME)}  ·  Built with code &amp; lots of cha</text>`;
  save("footer.svg", svg(W, H, body, "", defs));
}

// --------------------------------------------------------------- MAIN
console.log("Loading font metrics…");
await loadMetrics();
hero(); nav(); ticker(); headers(); about(); stack(); services(); contact(); footer();
console.log(`Embedding fonts and writing SVGs → ${OUT}`);
let total = 0;
for (const [name, content] of PAGES) {
  const out = await embedFonts(content);
  writeFileSync(join(OUT, name), out, "utf8");
  total += out.length;
  console.log(`  ✓ ${name.padEnd(18)} ${(out.length / 1024).toFixed(0).padStart(4)} KB`);
}
console.log(`Done. ${PAGES.length} files, ${(total / 1024).toFixed(0)} KB total.`);

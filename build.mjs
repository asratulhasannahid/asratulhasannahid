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

// ---------------------------------------------------------------- PALETTE (dark, one green accent)
const BG = "#0A0E0C", CARD = "#0F1412", PANEL = "#151C18", LINE = "#1F2924", LINE2 = "#2B3731";
const INK = "#EDF3EF", INK2 = "#A6B5AD", MUTE = "#71827A";
const G = "#22C55E", G_L = "#4ADE80", G_D = "#16A34A", MINT = "#A7F3D0";
// code editor (dark)
const C_KEY = G_L, C_PROP = "#9AA8B6", C_STR = "#F5C98B", C_COM = "#56665E", C_ID = INK, C_TYPE = "#5EEAD4", C_PUN = "#7E8E86";
// brand colors, only on brand items (lightened where needed to read on dark)
const WP = "#4AA3DF", SHOP = "#95BF47", LINKEDIN = "#0A66C2", FACEBOOK = "#1877F2", GMAIL = "#D14836";
// section headers have no background, so their colors must read on GitHub's light AND dark page
const HEAD = G_D, HEAD_SUB = MUTE;

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

function shimmerGrad(id, width = 600, colors = [G, G_L, MINT, G_L, G], dur = 7) {
  const stops = colors.map((c, i) => `<stop offset="${(i / (colors.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join("");
  return (
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${width}" y2="0" spreadMethod="repeat">${stops}` +
    `<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="${width} 0" dur="${dur}s" repeatCount="indefinite"/></linearGradient>`
  );
}

/** Typing animation for code lines: each line is revealed by a growing clip rect,
 *  and a blinking caret jumps to the end of each line as it finishes. */
function typedLines(lines, { x, y0, step, size, dur, idPrefix, numX, start = 0.3, per = 0.75, hold = 0.94 }) {
  const out = [];
  const cx = [x], cy = [y0 - size + 1], kt = [0];
  lines.forEach((ln, i) => {
    const y = y0 + i * step;
    const plain = ln.map(([t]) => t).join("");
    const ww = tw(plain, size, 400, "mono") + 10;
    const t0 = (start + i * per) / dur, t1 = (start + i * per + 0.6) / dur;
    cx.push(x + ww - 7); cy.push(y - size + 1); kt.push(t1);
    out.push(`<text class="mono" x="${numX}" y="${y}" font-size="${size - 1.5}" fill="${MUTE}" opacity=".55">${String(i + 1).padStart(2, " ")}</text>`);
    out.push(
      `<clipPath id="${idPrefix}${i}"><rect x="${x}" y="${y - size - 3}" height="${size + 9}" width="0">` +
        `<animate attributeName="width" values="0;0;${f0(ww)};${f0(ww)};0" keyTimes="0;${t0.toFixed(3)};${t1.toFixed(3)};${hold};1" dur="${dur}s" repeatCount="indefinite"/></rect></clipPath>`,
    );
    const spans = ln.map(([t, c]) => `<tspan fill="${c}">${t}</tspan>`).join("");
    out.push(`<text class="mono" clip-path="url(#${idPrefix}${i})" x="${x}" y="${y}" font-size="${size}" xml:space="preserve">${spans}</text>`);
  });
  cx.push(x); cy.push(y0 - size + 1); kt.push(hold);
  const keys = kt.map((k) => k.toFixed(3)).join(";");
  out.push(
    `<rect class="blink" width="${Math.round(size * 0.55)}" height="${size + 4}" rx="1" fill="${G}" opacity=".85">` +
      `<animate attributeName="x" values="${cx.map(f0).join(";")}" keyTimes="${keys}" dur="${dur}s" repeatCount="indefinite" calcMode="discrete"/>` +
      `<animate attributeName="y" values="${cy.map(f0).join(";")}" keyTimes="${keys}" dur="${dur}s" repeatCount="indefinite" calcMode="discrete"/></rect>`,
  );
  return out.join("");
}

// --------------------------------------------------------------- HERO
function hero() {
  const W = 1000, H = 440;
  const defs = `
    ${shimmerGrad("name", 560)}
    <radialGradient id="glow" cx=".8" cy=".2" r=".6"><stop offset="0" stop-color="${G}" stop-opacity=".11"/><stop offset="1" stop-color="${G}" stop-opacity="0"/>
      <animate attributeName="cx" values=".8;.68;.8" dur="14s" repeatCount="indefinite"/></radialGradient>
    <radialGradient id="glow2" cx=".05" cy="1" r=".5"><stop offset="0" stop-color="${G}" stop-opacity=".07"/><stop offset="1" stop-color="${G}" stop-opacity="0"/></radialGradient>
    <clipPath id="clip"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18"/></clipPath>`;
  const css = `
    .float{animation:float 7s ease-in-out infinite}
    .in1{animation:up .8s ease both .1s}.in2{animation:up .8s ease both .3s}.in3{animation:up .8s ease both .5s}
    .in4{animation:up .8s ease both .7s}.in5{animation:up .8s ease both .9s}.in6{animation:up .9s ease both .6s}
    .ring{animation:ring 2.2s ease-out infinite}`;
  const b = [];
  b.push(`<g clip-path="url(#clip)"><rect width="${W}" height="${H}" fill="${BG}"/><rect width="${W}" height="${H}" fill="url(#glow)"/><rect width="${W}" height="${H}" fill="url(#glow2)"/>`);
  // browser bar
  b.push(`<rect width="${W}" height="44" fill="${CARD}"/><line x1="0" y1="44.5" x2="${W}" y2="44.5" stroke="${LINE}"/>`);
  [0, 1, 2].forEach((i) => b.push(`<circle cx="${26 + i * 18}" cy="22" r="5.5" fill="${LINE2}"/>`));
  b.push(`<rect x="320" y="10" width="360" height="24" rx="12" fill="${BG}" stroke="${LINE}"/>`);
  b.push(`<path d="M343 20v-2a4 4 0 0 1 8 0v2" stroke="${G}" stroke-width="1.5"/><rect x="341" y="20" width="12" height="8.5" rx="2" fill="${G}"/>`);
  b.push(`<text x="500" y="27" text-anchor="middle" font-size="12.5" font-weight="500" fill="${MUTE}">${esc(DOMAIN)}</text>`);
  let nx = W - 28;
  for (const t of ["Contact", "Services", "Stack", "About"]) {
    b.push(`<text x="${f0(nx)}" y="27" text-anchor="end" font-size="12.5" font-weight="500" fill="${MUTE}">${t}</text>`);
    nx -= tw(t, 12.5, 500) + 22;
  }
  b.push("</g>");
  b.push(`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" stroke="${LINE}"/>`);

  // left column
  const L = 56;
  const pillW = tw(ROLE, 13, 600) + 48;
  b.push(`<g class="in1"><rect x="${L}" y="96" width="${f0(pillW)}" height="30" rx="15" fill="${G}" fill-opacity=".08" stroke="${G}" stroke-opacity=".3"/>
      <circle cx="${L + 17}" cy="111" r="4" fill="${G}"/><circle class="ring" cx="${L + 17}" cy="111" r="5" stroke="${G}" stroke-width="1.5"/>
      <text x="${L + 30}" y="115.5" font-size="13" font-weight="600" fill="${G_L}">${esc(ROLE)}</text></g>`);
  b.push(`<text class="in2" x="${L}" y="168" font-size="20" font-weight="500" fill="${INK2}">Hi there, I&#8217;m</text>`);
  const nameSize = fit(NAME, 500, 54, 700, "jost");
  b.push(`<text class="h in2" x="${L - 2}" y="224" font-size="${nameSize}" font-weight="700" fill="url(#name)" letter-spacing="-.5">${esc(NAME)}</text>`);

  // rotating typed words
  const words = ["WordPress experiences", "Shopify themes", "headless CMS sites", "full-stack apps", "scalable APIs"];
  const cyc = words.length * 3;
  b.push(`<g class="in3"><text x="${L}" y="270" font-size="22" font-weight="600" fill="${INK}">I build</text>`);
  const x0 = L + tw("I build", 22, 600) + 8;
  words.forEach((wd, i) => {
    const ww = tw(wd, 22, 700) + 4;
    const a = (i * 3) / cyc, s1 = (i * 3 + 1.1) / cyc, s2 = (i * 3 + 2.4) / cyc, e = (i * 3 + 2.9) / cyc;
    const kt = [...new Set([0, a, s1, s2, e, 1])].sort((p, q) => p - q);
    const v = kt.map((k) => (k === s1 || k === s2 ? ww : 0));
    const kts = kt.map((k) => k.toFixed(4)).join(";");
    b.push(`<clipPath id="cw${i}"><rect x="${f0(x0)}" y="244" height="36" width="0"><animate attributeName="width" values="${v.map((n) => n.toFixed(1)).join(";")}" keyTimes="${kts}" dur="${cyc}s" repeatCount="indefinite" calcMode="linear"/></rect></clipPath>`);
    b.push(`<text clip-path="url(#cw${i})" x="${f0(x0)}" y="270" font-size="22" font-weight="700" fill="${G_L}">${esc(wd)}</text>`);
    b.push(
      `<rect y="250" width="2.5" height="26" rx="1" fill="${G_L}" opacity="0"><animate attributeName="x" values="${v.map((n) => (x0 + n + 1).toFixed(1)).join(";")}" keyTimes="${kts}" dur="${cyc}s" repeatCount="indefinite"/>` +
        // discrete: each value holds until the next keyTime, so the caret shows only from a to e
        `<animate attributeName="opacity" values="0;1;0" keyTimes="0;${(a + 0.0001).toFixed(4)};${e.toFixed(4)}" dur="${cyc}s" repeatCount="indefinite" calcMode="discrete"/></rect>`,
    );
  });
  b.push("</g>");
  b.push(`<text class="in4" x="${L}" y="310" font-size="15" fill="${MUTE}">2+ years shipping fast, secure web apps, stores &amp; CMS sites.</text>`);
  const b1 = "See what I do &#8594;", b2 = "Let&#8217;s connect";
  const b1w = tw(b1, 14.5, 600) + 44, b2w = tw(b2, 14.5, 600) + 40;
  b.push(`<g class="in5">
      <rect x="${L}" y="340" width="${f0(b1w)}" height="44" rx="22" fill="${G}"/>
      <text x="${f0(L + b1w / 2)}" y="367" text-anchor="middle" font-size="14.5" font-weight="600" fill="#06140B">${b1}</text>
      <rect x="${f0(L + b1w + 12)}" y="340" width="${f0(b2w)}" height="44" rx="22" fill="${CARD}" stroke="${LINE2}"/>
      <text x="${f0(L + b1w + 12 + b2w / 2)}" y="367" text-anchor="middle" font-size="14.5" font-weight="600" fill="${INK}">${b2}</text></g>`);

  // code card (right column)
  const P = C_PUN;
  const lines = [
    [["const ", C_KEY], ["nahid", C_ID], [" = {", P]],
    [["  role", C_PROP], [": ", P], ['"Full-Stack Engineer"', C_STR], [",", P]],
    [["  company", C_PROP], [": ", P], ['"Exprovia"', C_STR], [",", P]],
    [["  stack", C_PROP], [": [", P], ['"WP"', C_STR], [", ", P], ['"Shopify"', C_STR], ["],", P]],
    [["  backend", C_PROP], [": [", P], ['"NestJS"', C_STR], [", ", P], ['"AWS"', C_STR], ["],", P]],
    [["  cha", C_PROP], [": ", P], ["Infinity", C_TYPE], [",", P]],
    [["};", P]],
  ];
  const cw = 356, ch = 262, cx = W - 56 - cw, cy = 112;
  b.push(`<g class="in6"><g class="float"><rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="14" fill="${CARD}" stroke="${LINE}"/>`);
  b.push(`<path d="M${cx} ${cy + 40}V${cy + 14}a14 14 0 0 1 14-14h${cw - 28}a14 14 0 0 1 14 14V${cy + 40}z" fill="${PANEL}"/><line x1="${cx}" y1="${cy + 40.5}" x2="${cx + cw}" y2="${cy + 40.5}" stroke="${LINE}"/>`);
  [0, 1, 2].forEach((i) => b.push(`<circle cx="${cx + 20 + i * 15}" cy="${cy + 20}" r="4.5" fill="${LINE2}"/>`));
  b.push(`<circle cx="${cx + 82}" cy="${cy + 20}" r="3.5" fill="${G}"/><text class="mono" x="${cx + 92}" y="${cy + 24.5}" font-size="12" fill="${INK2}">nahid.ts</text>`);
  b.push(`<text class="mono" x="${cx + cw - 16}" y="${cy + 24.5}" text-anchor="end" font-size="11" fill="${MUTE}">TypeScript</text>`);
  b.push(typedLines(lines, { x: cx + 44, y0: cy + 74, step: 26, size: 13.5, dur: 11, idPrefix: "cl", numX: cx + 14 }));
  b.push("</g></g>");
  save("hero.svg", svg(W, H, b.join(""), css, defs));
}

// --------------------------------------------------------------- NAV BUTTONS
function nav() {
  const items = [["about", "About", "01"], ["stack", "Tech Stack", "02"], ["services", "What I Do", "03"],
    ["stats", "Stats", "04"], ["projects", "Projects", "05"], ["contact", "Contact", "06"]];
  for (const [slug, label, n] of items) {
    const W = 150, H = 46;
    const nw = tw(n, 11.5, 400, "mono"), lw = tw(label, 14, 600), gap = 8;
    const sx = (W - (nw + gap + lw)) / 2;
    const body =
      `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="23" fill="${CARD}" stroke="${LINE2}"/>` +
      `<text class="mono" x="${sx.toFixed(1)}" y="28" font-size="11.5" fill="${G}">${n}</text>` +
      `<text x="${(sx + nw + gap).toFixed(1)}" y="28.5" font-size="14" font-weight="600" fill="${INK}">${esc(label)}</text>`;
    save(`nav-${slug}.svg`, svg(W, H, body));
  }
  // back to top
  const W = 150, H = 40, lw = tw("Back to top", 13, 600);
  const sx = (W - (12 + 8 + lw)) / 2;
  const body =
    `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" fill="${CARD}" stroke="${LINE2}"/>` +
    `<path d="M${sx + 6} 26V14M${sx} 19.5l6-6 6 6" stroke="${G}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<text x="${(sx + 20).toFixed(1)}" y="25" font-size="13" font-weight="600" fill="${INK2}">Back to top</text>`;
  save("nav-top.svg", svg(W, H, body));
}

// --------------------------------------------------------------- TICKER
function ticker() {
  const W = 1000, H = 54;
  const items = ["WordPress", "Shopify", "Liquid", "PHP", "Headless CMS", "Next.js", "React", "TypeScript",
    "NestJS", "PostgreSQL", "Prisma", "Redis", "BullMQ", "Docker", "AWS", "Linux", "Nginx", "GitHub Actions"];
  const xs = [];
  let x = 0;
  for (const t of items) { xs.push(x); x += tw(t, 16, 500, "jost") + 44; }
  const GAP = Math.round(x);
  const row = (off) =>
    items.map((t, i) => {
      const px = xs[i] + off, tx = px + tw(t, 16, 500, "jost");
      return `<text class="h" x="${f0(px)}" y="32.5" font-size="16" font-weight="500" fill="${INK2}">${esc(t)}</text><circle cx="${(tx + 22).toFixed(1)}" cy="27" r="2.5" fill="${G}"/>`;
    }).join("");
  const defs =
    `<linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="${CARD}"/><stop offset=".08" stop-color="${CARD}" stop-opacity="0"/>` +
    `<stop offset=".92" stop-color="${CARD}" stop-opacity="0"/><stop offset="1" stop-color="${CARD}"/></linearGradient>` +
    `<clipPath id="c"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14"/></clipPath>`;
  const body =
    `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="${CARD}" stroke="${LINE}"/>` +
    `<g clip-path="url(#c)"><g>${row(24)}${row(24 + GAP)}${row(24 + 2 * GAP)}` +
    `<animateTransform attributeName="transform" type="translate" from="0 0" to="-${GAP} 0" dur="${(GAP / 40).toFixed(1)}s" repeatCount="indefinite"/></g>` +
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
    const W = 1000, H = 96;
    const css = `.draw{stroke-dasharray:180;stroke-dashoffset:180;animation:drawl 1.6s ease forwards .3s}
      @keyframes drawl{to{stroke-dashoffset:0}}
      .t{animation:up .8s ease both}.s{animation:up .8s ease both .2s}`;
    const body =
      `<g class="t"><rect x="1" y="14" width="52" height="52" rx="14" fill="${G}" fill-opacity=".08" stroke="${G}" stroke-opacity=".35"/>` +
      `<text class="h" x="27" y="48" text-anchor="middle" font-size="21" font-weight="600" fill="${HEAD}">${n}</text>` +
      `<text class="h" x="72" y="40" font-size="28" font-weight="700" fill="${HEAD}">${esc(title)}</text></g>` +
      `<text class="s" x="73" y="63" font-size="14.5" fill="${HEAD_SUB}">${esc(sub)}</text>` +
      `<line x1="0" y1="88" x2="${W}" y2="88" stroke="${MUTE}" stroke-opacity=".25"/>` +
      `<line class="draw" x1="0" y1="88" x2="180" y2="88" stroke="${G}" stroke-width="2.5" stroke-linecap="round"/>`;
    save(`h-${slug}.svg`, svg(W, H, body, css));
  }
}

// --------------------------------------------------------------- ABOUT
function about() {
  const W = 1000, H = 360;
  const css = `.c1{animation:up .7s ease both .2s}.c2{animation:up .7s ease both .35s}.c3{animation:up .7s ease both .5s}.c4{animation:up .7s ease both .65s}`;
  const ew = 540, eh = H - 2;
  const defs = `<clipPath id="ed"><rect x="1" y="1" width="${ew}" height="${eh}" rx="16"/></clipPath>`;
  const b = [];
  // editor
  b.push(`<g clip-path="url(#ed)"><rect x="1" y="1" width="${ew}" height="${eh}" fill="${CARD}"/>`);
  b.push(`<rect x="1" y="1" width="${ew}" height="42" fill="${PANEL}"/><line x1="1" y1="43.5" x2="${ew + 1}" y2="43.5" stroke="${LINE}"/>`);
  b.push(`<rect x="1" y="${eh - 29}" width="${ew}" height="30" fill="${PANEL}"/><line x1="1" y1="${eh - 29.5}" x2="${ew + 1}" y2="${eh - 29.5}" stroke="${LINE}"/></g>`);
  [0, 1, 2].forEach((i) => b.push(`<circle cx="${22 + i * 16}" cy="22" r="5" fill="${LINE2}"/>`));
  b.push(`<circle cx="90" cy="22" r="3.5" fill="${G}"/><text class="mono" x="100" y="26.5" font-size="12.5" fill="${INK2}">about-me.ts</text>`);
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
  b.push(typedLines(lines, { x: 52, y0: 76, step: 25.5, size: 13.5, dur: 14, idPrefix: "a", numX: 16, start: 0.4, per: 0.8, hold: 0.95 }));
  b.push(`<circle cx="20" cy="${eh - 13.5}" r="3" fill="${G}"/>`);
  b.push(`<text class="mono" x="30" y="${eh - 10}" font-size="11" fill="${MUTE}" xml:space="preserve">main   UTF-8   TypeScript   Ln 10, Col 3</text>`);
  b.push(`<rect x="1.5" y="1.5" width="${ew - 1}" height="${eh - 1}" rx="16" stroke="${LINE}"/>`);
  // stat cards, 2 x 2
  const cards = [["2+", "Years", "building for the web", G_L],
    ["WP", "WordPress", "themes, plugins &amp; speed", WP],
    ["SH", "Shopify", "Liquid theme development", SHOP],
    ["FS", "Full-Stack", "Next.js · NestJS · PostgreSQL", G_L]];
  const gx = 16, x0 = ew + 1 + 16, cw = (W - 1 - x0 - gx) / 2, ch = (eh - 16) / 2;
  cards.forEach(([big, title, sub, col], i) => {
    const x = x0 + (i % 2) * (cw + gx), y = 1 + Math.floor(i / 2) * (ch + 16);
    b.push(
      `<g class="c${i + 1}"><rect x="${x + 0.5}" y="${y + 0.5}" width="${cw - 1}" height="${ch - 1}" rx="16" fill="${CARD}" stroke="${LINE}"/>` +
        `<rect x="${x + 22}" y="${y + 22}" width="26" height="3" rx="1.5" fill="${col}"/>` +
        `<text class="h" x="${x + 21}" y="${y + 78}" font-size="38" font-weight="700" fill="${col}">${big}</text>` +
        `<text x="${x + 22}" y="${y + 114}" font-size="16" font-weight="600" fill="${INK}">${title}</text>` +
        `<text x="${x + 22}" y="${y + 137}" font-size="${fit(sub, cw - 44, 12.5)}" fill="${MUTE}">${sub}</text></g>`,
    );
  });
  save("about.svg", svg(W, H, b.join(""), css, defs));
}

// --------------------------------------------------------------- STACK
function stack() {
  const W = 1000;
  const cols = [
    ["Daily Driver", "What I ship with every week",
      ["WordPress", "PHP", "Shopify", "Liquid", "WooCommerce", "JavaScript", "React", "Next.js", "Tailwind CSS", "MySQL"]],
    ["Full-Stack", "Apps, APIs &amp; databases",
      ["TypeScript", "Node.js", "NestJS", "PostgreSQL", "Prisma", "Redis", "BullMQ", "Docker", "AWS", "GitHub Actions", "Jest", "Playwright"]],
    ["Server &amp; Craft", "Keeping things fast &amp; secure",
      ["Linux", "Nginx", "Git", "Server Security", "Performance", "Headless CMS", "REST APIs", "System Design", "Figma", "AI Pair-Programming"]],
  ];
  const gap = 16, cw = (W - 2 * gap) / 3, pad = 22;
  let maxh = 0;
  const layouts = cols.map(([, , chips]) => {
    let x = pad, y = 102;
    const pos = [];
    for (const c of chips) {
      const w = tw(c, 13, 500) + 34;
      if (x + w > cw - pad) { x = pad; y += 38; }
      pos.push([x, y, w, c]);
      x += w + 8;
    }
    maxh = Math.max(maxh, y + 30 + 24);
    return pos;
  });
  const H = maxh + 1;
  let css = "";
  for (let i = 0; i < 40; i++) css += `.k${i}{animation:up .5s ease both ${(0.1 + i * 0.04).toFixed(2)}s}`;
  let k = 0;
  const b = [];
  cols.forEach(([title, sub], ci) => {
    const ox = ci * (cw + gap);
    b.push(
      `<g transform="translate(${ox.toFixed(1)} 0)"><rect x=".5" y=".5" width="${(cw - 1).toFixed(1)}" height="${H - 1}" rx="16" fill="${CARD}" stroke="${LINE}"/>` +
        `<text class="h" x="${pad}" y="42" font-size="19" font-weight="600" fill="${INK}">${title}</text>` +
        `<text class="mono" x="${(cw - pad).toFixed(1)}" y="41" text-anchor="end" font-size="12" fill="${G}">0${ci + 1}</text>` +
        `<text x="${pad}" y="64" font-size="12.5" fill="${MUTE}">${sub}</text>` +
        `<line x1="${pad}" y1="82.5" x2="${(cw - pad).toFixed(1)}" y2="82.5" stroke="${LINE}"/>`,
    );
    for (const [x, y, w, c] of layouts[ci]) {
      b.push(
        `<g class="k${k}"><rect x="${f0(x)}.5" y="${y}.5" width="${f0(w)}" height="29" rx="14.5" fill="${PANEL}" stroke="${LINE2}"/>` +
          `<circle cx="${f0(x + 14)}" cy="${y + 15}" r="3" fill="${G}"/>` +
          `<text x="${f0(x + 24)}" y="${y + 19.5}" font-size="13" font-weight="500" fill="${INK2}">${esc(c)}</text></g>`,
      );
      k++;
    }
    b.push("</g>");
  });
  save("stack.svg", svg(W, H, b.join(""), css));
}

// --------------------------------------------------------------- SERVICES
function services() {
  const W = 1000;
  const items = [
    ["WP", "WordPress Development", ["Custom themes &amp; plugins", "Speed &amp; Core Web Vitals", "Server setup &amp; hardening"]],
    ["SH", "Shopify Development", ["Liquid theme development", "Store customization", "Third-party app integration"]],
    ["HL", "Headless CMS", ["WordPress as a backend", "Next.js frontends", "SEO-friendly, blazing fast"]],
    ["FS", "Full-Stack Apps", ["Next.js + NestJS", "PostgreSQL + Prisma", "Auth, payments &amp; webhooks"]],
    ["API", "Backend &amp; APIs", ["REST APIs with Swagger docs", "BullMQ queues &amp; Redis caching", "Tested &amp; secure by default"]],
    ["OPS", "DevOps &amp; Cloud", ["Docker &amp; Docker Compose", "AWS: EC2, RDS, S3", "CI/CD with GitHub Actions"]],
  ];
  const g = 16, cw = (W - 2 * g) / 3, ch = 214;
  const H = 2 * ch + g;
  let css = "";
  for (let i = 0; i < 6; i++) css += `.s${i}{animation:up .7s ease both ${(0.1 + i * 0.1).toFixed(2)}s}`;
  const b = [];
  items.forEach(([ic, title, pts], i) => {
    const x = (i % 3) * (cw + g), y = Math.floor(i / 3) * (ch + g);
    b.push(
      // position on the outer group: the CSS fade-in animates `transform`, which would override a transform attribute
      `<g transform="translate(${x.toFixed(1)} ${y})"><g class="s${i}"><rect x=".5" y=".5" width="${(cw - 1).toFixed(1)}" height="${ch - 1}" rx="16" fill="${CARD}" stroke="${LINE}"/>` +
        `<rect x="22" y="22" width="44" height="44" rx="12" fill="${G}" fill-opacity=".1" stroke="${G}" stroke-opacity=".3"/>` +
        `<text class="h" x="44" y="${ic.length < 3 ? 50 : 49}" text-anchor="middle" font-size="${ic.length < 3 ? 17 : 14}" font-weight="700" fill="${G_L}">${ic}</text>` +
        `<text class="mono" x="${(cw - 22).toFixed(1)}" y="40" text-anchor="end" font-size="12" fill="${MUTE}">0${i + 1}</text>` +
        `<text class="h" x="22" y="102" font-size="${fit(title, cw - 44, 19, 600, "jost")}" font-weight="600" fill="${INK}">${title}</text>`,
    );
    pts.forEach((p, j) => {
      const py = 136 + j * 26;
      b.push(
        `<path d="M23 ${py - 5}l3.5 3.5 6-6.5" stroke="${G}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
          `<text x="42" y="${py}" font-size="${fit(p, cw - 64, 13.5)}" fill="${INK2}">${p}</text>`,
      );
    });
    b.push("</g></g>");
  });
  save("services.svg", svg(W, H, b.join(""), css));
}

// --------------------------------------------------------------- CONTACT BUTTONS
function contact() {
  const globe = `<circle cx="35" cy="32" r="8.5" stroke="#fff" stroke-width="1.7"/><ellipse cx="35" cy="32" rx="3.8" ry="8.5" stroke="#fff" stroke-width="1.5"/><path d="M26.5 32h17" stroke="#fff" stroke-width="1.5"/>`;
  const items = [["linkedin", "LinkedIn", "Let's network", LINKEDIN, "in"],
    ["facebook", "Facebook", "Say hello", FACEBOOK, "f"],
    ["email", "Email", "Drop a message", GMAIL, "@"],
    ["portfolio", "Portfolio", "See my work", G_D, null]];
  items.forEach(([slug, label, sub, col, ic], i) => {
    const W = 220, H = 64;
    const defs =
      `<linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
      `<clipPath id="c"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16"/></clipPath>`;
    const icon = ic ? `<text x="35" y="38.5" text-anchor="middle" font-size="${ic === "@" ? 17 : 18}" font-weight="700" fill="#fff">${ic}</text>` : globe;
    const body =
      `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="${CARD}" stroke="${LINE2}"/>` +
      `<g clip-path="url(#c)"><rect x="-80" y="0" width="70" height="${H}" fill="url(#sh)" transform="skewX(-20)">` +
      `<animate attributeName="x" values="-80;300;300" keyTimes="0;.3;1" dur="6s" begin="${i * 0.6}s" repeatCount="indefinite"/></rect></g>` +
      `<rect x="16" y="13" width="38" height="38" rx="11" fill="${col}"/>${icon}` +
      `<text x="68" y="30" font-size="15" font-weight="600" fill="${INK}">${label}</text>` +
      `<text x="68" y="48" font-size="12" fill="${MUTE}">${sub}</text>` +
      `<path d="M${W - 30} 37l8-8M${W - 28} 29h6v6" stroke="${MUTE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    save(`btn-${slug}.svg`, svg(W, H, body, "", defs));
  });
}

// --------------------------------------------------------------- FOOTER
function footer() {
  // transparent background: reads on GitHub's light and dark page
  const W = 1000, H = 210;
  const defs = shimmerGrad("fg", 520);
  const wave = (amp, y, op, dur, rev = false) => {
    let d = `M0 ${y}`;
    for (let i = 0; i < 8; i++) { const x = i * 250; d += ` Q${x + 62} ${y - amp} ${x + 125} ${y} T${x + 250} ${y}`; }
    d += ` V${H} H0Z`;
    const [fr, to] = rev ? ["-500 0", "0 0"] : ["0 0", "-500 0"];
    return `<path d="${d}" fill="${G}" fill-opacity="${op}"><animateTransform attributeName="transform" type="translate" from="${fr}" to="${to}" dur="${dur}s" repeatCount="indefinite"/></path>`;
  };
  const body =
    `<clipPath id="fc"><rect width="${W}" height="${H}" rx="16"/></clipPath><g clip-path="url(#fc)">` +
    wave(14, 138, 0.06, 12) + wave(11, 152, 0.08, 9, true) + wave(8, 168, 0.12, 15) + "</g>" +
    `<text class="h" x="${W / 2}" y="58" text-anchor="middle" font-size="32" font-weight="700" fill="url(#fg)">Thanks for stopping by!</text>` +
    `<text x="${W / 2}" y="90" text-anchor="middle" font-size="15" fill="${MUTE}">Let&#8217;s build something amazing together.</text>` +
    `<text x="${W / 2}" y="196" text-anchor="middle" font-size="12.5" font-weight="500" fill="${G_D}">${esc(NAME)}  ·  Built with code &amp; lots of cha</text>`;
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

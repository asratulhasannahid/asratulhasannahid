# Project context: GitHub profile README for Asratul Hasan Nahid

This file is the handoff from an earlier chat. Read it fully before you change anything.

## Goal

Build a GitHub **profile README** for `github.com/asratulhasannahid`. It goes in a public repo
named `asratulhasannahid` (same as the username). It should be heavily animated, look like a
**real website** (hero, navbar, sections, cards, footer), and feel premium.

The user writes in Banglish (Bengali in Latin script) and calls the assistant "bro". Reply the same way:
casual Banglish, with technical terms in English.

## About the user (use only these facts)

- Name: **Asratul Hasan Nahid** (short: Nahid), Bangladesh 🇧🇩
- Current role: **Full-Stack Engineer @ Exprovia** (org: https://github.com/exprovia)
  - ⚠️ His OLD role was "Web & CMS Developer @ Exprovia". Do not use it anywhere.
- 2+ years experience. WordPress (themes, plugins, speed, server setup and security), Shopify (Liquid themes),
  Headless CMS (WordPress + Next.js)
- Full-stack skills he **already has** (not "learning"): TypeScript, Node.js, NestJS, Next.js/React,
  PostgreSQL + Prisma, Redis, BullMQ queues, Docker, AWS (EC2/RDS/S3), GitHub Actions CI/CD, testing (Jest/Playwright),
  security, system design
- ⚠️ He once shared a 12-week learning roadmap, only to show his skills. That learning is DONE.
  **Do not add any roadmap, "learning", "leveling up" or "mission" content.** It was removed on purpose.
- Social links not given yet. README uses placeholders: `YOUR_LINKEDIN`, `YOUR_FACEBOOK`,
  `YOUR_EMAIL@gmail.com`, `YOUR_PORTFOLIO.com`, `REPO_NAME_1..4`

## How it works (technical)

GitHub READMEs strip JS, `<style>` and `<script>`. So **every design piece is a standalone animated SVG**
in `assets/`, shown with `<img>`. SVGs shown through `<img>` support CSS `@keyframes` inside `<style>`
and SMIL (`<animate>`, `<animateTransform>`), but they **cannot load external resources** (no Google Fonts URLs,
no external images). Any custom font must be **embedded as base64 @font-face** inside each SVG.

- `build.mjs` creates every SVG (Node 18+, zero dependencies; this Windows machine has Node but no Python, and
  installing Python tooling was blocked, so the old `build.py` was ported and removed). Edit CONFIG and the
  component functions, then run `node build.mjs`.
- Fonts: Jost (headings, class `h`), Poppins (body, default; the user asked for it instead of Inter), JetBrains Mono (class `mono`). The build asks the
  Google Fonts CSS API with `&text=` for a woff2 subset of exactly the characters each (family, weight) uses
  (worked out by parsing the SVG's <text>/<tspan>), and embeds it as base64 @font-face. It also downloads full
  static TTFs to measure real text widths (`tw()`, `fit()`), so layout uses true widths. Everything is cached
  in `.cache/fonts` (gitignored). Poppins has no arrow glyphs, so arrows are drawn as paths.
- Icons: `icons/` holds vendored Simple Icons (`si-*`, CC0, brand logos) and Lucide (`lu-*`, ISC) SVGs; `icon()` in
  build.mjs inlines their paths. The user asked for logos/vectors instead of "WP/SH/FS" text. Don't hotlink images.
- Nav buttons are shown at `height="40"` so all six fit one row in GitHub's ~845px README column.
- **Never hand-edit files in `assets/`.** They are regenerated.
- Clickable navigation: each nav button is its own SVG wrapped in `<a href="#section">`, and each section
  has `<a name="section"></a>` before it.
- Dynamic third-party cards (kept in README): github-readme-stats (stats, top-langs, pin cards),
  streak-stats.demolab.com, github-readme-activity-graph, komarev visitor badge, skillicons.dev,
  and Platane/snk contribution snake (`.github/workflows/snake.yml`, which writes to the `output` branch).

### Files

```
README.md                     the profile README, uses assets/*.svg
build.mjs                     generates every SVG (node build.mjs)
assets/
  hero.svg                    browser-window hero: name shimmer, typed rotating words, floating code card and badges
  nav-{about,stack,services,stats,projects,contact,top}.svg   navbar buttons (animated border)
  ticker.svg                  infinite scrolling tech marquee
  h-{about,stack,services,stats,projects,contact}.svg          section headers (01–06, line draw and moving dot)
  about.svg                   VS Code-style editor (typing code) and 4 stat cards
  stack.svg                   3 cards of tech chips: Daily Driver / Full-Stack / Server & Craft
  services.svg                "What I Do": 6 service cards
  btn-{linkedin,facebook,email,portfolio}.svg                 contact buttons with a shine sweep
  footer.svg                  animated waves and "Thanks for stopping by!"
.github/workflows/snake.yml   snake animation generator
```

README section order: hero → navbar → ticker → 01 About → 02 Tech Stack (+ skillicons row)
→ 03 What I Do → 04 GitHub Stats (stats, langs, streak, activity graph, snake) → 05 Featured Work (4 pin cards)
→ 06 Let's Connect (4 buttons) → footer → back-to-top and visitor badge.

## Current state (2026-11-24)

**Dark + green, "clean" version is done.** The user tried a white/green light version, then asked to keep the
black version but make it less cluttered ("hijibiji"). Decisions:

- Palette (dark, one accent): bg #0A0E0C, card #0F1412, panel #151C18, borders #1F2924 / #2B3731,
  text #EDF3EF / #A6B5AD / muted #71827A, green #22C55E (light #4ADE80, dark #16A34A). Brand colors only on brand
  items (WP #4AA3DF, Shopify #95BF47, LinkedIn, Facebook, Gmail).
- Removed on purpose as clutter: hero particles, grid, floating badges, colored traffic lights; running dash
  borders on nav/stack/services; pulse glows; per-section accent colors; animated progress bars.
- Kept animations: hero name shimmer, typed rotating words, typed code with a caret that follows the lines,
  marquee, fade-ins, header underline draw, footer waves, contact shine.
- Section headers and the footer have transparent backgrounds, so their colors (#16A34A title, #71827A sub)
  must read on GitHub's light AND dark page.
- Stats section: GitHub stats card (`card_width=495`) and streak card (`card_width=495&card_height=195`) are
  both exactly 495x195 at width 49%, so the row has no gaps. The top-langs card was removed: its height depends on
  the language count, which always left empty space next to it. Pin cards use `description_lines_count=2` so
  they share one height.
- Gotcha: a CSS animation on `transform` (e.g. the `up` fade-in) overrides a `transform` attribute on the same
  element. Put position on an outer <g> and the animation class on an inner <g>.

## Verifying (always do this before handing over)

Chrome is available (no Playwright package). Drive it over the DevTools protocol from a small Node script
(Node 24 has a global WebSocket): open a preview page, wait real time, then `Page.captureScreenshot`.
`--virtual-time-budget` does not advance SVG-in-img animations. Render the page on GitHub dark (#0D1117).

- `<img>` with a `file://` src must be inside a page also loaded from `file://` (`page.goto`), not `set_content`
- Chrome pauses animations in offscreen images, so for a full-page screenshot use a tall viewport (~4200px)
- Take screenshots after about 5s and again after about 12s, so typing animations are complete
- Look for: text overflowing cards, overlaps, things invisible on white, the gap after "I build"
  External cards (stats, skillicons) don't load offline, which is expected.

## Deliverable

The user commits and pushes this folder straight to `github.com/asratulhasannahid/asratulhasannahid`, so no zip is
needed. Hand over the changed files, `preview.png`, and remind them to replace the placeholders and run
Actions → Generate Snake → Run workflow once.

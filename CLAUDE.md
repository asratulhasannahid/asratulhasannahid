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

- `build.py` creates every SVG. Edit CONFIG and the component functions, then run `python build.py`.
- **Never hand-edit files in `assets/`.** They are regenerated.
- Clickable navigation: each nav button is its own SVG wrapped in `<a href="#section">`, and each section
  has `<a name="section"></a>` before it.
- Dynamic third-party cards (kept in README): github-readme-stats (stats, top-langs, pin cards),
  streak-stats.demolab.com, github-readme-activity-graph, komarev visitor badge, skillicons.dev,
  and Platane/snk contribution snake (`.github/workflows/snake.yml`, which writes to the `output` branch).

### Files

```
README.md                     the profile README, uses assets/*.svg
build.py                      generates every SVG
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

## Current state

The **dark navy theme version is finished and working** (palette: bg #0B1730, cyan #5CC8FF, amber, purple).

## ▶️ NEXT TASK (in progress when the chat ended)

The user asked to switch to a **white / light, "standard" (clean, professional) design**:

1. **Light theme**: white backgrounds, subtle light-gray borders, dark text. Clean and minimal, not flashy.
2. **Primary color: GREEN.** Suggested palette:
   - primary `#16A34A`, light `#22C55E`, dark `#15803D`, tint backgrounds `#DCFCE7` / `#F0FDF4`
   - bg `#FFFFFF`, card `#F7FAF8`, panel `#EEF5F0`, border `#E3E8E5`
   - text `#0F1A14`, secondary `#43524A`, muted `#6B7A72`
   - keep brand colors only on brand items (WordPress #21759B, Shopify #7AB55C, LinkedIn, etc.)
   - code editor (light): keyword `#16A34A`, property `#475569`, string `#B45309`, comment `#94A3B8`
3. **Fonts: Inter and/or Jost** (the user's choice).
   - Inter is installed here: `/usr/share/fonts/opentype/inter/Inter-{Regular,Medium,SemiBold,Bold,ExtraBold}.otf`
   - Jost was **not** available offline. If you can download it (Google Fonts, OFL licence), use Jost for
     headings and Inter for body. Otherwise use Inter everywhere and tell the user.
   - Mono font for code: DejaVu Sans Mono (`/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf`),
     or JetBrains Mono if you can download it.
   - **Embed the fonts in each SVG**: use fontTools to subset each weight to only the characters in that SVG,
     save as woff (or woff2 if `brotli` is installed), then add base64 `@font-face` rules in the SVG `<style>`.
     Keep the file size reasonable.
4. Things to change in `build.py` for light mode (these were found before the chat ended):
   - Palette constants (line ~23) and `shimmer_grad` default colors → green shades
   - Hero: `#102043` bg gradient → white to light green tint; `#3D7BFF` button gradient → greens;
     blob colors → soft green/teal at low opacity; white twinkle particles → green or remove;
     browser-bar `fill="{BG}"` and the second button fill; rotating-word color → green
   - Code colors in the hero and about editors (they use PURPLE/CYAN/AMBER now)
   - Nav border gradient, header line gradient, and the `#fff` glow dot in headers
   - Contact buttons: the white shine sweep is invisible on white, so use a tinted shine
   - Footer: `#1E4A8F` waves → green tints (`#DCFCE7`, `#BBF7D0`, `#22C55E` at low opacity)
   - `text_w()` width estimates: Inter is wider than the fonts used before, so recheck overflow
5. README.md: change third-party card colors to light, e.g. `bg_color=FFFFFF`, `title_color=16A34A`,
   `icon_color=16A34A`, `text_color=43524A`, `border_color=E3E8E5` (show borders), and the same for streak and
   activity graph. Use `skillicons ... &theme=light` and visitor badge color `16A34A`.
6. Keep every animation (typing, shimmer, floating, marquee, dash borders, waves), toned to fit a clean light look.
   Keep the `@media (prefers-reduced-motion)` rule.

## Verifying (always do this before handing over)

Chrome and Playwright are available here. Render each SVG and look at it:

- `<img>` with a `file://` src must be inside a page also loaded from `file://` (`page.goto`), not `set_content`
- Chrome pauses animations in offscreen images, so for a full-page screenshot use a tall viewport (~4200px)
- Take screenshots after about 5s and again after about 12s, so typing animations are complete
- Look for: text overflowing cards, overlaps, things invisible on white, the gap after "I build"
  External cards (stats, skillicons) don't load offline, which is expected.

## Deliverable

A zip containing `README.md`, `build.py`, `assets/`, and `.github/workflows/snake.yml`, plus a preview PNG.
Tell the user (in Banglish) how to upload it: public repo `asratulhasannahid`, upload everything,
replace the placeholders, then Actions → Generate Snake → Run workflow.

#!/usr/bin/env python3
"""
Generates every animated SVG used in the profile README.

  ✏️  Edit the CONFIG block, then run:   python build.py
      All SVGs are written to ./assets/
"""
from pathlib import Path

# ============================ CONFIG ============================
NAME = "Asratul Hasan Nahid"
ROLE = "Full-Stack Engineer @ Exprovia"
DOMAIN = "github.com/asratulhasannahid"
# ================================================================

OUT = Path(__file__).parent / "assets"
OUT.mkdir(exist_ok=True)

FONT = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif"
MONO = "'SF Mono', 'Cascadia Code', Consolas, 'Liberation Mono', Menlo, monospace"
BG, BG2, PANEL, LINE = "#0B1730", "#0E1D3E", "#132750", "#284578"
INK, INK2, MUTE = "#EAF1FF", "#B7C6E6", "#8DA0CA"
CYAN, AMBER, GREEN, PINK, PURPLE = "#5CC8FF", "#FFB547", "#4FD1A1", "#FF7A85", "#B79CFF"

BASE_CSS = f"""
text{{font-family:{FONT}}}
.mono{{font-family:{MONO}}}
@keyframes float{{0%,100%{{transform:translateY(0)}}50%{{transform:translateY(-10px)}}}}
@keyframes pulse{{0%,100%{{opacity:1}}50%{{opacity:.35}}}}
@keyframes blink{{0%,49%{{opacity:1}}50%,100%{{opacity:0}}}}
@keyframes up{{from{{opacity:0;transform:translateY(14px)}}to{{opacity:1;transform:translateY(0)}}}}
@keyframes ring{{0%{{r:6;opacity:.9}}100%{{r:22;opacity:0}}}}
@keyframes dash{{to{{stroke-dashoffset:-400}}}}
@keyframes twinkle{{0%,100%{{opacity:.15}}50%{{opacity:1}}}}
@media (prefers-reduced-motion:reduce){{*{{animation:none!important}}}}
"""


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def svg(w, h, body, css="", defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" fill="none">'
            f'<style>{BASE_CSS}{css}</style><defs>{defs}</defs>{body}</svg>')


def save(name, content):
    (OUT / name).write_text(content, encoding="utf-8")
    print("  ✓", name)


def shimmer_grad(id_, width=600, colors=(CYAN, PURPLE, AMBER, CYAN), dur=6):
    stops = "".join(f'<stop offset="{i/(len(colors)-1):.2f}" stop-color="{c}"/>' for i, c in enumerate(colors))
    return (f'<linearGradient id="{id_}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="{width}" y2="0" spreadMethod="repeat">'
            f'{stops}<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="{width} 0" '
            f'dur="{dur}s" repeatCount="indefinite"/></linearGradient>')


def text_w(s, size, bold=False, mono=False):
    k = 0.6 if mono else (0.56 if bold else 0.52)
    return len(s) * size * k


# --------------------------------------------------------------- HERO
def hero():
    W, H = 1000, 460
    defs = f"""
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#102043"/><stop offset="1" stop-color="{BG}"/></linearGradient>
    {shimmer_grad("name", 520)}
    <linearGradient id="btn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{CYAN}"/><stop offset="1" stop-color="#3D7BFF"/></linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="45"/></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" stroke="{CYAN}" stroke-opacity=".07"/></pattern>
    <radialGradient id="fade" cx=".7" cy=".35" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <mask id="gm"><rect width="{W}" height="{H}" fill="url(#fade)"/></mask>
    <clipPath id="win"><rect x="10" y="10" width="{W-20}" height="{H-20}" rx="20"/></clipPath>
    """
    css = """
    .float1{animation:float 6s ease-in-out infinite}
    .float2{animation:float 5s ease-in-out infinite;animation-delay:-2s}
    .float3{animation:float 7s ease-in-out infinite;animation-delay:-4s}
    .pulse{animation:pulse 2s ease-in-out infinite}
    .blink{animation:blink 1s step-end infinite}
    .tw{animation:twinkle 3s ease-in-out infinite}
    .in1{animation:up .8s ease both .1s}.in2{animation:up .8s ease both .3s}.in3{animation:up .8s ease both .5s}
    .in4{animation:up .8s ease both .7s}.in5{animation:up .8s ease both .9s}
    .ring{animation:ring 2s ease-out infinite}
    .btnglow{animation:pulse 2.4s ease-in-out infinite}
    """
    b = []
    b.append(f'<g clip-path="url(#win)"><rect width="{W}" height="{H}" fill="url(#bg)"/>')
    # blobs
    b.append(f'''<g filter="url(#blur)" opacity=".55">
      <circle cx="790" cy="170" r="150" fill="{CYAN}" opacity=".45"><animateTransform attributeName="transform" type="translate" values="0 0;-60 40;0 0" dur="14s" repeatCount="indefinite"/></circle>
      <circle cx="640" cy="420" r="130" fill="{PURPLE}" opacity=".45"><animateTransform attributeName="transform" type="translate" values="0 0;70 -30;0 0" dur="11s" repeatCount="indefinite"/></circle>
      <circle cx="120" cy="440" r="110" fill="{AMBER}" opacity=".18"><animateTransform attributeName="transform" type="translate" values="0 0;40 -40;0 0" dur="16s" repeatCount="indefinite"/></circle>
    </g>''')
    b.append(f'<rect width="{W}" height="{H}" fill="url(#grid)" mask="url(#gm)"/>')
    # particles
    import random
    random.seed(7)
    for i in range(26):
        x, y = random.randint(30, 970), random.randint(70, 440)
        r = random.choice([1, 1.2, 1.6, 2])
        b.append(f'<circle class="tw" cx="{x}" cy="{y}" r="{r}" fill="{INK}" style="animation-delay:-{random.uniform(0,3):.1f}s;animation-duration:{random.uniform(2,5):.1f}s"/>')
    # browser chrome
    b.append(f'<rect x="10" y="10" width="{W-20}" height="46" fill="{BG}" fill-opacity=".75"/><line x1="10" y1="56" x2="{W-10}" y2="56" stroke="{LINE}"/>')
    for i, c in enumerate(["#FF5F57", "#FEBC2E", "#28C840"]):
        b.append(f'<circle cx="{36+i*20}" cy="33" r="6" fill="{c}"/>')
    b.append(f'<rect x="300" y="20" width="400" height="26" rx="13" fill="{BG2}" stroke="{LINE}"/>')
    b.append(f'<path d="M324 30v-2a4 4 0 0 1 8 0v2" stroke="{GREEN}" stroke-width="1.6"/><rect x="322" y="30" width="12" height="9" rx="2" fill="{GREEN}"/>')
    b.append(f'<text x="500" y="38" text-anchor="middle" font-size="13" fill="{INK2}">{esc(DOMAIN)}</text>')
    nx = W - 34
    for t in reversed(["About", "Stack", "Services", "Contact"]):
        b.append(f'<text x="{nx:.0f}" y="38" text-anchor="end" font-size="12.5" fill="{MUTE}">{t}</text>')
        nx -= text_w(t, 12.5) + 22
    b.append('</g>')
    b.append(f'<rect x="10" y="10" width="{W-20}" height="{H-20}" rx="20" stroke="{LINE}" stroke-width="1.5"/>')

    # left content
    pill_w = text_w(ROLE, 13.5) + 62
    b.append(f'''<g class="in1"><rect x="50" y="92" width="{pill_w:.0f}" height="32" rx="16" fill="{CYAN}" fill-opacity=".1" stroke="{CYAN}" stroke-opacity=".45"/>
      <circle cx="70" cy="108" r="5" fill="{GREEN}"/><circle class="ring" cx="70" cy="108" r="6" stroke="{GREEN}" stroke-width="2"/>
      <text x="86" y="113" font-size="13.5" font-weight="600" fill="{INK}">{esc(ROLE)}</text></g>''')
    b.append(f'<text class="in2" x="50" y="168" font-size="22" fill="{INK2}">Hi there, I&#8217;m</text>')
    b.append(f'<text class="in2" x="50" y="224" font-size="48" font-weight="800" fill="url(#name)" letter-spacing="-1">{esc(NAME)}</text>')

    # rotating typed roles
    words = ["WordPress experiences", "Shopify themes", "headless CMS sites", "full-stack apps", "scalable APIs"]
    cyc = len(words) * 3
    b.append(f'<g class="in3"><text x="50" y="270" font-size="24" font-weight="600" fill="{INK}">I build</text>')
    x0 = 50 + 80
    for i, wd in enumerate(words):
        ww = text_w(wd, 24, True) + 6
        a, s1, s2, e = i * 3 / cyc, (i * 3 + 1.1) / cyc, (i * 3 + 2.4) / cyc, (i * 3 + 2.9) / cyc
        kt = sorted(set([0, a, s1, s2, e, 1]))
        def vals(on):
            m = {0: 0, a: 0, s1: on, s2: on, e: 0, 1: 0}
            return ";".join(f"{m[k]:.1f}" for k in kt)
        kts = ";".join(f"{k:.4f}" for k in kt)
        b.append(f'<clipPath id="cw{i}"><rect x="{x0:.0f}" y="244" height="36" width="0"><animate attributeName="width" values="{vals(ww)}" keyTimes="{kts}" dur="{cyc}s" repeatCount="indefinite" calcMode="linear"/></rect></clipPath>')
        b.append(f'<text clip-path="url(#cw{i})" x="{x0:.0f}" y="270" font-size="24" font-weight="700" fill="{AMBER}">{esc(wd)}</text>')
        b.append(f'<rect y="249" width="3" height="28" fill="{AMBER}" opacity="0"><animate attributeName="x" values="{";".join(f"{x0+float(v):.1f}" for v in vals(ww).split(";"))}" keyTimes="{kts}" dur="{cyc}s" repeatCount="indefinite"/>'
                 f'<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;{a+0.0001:.4f};{e:.4f};1" dur="{cyc}s" repeatCount="indefinite" calcMode="discrete"/></rect>')
    b.append('</g>')
    b.append(f'''<g class="in4"><text x="50" y="314" font-size="15.5" fill="{INK2}">2+ years shipping fast, secure web apps, stores &amp; CMS sites.</text>
      <text x="50" y="338" font-size="15.5" fill="{INK2}">Next.js · NestJS · PostgreSQL · Docker · AWS · WordPress · Shopify</text></g>''')
    b.append(f'''<g class="in5">
      <rect class="btnglow" x="46" y="366" width="186" height="52" rx="26" fill="{CYAN}" opacity=".35" filter="url(#glow)"/>
      <rect x="50" y="370" width="178" height="44" rx="22" fill="url(#btn)"/>
      <text x="139" y="398" text-anchor="middle" font-size="15" font-weight="700" fill="{BG}">See what I do &#8594;</text>
      <rect x="244" y="370" width="150" height="44" rx="22" stroke="{INK2}" stroke-opacity=".5" fill="{BG}" fill-opacity=".4"/>
      <text x="319" y="398" text-anchor="middle" font-size="15" font-weight="600" fill="{INK}">Let&#8217;s connect</text></g>''')

    # code card
    lines = [
        [("const ", PURPLE), ("nahid", CYAN), (" = {", INK)],
        [("  role", INK2), (": ", INK), ('"Full-Stack Engineer"', GREEN), (",", INK)],
        [("  company", INK2), (": ", INK), ('"Exprovia"', GREEN), (",", INK)],
        [("  stack", INK2), (": [", INK), ('"WP"', GREEN), (", ", INK), ('"Shopify"', GREEN), ("],", INK)],
        [("  backend", INK2), (": [", INK), ('"NestJS"', GREEN), (", ", INK), ('"AWS"', GREEN), ("],", INK)],
        [("  cha", INK2), (": ", INK), ("Infinity", AMBER), (",", INK)],
        [("};", INK)],
    ]
    cx, cy = 612, 96
    b.append(f'<g class="float1"><rect x="{cx}" y="{cy}" width="340" height="250" rx="16" fill="{BG2}" fill-opacity=".92" stroke="{LINE}"/>')
    b.append(f'<rect x="{cx}" y="{cy}" width="340" height="38" rx="16" fill="{PANEL}"/><rect x="{cx}" y="{cy+22}" width="340" height="16" fill="{PANEL}"/>')
    b.append(f'<rect x="{cx+14}" y="{cy+8}" width="96" height="30" rx="6" fill="{BG2}"/><circle cx="{cx+28}" cy="{cy+23}" r="4" fill="{CYAN}"/>')
    b.append(f'<text class="mono" x="{cx+38}" y="{cy+28}" font-size="12.5" fill="{INK}">nahid.ts</text>')
    b.append(f'<text class="mono" x="{cx+322}" y="{cy+27}" text-anchor="end" font-size="11" fill="{MUTE}">TypeScript</text>')
    dur = 11
    for i, ln in enumerate(lines):
        y = cy + 66 + i * 25
        plain = "".join(t for t, _ in ln).replace("&amp;", "&")
        ww = text_w(plain, 13.5, mono=True) + 8
        t0 = (0.3 + i * 0.75) / dur
        t1 = (0.3 + i * 0.75 + 0.6) / dur
        b.append(f'<text class="mono" x="{cx+18}" y="{y}" font-size="12" fill="{MUTE}" opacity=".6">{i+1}</text>')
        b.append(f'<clipPath id="cl{i}"><rect x="{cx+42}" y="{y-16}" height="22" width="0"><animate attributeName="width" values="0;0;{ww:.0f};{ww:.0f};0" keyTimes="0;{t0:.3f};{t1:.3f};0.94;1" dur="{dur}s" repeatCount="indefinite"/></rect></clipPath>')
        spans = "".join(f'<tspan fill="{c}">{t}</tspan>' for t, c in ln)
        b.append(f'<text class="mono" clip-path="url(#cl{i})" x="{cx+42}" y="{y}" font-size="13.5" xml:space="preserve">{spans}</text>')
    b.append(f'<rect class="blink" x="{cx+62}" y="{cy+66+6*25-14}" width="8" height="17" fill="{CYAN}"/>')
    b.append('</g>')
    # floating badges
    badges = [(560, 86, "WordPress", "#3CA3D8", "float2"), (868, 352, "Shopify", "#7AB55C", "float3"),
              (590, 372, "Next.js", INK, "float3"), (880, 70, "NestJS", "#E0234E", "float2")]
    for x, y, t, c, cl in badges:
        w = text_w(t, 13, True) + 40
        b.append(f'<g class="{cl}"><rect x="{x}" y="{y}" width="{w:.0f}" height="32" rx="16" fill="{PANEL}" stroke="{c}" stroke-opacity=".6"/>'
                 f'<circle cx="{x+16}" cy="{y+16}" r="5" fill="{c}"/><text x="{x+27}" y="{y+21}" font-size="13" font-weight="700" fill="{INK}">{t}</text></g>')
    save("hero.svg", svg(W, H, "".join(b), css, defs))


# --------------------------------------------------------------- NAV BUTTONS
def nav():
    items = [("about", "About", "01"), ("stack", "Tech Stack", "02"), ("services", "What I Do", "03"),
             ("stats", "Stats", "04"), ("projects", "Projects", "05"), ("contact", "Contact", "06")]
    for i, (slug, label, n) in enumerate(items):
        W, H = 150, 48
        defs = f'<linearGradient id="bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{CYAN}"/><stop offset=".5" stop-color="{PURPLE}"/><stop offset="1" stop-color="{AMBER}"/></linearGradient>'
        css = f".run{{stroke-dasharray:60 340;animation:dash 4s linear infinite;animation-delay:-{i*0.6}s}}"
        body = (f'<rect x="1" y="1" width="{W-2}" height="{H-2}" rx="24" fill="{BG2}" stroke="{LINE}"/>'
                f'<rect class="run" x="1" y="1" width="{W-2}" height="{H-2}" rx="24" stroke="url(#bd)" stroke-width="2"/>'
                f'<text x="{W/2}" y="30" text-anchor="middle" font-size="14.5" font-weight="700" fill="{INK}">'
                f'<tspan fill="{CYAN}" font-size="11.5" class="mono">{n}</tspan>  {esc(label)}</text>')
        save(f"nav-{slug}.svg", svg(W, H, body, css, defs))
    # back to top
    W, H = 150, 40
    body = (f'<rect x="1" y="1" width="{W-2}" height="{H-2}" rx="20" fill="{BG2}" stroke="{LINE}"/>'
            f'<text x="{W/2}" y="25" text-anchor="middle" font-size="13" font-weight="600" fill="{INK2}">&#8593;  Back to top</text>')
    save("nav-top.svg", svg(W, H, body))


# --------------------------------------------------------------- TICKER
def ticker():
    W, H = 1000, 58
    items = ["WordPress", "Shopify", "Liquid", "PHP", "Headless CMS", "Next.js", "React", "TypeScript",
             "NestJS", "PostgreSQL", "Prisma", "Redis", "Docker", "AWS", "Linux", "Nginx", "GitHub Actions"]
    colors = [CYAN, AMBER, GREEN, PURPLE, PINK]
    xs, x = [], 0
    for t in items:
        xs.append(x)
        x += text_w(t, 17, True) + 56
    G = round(x)
    def row(off):
        out = []
        for i, t in enumerate(items):
            px = xs[i] + off
            out.append(f'<text x="{px:.0f}" y="36" font-size="17" font-weight="700" fill="{INK}">{esc(t)}</text>')
            out.append(f'<text x="{px + text_w(t,17,True) + 20:.0f}" y="36" font-size="15" fill="{colors[i%5]}">&#10022;</text>')
        return "".join(out)
    defs = (f'<linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="{BG}"/><stop offset=".08" stop-color="{BG}" stop-opacity="0"/>'
            f'<stop offset=".92" stop-color="{BG}" stop-opacity="0"/><stop offset="1" stop-color="{BG}"/></linearGradient>'
            f'<clipPath id="c"><rect x="1" y="1" width="{W-2}" height="{H-2}" rx="14"/></clipPath>')
    body = (f'<rect x="1" y="1" width="{W-2}" height="{H-2}" rx="14" fill="{BG2}" stroke="{LINE}"/>'
            f'<g clip-path="url(#c)"><g>{row(20)}{row(20+G)}{row(20+2*G)}'
            f'<animateTransform attributeName="transform" type="translate" from="0 0" to="-{G} 0" dur="{G/45:.1f}s" repeatCount="indefinite"/></g>'
            f'<rect width="{W}" height="{H}" fill="url(#edge)"/></g>')
    save("ticker.svg", svg(W, H, body, "", defs))


# --------------------------------------------------------------- SECTION HEADERS
def headers():
    secs = [("about", "01", "About Me", "Who I am and what I do every day"),
            ("stack", "02", "Tech Stack", "The tools I use to design, build and ship"),
            ("services", "03", "What I Do", "From CMS builds to full-stack apps, end to end"),
            ("stats", "04", "GitHub Stats", "Consistency beats intensity"),
            ("projects", "05", "Featured Work", "Things I've built and shipped"),
            ("contact", "06", "Let's Connect", "Open to collaborate, learn and build together")]
    for slug, n, title, sub in secs:
        W, H = 1000, 110
        defs = (shimmer_grad("tg", 400, (INK, CYAN, INK), 5) +
                f'<linearGradient id="ln" x1="0" x2="1"><stop offset="0" stop-color="{CYAN}"/><stop offset=".5" stop-color="{PURPLE}"/><stop offset="1" stop-color="{CYAN}" stop-opacity="0"/></linearGradient>'
                f'<filter id="gl" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4"/></filter>')
        css = """.draw{stroke-dasharray:1000;stroke-dashoffset:1000;animation:drawl 2.2s ease forwards .2s}
        @keyframes drawl{to{stroke-dashoffset:0}}
        .t{animation:up .8s ease both}.s{animation:up .8s ease both .25s}"""
        body = (f'<text x="3" y="66" font-size="64" font-weight="800" fill="none" stroke="{CYAN}" stroke-opacity=".35" stroke-width="1.5">{n}</text>'
                f'<text class="t" x="96" y="52" font-size="32" font-weight="800" fill="url(#tg)">{esc(title)}</text>'
                f'<text class="s" x="98" y="80" font-size="15" fill="{MUTE}">{esc(sub)}</text>'
                f'<line x1="0" y1="100" x2="{W}" y2="100" stroke="{LINE}" stroke-opacity=".6"/>'
                f'<line class="draw" x1="0" y1="100" x2="{W}" y2="100" stroke="url(#ln)" stroke-width="2.5"/>'
                f'<circle cy="100" r="5" fill="{CYAN}" filter="url(#gl)"><animate attributeName="cx" values="0;{W*0.7};0" dur="7s" repeatCount="indefinite"/></circle>'
                f'<circle cy="100" r="2.5" fill="#fff"><animate attributeName="cx" values="0;{W*0.7};0" dur="7s" repeatCount="indefinite"/></circle>')
        save(f"h-{slug}.svg", svg(W, H, body, css, defs))


# --------------------------------------------------------------- ABOUT
def about():
    W, H = 1000, 380
    css = """.float1{animation:float 7s ease-in-out infinite}.blink{animation:blink 1s step-end infinite}
    .c1{animation:up .7s ease both .2s}.c2{animation:up .7s ease both .4s}.c3{animation:up .7s ease both .6s}.c4{animation:up .7s ease both .8s}
    .bar{animation:grow 2.5s ease-in-out infinite alternate}
    @keyframes grow{from{transform:scaleX(.25)}to{transform:scaleX(1)}}
    .bar{transform-box:fill-box;transform-origin:left}
    .glow{animation:pulse 3s ease-in-out infinite}"""
    defs = shimmer_grad("v", 300, (CYAN, PURPLE, CYAN), 5)
    b = []
    # editor
    ex, ey, ew, eh = 1, 1, 540, 376
    b.append(f'<rect x="{ex}" y="{ey}" width="{ew}" height="{eh}" rx="16" fill="{BG2}" stroke="{LINE}"/>')
    b.append(f'<path d="M{ex} {ey+44}V{ey+16}a16 16 0 0 1 16-16h{ew-32}a16 16 0 0 1 16 16V{ey+44}z" fill="{PANEL}"/>')
    for i, c in enumerate(["#FF5F57", "#FEBC2E", "#28C840"]):
        b.append(f'<circle cx="{ex+24+i*18}" cy="{ey+22}" r="5.5" fill="{c}"/>')
    b.append(f'<rect x="{ex+90}" y="{ey+8}" width="124" height="36" rx="6" fill="{BG2}"/><circle cx="{ex+106}" cy="{ey+26}" r="4" fill="{CYAN}"/>')
    b.append(f'<text class="mono" x="{ex+116}" y="{ey+31}" font-size="13" fill="{INK}">about-me.ts</text>')
    P, K, S, I, T = PURPLE, INK2, GREEN, INK, CYAN
    lines = [
        [("// hello world, I'm Nahid 👋".replace("👋", ""), MUTE)],
        [("const ", P), ("nahid", T), (": ", I), ("Developer", AMBER), (" = {", I)],
        [("  name", K), (": ", I), ('"Asratul Hasan Nahid"', S), (",", I)],
        [("  role", K), (": ", I), ('"Full-Stack Engineer"', S), (",", I)],
        [("  company", K), (": ", I), ('"@exprovia"', S), (",", I)],
        [("  experience", K), (": ", I), ('"2+ years"', S), (",", I)],
        [("  craft", K), (": [", I), ('"WordPress"', S), (", ", I), ('"Shopify"', S), (", ", I), ('"Headless"', S), ("],", I)],
        [("  fullStack", K), (": [", I), ('"Next.js"', S), (", ", I), ('"NestJS"', S), (", ", I), ('"AWS"', S), ("],", I)],
        [("  motto", K), (": ", I), ('"Build things people love"', S), (",", I)],
        [("};", I)],
    ]
    dur = 14
    for i, ln in enumerate(lines):
        y = ey + 80 + i * 28
        plain = "".join(t for t, _ in ln).replace("&amp;", "&")
        ww = text_w(plain, 14, mono=True) + 10
        t0, t1 = (0.4 + i * 0.8) / dur, (0.4 + i * 0.8 + 0.65) / dur
        b.append(f'<text class="mono" x="{ex+20}" y="{y}" font-size="12.5" fill="{MUTE}" opacity=".55">{i+1:>2}</text>')
        b.append(f'<clipPath id="a{i}"><rect x="{ex+52}" y="{y-18}" height="24" width="0"><animate attributeName="width" values="0;0;{ww:.0f};{ww:.0f};0" keyTimes="0;{t0:.3f};{t1:.3f};0.95;1" dur="{dur}s" repeatCount="indefinite"/></rect></clipPath>')
        spans = "".join(f'<tspan fill="{c}">{t}</tspan>' for t, c in ln)
        b.append(f'<text class="mono" clip-path="url(#a{i})" x="{ex+52}" y="{y}" font-size="14" xml:space="preserve">{spans}</text>')
    b.append(f'<rect class="blink" x="{ex+72}" y="{ey+80+9*28-15}" width="8" height="18" fill="{CYAN}"/>')
    b.append(f'<rect x="{ex}" y="{ey+eh-30}" width="{ew}" height="30" fill="{CYAN}" fill-opacity=".08"/>')
    b.append(f'<text class="mono" x="{ex+18}" y="{ey+eh-11}" font-size="11.5" fill="{CYAN}">&#9679; main   UTF-8   TypeScript   Ln 10, Col 3</text>')
    # cards
    cards = [("2+", "Years", "building for the web", CYAN),
             ("WP", "WordPress", "themes, plugins &amp; speed", "#3CA3D8"),
             ("SH", "Shopify", "Liquid theme development", "#7AB55C"),
             ("FS", "Full-Stack", "Next.js · NestJS · PostgreSQL", AMBER)]
    cw, ch, gx = 214, 180, 16
    for i, (big, title, sub, col) in enumerate(cards):
        x = 555 + (i % 2) * (cw + gx)
        y = 1 + (i // 2) * (ch + 16)
        b.append(f'<g class="c{i+1}"><rect x="{x}" y="{y}" width="{cw}" height="{ch}" rx="16" fill="{BG2}" stroke="{LINE}"/>'
                 f'<rect class="glow" x="{x}" y="{y}" width="{cw}" height="{ch}" rx="16" stroke="{col}" stroke-opacity=".55" style="animation-delay:-{i*0.75}s"/>'
                 f'<path d="M{x+cw-40} {y+24}h16v16" stroke="{col}" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>'
                 f'<text x="{x+20}" y="{y+64}" font-size="40" font-weight="800" fill="{col}">{big}</text>'
                 f'<text x="{x+20}" y="{y+104}" font-size="17" font-weight="700" fill="{INK}">{title}</text>'
                 f'<text x="{x+20}" y="{y+128}" font-size="12.5" fill="{MUTE}">{sub}</text>'
                 f'<rect x="{x+20}" y="{y+148}" width="{cw-40}" height="6" rx="3" fill="{LINE}" fill-opacity=".6"/>'
                 f'<rect class="bar" x="{x+20}" y="{y+148}" width="{cw-40}" height="6" rx="3" fill="{col}" style="animation-delay:-{i*0.6}s"/></g>')
    save("about.svg", svg(W, H, "".join(b), css, defs))


# --------------------------------------------------------------- STACK
def stack():
    W = 1000
    cols = [
        ("Daily Driver", "What I ship with every week", GREEN,
         ["WordPress", "PHP", "Shopify", "Liquid", "WooCommerce", "JavaScript", "React", "Next.js", "Tailwind CSS", "MySQL"]),
        ("Full-Stack", "Apps, APIs & databases", CYAN,
         ["TypeScript", "Node.js", "NestJS", "PostgreSQL", "Prisma", "Redis", "Docker", "AWS", "GitHub Actions", "Jest"]),
        ("Server & Craft", "Keeping things fast & secure", PURPLE,
         ["Linux", "Nginx", "Git", "Server Security", "Performance", "Headless CMS", "REST APIs", "Figma", "AI Pair-Programming"]),
    ]
    cw, gap, pad = 318, 22, 20
    layouts, maxh = [], 0
    for title, sub, col, chips in cols:
        x, y, pos = pad, 104, []
        for c in chips:
            w = text_w(c, 13, True) + 36
            if x + w > cw - pad:
                x, y = pad, y + 38
            pos.append((x, y, w, c))
            x += w + 8
        layouts.append(pos)
        maxh = max(maxh, y + 30 + 24)
    H = maxh + 4
    css = ".run{stroke-dasharray:90 1400;animation:dash2 6s linear infinite}@keyframes dash2{to{stroke-dashoffset:-1490}}"
    css += "".join(f".k{i}{{animation:up .6s ease both {0.15+i*0.07:.2f}s}}" for i in range(40))
    defs = ""
    b, k = [], 0
    for ci, ((title, sub, col, chips), pos) in enumerate(zip(cols, layouts)):
        ox = 1 + ci * (cw + gap)
        defs += f'<linearGradient id="hd{ci}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{col}" stop-opacity=".18"/><stop offset="1" stop-color="{col}" stop-opacity="0"/></linearGradient>'
        b.append(f'<g transform="translate({ox} 1)"><rect width="{cw}" height="{H-2}" rx="18" fill="{BG2}" stroke="{LINE}"/>'
                 f'<rect width="{cw}" height="90" rx="18" fill="url(#hd{ci})"/>'
                 f'<rect class="run" width="{cw}" height="{H-2}" rx="18" stroke="{col}" stroke-width="2" style="animation-delay:-{ci*2}s"/>'
                 f'<circle cx="{pad+18}" cy="44" r="18" fill="{col}" fill-opacity=".15" stroke="{col}"/>'
                 f'<text x="{pad+18}" y="50" text-anchor="middle" font-size="16" font-weight="800" fill="{col}">{ci+1}</text>'
                 f'<text x="{pad+48}" y="40" font-size="19" font-weight="800" fill="{INK}">{esc(title)}</text>'
                 f'<text x="{pad+48}" y="62" font-size="12.5" fill="{MUTE}">{esc(sub)}</text>'
                 f'<line x1="{pad}" y1="86" x2="{cw-pad}" y2="86" stroke="{LINE}"/>')
        for x, y, w, c in pos:
            b.append(f'<g class="k{k}"><rect x="{x}" y="{y}" width="{w:.0f}" height="30" rx="15" fill="{PANEL}" stroke="{col}" stroke-opacity=".35"/>'
                     f'<circle cx="{x+15}" cy="{y+15}" r="4" fill="{col}"/>'
                     f'<text x="{x+25}" y="{y+20}" font-size="13" font-weight="600" fill="{INK}">{esc(c)}</text></g>')
            k += 1
        b.append('</g>')
    save("stack.svg", svg(W, H, "".join(b), css, defs))


# --------------------------------------------------------------- SERVICES
def services():
    W = 1000
    items = [
        ("WP", "WordPress Development", "#3CA3D8",
         ["Custom themes &amp; plugins", "Speed &amp; Core Web Vitals", "Server setup &amp; hardening"]),
        ("SH", "Shopify Development", "#7AB55C",
         ["Liquid theme development", "Store customization", "Third-party app integration"]),
        ("HL", "Headless CMS", PURPLE,
         ["WordPress as a backend", "Next.js frontends", "SEO-friendly, blazing fast"]),
        ("FS", "Full-Stack Apps", CYAN,
         ["Next.js + NestJS", "PostgreSQL + Prisma", "Auth, payments &amp; webhooks"]),
        ("API", "Backend &amp; APIs", AMBER,
         ["REST APIs with Swagger docs", "Queues &amp; Redis caching", "Tested &amp; secure by default"]),
        ("OPS", "DevOps &amp; Cloud", GREEN,
         ["Docker &amp; Docker Compose", "AWS: EC2, RDS, S3", "CI/CD with GitHub Actions"]),
    ]
    cw, ch, g = 322, 236, 16
    H = 2 * ch + g + 2
    css = ".run{stroke-dasharray:110 1000;animation:d 7s linear infinite}@keyframes d{to{stroke-dashoffset:-1110}}"
    css += ".float{animation:float 5s ease-in-out infinite}"
    css += "".join(f".s{i}{{animation:up .7s ease both {0.1+i*0.12:.2f}s}}" for i in range(6))
    defs = ""
    b = []
    for i, (ic, title, col, pts) in enumerate(items):
        x = 1 + (i % 3) * (cw + g)
        y = 1 + (i // 3) * (ch + g)
        defs += (f'<radialGradient id="rg{i}" cx="1" cy="0" r="1"><stop offset="0" stop-color="{col}" stop-opacity=".22"/>'
                 f'<stop offset="1" stop-color="{col}" stop-opacity="0"/></radialGradient>')
        b.append(f'<g class="s{i}"><rect x="{x}" y="{y}" width="{cw}" height="{ch}" rx="18" fill="{BG2}" stroke="{LINE}"/>'
                 f'<rect x="{x}" y="{y}" width="{cw}" height="{ch}" rx="18" fill="url(#rg{i})"/>'
                 f'<rect class="run" x="{x}" y="{y}" width="{cw}" height="{ch}" rx="18" stroke="{col}" stroke-width="2" style="animation-delay:-{i*1.1:.1f}s"/>'
                 f'<g class="float" style="animation-delay:-{i*0.8:.1f}s"><rect x="{x+22}" y="{y+22}" width="54" height="54" rx="14" fill="{col}" fill-opacity=".15" stroke="{col}" stroke-opacity=".7"/>'
                 f'<text x="{x+49}" y="{y+55}" text-anchor="middle" font-size="{17 if len(ic)<3 else 14}" font-weight="800" fill="{col}">{ic}</text></g>'
                 f'<text x="{x+cw-22}" y="{y+44}" text-anchor="end" font-size="13" font-weight="800" fill="{MUTE}" class="mono">0{i+1}</text>'
                 f'<text x="{x+22}" y="{y+112}" font-size="20" font-weight="800" fill="{INK}">{title}</text>')
        for j, p in enumerate(pts):
            py = y + 146 + j * 28
            b.append(f'<path d="M{x+24} {py-4}l4 4 8-8" stroke="{col}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
                     f'<text x="{x+46}" y="{py}" font-size="14" fill="{INK2}">{p}</text>')
        b.append('</g>')
    save("services.svg", svg(W, H, "".join(b), css, defs))


# --------------------------------------------------------------- CONTACT BUTTONS
def contact():
    items = [("linkedin", "LinkedIn", "Let's network", "#0A66C2", "in"),
             ("facebook", "Facebook", "Say hello", "#1877F2", "f"),
             ("email", "Email", "Drop a message", "#D14836", "@"),
             ("portfolio", "Portfolio", "See my work", CYAN, "&#9670;")]
    for i, (slug, label, sub, col, ic) in enumerate(items):
        W, H = 220, 68
        defs = (f'<linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
                f'<clipPath id="c"><rect x="1" y="1" width="{W-2}" height="{H-2}" rx="18"/></clipPath>')
        body = (f'<rect x="1" y="1" width="{W-2}" height="{H-2}" rx="18" fill="{BG2}" stroke="{col}" stroke-opacity=".6"/>'
                f'<g clip-path="url(#c)"><rect x="-80" y="0" width="60" height="{H}" fill="url(#sh)" transform="skewX(-20)">'
                f'<animate attributeName="x" values="-80;300;300" keyTimes="0;.35;1" dur="4s" begin="{i*0.5}s" repeatCount="indefinite"/></rect></g>'
                f'<rect x="16" y="14" width="40" height="40" rx="12" fill="{col}"/>'
                f'<text x="36" y="41" text-anchor="middle" font-size="19" font-weight="800" fill="#fff">{ic}</text>'
                f'<text x="70" y="32" font-size="16" font-weight="800" fill="{INK}">{label}</text>'
                f'<text x="70" y="51" font-size="12.5" fill="{MUTE}">{sub}</text>'
                f'<text x="{W-20}" y="40" text-anchor="end" font-size="18" fill="{col}">&#8599;</text>')
        save(f"btn-{slug}.svg", svg(W, H, body, "", defs))


# --------------------------------------------------------------- FOOTER
def footer():
    W, H = 1000, 230
    defs = (shimmer_grad("fg", 500, (CYAN, PURPLE, AMBER, CYAN), 6) +
            f'<linearGradient id="wv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E4A8F"/><stop offset="1" stop-color="{BG}"/></linearGradient>')
    def wave(amp, y, col, op, dur, rev=False):
        d = f"M0 {y}"
        for i in range(8):
            x = i * 250
            d += f" Q{x+62} {y-amp} {x+125} {y} T{x+250} {y}"
        d += f" V{H} H0Z"
        fr, to = ("-500 0", "0 0") if rev else ("0 0", "-500 0")
        return (f'<path d="{d}" fill="{col}" fill-opacity="{op}"><animateTransform attributeName="transform" type="translate" '
                f'from="{fr}" to="{to}" dur="{dur}s" repeatCount="indefinite"/></path>')
    body = (wave(18, 150, "#1E4A8F", .35, 10) + wave(14, 165, CYAN, .18, 7, True) + wave(10, 182, "#1E4A8F", .55, 13) +
            f'<text x="{W/2}" y="62" text-anchor="middle" font-size="34" font-weight="800" fill="url(#fg)">Thanks for stopping by!</text>'
            f'<text x="{W/2}" y="96" text-anchor="middle" font-size="16" fill="{INK2}">Let&#8217;s build something amazing together.</text>'
            f'<text x="{W/2}" y="212" text-anchor="middle" font-size="12.5" fill="{INK2}">{esc(NAME)}  ·  Built with code &amp; lots of cha</text>')
    save("footer.svg", svg(W, H, body, "", defs))


if __name__ == "__main__":
    print("Building SVGs →", OUT)
    hero(); nav(); ticker(); headers(); about(); stack(); services(); contact(); footer()
    print("Done.")

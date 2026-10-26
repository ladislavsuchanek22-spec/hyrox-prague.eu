"""Anglické průvodce pro hyrox-prague.eu (EN publikum).

Generuje je tools/build_i18n.py. Průvodce s draft=True se negeneruje ani nepřidá do sitemap.
Zveřejnění: nastav draft=False a spusť python3 tools/build_i18n.py.
Styly, hlavička a patička se berou z vygenerované anglické homepage (index.html).
"""
import json
import re
from html import escape

BASE = "https://hyrox-prague.eu"

GUIDES = {
    "train-hyrox-in-prague": dict(
        draft=True,
        title="Train HYROX in Prague: Coaching, Classes & Gyms for Visitors | STR2G",
        desc="Visiting Prague and training for HYROX? Where to train, how to book HYROX classes at Form Factory and 1:1 sessions in English with a HYROX coach.",
        eyebrow="HYROX Prague guide",
        h1="Train HYROX in Prague",
        lead="In Prague for work, a city break or a training camp? You don't have to pause your HYROX prep. Here is where and how to train, in English.",
        body="""
<h2>1:1 coaching in English</h2>
<p>Train with Ladislav Suchánek, HYROX Performance Coach, at Form Factory Na Knížecí, Ostrovského 464/6, Prague 5 – Smíchov. One session can cover station technique (sleds, wall balls, burpee broad jumps), pacing for your next race or a part-race simulation. A 60-minute session costs 1,300 CZK.</p>
<p><a class="btn" href="https://www.ladislavsuchanek.cz/en/services/hyrox-coaching/">Book a session</a></p>
<h2>HYROX classes</h2>
<p>The official HYROX Training Club runs classes at two Form Factory clubs in Prague: Na Knížecí (Prague 5) and Vinohradská 190 (Prague 3). Classes last 45 minutes and follow the HYROX365 programme: running, strength, stations and work under fatigue. Book in the Moje Form Factory app or on the Form Factory website. First-visit options are on <a href="https://www.formfactory.cz/en/" target="_blank" rel="noopener">formfactory.cz</a>.</p>
<p><a class="btn ghost" href="https://hyroxtrainingclub.cz/en/">Clubs and timetable</a></p>
<h2>Training on your own</h2>
<p>All STR2G programs are written in English and run in the Strivee app on your phone, so you can keep your plan wherever you are. From 750 CZK a month, or a fixed 8- and 12-week race prep.</p>
<p><a class="btn ghost" href="https://str2g.com/">See the programs</a></p>
<h2>Tips for training while travelling</h2>
<ul>
<li>Keep your key sessions (one compromised run, one strength day) and drop the rest.</li>
<li>Easy runs are the simplest thing to keep: Prague has long riverside paths along the Vltava.</li>
<li>If you have a race within two weeks, treat the trip as part of your taper: less volume, keep some intensity.</li>
</ul>
""",
        faq=[
            ("Where can I train HYROX in Prague?", "At the official HYROX Training Club classes at Form Factory Na Knížecí (Prague 5) and Vinohradská (Prague 3), or 1:1 with HYROX coach Ladislav Suchánek at Form Factory Na Knížecí."),
            ("Is HYROX coaching in Prague available in English?", "Yes. 1:1 sessions with Ladislav Suchánek are available in English, and all STR2G online programs are written in English."),
            ("How long is a HYROX class in Prague?", "HYROX classes at Form Factory last 45 minutes and are booked in the Moje Form Factory app or on the Form Factory website."),
        ],
    ),
    "hyrox-races-near-prague": dict(
        draft=True,
        title="HYROX Races Near Prague 2026/27: Vienna, Katowice, Frankfurt & More | STR2G",
        desc="Living in or near Prague? These are the closest HYROX races in season 2026/27, with dates, plus tips for travelling to your race.",
        eyebrow="HYROX Prague guide",
        h1="HYROX races near Prague",
        lead="There is no HYROX race in Prague on the 2026/27 calendar so far. The good news: several races are a car or train ride away. Here are the closest ones.",
        body="""
<h2>Closest races in season 2026/27</h2>
<table class="gtable"><thead><tr><th>Race</th><th>Dates</th><th>Country</th></tr></thead><tbody>
<tr><td>HYROX Poznań</td><td>20–22 Nov 2026</td><td>Poland</td></tr>
<tr><td>HYROX Frankfurt</td><td>10–13 Dec 2026</td><td>Germany</td></tr>
<tr><td>HYROX Vienna (Messe Wien, Hall A)</td><td>19–21 Feb 2027</td><td>Austria</td></tr>
<tr><td>HYROX Katowice</td><td>19–21 Feb 2027</td><td>Poland</td></tr>
</tbody></table>
<p>Dates as published on hyrox.com in October 2026. More spring 2027 races may still be announced, so check <a href="https://hyrox.com/find-my-race/" target="_blank" rel="noopener">Find My Race</a> before you plan.</p>
<h2>Tickets sell out early</h2>
<p>Popular races sell out in the Open divisions months ahead. When we checked HYROX Vienna in October 2026, Men's Open Singles was already sold out. Buy your ticket as soon as you pick a race.</p>
<h2>Travelling to your race</h2>
<ul>
<li>Arrive the day before. Your start time is fixed and you want a calm morning.</li>
<li>Plan your race-day meal 2–3 hours before your start and bring food you know.</li>
<li>Pack shoes and kit you have trained in. Headphones and phones are not allowed on the course.</li>
<li>Use the last two weeks as a taper: less volume, keep some intensity.</li>
</ul>
<h2>Prepare in Prague</h2>
<p>Train for your race at the HYROX Training Club in Prague, or with a structured plan in English from STR2G. For 1:1 race prep, book a session with Ladislav at Form Factory Na Knížecí.</p>
<p><a class="btn" href="https://str2g.com/hyrox-training-plan/">HYROX training plans</a> <a class="btn ghost" href="/train-hyrox-in-prague/">Train HYROX in Prague</a></p>
""",
        faq=[
            ("Is there a HYROX race in Prague?", "Not on the 2026/27 calendar so far. The closest races are in Poland, Germany and Austria, for example Vienna and Katowice in February 2027."),
            ("When is HYROX Vienna 2027?", "HYROX Vienna takes place on 19–21 February 2027 at Messe Wien, Hall A."),
            ("How early should I buy HYROX tickets?", "As soon as you choose a race. Open divisions on popular races sell out months ahead."),
        ],
    ),
}

GUIDE_CSS = """
.ghero{padding:150px 0 40px}
.ghero .wrap{max-width:780px}
.ghero h1{font-size:clamp(46px,7vw,96px);margin:10px 0 18px}
.gbody{max-width:780px;padding-bottom:40px}
.gbody h2{font-size:clamp(30px,4vw,46px);margin:48px 0 16px}
.gbody p,.gbody li,.gbody td,.gbody th{font-size:18px;line-height:1.6;color:#E8E6E0}
.gbody ul{padding-left:22px}
.gbody a:not(.btn){color:var(--accent)}
.gbody .btn{margin:6px 8px 6px 0}
.gtable{width:100%;border-collapse:collapse;margin:8px 0 16px}
.gtable th,.gtable td{text-align:left;padding:10px 12px 10px 0;border-bottom:1px solid rgba(255,255,255,.12)}
.gfaq details{border-bottom:1px solid rgba(255,255,255,.12);padding:16px 0}
.gfaq summary{cursor:pointer;font-weight:700;font-size:19px}
.gfaq p{color:#cfcac0}
"""


def page(slug, g, en_html):
    css = re.search(r"<style>(.*?)</style>", en_html, re.S).group(1)
    head_links = "\n".join(re.findall(r'<link rel="(?:icon|preconnect|stylesheet)"[^>]*>', en_html))
    tracking = "\n".join(re.findall(r'<script src="/js/[^"]+"[^>]*></script>', en_html))
    header = re.search(r'<header class="nav" id="nav">.*?</header>', en_html, re.S).group(0)
    footer = re.search(r"<footer>.*?</footer>", en_html, re.S).group(0).replace('href="#top"', 'href="/"')
    scripts_tail = en_html[en_html.index("</footer>") + len("</footer>"):]
    # odkazy na kotvy homepage musí vést na /
    header = re.sub(r'href="#', 'href="/#', header)
    footer = re.sub(r'href="/#top"', 'href="/"', footer)
    url = f"{BASE}/{slug}/"
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "HYROX Prague", "item": BASE + "/"},
            {"@type": "ListItem", "position": 2, "name": g["h1"], "item": url}]},
        {"@type": "Article", "headline": g["h1"], "description": g["desc"], "inLanguage": "en", "mainEntityOfPage": url,
         "author": {"@type": "Person", "name": "Ladislav Suchánek"}, "image": BASE + "/img/og.jpg"},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in g["faq"]]},
    ]}
    faq = "".join(f"<details><summary>{escape(q)}</summary><p>{escape(a)}</p></details>" for q, a in g["faq"])
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{escape(g["title"])}</title>
<meta name="description" content="{escape(g["desc"])}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="STR2G HYROX">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{escape(g["title"])}">
<meta property="og:description" content="{escape(g["desc"])}">
<meta property="og:image" content="{BASE}/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
{head_links}
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>{css}{GUIDE_CSS}</style>
{tracking}
</head>
<body>
{header}
<main id="top">
  <section class="ghero"><div class="wrap">
    <div class="eyebrow">{escape(g["eyebrow"])}</div>
    <h1>{escape(g["h1"])}</h1>
    <p class="lead">{escape(g["lead"])}</p>
  </div></section>
  <section class="band"><div class="wrap gbody">
{g["body"]}
    <h2>FAQ</h2>
    <div class="gfaq">{faq}</div>
  </div></section>
</main>
{footer}
{scripts_tail}'''


def build(root):
    en_html = (root / "index.html").read_text(encoding="utf-8")
    urls = []
    for slug, g in GUIDES.items():
        if g.get("draft"):
            continue
        out = root / slug / "index.html"
        out.parent.mkdir(exist_ok=True)
        out.write_text(page(slug, g, en_html), encoding="utf-8")
        urls.append(f"{BASE}/{slug}/")
    print("guides:", len(urls))
    return urls


def render_all(root):
    """Náhled všech průvodců včetně konceptů (pro kontrolu), vrací {slug: html}."""
    en_html = (root / "index.html").read_text(encoding="utf-8")
    return {slug: page(slug, g, en_html) for slug, g in GUIDES.items()}

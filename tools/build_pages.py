"""Vygeneruje české podstránky a blog z tools/pages.py.

Použití (z kořene repozitáře):  python3 tools/build_pages.py

- Obsah je v tools/pages.py.
- Styly se berou z index.html, takže design zůstává stejný jako na hlavní stránce.
- Výstup: /hyrox-trener-praha/, /online-hyrox-trenink/, /hyrox-programy/, /blog/..., sitemap.xml, sitemap.txt
"""
import json
import re
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from pages import PAGES, POSTS, BLOG, BUSINESS, LADA  # noqa: E402

BASE = "https://hyrox-prague.eu"
SRC = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = re.search(r"<style>(.*?)</style>", SRC, re.S).group(1)
FOOTER = re.search(r"<footer>.*?</footer>", SRC, re.S).group(0).replace('href="#top"', 'href="/"')
VERIFY = re.search(r'name="google-site-verification" content="([^"]+)"', SRC).group(1)
FONTS = re.search(r'<link rel="stylesheet" href="(https://fonts.googleapis.com[^"]+)"', SRC).group(1)

EXTRA_CSS = """
.hero.sub{min-height:min(64vh,620px)}
.hero.sub h1{font-size:clamp(52px,8vw,112px);max-width:12ch}
.crumbs{font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);display:flex;flex-wrap:wrap;gap:8px}
.crumbs a{color:var(--muted);text-decoration:none}.crumbs a:hover{color:var(--accent)}
.prose{max-width:760px}
.prose > p,.prose li{color:#E8E6E0;font-size:18px}
.prose > p{margin:0 0 20px}
.prose a:not(.btn){color:var(--accent)}
.prose h2{font-size:clamp(34px,4.6vw,54px);margin:56px 0 20px}
.prose h2:first-child{margin-top:0}
.prose ul{margin:0 0 24px;padding-left:22px;display:grid;gap:10px}
.prose li::marker{color:var(--accent)}
.prose b{color:var(--fg)}
.pcards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:8px 0 24px}
.pcard{background:var(--panel);border:1px solid var(--line);border-top:3px solid var(--accent);padding:22px;display:flex;flex-direction:column;gap:12px;min-width:0}
.pcard h3{font-size:28px}
.pcard .pr{font-family:var(--display);font-style:italic;font-weight:800;font-size:30px;color:var(--accent);line-height:1}
.pcard p{color:var(--muted);font-size:15.5px;flex:1}
.pcard .btn{font-size:17px;line-height:1.15;padding:11px 14px 9px;width:100%;text-align:center}
.posts{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.post{display:flex;flex-direction:column;gap:12px;background:var(--panel);border:1px solid var(--line);padding:26px;text-decoration:none;transition:border-color .15s}
.post:hover{border-color:var(--accent)}
.post h2{font-size:clamp(30px,3.4vw,40px)}
.post p{color:var(--muted)}
.post time{font-family:var(--mono);font-size:12px;color:var(--accent);letter-spacing:.1em}
.byline{font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:18px}
.cta-band{text-align:left}
.cta-band h2{margin:10px 0 18px}
.cta-band p{color:var(--muted);max-width:52ch;margin-bottom:26px}
.sub-menu{display:flex;gap:22px;list-style:none;margin:0;padding:0}
.sub-menu a{font-family:var(--display);font-style:italic;font-weight:700;text-transform:uppercase;font-size:19px;text-decoration:none;color:var(--fg)}
.sub-menu a:hover,.sub-menu a[aria-current]{color:var(--accent)}
@media (max-width:980px){
  .sub-menu{display:none;position:absolute;top:var(--nav-h);left:0;right:0;flex-direction:column;gap:0;background:var(--bg);border-bottom:1px solid var(--line);padding:8px var(--gut-r) 20px var(--gut-l)}
  .sub-menu a{display:block;padding:12px 0;font-size:24px}
  .nav.open .sub-menu{display:flex}
  .pcards,.posts{grid-template-columns:1fr}
}
@media (min-width:981px){.burger{display:none}}
"""

MENU = [
    ("/hyrox-trener-praha/", "Trenér Praha"),
    ("/online-hyrox-trenink/", "Online trénink"),
    ("/hyrox-programy/", "Programy"),
    ("/blog/", "Blog"),
    ("/#prihlaska", "Kontakt"),
]


def header(current):
    items = "".join(
        f'<li><a href="{u}"{" aria-current=\"page\"" if u == current else ""}>{t}</a></li>' for u, t in MENU)
    return f'''<header class="nav" id="nav">
  <div class="wrap nav-in">
    <a class="logo" href="/"><b>STR<i>2</i>G</b><span>Ladislav Suchánek</span></a>
    <ul class="sub-menu" id="menu">{items}</ul>
    <div class="nav-cta">
      <a class="btn" href="/#prihlaska">Chci začít</a>
      <button class="burger" id="burger" aria-label="Otevřít menu" aria-expanded="false"><svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
    </div>
  </div>
</header>'''


SCRIPT = """<script>
(function(){var n=document.getElementById('nav'),b=document.getElementById('burger');
function s(o){n.classList.toggle('open',o);b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Zavřít menu':'Otevřít menu')}
b.addEventListener('click',function(){s(!n.classList.contains('open'))});
document.addEventListener('keydown',function(e){if(e.key==='Escape')s(false)});})();
</script>"""


def head(title, desc, url, og_type, ld):
    return f'''<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{escape(title)}</title>
<meta name="description" content="{escape(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="author" content="Ladislav Suchánek">
<meta name="google-site-verification" content="{VERIFY}">
<meta name="theme-color" content="#050505">
<link rel="canonical" href="{url}">
<meta property="og:type" content="{og_type}">
<meta property="og:locale" content="cs_CZ">
<meta property="og:site_name" content="STR2G HYROX">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{escape(title)}">
<meta property="og:description" content="{escape(desc)}">
<meta property="og:image" content="{BASE}/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>{CSS}{EXTRA_CSS}</style>
<script src="/js/tracking.js"></script>
</head>
<body>'''


def hero(p, crumbs, byline=""):
    c = ' <span aria-hidden="true">/</span> '.join(
        f'<a href="{u}">{t}</a>' if u else f'<span>{t}</span>' for u, t in crumbs)
    return f'''<section class="hero sub bgph ph-lunge">
    <div class="wrap">
      <nav class="crumbs" aria-label="Drobečková navigace">{c}</nav>
      <h1><span class="eyebrow h1k">{p["eyebrow"]}</span>{p["h1"][0]}<span class="l2">{p["h1"][1]}</span></h1>
      <p class="lead">{p["lead"]}</p>{byline}
      <div class="hero-ctas"><a class="btn" href="/#prihlaska">Chci začít</a><a class="btn ghost" href="/#nabidka">Ceny a programy</a></div>
    </div>
  </section>'''


def body(sections):
    out = []
    for kind, val in sections:
        if kind == "h2":
            out.append(f"<h2>{val}</h2>")
        elif kind == "h3":
            out.append(f"<h3>{val}</h3>")
        elif kind == "p":
            out.append(f"<p>{val}</p>")
        elif kind == "ul":
            out.append("<ul>" + "".join(f"<li>{x}</li>" for x in val) + "</ul>")
        elif kind == "cards":
            cards = "".join(
                f'<article class="pcard"><h3>{h}</h3><div class="pr">{pr}</div><p>{t}</p><a class="btn" href="{u}">{b}</a></article>'
                for h, pr, t, u, b in val)
            out.append(f'<div class="pcards">{cards}</div>')
    return "\n        ".join(out)


def faq_html(faq):
    if not faq:
        return ""
    half = (len(faq) + 1) // 2
    cols = [faq[:half], faq[half:]]
    inner = "".join("<div>" + "".join(
        f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in col) + "</div>" for col in cols)
    return f'''
  <section class="band alt" id="faq">
    <div class="wrap">
      <div class="shead"><span class="no">?</span><div><div class="eyebrow">Časté otázky</div><h2 style="margin-top:10px">Na co se <span class="hl">ptáte.</span></h2></div></div>
      <div class="faq">{inner}</div>
    </div>
  </section>'''


CTA = '''
  <section class="band cta-band">
    <div class="wrap">
      <div class="eyebrow">HYROX trénink Praha a online</div>
      <h2>Pojď <span class="hl">do toho.</span></h2>
      <p>Napiš, kde jsi a kam chceš. Ozvu se a doporučím ti, jak začít.</p>
      <a class="btn" href="/#prihlaska">Napsat mi</a>
    </div>
  </section>'''


def crumbs_ld(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + u} for i, (u, n) in enumerate(items)]}


def faq_ld(url, faq):
    return {"@type": "FAQPage", "@id": url + "#faq", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub("<[^>]+>", "", a)}}
        for q, a in faq]}


def write(path, html):
    f = ROOT / path / "index.html"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(html, encoding="utf-8")
    print("zapsáno", f.relative_to(ROOT))


urls = []

# ---- služby
for p in PAGES:
    url = f"{BASE}/{p['slug']}/"
    urls.append(url)
    cr = [("/", "HYROX trénink Praha"), (f"/{p['slug']}/", p["crumb"])]
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebPage", "@id": url, "url": url, "name": p["title"], "description": p["desc"], "inLanguage": "cs",
         "isPartOf": {"@id": BASE + "/#web"}, "about": {"@id": url + "#service"}},
        {"@type": "Service", "@id": url + "#service", "name": p["service"], "serviceType": "HYROX trénink",
         "provider": {"@id": BUSINESS}, "areaServed": [{"@type": "City", "name": "Praha"}, {"@type": "Country", "name": "Česká republika"}],
         "url": url, "description": p["desc"]},
        crumbs_ld(cr), faq_ld(url, p["faq"])]}
    html = head(p["title"], p["desc"], url, "website", ld) + "\n" + header(f"/{p['slug']}/") + f'''
<main id="top">
  {hero(p, [("/", "Domů"), (None, p["crumb"])])}
  <section class="band">
    <div class="wrap">
      <div class="prose">
        {body(p["sections"])}
      </div>
    </div>
  </section>{faq_html(p["faq"])}{CTA}
</main>
{FOOTER}
{SCRIPT}
</body>
</html>
'''
    write(p["slug"], html)

# ---- články
for p in POSTS:
    url = f"{BASE}/blog/{p['slug']}/"
    urls.append(url)
    cr = [("/", "HYROX trénink Praha"), ("/blog/", "Blog"), (f"/blog/{p['slug']}/", p["crumb"])]
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BlogPosting", "@id": url + "#article", "headline": p["crumb"], "description": p["desc"], "url": url,
         "mainEntityOfPage": url, "inLanguage": "cs", "image": BASE + "/img/og.jpg", "datePublished": p["date"],
         "dateModified": p["date"], "author": {"@type": "Person", "@id": LADA, "name": "Ladislav Suchánek", "url": BASE + "/"},
         "publisher": {"@id": BUSINESS}, "isPartOf": {"@id": BASE + "/#web"}},
        crumbs_ld(cr)]}
    d = p["date"].split("-")
    byline = f'\n      <p class="byline">Ladislav Suchánek · HYROX Performance Coach · <time datetime="{p["date"]}">{int(d[2])}. {int(d[1])}. {d[0]}</time></p>'
    html = head(p["title"], p["desc"], url, "article", ld) + "\n" + header("/blog/") + f'''
<main id="top">
  {hero(p, [("/", "Domů"), ("/blog/", "Blog"), (None, p["crumb"])], byline)}
  <section class="band">
    <div class="wrap">
      <article class="prose">
        {body(p["sections"])}
      </article>
    </div>
  </section>{CTA}
</main>
{FOOTER}
{SCRIPT}
</body>
</html>
'''
    write(f"blog/{p['slug']}", html)

# ---- rozcestník blogu
url = f"{BASE}/blog/"
urls.append(url)
cards = "".join(
    f'<a class="post" href="/blog/{p["slug"]}/"><time datetime="{p["date"]}">{int(p["date"][8:])}. {int(p["date"][5:7])}. {p["date"][:4]}</time>'
    f'<h2>{p["crumb"]}</h2><p>{p["lead"]}</p><span class="hl">Číst článek →</span></a>' for p in POSTS)
ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Blog", "@id": url, "url": url, "name": BLOG["title"], "description": BLOG["desc"], "inLanguage": "cs",
     "publisher": {"@id": BUSINESS}, "blogPost": [{"@id": f"{BASE}/blog/{p['slug']}/#article"} for p in POSTS]},
    crumbs_ld([("/", "HYROX trénink Praha"), ("/blog/", "Blog")])]}
html = head(BLOG["title"], BLOG["desc"], url, "website", ld) + "\n" + header("/blog/") + f'''
<main id="top">
  {hero(BLOG, [("/", "Domů"), (None, "Blog")])}
  <section class="band">
    <div class="wrap">
      <div class="posts">{cards}</div>
    </div>
  </section>{CTA}
</main>
{FOOTER}
{SCRIPT}
</body>
</html>
'''
write("blog", html)

# ---- sitemap
LASTMOD = "2026-10-16"
langs = [("cs", "/"), ("en", "/en/"), ("pl", "/pl/"), ("de", "/de/")]
alt = "".join(f'\n    <xhtml:link rel="alternate" hreflang="{l}" href="{BASE}{p}"/>' for l, p in langs) + \
    f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{BASE}/en/"/>'
xml = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for _, p in langs:
    xml.append(f"  <url><loc>{BASE}{p}</loc><lastmod>{LASTMOD}</lastmod>{alt}\n  </url>")
for u in urls:
    xml.append(f"  <url><loc>{u}</loc><lastmod>{LASTMOD}</lastmod></url>")
xml.append("</urlset>\n")
(ROOT / "sitemap.xml").write_text("\n".join(xml), encoding="utf-8")
(ROOT / "sitemap.txt").write_text("\n".join([BASE + p for _, p in langs] + urls) + "\n", encoding="utf-8")
print("zapsáno sitemap.xml, sitemap.txt")

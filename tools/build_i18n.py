"""Vygeneruje jazykové verze webu z české stránky index.html.

Použití (z kořene repozitáře):  python3 tools/build_i18n.py

- Zdroj pravdy je tools/index.cs.html (čeština). Texty upravuj tam.
- Výstup: / = angličtina (hlavní verze), /cs/, /pl/, /de/.
- Překlady jsou v tools/i18n.py (klíč = přesný český text).
- Výstup: en/index.html, pl/index.html, de/index.html.
Skript skončí chybou, pokud na stránce zůstane nepřeložený český text.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from i18n import T  # noqa: E402

BASE = "https://hyrox-prague.eu/"
# Angličtina je hlavní verze na kořeni webu (hyrox-prague.eu/), čeština je na /cs/.
PATHS = {"en": "", "cs": "cs/", "pl": "pl/", "de": "de/"}
LANGS = {  # kód: (index v T, og:locale)
    "en": (0, "en_US"),
    "pl": (1, "pl_PL"),
    "de": (2, "de_DE"),
}
# Odkazy na ostatní weby STR2G: česká URL ve zdroji -> URL podle jazyka
XLINKS = {
    "https://www.ladislavsuchanek.cz/eshop/#osobni-trenink": {"en": "https://www.ladislavsuchanek.cz/en/eshop/#osobni-trenink", "pl": "https://www.ladislavsuchanek.cz/pl/cennik/#osobni-trenink", "de": "https://www.ladislavsuchanek.cz/de/preise/#osobni-trenink"},
    "https://www.ladislavsuchanek.cz/eshop/#balicek-10-treninku": {"en": "https://www.ladislavsuchanek.cz/en/eshop/#balicek-10-treninku", "pl": "https://www.ladislavsuchanek.cz/pl/cennik/#balicek-10-treninku", "de": "https://www.ladislavsuchanek.cz/de/preise/#balicek-10-treninku"},
    "https://www.ladislavsuchanek.cz/eshop/#konzultace": {"en": "https://www.ladislavsuchanek.cz/en/eshop/#konzultace", "pl": "https://www.ladislavsuchanek.cz/pl/cennik/#konzultace", "de": "https://www.ladislavsuchanek.cz/de/preise/#konzultace"},
    "https://www.ladislavsuchanek.cz/l/vyzivovy-coaching/": {"en": "https://www.ladislavsuchanek.cz/l/en-vyzivovy-coaching/", "pl": "https://www.ladislavsuchanek.cz/l/pl-vyzivovy-coaching/", "de": "https://www.ladislavsuchanek.cz/l/de-vyzivovy-coaching/"},
    "https://www.ladislavsuchanek.cz/pravidla-ochrany-soukromi/": {"en": "https://www.ladislavsuchanek.cz/en/pravidla-ochrany-soukromi/", "pl": "https://www.ladislavsuchanek.cz/pl/polityka-prywatnosci/", "de": "https://www.ladislavsuchanek.cz/de/datenschutz/"},
    # stránky programů na str2g.com
    "https://str2g.com/cs/programy/hyrox-basic/": {"en": "https://str2g.com/programs/hyrox-basic/", "pl": "https://str2g.com/pl/programy/hyrox-basic/", "de": "https://str2g.com/de/programme/hyrox-basic/"},
    "https://str2g.com/cs/programy/8tydenni-hyrox-singles/": {"en": "https://str2g.com/programs/8-week-hyrox-singles/", "pl": "https://str2g.com/pl/programy/8-tygodni-hyrox-singles/", "de": "https://str2g.com/de/programme/8-wochen-hyrox-singles/"},
    "https://www.ladislavsuchanek.cz/": {"en": "https://www.ladislavsuchanek.cz/en/", "pl": "https://www.ladislavsuchanek.cz/pl/", "de": "https://www.ladislavsuchanek.cz/de/"},
    "https://www.ladislavsuchanek.cz/eshop/#online-coaching": {"en": "https://www.ladislavsuchanek.cz/en/eshop/#online-coaching", "pl": "https://www.ladislavsuchanek.cz/pl/cennik/#online-coaching", "de": "https://www.ladislavsuchanek.cz/de/preise/#online-coaching"},
    "https://str2g.com/cs/": {"en": "https://str2g.com/", "pl": "https://str2g.com/pl/", "de": "https://str2g.com/de/"},
    "https://hyroxtrainingclub.cz/": {"en": "https://hyroxtrainingclub.cz/en/", "pl": "https://hyroxtrainingclub.cz/pl/", "de": "https://hyroxtrainingclub.cz/de/"},
    "https://formfactorygames.cz/": {"en": "https://formfactorygames.cz/en/", "pl": "https://formfactorygames.cz/pl/", "de": "https://formfactorygames.cz/de/"},
    "https://riahrusovska.cz/": {"en": "https://riahrusovska.cz/en/", "pl": "https://riahrusovska.cz/en/", "de": "https://riahrusovska.cz/en/"},
    "https://strongertogether.cz/": {"en": "https://strongertogether.cz/en/", "pl": "https://strongertogether.cz/en/", "de": "https://strongertogether.cz/en/"},
}
ATTRS = ("alt", "placeholder", "aria-label", "data-plan", "content", "title")
CZ_ONLY = re.compile(r"[áčďéěíňřšťúůýžÁČĎÉĚÍŇŘŠŤÚŮÝŽ]")  # znaky češtiny, které PL/EN/DE nemají (kromě ó, ś...)
# Texty, které se nepřekládají (jména, značky, čísla)
KEEP = {"Ladislav Suchánek", "Ria Suchánek Hrušovská, MSc.", "Láďa &amp; Ria · Mixed Doubles · HYROX Maastricht",
        "Ria Suchánek Hrušovská", "IG · @22segge_coach",
        "Train with Ladislav at Form Factory Na Knížecí, Prague 5. Station technique, sled work, pacing or a full race simulation. 60 minutes, 1,300 CZK."}


def tr(text, i):
    v = T.get(text)
    return v[i] if v else None


def translate_html(src, i):
    # rozdělit na <script>/<style> a zbytek
    parts = re.split(r"(<script\b.*?</script>|<style\b.*?</style>)", src, flags=re.S)
    out = []
    for part in parts:
        if part.startswith("<script") and "application/ld+json" in part:
            out.append(translate_jsonld(part, i))
        elif part.startswith("<script"):
            for k in ("Zavřít menu", "Otevřít menu"):
                part = part.replace("'" + k + "'", "'" + T[k][i] + "'")
            out.append(part)
        elif part.startswith("<style"):
            out.append(part)
        else:
            def text_node(m):
                lead, txt, trail = m.group(1), m.group(2), m.group(3)
                t = tr(txt, i)
                return ">" + lead + (t if t is not None else txt) + trail + "<"
            part = re.sub(r">(\s*)([^<>]*?\S)(\s*)<", text_node, part)

            def attr(m):
                t = tr(m.group(2), i)
                return m.group(1) + '="' + (t if t is not None else m.group(2)) + '"'
            part = re.sub(r"\b(" + "|".join(ATTRS) + r')="([^"]*)"', attr, part)
            out.append(part)
    return "".join(out)


def translate_jsonld(block, i):
    m = re.match(r'(<script type="application/ld\+json">)(.*)(</script>)', block, flags=re.S)
    data = json.loads(m.group(2))

    def walk(o):
        if isinstance(o, dict):
            return {k: walk(v) for k, v in o.items()}
        if isinstance(o, list):
            return [walk(v) for v in o]
        if isinstance(o, str):
            t = tr(o, i)
            return t if t is not None else o
        return o
    data = walk(data)
    return m.group(1) + json.dumps(data, ensure_ascii=False) + m.group(3)


def localize_meta(html, code, locale):
    url = BASE + PATHS[code]
    html = html.replace('<html lang="cs">', '<html lang="%s">' % code, 1)
    html = html.replace('<link rel="canonical" href="%scs/">' % BASE, '<link rel="canonical" href="%s">' % url, 1)
    html = html.replace('<meta property="og:url" content="%scs/">' % BASE, '<meta property="og:url" content="%s">' % url, 1)
    html = html.replace('<meta property="og:locale" content="cs_CZ">', '<meta property="og:locale" content="%s">' % locale, 1)
    html = html.replace('"inLanguage": "cs"', '"inLanguage": "%s"' % code, 1)
    html = html.replace('"url": "%s"' % BASE, '"url": "%s"' % url)  # WebSite/Business url -> jazyková verze
    html = html.replace('<input type="hidden" name="lang" value="cs">', '<input type="hidden" name="lang" value="%s">' % code, 1)
    # odkazy na ostatní weby STR2G -> stejná jazyková verze
    for cs_url, by_lang in XLINKS.items():
        html = html.replace('href="%s"' % cs_url, 'href="%s"' % by_lang[code])
    # přepínač jazyků: aktivní položka
    html = html.replace(' aria-current="page">CZ</a>', '>CZ</a>', 1)
    label = code.upper()
    html = html.replace('lang="%s">%s</a>' % (code, label), 'lang="%s" aria-current="page">%s</a>' % (code, label), 1)
    return html


NAMES = re.compile(r"Ladislav Suchánek|Suchánek Hrušovská|Láďa|Suchánkiem|Ladislavem")


def check(html, code):
    """Vrátí seznam textů, které zůstaly česky."""
    body = re.sub(r"<script\b.*?</script>|<style\b.*?</style>", "", html, flags=re.S)
    body = NAMES.sub("", body)
    leftovers = []
    for txt in re.findall(r">\s*([^<>]*?\S)\s*<", body):
        if txt in KEEP:
            continue
        if CZ_ONLY.search(txt) and not (code == "pl" and not re.search(r"[čďěňřšťůýžČĎĚŇŘŠŤŮÝŽ]", txt)):
            leftovers.append(txt)
    for a in re.findall(r'\b(?:%s)="([^"]*)"' % "|".join(ATTRS), body):
        if a in KEEP:
            continue
        if re.search(r"[čďěňřšťůČĎĚŇŘŠŤŮ]", a):
            leftovers.append("@" + a)
    # názvy osob a měst bez diakritiky problém nejsou; povolíme jména
    leftovers = [x for x in leftovers if not re.fullmatch(r"(Ladislav Suchánek|Láďa.*|Ria Suchánek.*)", x)]
    return sorted(set(leftovers))


SITEMAP_LANGS = ["en", "cs", "pl", "de"]


def write_sitemaps():
    from datetime import date
    today = date.today().isoformat()
    alts = "".join('\n    <xhtml:link rel="alternate" hreflang="%s" href="%s%s"/>' % (c, BASE, PATHS[c]) for c in SITEMAP_LANGS)
    alts += '\n    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % BASE
    urls = "".join('\n  <url><loc>%s%s</loc><lastmod>%s</lastmod>%s\n  </url>' % (BASE, PATHS[c], today, alts) for c in SITEMAP_LANGS)
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">%s\n</urlset>\n' % urls, encoding="utf-8")
    (ROOT / "sitemap.txt").write_text("".join("%s%s\n" % (BASE, PATHS[c]) for c in SITEMAP_LANGS), encoding="utf-8")


def main():
    full = (ROOT / "tools" / "index.cs.html").read_text(encoding="utf-8")
    # čeština: bez anglických bloků, beze změn textu
    cs = re.sub(r"<!--en-only-->.*?<!--/en-only-->", "", full, flags=re.S)
    (ROOT / "cs").mkdir(exist_ok=True)
    (ROOT / "cs" / "index.html").write_text(cs, encoding="utf-8")
    print("[cs] zapsáno cs/index.html")
    # bloky jen pro češtinu (odkazy na české podstránky a blog)
    src = re.sub(r"<!--cz-only-->.*?<!--/cz-only-->", "", full, flags=re.S)
    failed = False
    for code, (i, locale) in LANGS.items():
        page = src if code == "en" else re.sub(r"<!--en-only-->.*?<!--/en-only-->", "", src, flags=re.S)
        html = translate_html(page, i)
        html = localize_meta(html, code, locale)
        left = check(html, code)
        if left:
            failed = True
            print("[%s] NEPŘELOŽENO:" % code)
            for x in left:
                print("   ", x)
        out = ROOT / PATHS[code] / "index.html"
        out.parent.mkdir(exist_ok=True)
        out.write_text(html, encoding="utf-8")
        print("[%s] zapsáno %s" % (code, out.relative_to(ROOT)))
    write_sitemaps()
    print("sitemap.xml + sitemap.txt")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()

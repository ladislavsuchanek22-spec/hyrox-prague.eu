"""Vygeneruje jazykové verze webu z české stránky index.html.

Použití (z kořene repozitáře):  python3 tools/build_i18n.py

- Zdroj pravdy je index.html (čeština). Texty upravuj tam.
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
LANGS = {  # kód: (index v T, og:locale)
    "en": (0, "en_US"),
    "pl": (1, "pl_PL"),
    "de": (2, "de_DE"),
}
# Odkazy na ostatní weby STR2G: česká URL ve zdroji -> URL podle jazyka
XLINKS = {
    "https://str2g.com/cs/": {"en": "https://str2g.com/", "pl": "https://str2g.com/pl/", "de": "https://str2g.com/de/"},
    "https://hyroxtrainingclub.cz/": {"en": "https://hyroxtrainingclub.cz/en/", "pl": "https://hyroxtrainingclub.cz/pl/", "de": "https://hyroxtrainingclub.cz/de/"},
    "https://formfactorygames.cz/": {"en": "https://formfactorygames.cz/en/", "pl": "https://formfactorygames.cz/pl/", "de": "https://formfactorygames.cz/de/"},
}
ATTRS = ("alt", "placeholder", "aria-label", "data-plan", "content", "title")
CZ_ONLY = re.compile(r"[áčďéěíňřšťúůýžÁČĎÉĚÍŇŘŠŤÚŮÝŽ]")  # znaky češtiny, které PL/EN/DE nemají (kromě ó, ś...)
# Texty, které se nepřekládají (jména, značky, čísla)
KEEP = {"Ladislav Suchánek", "Ria Suchánek Hrušovská, MSc.", "Láďa &amp; Ria · Mixed Doubles · HYROX Maastricht",
        "Ria Suchánek Hrušovská", "IG · @22segge_coach"}


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
    url = BASE + code + "/"
    html = html.replace('<html lang="cs">', '<html lang="%s">' % code, 1)
    html = html.replace('<link rel="canonical" href="%s">' % BASE, '<link rel="canonical" href="%s">' % url, 1)
    html = html.replace('<meta property="og:url" content="%s">' % BASE, '<meta property="og:url" content="%s">' % url, 1)
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


def main():
    src = (ROOT / "index.html").read_text(encoding="utf-8")
    # bloky jen pro češtinu (odkazy na české podstránky a blog)
    src = re.sub(r"<!--cz-only-->.*?<!--/cz-only-->", "", src, flags=re.S)
    failed = False
    for code, (i, locale) in LANGS.items():
        html = translate_html(src, i)
        html = localize_meta(html, code, locale)
        left = check(html, code)
        if left:
            failed = True
            print("[%s] NEPŘELOŽENO:" % code)
            for x in left:
                print("   ", x)
        out = ROOT / code / "index.html"
        out.parent.mkdir(exist_ok=True)
        out.write_text(html, encoding="utf-8")
        print("[%s] zapsáno %s" % (code, out.relative_to(ROOT)))
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()

# hyrox-prague.eu

Web STR2G HYROX · Ladislav Suchánek. Statický web hostovaný na Netlify.

- `index.html`: celá stránka
- `img/`: fotky
- `netlify.toml`: přesměrování a cache
- Formulář `prihlaska` běží přes Netlify Forms.

Každý push do větve `main` se automaticky nasadí na hyrox-prague.eu.

## Jazykové verze (EN / CZ / PL / DE)

- Od 26. 10. 2026 je hlavní verze anglická na kořeni webu (`/`). Čeština je na `/cs/`.
- Zdroj textů je čeština: `tools/index.cs.html`. Texty upravuj tam.
- Překlady jsou v `tools/i18n.py` (klíč = přesný český text).
- Po každé změně spusť `python3 tools/build_i18n.py`. Vygeneruje `index.html` (EN), `cs/`, `pl/`, `de/`, `sitemap.xml` a `sitemap.txt`.
- Bloky `<!--cz-only-->…<!--/cz-only-->` jsou jen v češtině, `<!--en-only-->…<!--/en-only-->` jen v angličtině.
- České podstránky a blog jsou přesměrované na ladislavsuchanek.cz a str2g.com (netlify.toml).

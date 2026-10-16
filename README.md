# hyrox-prague.eu

Web STR2G HYROX · Ladislav Suchánek. Statický web hostovaný na Netlify.

- `index.html`: celá stránka
- `img/`: fotky
- `netlify.toml`: přesměrování a cache
- Formulář `prihlaska` běží přes Netlify Forms.

Každý push do větve `main` se automaticky nasadí na hyrox-prague.eu.

## Jazykové verze (CZ / EN / PL / DE)

- Čeština je zdroj: `index.html`. Texty upravuj tam.
- Překlady jsou v `tools/i18n.py` (klíč = přesný český text).
- Po každé změně spusť `python3 tools/build_i18n.py`. Vygeneruje `en/`, `pl/`, `de/` a ohlásí nepřeložené texty.

## Podstránky a blog (jen česky)

- Obsah: `tools/pages.py`, generátor: `tools/build_pages.py` (styly bere z `index.html`).
- Po změně spusť `python3 tools/build_pages.py`. Přegeneruje podstránky, blog a `sitemap.xml`.
- Bloky `<!--cz-only-->…<!--/cz-only-->` v `index.html` se do EN/PL/DE nepřenáší.

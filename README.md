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

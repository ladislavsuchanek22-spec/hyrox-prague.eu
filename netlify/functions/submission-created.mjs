// Přihláška z hyrox-prague.eu → dva e-maily přes Resend (https://resend.com):
//   1) upozornění pro Ladislava (česky, s tlačítkem Odpovědět),
//   2) potvrzení pro toho, kdo přihlášku poslal (v jazyce stránky CZ/EN/DE/PL).
// Vzhled = web hyrox-prague.eu (STR2G, černá + zlatá, Barlow Condensed).
//
// Netlify funkci spustí sám po každém ověřeném odeslání formuláře (spam sem nedojde).
//
// Environment variables (Netlify → Project configuration → Environment variables, scope Functions):
//   RESEND_API_KEY     klíč z Resend (povinné)
//   NOTIFY_FROM        odesílatel, např. "Web hyrox-prague.eu <web@ladislavsuchanek.cz>"
//   NOTIFY_TO          kam poslat upozornění (výchozí info@ladislavsuchanek.cz)
//   SEND_CONFIRMATION  "off" vypne potvrzení pro odesílatele

const C = { bg: '#050505', panel: '#0F0F0E', line: '#262521', fg: '#FFFFFF', muted: '#A19E96', gold: '#C9A950' }
const DISPLAY = "'Barlow Condensed','Arial Narrow',Impact,Arial,sans-serif"
const BODY = "Archivo,'Helvetica Neue',Arial,sans-serif"
const MONO = "'JetBrains Mono',Menlo,Consolas,monospace"
const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;700&family=Barlow+Condensed:ital,wght@1,800;1,900&family=JetBrains+Mono:wght@500&display=swap'

const LANGS = {
  cs: { code: 'CZ', name: 'Čeština', hint: 'Odpověz česky', url: 'https://hyrox-prague.eu/' },
  en: { code: 'EN', name: 'Angličtina', hint: 'Odpověz anglicky', url: 'https://hyrox-prague.eu/en/' },
  de: { code: 'DE', name: 'Němčina', hint: 'Odpověz německy', url: 'https://hyrox-prague.eu/de/' },
  pl: { code: 'PL', name: 'Polština', hint: 'Odpověz polsky', url: 'https://hyrox-prague.eu/pl/' },
}

const CONFIRM = {
  cs: { noName: true, subject: () => 'Díky – přihláška mi dorazila', eyebrow: 'Přihláška přijata', thanks: 'Díky', lead: 'Tvoje přihláška mi dorazila. Projdu si ji a do 24 hodin se ti ozvu s dalším krokem.', recap: 'Co jsi poslal/a', plan: 'Zájem o', race: 'Další závod', goal: 'Kde jsi teď a cíl', none: 'neuvedeno', reply: 'Kdyby tě mezitím ještě něco napadlo, prostě odpověz na tenhle e-mail.', btn: 'Zpět na web', foot: 'Odpovím do 24 h' },
  en: { subject: (n) => n ? `Thanks, ${n} – application received` : 'Thanks – application received', eyebrow: 'Application received', thanks: 'Thanks', lead: 'Your application is in. I’ll go through it and get back to you within 24 hours with the next step.', recap: 'What you sent', plan: 'Interested in', race: 'Next race', goal: 'Where you are & goal', none: 'not provided', reply: 'If anything else comes to mind, just reply to this email.', btn: 'Back to the website', foot: 'Reply within 24 h' },
  de: { subject: (n) => n ? `Danke, ${n} – deine Bewerbung ist da` : 'Danke – deine Bewerbung ist da', eyebrow: 'Bewerbung erhalten', thanks: 'Danke', lead: 'Deine Bewerbung ist angekommen. Ich schaue sie mir an und melde mich innerhalb von 24 Stunden mit dem nächsten Schritt.', recap: 'Deine Angaben', plan: 'Interesse an', race: 'Nächstes Rennen', goal: 'Stand & Ziel', none: 'nicht angegeben', reply: 'Wenn dir noch etwas einfällt, antworte einfach auf diese E-Mail.', btn: 'Zurück zur Website', foot: 'Antwort in 24 h' },
  pl: { noName: true, subject: () => 'Dzięki – zgłoszenie dotarło', eyebrow: 'Zgłoszenie przyjęte', thanks: 'Dzięki', lead: 'Twoje zgłoszenie dotarło. Przejrzę je i w ciągu 24 godzin odezwę się z kolejnym krokiem.', recap: 'Twoje zgłoszenie', plan: 'Zainteresowanie', race: 'Najbliższy start', goal: 'Gdzie jesteś i cel', none: 'nie podano', reply: 'Jeśli coś jeszcze przyjdzie ci do głowy, po prostu odpowiedz na tego maila.', btn: 'Wróć na stronę', foot: 'Odpowiedź w 24 h' },
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function pragueTime(iso) {
  const d = iso ? new Date(iso) : new Date()
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('cs-CZ', { timeZone: 'Europe/Prague', day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      .formatToParts(d).map((x) => [x.type, x.value]),
  )
  return `${p.day}.${p.month}.${p.year} · ${p.hour}:${p.minute}`
}

const row = (k, v) => `<tr>
  <td class="lb" width="150" valign="top" style="padding:15px 12px 15px 0;border-bottom:1px solid ${C.line};font-family:${MONO};font-size:11px;letter-spacing:2px;color:${C.muted};text-transform:uppercase">${k}</td>
  <td valign="top" style="padding:15px 0;border-bottom:1px solid ${C.line};font-family:${BODY};font-size:16px;color:${C.fg}">${v}</td></tr>`

const box = (title, text) => `<tr><td class="px" style="padding:26px 32px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.panel}" style="background:${C.panel};border:1px solid ${C.line}"><tr><td style="padding:22px">
    <div style="font-family:${MONO};font-size:12px;letter-spacing:2px;color:${C.gold};text-transform:uppercase">${title}</div>
    <div style="margin-top:12px;font-family:${BODY};font-size:16px;line-height:1.6;color:${C.fg};white-space:pre-line">${text}</div>
  </td></tr></table></td></tr>`

const pill = (href, text) => `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
  <td align="center" bgcolor="${C.gold}" style="border:1.5px solid ${C.gold};background:${C.gold};border-radius:999px">
  <a class="bt" href="${esc(href)}" style="display:block;padding:14px 28px 13px;font-family:${DISPLAY};font-style:italic;font-weight:800;font-size:20px;line-height:1;text-transform:uppercase;color:${C.bg};text-decoration:none">${text}</a></td></tr></table>`

function shell({ lang = 'cs', title, preheader, right = '', body, footRight }) {
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<title>${esc(title)}</title>
<link href="${FONTS}" rel="stylesheet">
<style>a{color:${C.gold}} @media (max-width:480px){.px{padding-left:20px!important;padding-right:20px!important}.name{font-size:52px!important}.lb{width:96px!important}.hide-sm{display:none!important}.bt{font-size:17px!important}.dt{font-size:10px!important;letter-spacing:0!important}}</style>
</head>
<body style="margin:0;padding:0;background:${C.bg}">
<div style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.bg}" style="background:${C.bg}"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${C.bg};color:${C.fg}">

<tr><td class="px" style="padding:22px 32px;border-bottom:1px solid ${C.line}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="white-space:nowrap"><span style="font-family:${DISPLAY};font-style:italic;font-weight:900;font-size:30px;line-height:1;color:${C.fg}">STR<span style="color:${C.gold}">2</span>G</span>
      <span class="hide-sm" style="padding-left:10px;font-family:${MONO};font-size:11px;letter-spacing:1.5px;color:${C.muted};text-transform:uppercase">Ladislav Suchánek</span></td>
    <td class="dt" align="right" style="font-family:${MONO};font-size:11px;letter-spacing:1px;color:${C.muted}">${right}</td>
  </tr></table>
</td></tr>
${body}
<tr><td class="px" style="padding:36px 32px 26px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.line}"><tr>
    <td style="padding-top:20px;font-family:${DISPLAY};font-style:italic;font-weight:800;font-size:18px;color:${C.muted};text-transform:uppercase">Stronger together</td>
    <td align="right" style="padding-top:20px;font-family:${MONO};font-size:11px;letter-spacing:1px;color:${C.muted};text-transform:uppercase">${footRight}</td>
  </tr></table>
</td></tr>
</table></td></tr></table>
</body></html>`
}

function fields(d) {
  return {
    name: String(d.name || '').trim(),
    email: String(d.email || '').trim(),
    plan: String(d.plan || '').trim(),
    race: String(d.race || '').trim(),
    goal: String(d.goal || '').trim(),
    lc: CONFIRM[d.lang] ? d.lang : 'cs',
  }
}

// 1) upozornění pro Ladislava
export function buildNotification(d, meta = {}) {
  const f = fields(d)
  const lang = LANGS[f.lc]
  const name = f.name || 'Bez jména'
  const parts = name.split(/\s+/)
  const nameHtml = parts.length > 1 ? esc(parts[0]) + '<br>' + esc(parts.slice(1).join(' ')) : esc(name)
  const plan = f.plan || 'Nevybráno'
  const muted = (t) => `<span style="color:${C.muted}">${t}</span>`
  const replySubject = encodeURIComponent(`${f.plan || 'HYROX'} – Ladislav Suchánek`)

  const body = `
<tr><td class="px" style="padding:40px 32px 30px">
  <div style="font-family:${MONO};font-size:12px;letter-spacing:2px;color:${C.gold};text-transform:uppercase">Nová přihláška · hyrox-prague.eu · ${lang.code}</div>
  <div class="name" style="margin-top:16px;font-family:${DISPLAY};font-style:italic;font-weight:900;font-size:76px;line-height:0.9;text-transform:uppercase;color:${C.fg};word-break:break-word">${nameHtml}</div>
  <div style="margin-top:16px;font-family:${BODY};font-size:17px;line-height:1.5;color:${C.muted}">Zájem o <strong style="color:${C.fg}">${esc(plan)}</strong></div>
</td></tr>
${f.email ? `<tr><td class="px" style="padding:0 32px">${pill(`mailto:${f.email}?subject=${replySubject}`, 'Odpovědět e-mailem')}</td></tr>` : ''}
<tr><td class="px" style="padding:30px 32px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.line}">
    ${row('E-mail', f.email ? `<a href="mailto:${esc(f.email)}" style="color:${C.fg};text-decoration:none">${esc(f.email)}</a>` : muted('neuvedeno'))}
    ${row('Zájem o', esc(plan))}
    ${row('Další závod', f.race ? esc(f.race) : muted('neuvedeno'))}
    ${row('Jazyk webu', `${lang.name} (${lang.code}) ${muted('· ' + lang.hint)}`)}
  </table>
</td></tr>
${box('Kde je teď a jaký má cíl', f.goal ? esc(f.goal) : muted('nevyplněno'))}`

  const html = shell({ title: `Nová přihláška – ${name}`, preheader: `${plan} · ${f.goal.slice(0, 120)}`, right: esc(pragueTime(meta.createdAt)), body, footRight: 'Odpověz do 24 h' })
  const text = [
    `NOVÁ PŘIHLÁŠKA – hyrox-prague.eu (${lang.code})`, pragueTime(meta.createdAt), '',
    `Jméno: ${name}`, `E-mail: ${f.email || 'neuvedeno'}`, `Zájem o: ${plan}`, `Další závod: ${f.race || 'neuvedeno'}`,
    `Jazyk webu: ${lang.name} – ${lang.hint.toLowerCase()}`, '', 'Kde je teď a jaký má cíl:', f.goal || '(nevyplněno)',
  ].join('\n')
  return { subject: `Nová přihláška: ${name} · ${plan}`, html, text, replyTo: f.email }
}

// 2) potvrzení pro odesílatele
export function buildConfirmation(d) {
  const f = fields(d)
  const t = CONFIRM[f.lc]
  const url = LANGS[f.lc].url
  const first = t.noName ? '' : (f.name.split(/\s+/)[0] || '')
  const muted = (x) => `<span style="color:${C.muted}">${x}</span>`
  const heading = first
    ? `${esc(t.thanks)},<br><span style="color:${C.gold}">${esc(first)}.</span>`
    : `${esc(t.thanks)}<span style="color:${C.gold}">!</span>`

  const body = `
<tr><td class="px" style="padding:40px 32px 26px">
  <div style="font-family:${MONO};font-size:12px;letter-spacing:2px;color:${C.gold};text-transform:uppercase">${esc(t.eyebrow)}</div>
  <div class="name" style="margin-top:16px;font-family:${DISPLAY};font-style:italic;font-weight:900;font-size:76px;line-height:0.9;text-transform:uppercase;color:${C.fg};word-break:break-word">${heading}</div>
  <div style="margin-top:18px;font-family:${BODY};font-size:17px;line-height:1.55;color:${C.fg}">${esc(t.lead)}</div>
</td></tr>
<tr><td class="px" style="padding:0 32px">
  <div style="font-family:${MONO};font-size:12px;letter-spacing:2px;color:${C.muted};text-transform:uppercase;padding-bottom:6px">${esc(t.recap)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.line}">
    ${row(esc(t.plan), f.plan ? esc(f.plan) : muted(esc(t.none)))}
    ${row(esc(t.race), f.race ? esc(f.race) : muted(esc(t.none)))}
  </table>
</td></tr>
${f.goal ? box(esc(t.goal), esc(f.goal)) : ''}
<tr><td class="px" style="padding:26px 32px 0;font-family:${BODY};font-size:16px;line-height:1.55;color:${C.muted}">${esc(t.reply)}</td></tr>
<tr><td class="px" style="padding:26px 32px 0">${pill(url, esc(t.btn))}</td></tr>
<tr><td class="px" style="padding:34px 32px 0;font-family:${BODY};font-size:16px;line-height:1.5;color:${C.fg}">Ladislav Suchánek<br><span style="color:${C.muted};font-size:14px">HYROX Performance Coach · STR2G · <span style="white-space:nowrap">+420 722 077 070</span></span></td></tr>`

  const html = shell({ lang: f.lc, title: t.subject(first), preheader: t.lead, body, footRight: esc(t.foot) })
  const text = [
    `${t.thanks}${first ? ', ' + first + '.' : '!'}`, '', t.lead, '',
    `${t.plan}: ${f.plan || t.none}`, `${t.race}: ${f.race || t.none}`,
    ...(f.goal ? ['', `${t.goal}:`, f.goal] : []), '', t.reply, '',
    'Ladislav Suchánek', 'HYROX Performance Coach · STR2G · +420 722 077 070', url,
  ].join('\n')
  return { subject: t.subject(first), html, text, to: f.email }
}

async function send(key, body) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) console.error('Resend chyba', res.status, await res.text())
  return res.ok
}

export default async (req) => {
  const { payload } = await req.json()
  if (!payload || payload.form_name !== 'prihlaska') return new Response('skip')

  const key = Netlify.env.get('RESEND_API_KEY')
  if (!key) {
    console.log('RESEND_API_KEY chybí – e-maily se neposílají.')
    return new Response('no key')
  }
  const from = Netlify.env.get('NOTIFY_FROM') || 'Web hyrox-prague.eu <web@ladislavsuchanek.cz>'
  const owner = Netlify.env.get('NOTIFY_TO') || 'info@ladislavsuchanek.cz'
  const d = payload.data || {}

  const n = buildNotification(d, { createdAt: payload.created_at })
  const ok = await send(key, { from, to: [owner], subject: n.subject, html: n.html, text: n.text, ...(n.replyTo ? { reply_to: n.replyTo } : {}) })

  const c = buildConfirmation(d)
  if (Netlify.env.get('SEND_CONFIRMATION') !== 'off' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.to)) {
    await send(key, { from: from.replace(/^[^<]*</, 'Ladislav Suchánek · STR2G <'), to: [c.to], subject: c.subject, html: c.html, text: c.text, reply_to: owner })
  }
  return new Response(ok ? 'ok' : 'send failed', { status: ok ? 200 : 500 })
}

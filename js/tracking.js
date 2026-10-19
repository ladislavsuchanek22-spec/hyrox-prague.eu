/* hyrox-prague.eu – měření pro reklamu (Meta pixel + GA4 + Google Ads)
   Načítá se synchronně v <head> každé stránky: <script src="/js/tracking.js"></script>
   Consent Mode v2: bez souhlasu jde do Googlu jen anonymní signál, Meta pixel se nenačte vůbec.
   ID a štítky: viz projekt REKLAMA → claude/hyrox-prague-mereni-id.md */
(function () {
  var T = {
    metaPixelId:  '1985583982135119',          // Meta pixel „HYROX Prague – hyrox-prague.eu“
    ga4Id:        'G-YPQE7670E3',              // GA4 služba „HYROX Prague – hyrox-prague.eu“
    adsId:        'AW-11061084387',            // Google Ads 402-723-4713
    adsBuyLabel:  'u3UmCNGp1Z8dEOOBq5op',      // konverze „HYROX Prague – Klik na koupit“
    adsLeadLabel: '-qJkCNSp1Z8dEOOBq5op'       // konverze „HYROX Prague – Lead“
  };
  var KEY = 'hp_consent';

  // --- Google: Consent Mode v2, výchozí stav = vše zamítnuto ---
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', wait_for_update: 500
  });
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + T.ga4Id;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', T.ga4Id);
  gtag('config', T.adsId);

  function getConsent() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // --- Meta pixel (jen po souhlasu) ---
  var metaLoaded = false;
  function loadMeta() {
    if (metaLoaded) return; metaLoaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', T.metaPixelId);
    fbq('track', 'PageView');
  }

  function grant() {
    gtag('consent', 'update', {
      ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
    loadMeta();
  }
  if (getConsent() === 'all') grant();

  // --- Události ---
  // Klik na „Koupit“ = odkaz na program (str2g.com/#…) nebo položku e-shopu
  function trackBuy(href) {
    var product = (href.match(/#([a-z0-9-]+)$/) || href.match(/\/p\/([^\/?#]+)/) || [])[1] || 'unknown';
    gtag('event', 'begin_checkout', { items: [{ item_id: product }] });
    gtag('event', 'conversion', { send_to: T.adsId + '/' + T.adsBuyLabel });
    if (window.fbq) fbq('track', 'InitiateCheckout', { content_ids: [product] });
  }
  document.addEventListener('click', function (e) {
    // Koupit = odkaz na program na str2g.com nebo na položku v e-shopu ladislavsuchanek.cz
    var a = e.target.closest && e.target.closest('a[href*="str2g.com/"][href*="#"], a[href*="ladislavsuchanek.cz/eshop/#"], a[href*="ladislavsuchanek.cz/p/"]');
    if (a) trackBuy(a.href);
  }, true);

  // Úspěšně odeslaná přihláška – volá to obsluha formuláře v index.html po odpovědi Netlify
  window.hpTrackLead = function (plan) {
    gtag('event', 'generate_lead', { plan: plan || '' });
    gtag('event', 'conversion', { send_to: T.adsId + '/' + T.adsLeadLabel });
    if (window.fbq) fbq('track', 'Lead', { content_name: plan || '' });
  };

  // --- Cookie lišta (CZ / EN / PL / DE podle <html lang>) ---
  var TXT = {
    cs: ['Používáme cookies pro měření návštěvnosti a reklamu.', 'Povolit vše', 'Jen nezbytné'],
    en: ['We use cookies for analytics and advertising.', 'Accept all', 'Essential only'],
    pl: ['Używamy plików cookie do analityki i reklam.', 'Akceptuj wszystkie', 'Tylko niezbędne'],
    de: ['Wir nutzen Cookies für Analyse und Werbung.', 'Alle akzeptieren', 'Nur notwendige']
  };
  function banner() {
    if (document.getElementById('hp-cookie')) return;
    var t = TXT[(document.documentElement.lang || 'cs').slice(0, 2)] || TXT.en;
    var d = document.createElement('div');
    d.id = 'hp-cookie';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'Cookies');
    d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;background:#111;color:#fff;border:1px solid #333;border-radius:10px;padding:16px;font:14px/1.4 system-ui,sans-serif;display:flex;flex-wrap:wrap;gap:10px;align-items:center';
    d.innerHTML = '<span style="flex:1 1 220px">' + t[0] + '</span>' +
      '<button type="button" data-c="necessary" style="background:none;color:#fff;border:1px solid #555;border-radius:6px;padding:8px 12px;cursor:pointer;font:inherit">' + t[2] + '</button>' +
      '<button type="button" data-c="all" style="background:#fff;color:#000;border:0;border-radius:6px;padding:8px 12px;cursor:pointer;font:inherit;font-weight:600">' + t[1] + '</button>';
    d.addEventListener('click', function (e) {
      var c = e.target.getAttribute('data-c'); if (!c) return;
      setConsent(c);
      if (c === 'all') grant();
      else gtag('consent', 'update', {
        ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
        analytics_storage: 'denied'
      });
      d.remove();
    });
    document.body.appendChild(d);
  }
  window.hpCookieSettings = banner; // odkaz „Nastavení cookies“ v patičce
  if (!getConsent()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', banner);
    else banner();
  }
})();

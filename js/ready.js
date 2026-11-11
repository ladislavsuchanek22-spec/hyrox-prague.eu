/* HYROX Readiness Check – EN / CS / PL / DE podle <html lang>.
   Markup: <div id="ready-app"></div>. Výsledek předvyplní přihlášku (#apply-form). */
(function () {
  var root = document.getElementById("ready-app");
  if (!root) return;
  var L = (document.documentElement.lang || "en").slice(0, 2);
  if (["en", "cs", "pl", "de"].indexOf(L) < 0) L = "en";

  var S2 = "https://str2g.com";
  var PROG = {
    basic: { en: "/programs/hyrox-basic/", cs: "/cs/programy/hyrox-basic/", pl: "/pl/programy/hyrox-basic/", de: "/de/programme/hyrox-basic/" },
    competitor: { en: "/programs/hyrox-competitor/", cs: "/cs/programy/hyrox-competitor/", pl: "/pl/programy/hyrox-competitor/", de: "/de/programme/hyrox-competitor/" },
    singles: { en: "/programs/8-week-hyrox-singles/", cs: "/cs/programy/8tydenni-hyrox-singles/", pl: "/pl/programy/8-tygodni-hyrox-singles/", de: "/de/programme/8-wochen-hyrox-singles/" },
    raceprep: { en: "/programs/12-week-hyrox-race-prep/", cs: "/cs/programy/12tydenni-hyrox-race-prep/", pl: "/pl/programy/12-tygodni-hyrox-race-prep/", de: "/de/programme/12-wochen-hyrox-race-prep/" },
    running: { en: "/programs/running-for-hyrox/", cs: "/cs/programy/beh-pro-hyrox/", pl: "/pl/programy/bieganie-do-hyrox/", de: "/de/programme/laufen-fuer-hyrox/" },
    taper: { en: "/programs/hyrox-taper/", cs: "/cs/programy/hyrox-taper/", pl: "/pl/programy/hyrox-taper/", de: "/de/programme/hyrox-taper/" }
  };
  var HTC = { en: "https://hyroxtrainingclub.cz/en/", cs: "https://hyroxtrainingclub.cz/", pl: "https://hyroxtrainingclub.cz/pl/", de: "https://hyroxtrainingclub.cz/de/" };
  // index v <select name="plan"> přihlášky: 1 Basic, 2 Advanced, 3 Race Prep, 4 Osobní trénink, 6 Nevím
  var PLAN_IDX = { basic: 1, competitor: 1, singles: 3, raceprep: 3, running: 6, taper: 6, session: 4, advanced: 2, classes: 6 };

  var TX = {
    en: {
      intro: "11 questions. 2 minutes. Your readiness score, your biggest limiter and where to start.", start: "Start the check",
      back: "← Back", again: "↺ Start again", dk: "I don't know",
      q: {
        where: ["Where do you train?", [["prague", "In Czechia"], ["visiting", "I'm visiting Prague"], ["abroad", "Abroad"]]],
        sex: ["Which benchmarks should we use?", [["w", "Women"], ["m", "Men"]]],
        goal: ["What's your goal?", [["open", "Open"], ["pro", "Pro"], ["team", "Doubles or Relay"], ["first", "First race, not sure yet"]]],
        run1k: ["1 km run, fresh. Your time?"], run5k: ["5 km run. Your time?"], row: ["1,000 m row. Your time?"],
        sled: ["Sled push at race weight, 50 m.", [["3", "Unbroken"], ["2", "1–2 stops"], ["1", "Several stops"], ["0", "I can barely move it"]]],
        wb: ["100 wall balls at race weight.", [["3", "Under 5 min"], ["2", "5–7 min"], ["1", "7–10 min"], ["0", "Over 10 min or can't finish"]]],
        comp: ["Your running right after a station?", [["3", "Within 20 s/km of normal"], ["2", "20–45 s/km slower"], ["1", "More than 45 s/km slower"], ["0", "It falls apart"]]],
        freq: ["How many sessions a week?", [["0", "1–2"], ["1", "3"], ["2", "4–5"], ["3", "6+"]]],
        weeks: ["How long until your race?", [["lt4", "Less than 4 weeks"], ["4to8", "4–8 weeks"], ["8to12", "8–12 weeks"], ["gt12", "More than 12 weeks"], ["none", "No race booked"]]]
      },
      under: "Under", over: "Over", min: "min",
      score: "Readiness", proNote: "Scored against Pro standards.",
      bands: [["Build the base", "You're at the start. That's fine. A solid base now saves you weeks of frustration later."], ["Getting there", "The foundation is there. Now it's about closing the gaps that cost you the most time."], ["Race ready", "You can race this. Structure and pacing will decide how fast."], ["Ready to push", "You're in good shape. The gains now are in the details: transitions, pacing, compromised running."]],
      areas: { engine: "Engine", strength: "Stations", race: "Race skill", cons: "Consistency" },
      limiter: "Your biggest limiter",
      lim: {
        engine: "Half the race is running, 8 km under fatigue. Two easy runs plus one interval session a week moves this fastest.",
        strength: "Sled and wall balls punish weak legs and sloppy technique. Heavy sled work once a week and wall ball EMOMs.",
        race: "Your running falls apart after the stations. That's the core HYROX skill. Train run–station–run blocks, not separate sessions.",
        cons: "Frequency is the bottleneck. 3–4 structured sessions a week beat 6 random ones you can't keep up."
      },
      next: "Where to start", also: "Also worth a look", ask: "Ask Ladislav",
      rec: {
        taper: ["2-Week HYROX Taper", "Too late to build fitness, not too late to ruin it. Arrive fresh and sharp."],
        session: ["1:1 session in Prague", "60 min with Ladislav at Form Factory Na Knížecí. Station technique, sled work, pacing. In English."],
        basic: ["HYROX Basic (online)", "Running, strength and the stations in one plan. Build the base properly."],
        competitor: ["HYROX Competitor (online)", "More volume, race pace and sharp transitions for athletes who train consistently."],
        running: ["Running for HYROX 2.0", "12 weeks to fix the engine. The stations get easier when the running does."],
        singles: ["8-Week HYROX Singles", "Running, stations, transitions and pacing. Eight structured weeks to race day."],
        raceprep: ["12-Week HYROX Race Prep", "A proper base, then race-specific intensity, then you peak on race day."],
        classes: ["HYROX classes at Form Factory", "Official HYROX Training Club classes in Prague, Brno and Ostrava."],
        advanced: ["Advanced 1:1 coaching (online)", "A plan written only for you, adjusted every week, with race strategy."]
      },
      view: "View →", formMsg: "Readiness check: ", weekLbl: "race in"
    },
    cs: {
      intro: "11 otázek, 2 minuty. Skóre připravenosti, co tě brzdí nejvíc a s čím začít.", start: "Spustit test",
      back: "← Zpět", again: "↺ Znovu", dk: "Nevím",
      q: {
        where: ["Kde trénuješ?", [["prague", "V Česku"], ["visiting", "Jsem v Praze na návštěvě"], ["abroad", "V zahraničí"]]],
        sex: ["Jaké časy máme brát?", [["w", "Ženy"], ["m", "Muži"]]],
        goal: ["Jaký máš cíl?", [["open", "Open"], ["pro", "Pro"], ["team", "Doubles nebo Relay"], ["first", "První závod, ještě nevím"]]],
        run1k: ["1 km běhu, odpočatý. Tvůj čas?"], run5k: ["5 km běhu. Tvůj čas?"], row: ["1 000 m na veslu. Tvůj čas?"],
        sled: ["Sled push se závodní zátěží, 50 m.", [["3", "Bez zastavení"], ["2", "1–2 zastavení"], ["1", "Víc zastavení"], ["0", "Sotva s nimi pohnu"]]],
        wb: ["100 wall balls se závodní zátěží.", [["3", "Pod 5 min"], ["2", "5–7 min"], ["1", "7–10 min"], ["0", "Přes 10 min nebo nedokončím"]]],
        comp: ["Tvůj běh hned po stanici?", [["3", "Do 20 s/km pomaleji než normálně"], ["2", "O 20–45 s/km pomaleji"], ["1", "O víc než 45 s/km pomaleji"], ["0", "Rozpadne se"]]],
        freq: ["Kolik tréninků týdně?", [["0", "1–2"], ["1", "3"], ["2", "4–5"], ["3", "6+"]]],
        weeks: ["Kolik zbývá do závodu?", [["lt4", "Méně než 4 týdny"], ["4to8", "4–8 týdnů"], ["8to12", "8–12 týdnů"], ["gt12", "Víc než 12 týdnů"], ["none", "Závod nemám"]]]
      },
      under: "Pod", over: "Přes", min: "min",
      score: "Připravenost", proNote: "Hodnoceno podle Pro standardů.",
      bands: [["Postav základ", "Jsi na začátku. To je v pohodě. Pořádný základ teď ti později ušetří týdny frustrace."], ["Na dobré cestě", "Základ máš. Teď jde o to zavřít mezery, které tě stojí nejvíc času."], ["Připravený na závod", "Závod dáš. Jak rychle, rozhodne struktura a tempo."], ["Připravený zabrat", "Jsi ve formě. Rezervy jsou teď v detailech: přechody, tempo, běh pod únavou."]],
      areas: { engine: "Motor", strength: "Stanice", race: "Závodní dovednost", cons: "Pravidelnost" },
      limiter: "Co tě brzdí nejvíc",
      lim: {
        engine: "Polovina závodu je běh, 8 km pod únavou. Nejrychleji pomůžou dva lehké běhy a jeden intervalový trénink týdně.",
        strength: "Saně a wall balls trestají slabé nohy a špatnou techniku. Jednou týdně těžké saně a wall ball EMOMy.",
        race: "Po stanici se ti rozpadá běh. To je základní HYROX dovednost. Trénuj bloky běh–stanice–běh, ne každé zvlášť.",
        cons: "Brzdí tě frekvence. 3–4 tréninky týdně se strukturou jsou víc než 6 náhodných, které neudržíš."
      },
      next: "S čím začít", also: "Mrkni i na", ask: "Napsat Láďovi",
      rec: {
        taper: ["2-Week HYROX Taper", "Na budování kondice je pozdě, na její zničení ne. Přijď čerstvý a ostrý."],
        session: ["Osobní trénink v Praze", "60 min s Láďou ve Form Factory Na Knížecí. Technika stanic, saně, tempo."],
        basic: ["HYROX Basic (online)", "Běh, síla a stanice v jednom plánu. Postav pořádný základ."],
        competitor: ["HYROX Competitor (online)", "Víc objemu, závodní tempo a ostré přechody pro ty, kdo trénují pravidelně."],
        running: ["Running for HYROX 2.0", "12 týdnů na opravu motoru. Když jde běh, jdou líp i stanice."],
        singles: ["8-Week HYROX Singles", "Běh, stanice, přechody a tempo. Osm týdnů se strukturou do dne závodu."],
        raceprep: ["12-Week HYROX Race Prep", "Pořádný základ, pak závodní intenzita a formu trefíš na den závodu."],
        classes: ["HYROX lekce ve Form Factory", "Oficiální HYROX Training Club v Praze, Brně a Ostravě."],
        advanced: ["Advanced 1:1 (online)", "Plán psaný jen pro tebe, úpravy každý týden, závodní strategie."]
      },
      view: "Zobrazit →", formMsg: "Test připravenosti: ", weekLbl: "do závodu"
    },
    pl: {
      intro: "11 pytań, 2 minuty. Twój wynik gotowości, największe ograniczenie i od czego zacząć.", start: "Zacznij test",
      back: "← Wstecz", again: "↺ Od nowa", dk: "Nie wiem",
      q: {
        where: ["Gdzie trenujesz?", [["prague", "W Czechach"], ["visiting", "Jestem w Pradze przejazdem"], ["abroad", "Za granicą"]]],
        sex: ["Jakie normy mamy przyjąć?", [["w", "Kobiety"], ["m", "Mężczyźni"]]],
        goal: ["Jaki masz cel?", [["open", "Open"], ["pro", "Pro"], ["team", "Doubles lub Relay"], ["first", "Pierwsze zawody, jeszcze nie wiem"]]],
        run1k: ["1 km biegu na świeżo. Twój czas?"], run5k: ["5 km biegu. Twój czas?"], row: ["1000 m na wioślarzu. Twój czas?"],
        sled: ["Sled push z obciążeniem startowym, 50 m.", [["3", "Bez zatrzymania"], ["2", "1–2 zatrzymania"], ["1", "Kilka zatrzymań"], ["0", "Ledwo go ruszam"]]],
        wb: ["100 wall balls z obciążeniem startowym.", [["3", "Poniżej 5 min"], ["2", "5–7 min"], ["1", "7–10 min"], ["0", "Ponad 10 min lub nie kończę"]]],
        comp: ["Twój bieg zaraz po stacji?", [["3", "Do 20 s/km wolniej niż zwykle"], ["2", "20–45 s/km wolniej"], ["1", "Ponad 45 s/km wolniej"], ["0", "Rozpada się"]]],
        freq: ["Ile treningów w tygodniu?", [["0", "1–2"], ["1", "3"], ["2", "4–5"], ["3", "6+"]]],
        weeks: ["Ile zostało do zawodów?", [["lt4", "Mniej niż 4 tygodnie"], ["4to8", "4–8 tygodni"], ["8to12", "8–12 tygodni"], ["gt12", "Ponad 12 tygodni"], ["none", "Nie mam zawodów"]]]
      },
      under: "Poniżej", over: "Ponad", min: "min",
      score: "Gotowość", proNote: "Oceniane według standardów Pro.",
      bands: [["Zbuduj bazę", "Jesteś na początku. To nic złego. Solidna baza teraz oszczędzi Ci tygodni frustracji."], ["Na dobrej drodze", "Baza jest. Teraz chodzi o zamknięcie luk, które kosztują Cię najwięcej czasu."], ["Gotowy na zawody", "Dasz radę. O tempie zdecyduje struktura i rozłożenie sił."], ["Gotowy, by docisnąć", "Jesteś w formie. Rezerwy są teraz w detalach: przejścia, tempo, bieg w zmęczeniu."]],
      areas: { engine: "Silnik", strength: "Stacje", race: "Umiejętność startowa", cons: "Regularność" },
      limiter: "Co Cię najbardziej ogranicza",
      lim: {
        engine: "Połowa zawodów to bieg, 8 km w zmęczeniu. Najszybciej pomogą dwa spokojne biegi i jeden trening interwałowy w tygodniu.",
        strength: "Sanki i wall balls karzą słabe nogi i niedbałą technikę. Raz w tygodniu ciężkie sanki i EMOM-y z wall balls.",
        race: "Po stacji Twój bieg się rozpada. To podstawowa umiejętność HYROX. Trenuj bloki bieg–stacja–bieg, nie osobno.",
        cons: "Ogranicza Cię częstotliwość. 3–4 treningi ze strukturą to więcej niż 6 przypadkowych, których nie utrzymasz."
      },
      next: "Od czego zacząć", also: "Zobacz też", ask: "Napisz do Ladislava",
      rec: {
        taper: ["2-Week HYROX Taper", "Za późno na budowanie formy, nie za późno, by ją zepsuć. Przyjdź świeży."],
        session: ["Trening personalny w Pradze", "60 min z Ladislavem w Form Factory Na Knížecí. Technika stacji, sanki, tempo."],
        basic: ["HYROX Basic (online)", "Bieg, siła i stacje w jednym planie. Zbuduj porządną bazę."],
        competitor: ["HYROX Competitor (online)", "Więcej objętości, tempo startowe i szybkie przejścia dla regularnie trenujących."],
        running: ["Running for HYROX 2.0", "12 tygodni na naprawę silnika. Gdy idzie bieg, stacje też idą łatwiej."],
        singles: ["8-Week HYROX Singles", "Bieg, stacje, przejścia i tempo. Osiem tygodni ze strukturą do dnia zawodów."],
        raceprep: ["12-Week HYROX Race Prep", "Porządna baza, potem intensywność startowa i szczyt formy w dniu zawodów."],
        classes: ["Zajęcia HYROX w Form Factory", "Oficjalny HYROX Training Club w Pradze, Brnie i Ostrawie."],
        advanced: ["Advanced 1:1 (online)", "Plan pisany tylko dla Ciebie, korekty co tydzień, strategia startowa."]
      },
      view: "Zobacz →", formMsg: "Test gotowości: ", weekLbl: "do zawodów"
    },
    de: {
      intro: "11 Fragen, 2 Minuten. Dein Readiness-Score, dein größter Bremsklotz und womit du anfängst.", start: "Test starten",
      back: "← Zurück", again: "↺ Neu starten", dk: "Weiß nicht",
      q: {
        where: ["Wo trainierst du?", [["prague", "In Tschechien"], ["visiting", "Ich bin zu Besuch in Prag"], ["abroad", "Im Ausland"]]],
        sex: ["Welche Richtwerte sollen wir nehmen?", [["w", "Frauen"], ["m", "Männer"]]],
        goal: ["Was ist dein Ziel?", [["open", "Open"], ["pro", "Pro"], ["team", "Doubles oder Relay"], ["first", "Erstes Rennen, noch unsicher"]]],
        run1k: ["1 km Lauf, ausgeruht. Deine Zeit?"], run5k: ["5 km Lauf. Deine Zeit?"], row: ["1.000 m Rudern. Deine Zeit?"],
        sled: ["Sled Push mit Wettkampfgewicht, 50 m.", [["3", "Ohne Pause"], ["2", "1–2 Pausen"], ["1", "Mehrere Pausen"], ["0", "Ich bewege ihn kaum"]]],
        wb: ["100 Wall Balls mit Wettkampfgewicht.", [["3", "Unter 5 min"], ["2", "5–7 min"], ["1", "7–10 min"], ["0", "Über 10 min oder nicht geschafft"]]],
        comp: ["Dein Laufen direkt nach einer Station?", [["3", "Max. 20 s/km langsamer als normal"], ["2", "20–45 s/km langsamer"], ["1", "Mehr als 45 s/km langsamer"], ["0", "Es bricht ein"]]],
        freq: ["Wie viele Einheiten pro Woche?", [["0", "1–2"], ["1", "3"], ["2", "4–5"], ["3", "6+"]]],
        weeks: ["Wie lange noch bis zum Rennen?", [["lt4", "Weniger als 4 Wochen"], ["4to8", "4–8 Wochen"], ["8to12", "8–12 Wochen"], ["gt12", "Mehr als 12 Wochen"], ["none", "Kein Rennen gebucht"]]]
      },
      under: "Unter", over: "Über", min: "min",
      score: "Readiness", proNote: "Bewertet nach Pro-Standards.",
      bands: [["Bau die Basis", "Du stehst am Anfang. Kein Problem. Eine solide Basis jetzt erspart dir später Wochen voller Frust."], ["Auf gutem Weg", "Die Basis steht. Jetzt geht es darum, die Lücken zu schließen, die dich am meisten Zeit kosten."], ["Rennbereit", "Das Rennen schaffst du. Wie schnell, entscheiden Struktur und Pacing."], ["Bereit, Gas zu geben", "Du bist in Form. Die Reserven liegen jetzt in den Details: Übergänge, Pacing, Laufen unter Ermüdung."]],
      areas: { engine: "Motor", strength: "Stationen", race: "Renn-Skill", cons: "Regelmäßigkeit" },
      limiter: "Dein größter Bremsklotz",
      lim: {
        engine: "Die Hälfte des Rennens ist Laufen, 8 km unter Ermüdung. Am schnellsten helfen zwei lockere Läufe und eine Intervalleinheit pro Woche.",
        strength: "Schlitten und Wall Balls bestrafen schwache Beine und unsaubere Technik. Einmal pro Woche schwerer Schlitten und Wall-Ball-EMOMs.",
        race: "Nach den Stationen bricht dein Laufen ein. Das ist der Kern-Skill bei HYROX. Trainier Blöcke Lauf–Station–Lauf statt getrennt.",
        cons: "Die Häufigkeit bremst dich. 3–4 strukturierte Einheiten pro Woche bringen mehr als 6 zufällige, die du nicht durchhältst."
      },
      next: "Womit du anfängst", also: "Auch interessant", ask: "Ladislav schreiben",
      rec: {
        taper: ["2-Week HYROX Taper", "Zu spät, um Fitness aufzubauen, nicht zu spät, um sie zu ruinieren. Komm frisch an."],
        session: ["Personal Training in Prag", "60 min mit Ladislav bei Form Factory Na Knížecí. Stationstechnik, Schlitten, Pacing."],
        basic: ["HYROX Basic (online)", "Laufen, Kraft und Stationen in einem Plan. Bau eine solide Basis."],
        competitor: ["HYROX Competitor (online)", "Mehr Umfang, Renntempo und schnelle Übergänge für alle, die regelmäßig trainieren."],
        running: ["Running for HYROX 2.0", "12 Wochen, um den Motor zu reparieren. Läuft das Laufen, laufen auch die Stationen."],
        singles: ["8-Week HYROX Singles", "Laufen, Stationen, Übergänge und Pacing. Acht strukturierte Wochen bis zum Renntag."],
        raceprep: ["12-Week HYROX Race Prep", "Solide Basis, dann rennspezifische Intensität und Topform am Renntag."],
        classes: ["HYROX-Kurse bei Form Factory", "Offizieller HYROX Training Club in Prag, Brno und Ostrava."],
        advanced: ["Advanced 1:1 (online)", "Ein Plan nur für dich, wöchentlich angepasst, mit Rennstrategie."]
      },
      view: "Ansehen →", formMsg: "Readiness-Check: ", weekLbl: "bis zum Rennen"
    }
  };
  var T = TX[L];

  // časové hranice [nejlepší, ..., nejhorší] v sekundách – ženy / muži
  var CUT = {
    run1k: { w: [255, 300, 360], m: [225, 270, 330] },
    run5k: { w: [1440, 1680, 2040], m: [1260, 1500, 1800] },
    row: { w: [245, 270, 300], m: [220, 240, 270] }
  };
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return s >= 1200 ? m + " " + T.min : m + ":" + ("0" + r).slice(-2); }
  function timeOpts(k) {
    var c = CUT[k][a.sex || "m"];
    return [["3", T.under + " " + fmt(c[0])], ["2", fmt(c[0]) + "–" + fmt(c[1])], ["1", fmt(c[1]) + "–" + fmt(c[2])], ["0", T.over + " " + fmt(c[2])], ["dk", T.dk]];
  }

  var ORDER = ["where", "sex", "goal", "run1k", "run5k", "row", "sled", "wb", "comp", "freq", "weeks"];
  var a = {}, step = -1;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function ev(n, p) { try { if (window.gtag) window.gtag("event", n, p || {}); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function top() { root.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
  function n(k) { var v = a[k]; return v === "dk" ? 1 : +v; }

  function intro() {
    root.innerHTML = '<div class="rd-intro"><p>' + T.intro + '</p><button type="button" class="btn rd-start">' + T.start + "</button></div>";
    root.querySelector(".rd-start").onclick = function () { step = 0; ev("quiz_start", { quiz: "readiness_check" }); render(); top(); };
  }

  function render() {
    if (step >= ORDER.length) return result();
    var k = ORDER[step], q = T.q[k], opts = q[1] || timeOpts(k), total = ORDER.length;
    root.innerHTML = '<div class="rd-in"><div class="rd-top"><button type="button" class="rd-link rd-back"' + (step ? "" : ' style="visibility:hidden"') + ">" + T.back + '</button><span class="rd-count">' + ("0" + (step + 1)).slice(-2) + " / " + total + '</span></div><div class="rd-bar"><i style="width:' + ((step + 1) / total * 100) + '%"></i></div>' +
      '<h3 class="rd-q">' + q[0] + '</h3><div class="rd-opts' + (opts.length > 4 ? " five" : "") + '">' +
      opts.map(function (o) { return '<button type="button" data-v="' + o[0] + '"' + (a[k] === o[0] ? ' class="on"' : "") + "><i></i>" + esc(o[1]) + "</button>"; }).join("") + "</div></div>";
    var rt = root.getBoundingClientRect().top; if (rt < 0 || rt > window.innerHeight * 0.4) top();
    root.querySelector(".rd-back").onclick = function () { step--; render(); };
    [].forEach.call(root.querySelectorAll(".rd-opts button"), function (b) {
      b.onclick = function () {
        [].forEach.call(root.querySelectorAll(".rd-opts button"), function (x) { x.classList.toggle("on", x === b); });
        a[k] = b.getAttribute("data-v");
        ev("quiz_answer", { quiz: "readiness_check", question: k, answer: a[k] });
        setTimeout(function () { step++; render(); }, 200);
      };
    });
  }

  function decide(pct, weak) {
    var w = a.weeks, race = w !== "none", p, s;
    if (race && w === "lt4") p = "taper";
    else if (a.where === "visiting") p = "session";
    else if (pct < 40) p = "basic";
    else if (weak === "engine" && w !== "4to8") p = "running";
    else if (w === "4to8") p = "singles";
    else if (race) p = "raceprep";
    else p = pct >= 65 ? "competitor" : "basic";
    if (p === "session") s = race && w !== "lt4" ? (w === "4to8" ? "singles" : "raceprep") : "basic";
    else if (weak === "strength" && a.where === "prague") s = "session";
    else if (a.where === "prague") s = "classes";
    else s = "advanced";
    return [p, s];
  }
  function link(k) {
    if (PROG[k]) return S2 + PROG[k][L];
    if (k === "classes") return HTC[L];
    return "#prihlaska";
  }

  function result() {
    var ar = {
      engine: (n("run1k") + n("run5k") + n("row")) / 3,
      strength: (n("sled") + n("wb")) / 2,
      race: n("comp"),
      cons: n("freq")
    };
    var raw = (ar.engine * 0.35 + ar.strength * 0.25 + ar.race * 0.25 + ar.cons * 0.15) / 3 * 100;
    var pct = Math.max(0, Math.round(a.goal === "pro" ? raw - 15 : raw));
    var band = T.bands[pct < 40 ? 0 : pct < 65 ? 1 : pct < 85 ? 2 : 3];
    var weak = ["race", "engine", "strength", "cons"].reduce(function (m, k) { return ar[k] < ar[m] ? k : m; }, "race");
    var d = decide(pct, weak), P = T.rec[d[0]], Sx = T.rec[d[1]];
    var ext = function (k) { return /^https?:/.test(link(k)) ? ' target="_blank" rel="noopener"' : ""; };
    var bars = ["engine", "strength", "race", "cons"].map(function (k) {
      return '<div class="rd-area' + (k === weak ? " weak" : "") + '"><span>' + T.areas[k] + '</span><div class="rd-sbar"><i style="width:' + Math.round(ar[k] / 3 * 100) + '%"></i></div></div>';
    }).join("");
    root.innerHTML = '<div class="rd-in rd-res">' +
      '<div class="rd-head"><div class="rd-ring" style="--p:' + pct + '"><b>' + pct + '<small>%</small></b><span>' + T.score + "</span></div>" +
      '<div><h3 class="rd-band">' + band[0] + "</h3><p>" + band[1] + "</p>" + (a.goal === "pro" ? '<p class="rd-pro">' + T.proNote + "</p>" : "") + "</div></div>" +
      '<div class="rd-cols"><div class="rd-card">' + bars + '</div><div class="rd-card"><div class="eyebrow">' + T.limiter + ": " + T.areas[weak] + "</div><p>" + T.lim[weak] + "</p></div></div>" +
      '<div class="rd-rec"><div class="eyebrow">' + T.next + "</div><b>" + P[0] + "</b><p>" + P[1] + '</p><div class="rd-actions"><a class="btn rd-go" href="' + link(d[0]) + '"' + ext(d[0]) + ">" + T.view + '</a><a class="btn ghost rd-ask" href="#prihlaska">' + T.ask + "</a></div></div>" +
      '<a class="rd-alt" href="' + link(d[1]) + '"' + ext(d[1]) + '><span class="eyebrow">' + T.also + "</span><b>" + Sx[0] + "</b><em>" + Sx[1] + "</em></a>" +
      '<button type="button" class="rd-link rd-again">' + T.again + "</button></div>";
    root.querySelector(".rd-again").onclick = function () { a = {}; step = 0; render(); top(); };
    var fill = function (k) {
      var f = document.getElementById("apply-form"); if (!f) return;
      var sel = f.querySelector("[name=plan]"), goal = f.querySelector("[name=goal]");
      if (sel && PLAN_IDX[k] != null && sel.options[PLAN_IDX[k]]) sel.selectedIndex = PLAN_IDX[k];
      var wk = T.q.weeks[1].filter(function (o) { return o[0] === a.weeks; })[0];
      var line = T.formMsg + pct + "% (" + band[0] + "), " + T.limiter.toLowerCase() + ": " + T.areas[weak] + (wk && a.weeks !== "none" ? ", " + T.weekLbl + ": " + wk[1] : "") + ".";
      if (goal && goal.value.indexOf(T.formMsg) === -1) goal.value = line + (goal.value ? "\n\n" + goal.value : "\n\n");
    };
    [].forEach.call(root.querySelectorAll('a[href="#prihlaska"]'), function (x) {
      x.addEventListener("click", function () { fill(x.classList.contains("rd-ask") || x.classList.contains("rd-go") ? d[0] : d[1]); ev("quiz_cta_click", { quiz: "readiness_check", cta: "apply" }); });
    });
    [].forEach.call(root.querySelectorAll('a[target="_blank"]'), function (x) { x.addEventListener("click", function () { ev("quiz_cta_click", { quiz: "readiness_check", cta: "program" }); }); });
    top();
    ev("quiz_result", { quiz: "readiness_check", score: pct, limiter: weak, recommendation: d[0] });
  }

  intro();
})();

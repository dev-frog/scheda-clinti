/* ============================================================================
   Disegnarecasa — Scheda cliente: il motore
   Workstream J · v1.0 · 2026-08-28 · v1.4 · 2026-09-30 (due pagine: cliente e agente) · v1.5 · 2026-09-30 (gruppi chiusi, più prodotti, budget libero)
   ----------------------------------------------------------------------------
   Vanilla JS. Nessuna libreria, nessun build step, nessuna dipendenza.
   Le domande stanno in dc-scheda-config.js: questo file non va toccato
   per cambiare i testi.

   Fa sei cose:
     1. costruisce il modulo in tre passi dalla configurazione
     2. mostra solo le domande che servono (condizioni)
     3. salva una bozza nel browser, così una pagina ricaricata non azzera tutto
     4. raccoglie i parametri di provenienza (gclid, utm…) SOLO se la scheda
        la sta compilando un cliente
     5. invia, e spinge l'evento nel dataLayer di GTM solo per i clienti
     6. senza WordPress funziona lo stesso e mostra il JSON che avrebbe inviato
   ============================================================================ */
(function () {
  'use strict';

  var ROOT = document.getElementById('dc-scheda');
  if (!ROOT) { return; }

  var CFG = window.DC_SCHEDA_CONFIG;
  if (!CFG) { ROOT.innerHTML = '<p>Configurazione non caricata.</p>'; return; }

  var WP = window.DC_SCHEDA_WP || null;               // presente solo dentro WordPress

  /* v1.4 · DUE PAGINE. La modalità la decide lo SHORTCODE, cioè il server:
     [scheda_cliente] → pagina pubblica, sempre «Cliente», gclid tenuto;
     [scheda_agente]  → pagina interna, sempre «Agente», codice obbligatorio,
                         niente gclid e nessun evento per Google.
     Fuori da WordPress (file di prova) si sceglie con ?modo=agente. */
  var MODO = (ROOT.getAttribute('data-modo') ||
              (!WP && (/[?&]modo=agente\b/.test(location.search) || location.hash === '#agente') ? 'agente' : 'cliente')) === 'agente'
             ? 'agente' : 'cliente';
  var AG_MODO = MODO === 'agente';
  var ALTRO     = 'Altro…';
  var DRAFT_KEY = 'dc_scheda_bozza_v1' + (AG_MODO ? '_agente' : '');
  var COOKIE    = 'dc_src';

  /* ==========================================================================
     0 · PROVENIENZA
     --------------------------------------------------------------------------
     Il gclid va preso QUANDO IL CLIENTE ARRIVA, non quando invia: guarda un
     pavimento oggi e scrive fra tre settimane. Lo teniamo in un cookie di
     prima parte per 90 giorni.

     wbraid e gbraid sono i sostituti del gclid quando arriva da iPhone.
     Senza quelli, una fetta di traffico Google risulta "diretto".
     ========================================================================== */
  function leggiCookie(nome) {
    var m = document.cookie.match('(^|;)\\s*' + nome + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m.pop()) : '';
  }
  function scriviCookie(nome, val, giorni) {
    var d = new Date();
    d.setTime(d.getTime() + giorni * 864e5);
    document.cookie = nome + '=' + encodeURIComponent(val) + ';expires=' + d.toUTCString() +
                      ';path=/;SameSite=Lax' + (location.protocol === 'https:' ? ';Secure' : '');
  }

  function catturaProvenienza() {
    var p = new URLSearchParams(location.search);
    var campi = ['gclid', 'wbraid', 'gbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'msclkid', 'fbclid'];
    var trovato = {};
    var qualcosa = false;
    campi.forEach(function (c) {
      var v = p.get(c);
      if (v) { trovato[c] = v; qualcosa = true; }
    });

    if (qualcosa) {
      trovato.landing  = location.pathname;
      trovato.referrer = document.referrer || '';
      trovato.quando   = new Date().toISOString();
      try { scriviCookie(COOKIE, JSON.stringify(trovato), 90); } catch (e) {}
      return trovato;
    }
    // niente nell'indirizzo: usa quello che avevamo messo da parte
    try { return JSON.parse(leggiCookie(COOKIE) || '{}'); } catch (e) { return {}; }
  }
  var PROVENIENZA = catturaProvenienza();

  /* ==========================================================================
     1 · STATO
     ========================================================================== */
  var APERTA_ALLE = Date.now();   // serve all'antispam: un bot compila in un secondo

  var S = {
    passo: 1,
    fattaDa: AG_MODO ? 'Agente' : 'Cliente',
    compilataDa: (WP && WP.utente) || '',
    codiceAgente: '',
    schedaPer: AG_MODO ? '' : 'No, è il primo contatto',   // v1.8 · già selezionato per il cliente
    sel: {}, qta: {},
    nome: '', mail: '', tel: '', citta: '', richiamo: '', chi: '', note: '',
    canale: [], giorni: [], incontro: '', codiceProd: '',
    com: {}, tec: {}, nItem: {}, open: {},
    foto: null
  };

  // bozza
  var BOZZA_RIPRESA = false;
  try {
    var b = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (b && b.v === 1) {
      BOZZA_RIPRESA = true;   // il server non applica il controllo dei tempi
      // il codice agente non si salva mai nella bozza: è una credenziale
      ['fattaDa','sel','qta','nome','mail','tel','citta','richiamo','chi','note','com','tec','nItem','schedaPer','canale','giorni','incontro','codiceProd'].forEach(function (k) {
        if (b.d[k] !== undefined) { S[k] = b.d[k]; }
      });
      S.fattaDa = AG_MODO ? 'Agente' : 'Cliente';   // la bozza non cambia la pagina
      if (!Array.isArray(S.canale)) { S.canale = S.canale ? [S.canale === 'Solo e-mail' ? 'E-mail' : S.canale] : []; }
    }
  } catch (e) {}
  function salvaBozza() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 1, d: {
        fattaDa:S.fattaDa, sel:S.sel, qta:S.qta, nome:S.nome, mail:S.mail, tel:S.tel,
        citta:S.citta, richiamo:S.richiamo, chi:S.chi, note:S.note, com:S.com, tec:S.tec, nItem:S.nItem, schedaPer:S.schedaPer,
        canale:S.canale, giorni:S.giorni, incontro:S.incontro, codiceProd:S.codiceProd
      }}));
    } catch (e) {}
  }

  /* ==========================================================================
     2 · ICONE — SVG in linea, nessun font di icone, nessuna richiesta in più
     ========================================================================== */
  var UI = {
    check:'<path d="M4 12l5 5L20 6"/>',
    right:'<path d="M9 5l7 7-7 7"/>', left:'<path d="M15 5l-7 7 7 7"/>',
    send:'<path d="M4 12l16-8-6 16-3-6z"/>',
    cam:'<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="3.5"/>',
    user:'<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0115 0"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.6"/>'
  };
  function ui(n, s) {
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" ' +
           'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + UI[n] + '</svg>';
  }
  var FAMICO = {
    pav:'<rect x="5" y="6" width="22" height="20" rx="2"/><path d="M5 12.6h22M5 19.4h22M13 6v6.6M20 12.6v6.8M11 19.4V26"/>',
    lvt:'<rect x="5" y="6" width="10" height="20" rx="1.5"/><rect x="17" y="6" width="10" height="20" rx="1.5"/><path d="M10 6v20" opacity=".4"/>',
    esterni:'<rect x="4" y="10" width="24" height="4" rx="1"/><rect x="4" y="17" width="24" height="4" rx="1"/><path d="M9 10v-4M23 21v4"/>',
    ceramiche:'<rect x="5" y="5" width="10" height="10" rx="1"/><rect x="17" y="5" width="10" height="10" rx="1"/><rect x="5" y="17" width="10" height="10" rx="1"/><rect x="17" y="17" width="10" height="10" rx="1"/>',
    porte:'<rect x="8" y="4" width="16" height="24" rx="1.5"/><circle cx="20" cy="16" r="1.2"/>',
    blind:'<rect x="8" y="4" width="16" height="24" rx="1.5"/><path d="M16 13v6"/><circle cx="16" cy="11" r="2"/>',
    infissi:'<rect x="5" y="5" width="22" height="22" rx="1.5"/><path d="M16 5v22M5 16h22"/>',
    bagno:'<path d="M5 17h22v4a4 4 0 01-4 4H9a4 4 0 01-4-4z"/><path d="M9 17V8a3 3 0 016 0"/>',
    doccia:'<path d="M6 5h10a4 4 0 014 4v3"/><path d="M14 12h12"/><path d="M17 17v2M20 16v3M23 17v2M20 22v2"/>',
    piscine:'<rect x="4" y="9" width="24" height="16" rx="2"/><path d="M4 20c3-2 5 2 8 0s5 2 8 0 5 2 8 0"/><path d="M11 9v6M21 9v6"/>',
    idro:'<path d="M5 14h22v7a4 4 0 01-4 4H9a4 4 0 01-4-4z"/><path d="M10 14V9M16 14V7M22 14V9"/><circle cx="10" cy="7" r="1.2"/><circle cx="16" cy="5" r="1.2"/><circle cx="22" cy="7" r="1.2"/>',
    materassi:'<rect x="4" y="11" width="24" height="11" rx="3"/><path d="M4 16h24"/>',
    divani:'<path d="M4 20v-5a3 3 0 016 0v3h12v-3a3 3 0 016 0v5z"/><path d="M7 20v3M25 20v3"/>',
    camerette:'<path d="M4 22V10M4 16h16v6M20 16a4 4 0 018 0v6"/><circle cx="11" cy="12" r="2"/>',
    accessori:'<path d="M6 26l8-8M14 18l-3-3 6-6 3 3z"/><path d="M17 9l4-4 4 4-4 4"/>',
    saune:'<rect x="5" y="9" width="22" height="17" rx="1.5"/><path d="M5 15h22M10 9V5M22 9V5"/><path d="M12 20h8"/>',
    vasche:'<path d="M4 15h24v4a6 6 0 01-6 6H10a6 6 0 01-6-6z"/><path d="M8 15V8a3 3 0 016 0"/><path d="M9 25l-1 2M23 25l1 2"/>',
    chiusure:'<rect x="6" y="5" width="20" height="22" rx="1"/><path d="M6 10h20M6 14h20M6 18h20M6 22h20"/>',
    arredo:'<path d="M5 13h22M8 13v12M24 13v12M5 13l3-6h16l3 6"/>',
    altro:'<circle cx="16" cy="16" r="11"/><path d="M12.5 13a3.6 3.6 0 116 2.6c-1 .8-2.5 1.4-2.5 2.9"/><path d="M16 22.5h.01"/>'
  };
  function famico(k, s) {
    return '<svg viewBox="0 0 32 32" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" ' +
           'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           (FAMICO[k] || FAMICO.altro) + '</svg>';
  }

  /* ==========================================================================
     3 · PEZZI DI MODULO
     ========================================================================== */
  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
  function morbida(o) { return /non lo so|consigliatemi|non so cos|altro…|ve lo dico dopo|da rilevare/i.test(o); }

  /* v1.6 · SCELTA MULTIPLA nelle domande dei prodotti: il cliente può chiedere
     più preventivi (es. listone, plancia e 3 strip, oppure rovere e noce).
     Restano a scelta singola: i sì/no, e le domande da cui dipendono altre
     domande o avvisi (es. «Su misura» che apre il campo di descrizione). */
  var RIF = {};
  (CFG.famiglie || []).forEach(function (c) {
    var t = '';
    c.Q.forEach(function (q) { if (q.if) { t += q.if.toString(); } });
    (CFG.avvisi || []).forEach(function (a) { if (a.k === c.k) { t += a.when.toString(); } });
    RIF[c.k] = t;
  });
  function multipla(q, scope) {
    if (!q.o || q.uno) { return false; }
    if (q.multi === true) { return true; }
    if (scope === 'S' || scope === 'com') { return false; }
    if (q.o.indexOf('Sì') > -1 || q.o.indexOf('No') > -1) { return false; }
    var k = String(scope).split('~')[0];
    return !new RegExp('t\\.' + q.id + '\\b').test(RIF[k] || '');
  }
  /* v1.6 · il cliente può scegliere PIÙ canali (WhatsApp, e-mail e telefono). */
  function canaleTesto() {
    var c = S.canale || [];
    if (c.length === 1 && c[0] === 'E-mail') { return 'Solo e-mail'; }   // il server riconosce questa dicitura
    return c.join(', ');
  }
  function soloMail() { return canaleTesto() === 'Solo e-mail'; }

  function acceso1(v, o) { return Array.isArray(v) ? v.indexOf(o) > -1 : v === o; }

  function scelte(id, lista, store, scope, multi) {
    return '<div class="dcs-opts" role="group">' + lista.map(function (o) {
      var acceso = (id === 'fattaDa')
        ? ((o.indexOf('agente') > -1) === (S.fattaDa === 'Agente'))
        : acceso1(store[id], o);
      return '<button type="button" class="dcs-opt' + (morbida(o) ? ' is-soft' : '') +
             (acceso ? ' is-on' : '') + '"' + (multi ? ' data-m="1"' : '') + ' data-scope="' + scope + '" data-set="' + id +
             '" data-val="' + esc(o) + '" aria-pressed="' + acceso + '">' + o + '</button>';
    }).join('') + '</div>';
  }
  /* Come scelte(), ma se ne possono accendere più d'uno: per i giorni, che
     non sono un aut-aut — «lunedì o martedì» è la risposta normale. */
  function scelteMulte(id, lista) {
    var att = S[id] || [];
    return '<div class="dcs-opts" role="group">' + lista.map(function (o) {
      var acceso = att.indexOf(o) > -1;
      return '<button type="button" class="dcs-opt' + (acceso ? ' is-on' : '') +
             '" data-multi="' + id + '" data-val="' + esc(o) + '" aria-pressed="' + acceso + '">' + o + '</button>';
    }).join('') + '</div>';
  }

  function libero(scope, id, val, suf, ph, tipo) {
    var oggi = new Date(); oggi = oggi.getFullYear() + '-' + ('0' + (oggi.getMonth() + 1)).slice(-2) + '-' + ('0' + oggi.getDate()).slice(-2);
    var i = '<input class="dcs-in" ' +
            (tipo === 'num' ? 'type="number" inputmode="decimal" min="0" step="any"'
             : tipo === 'date' ? 'type="date" min="' + oggi + '"' : 'type="text"') +
            ' data-free="' + scope + '|' + id + '" value="' + esc(val) + '" placeholder="' + esc(ph || '') + '">';
    return suf ? '<div class="dcs-numrow">' + i + '<span class="dcs-suf">' + suf + '</span></div>' : i;
  }

  function domanda(q, store, scope) {
    /* La condizione vede anche QUALI famiglie sono state scelte: «serve la
       posa?» non ha senso se uno chiede solo un materasso. */
    if (q.if && !q.if(store, S.sel)) { return ''; }
    if (q.ag && !AG_MODO) { return ''; }            // domanda solo per la scheda agente
    if (q.cl && AG_MODO) { return ''; }             // domanda solo per la scheda cliente
    /* v1.7 · valore proposto in automatico (es. battiscopa = m² + 10% di sfrido).
       Resta automatico finché qualcuno non lo cambia a mano. */
    if (q.def && (store[q.id] === undefined || store[q.id] === '' || store[q.id + '_auto'])) {
      var dv = q.def({ qta: parseFloat(S.qta[String(scope).split('~')[0]] || 0) || 0 });
      if (dv) { store[q.id] = String(dv); store[q.id + '_auto'] = true; }
    }
    if (q.una && String(scope).indexOf('~') > -1) { return ''; }   // chiesta una volta sola per famiglia
    var h = '<div class="dcs-q' + (q.ag ? ' is-ag' : '') + '"><span class="dcs-lab">' + q.l + '</span>';
    if (q.h) { h += '<p class="dcs-help">' + q.h + '</p>'; }

    if (q.t === 'money') {
      /* Budget libero: una cifra e l'unità (al m², in tutto, a pezzo). */
      var un = q.u || ['€/m²', '€ in tutto'];
      h += libero(scope, q.id, store[q.id], '€', 'es. 40', 'num') +
           '<div style="margin-top:8px">' + scelte(q.id + '_u', un, store, scope) + '</div>';
    } else if (q.t === 'date') {
      /* v1.6 · calendario: il telefono apre il suo selettore di date. */
      h += libero(scope, q.id, store[q.id], '', '', 'date');
    } else if (q.t === 'num' || q.t === 'text') {
      h += libero(scope, q.id, store[q.id], q.suf, q.t === 'num' ? '' : 'scrivi qui', q.t);
    } else if (q.t === 'pair' || q.t === 'grid') {
      h += '<div class="dcs-pair">' + q.pair.map(function (p) {
        return '<div><label>' + p.l + '</label>' +
               libero(scope, q.id + '_' + p.id, store[q.id + '_' + p.id], p.suf, '', 'num') + '</div>';
      }).join('') + '</div>';
    } else {
      var lista = q.o.slice();
      if (q.altro) { lista.push(ALTRO); }
      var mm = multipla(q, scope);
      if (mm) { h += '<p class="dcs-help dcs-multi">Puoi sceglierne più di una.</p>'; }
      h += scelte(q.id, lista, store, scope, mm);
      if (q.altro && acceso1(store[q.id], ALTRO)) {
        h += '<div class="dcs-altro">' + libero(scope, q.id + '_x', store[q.id + '_x'], '', 'scrivi qui', 'text') + '</div>';
      }
    }
    return h + '</div>';
  }

  /* leggibile, per il riepilogo e per la mail al venditore */
  function valore(store, q) {
    if (q.t === 'money') {
      if (!store[q.id]) { return ''; }
      return store[q.id] + ' ' + (store[q.id + '_u'] || (q.u || ['€/m²'])[0]);
    }
    if (q.t === 'grid') {          // quantità divise: «DX a spingere 5 · SX a tirare 3»
      var g = q.pair.filter(function (p) { return store[q.id + '_' + p.id]; })
                    .map(function (p) { return p.l + ' ' + store[q.id + '_' + p.id]; });
      return g.join(' · ');
    }
    if (q.t === 'pair') {
      var v = q.pair.map(function (p) { return store[q.id + '_' + p.id]; }).filter(Boolean);
      return v.length ? v.join(' × ') + (q.pair[0].suf ? ' ' + q.pair[0].suf : '') : '';
    }
    var x = store[q.id] || '';
    if (q.t === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(x)) { var dd = x.split('-'); return dd[2] + '/' + dd[1] + '/' + dd[0]; }
    if (Array.isArray(x)) {
      x = x.map(function (v) { return v === ALTRO ? (store[q.id + '_x'] || '') : v; }).filter(Boolean).join(', ');
    }
    if (x === ALTRO) { x = store[q.id + '_x'] || ''; }
    if (x && q.suf) { x = x + ' ' + q.suf; }
    return x;
  }

  /* v1.5 · PIÙ PRODOTTI NELLA STESSA FAMIGLIA (es. un listone e una plancia,
     oppure 5 blindate sinistre e 3 destre): ogni prodotto ha le sue risposte.
     Il primo sta in S.tec[k], gli altri in S.tec['k~2'], S.tec['k~3']… */
  function nItem(k) { return Math.max(1, S.nItem[k] || 1); }
  function scopeDi(k, i) { return i === 1 ? k : k + '~' + i; }
  function togliItem(k, i) {
    var n = nItem(k);
    for (var j = i; j < n; j++) { S.tec[scopeDi(k, j)] = S.tec[scopeDi(k, j + 1)] || {}; }
    delete S.tec[scopeDi(k, n)];
    S.nItem[k] = n - 1;
  }

  function fam(k) {
    for (var i = 0; i < CFG.famiglie.length; i++) { if (CFG.famiglie[i].k === k) { return CFG.famiglie[i]; } }
    return null;
  }

  /* ==========================================================================
     4 · I TRE PASSI
     ========================================================================== */
  function intestazione() {
    var ag = S.fattaDa === 'Agente';
    var titoli = [
      '<b>1 di 3</b> · Cosa serve · due minuti in tutto',
      '<b>2 di 3</b> · ' + (ag ? 'Dati del cliente' : 'Chi sei') + ' · da qui si può già inviare',
      '<b>3 di 3</b> · Facoltativo · ma è quello che rende il preventivo vero'
    ];
    return '<div class="dcs-head">' +
      '<h2 class="dcs-title">' + (ag ? CFG.testi.titoloAgente : CFG.testi.titolo) + '</h2>' +
      '<div class="dcs-steps">' + [1,2,3].map(function (i) {
        return '<span class="dcs-step' + (i <= S.passo ? ' is-on' : '') + '"><i></i></span>';
      }).join('') + '</div>' +
      '<p class="dcs-stepTxt">' + titoli[S.passo - 1] + '</p></div>';
  }

  /* La scheda è pubblica e uguale per tutti. Questo blocco serve a una cosa
     sola: sapere CHI la sta compilando davvero. Non ci sono due versioni del
     modulo — c'è una domanda in più, e la risposta cambia solo due cose:
     il nome di chi l'ha fatta, e il fatto che una scheda interna non porta
     con sé la provenienza pubblicitaria. */
  function bloccoChiLaFa() {
    /* v1.4: sulla pagina cliente il blocco non c'è più (un cliente non può
       dichiararsi agente per sbaglio); sulla pagina agente è fisso. */
    if (!AG_MODO) { return ''; }
    var ag = true;
    var h = '<div class="dcs-by is-agente">' +
            '<span class="dcs-lab">Scheda agente · uso interno</span>';
    if (ag) {
      h += '<div class="dcs-mini">' +
        '<div><label>Nome dell\'agente <i style="color:#B5843F">*</i></label>' +
          '<input class="dcs-in" data-free="S|compilataDa" value="' + esc(S.compilataDa) + '" placeholder="Nome e cognome" autocomplete="off"></div>' +
        '<div><label>Codice agente <i style="color:#B5843F">*</i></label>' +
          '<input class="dcs-in" type="text" inputmode="numeric" data-free="S|codiceAgente" value="' + esc(S.codiceAgente) +
          '" placeholder="es. 4417" autocomplete="off" spellcheck="false"></div>' +
        '</div>' +
        '<div class="dcs-mini" style="grid-template-columns:1fr">' +
          '<div><label>Scheda per</label><select class="dcs-in" data-free="S|schedaPer">' +
            agenti().map(function (a) {
              return '<option' + (S.schedaPer === a ? ' selected' : '') + '>' + a + '</option>';
            }).join('') + '</select></div></div>' +
        '<p class="dcs-note"><b>Senza il codice giusto la scheda non parte</b> (lo controlla il server). ' +
        'È una scheda interna: niente gclid e nessuna conversione a Google. Scrivi <b>la stessa e-mail e lo stesso telefono</b> ' +
        'che ha usato il cliente: è così che Google collega la vendita al suo clic.</p>';
    }
    return h + '</div>';
  }

  /* Detto una volta sola ma detto forte, e nello stesso rosso del sito:
     una persona che teme un modulo lungo si ferma prima di cominciare. */
  function soloEmail() {
    return '<p class="dcs-solo">' + ui('info', 15) +
      '<span>Di obbligatoria c\'è <b>solo l\'e-mail</b>. <b>Cellulare e città sono altamente consigliati</b>: ' +
      'chi lascia il cellulare viene richiamato per primo, e con la città ti affidiamo un agente della tua zona. Tutto il resto lo lasci vuoto se non lo sai.</span></p>';
  }

  function passo1() {
    var ag = S.fattaDa === 'Agente';
    var h = intestazione() + bloccoChiLaFa() + soloEmail() +
      '<div class="dcs-err is-hidden" data-err></div>' +
      '<p class="dcs-sub">' + (ag
        ? 'Segna <b>che cosa chiede il cliente e quanto</b>. I dati personali al passo dopo.'
        : 'Dicci <b>che cosa ti serve e quanto</b>. Nessun dato personale in questo passo — quello viene dopo.') + '</p>';

    /* v1.5 · famiglie raccolte in GRUPPI, tutti chiusi: si apre solo quello
       che si tocca. Un gruppo con una famiglia sola si mostra direttamente. */
    function cat(c) {
      return '<div class="dcs-cat' + (S.sel[c.k] ? ' is-on' : '') + '">' +
        '<button type="button" class="dcs-catHead" data-toggle="' + c.k + '" aria-pressed="' + !!S.sel[c.k] + '">' +
          '<span class="dcs-ic">' + famico(c.ic || c.k, 32) + '</span><b>' + c.n + '</b>' +
          '<span class="dcs-check">' + ui('check', 15) + '</span></button>' +
        '<div class="dcs-catBody">' +
          (c.noQty
            ? '<p class="dcs-help" style="margin:12px 0 0">Le domande su questa voce arrivano al passo 3.</p>'
            : '<span class="dcs-lab">' + c.qty + '</span>' +
              (c.hint ? '<p class="dcs-help">' + c.hint + '</p>' : '') +
              '<div class="dcs-qty"><div>' +
                '<input class="dcs-in" type="number" inputmode="decimal" min="1" data-qty="' + c.k +
                '" value="' + esc(S.qta[c.k] || '') + '" placeholder="0"></div>' +
                '<span class="dcs-suf">' + c.u + '</span></div>') +
          (c.sfrido ? '<div class="dcs-sfrido is-hidden" data-sfrido="' + c.k + '"></div>' : '') +
        '</div></div>';
    }
    var gruppi = CFG.gruppi || CFG.famiglie.map(function (c) { return { n: c.n, f: [c.k] }; });
    gruppi.forEach(function (g, gi) {
      var fs = g.f.map(fam).filter(Boolean);
      if (fs.length === 1) { h += cat(fs[0]); return; }
      var scelti = fs.filter(function (c) { return S.sel[c.k]; }).length;
      var aperto = !!S.open['g' + gi];
      h += '<div class="dcs-grp' + (aperto ? ' is-open' : '') + '">' +
        '<button type="button" class="dcs-grpHead" data-grp="' + gi + '" aria-expanded="' + aperto + '">' +
          '<span class="dcs-ic">' + famico(g.ic || fs[0].ic || fs[0].k, 32) + '</span><b>' + g.n + '</b>' +
          (scelti ? '<span class="dcs-badge">' + scelti + '</span>' : '') +
          '<span class="dcs-chev">' + ui('right', 16) + '</span></button>' +
        (aperto ? '<div class="dcs-grpBody">' + fs.map(cat).join('') + '</div>' : '') +
        '</div>';
    });

    h += '<div class="dcs-foot"><button type="button" class="dcs-btn" data-next="2">Avanti ' + ui('right', 17) + '</button></div>';
    if (!Object.keys(S.sel).some(function (k) { return S.sel[k]; })) {
      h += '<p class="dcs-hint">Non sai ancora da dove partire? Vai avanti lo stesso: ' +
           'basta l\'e-mail, e ci racconti il resto alla fine con parole tue.</p>';
    }
    return h;
  }

  function passo2() {
    var ag = S.fattaDa === 'Agente';
    return intestazione() + bloccoChiLaFa() +
      '<p class="dcs-sub">' + (ag
        ? 'Basta l\'e-mail. Il resto se ce l\'hai.'
        : 'Un asterisco solo: l\'e-mail. <b>Tutto il resto puoi lasciarlo vuoto</b> — anche il nome. ' +
          'L\'indirizzo non serve per un preventivo: lo chiediamo se e quando si ordina.') + '</p>' +
      soloEmail() +
      '<div class="dcs-err is-hidden" data-err></div>' +
      /* Trappola per i robot: invisibile e fuori dal giro dei tasti, quindi una
         persona non la vede e non ci arriva mai. I programmi che compilano i
         moduli automaticamente riempiono ogni campo che trovano, e si tradiscono. */
      '<div aria-hidden="true" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden">' +
        '<label>Sito web</label>' +
        '<input type="text" name="dc_sito_web" data-trappola tabindex="-1" autocomplete="off" value="' + esc(S.trappola || '') + '">' +
      '</div>' +
      '<div class="dcs-q"><label class="dcs-lab" for="dcs-mail">E-mail <i>*</i></label>' +
        '<input class="dcs-in" id="dcs-mail" type="email" inputmode="email" autocomplete="email" ' +
        'data-free="S|mail" value="' + esc(S.mail) + '" placeholder="nome@esempio.it"></div>' +
      '<div class="dcs-grid2">' +
        '<div class="dcs-q"><label class="dcs-lab" for="dcs-nome">Nome</label>' +
          '<input class="dcs-in" id="dcs-nome" autocomplete="name" data-free="S|nome" value="' + esc(S.nome) + '" placeholder="Nome e cognome"></div>' +
        '<div class="dcs-q"><label class="dcs-lab" for="dcs-tel">Cellulare <span class="dcs-consigliato">altamente consigliato</span></label>' +
          '<input class="dcs-in" id="dcs-tel" type="tel" inputmode="tel" autocomplete="tel" data-free="S|tel" value="' + esc(S.tel) + '" placeholder="347 1234567">' +
          '<p class="dcs-hint">Non è obbligatorio, ma <b>diamo priorità a chi lascia il cellulare</b>: ti richiamiamo per primo.</p></div>' +
      '</div>' +

      '<div class="dcs-q"><label class="dcs-lab" for="dcs-citta">Città o CAP del cantiere <span class="dcs-consigliato">altamente consigliato</span></label>' +
        '<p class="dcs-help">Se non ci dici la città non possiamo affidarti un agente della tua zona. Serve anche per trasporto e posa.</p>' +
        '<input class="dcs-in" id="dcs-citta" autocomplete="address-level2" data-free="S|citta" value="' + esc(S.citta) + '" placeholder="Monza, oppure 20900"></div>' +
      /* Il canale prima dell'orario: chi sceglie «solo e-mail» non deve
         nemmeno vedere le domande sul quando. Una tendina in meno per lui,
         e per noi la certezza di non chiamare chi non vuole essere chiamato. */
      '<div class="dcs-q"><span class="dcs-lab">Come preferisci essere contattato</span>' +
        '<p class="dcs-help dcs-multi">Puoi sceglierne più di uno.</p>' +
        scelteMulte('canale', ['WhatsApp','Telefonata','SMS','E-mail']) + '</div>' +
      ((S.canale || []).length && !soloMail()
        ? '<div class="dcs-q"><span class="dcs-lab">In che fascia oraria</span>' +
            scelte('richiamo', ['Quando volete','Di mattina','Di pomeriggio','Dopo le 18'], S, 'S') + '</div>' +
          '<div class="dcs-q"><span class="dcs-lab">In che giorni</span>' +
            '<p class="dcs-help">Puoi sceglierne più di uno. Se lasci vuoto, proviamo quando capita.</p>' +
            scelteMulte('giorni', ['Lun','Mar','Mer','Gio','Ven','Sab']) + '</div>'
        : '') +
      /* v1.8 · «privato / impresa» ora è nella sezione del lead predittivo */

      (ag ? '' : '<p class="dcs-priv"><b>I tuoi dati restano nostri.</b> ' + CFG.testi.privacy + '</p>') +
      '<div class="dcs-foot">' +
        '<button type="button" class="dcs-btn is-ghost" data-next="1">' + ui('left', 17) + '</button>' +
        '<button type="button" class="dcs-btn" data-next="3">Avanti ' + ui('right', 17) + '</button>' +
      '</div>';
  }

  function avvisiPer(k, t) {
    var h = '';
    (CFG.avvisi || []).forEach(function (a) {
      if (a.k !== k || !a.when(t)) { return; }
      h += '<div class="dcs-note' + (a.ok ? ' is-ok' : '') + '">' +
           (typeof a.html === 'function' ? a.html(t) : a.html) + '</div>';
    });
    return h;
  }

  function passo3() {
    var ag = S.fattaDa === 'Agente';
    var h = intestazione() +
      '<p class="dcs-sub">' + (ag
        ? 'Quello che riesci a farti dire al telefono. <b>«Non lo so» è una risposta valida</b> e va segnata: dice al preventivista di chiedere.'
        : 'Ci servono per dirti <b>cosa si può fare e cosa no</b>, e per non farti perdere tempo con proposte sbagliate. Se una non la sai, <b>«Non lo so» va benissimo</b>.') + '</p>';

    /* v1.5 · ogni prodotto scelto è una sezione CHIUSA: si apre toccandola. */
    function sezione(key, icona, titolo, corpo, extra) {
      var aperta = !!S.open[key];
      return '<div class="dcs-sec' + (aperta ? ' is-open' : '') + '">' +
        '<button type="button" class="dcs-secHead" data-sez="' + key + '" aria-expanded="' + aperta + '">' +
          '<span class="dcs-ic">' + icona + '</span><b>' + titolo + '</b>' + (extra || '') +
          '<span class="dcs-chev">' + ui('right', 16) + '</span></button>' +
        (aperta ? '<div class="dcs-secBody">' + corpo() + '</div>' : '') + '</div>';
    }

    CFG.famiglie.forEach(function (c) {
      if (!S.sel[c.k]) { return; }
      var n = nItem(c.k);
      h += sezione('s' + c.k, famico(c.ic || c.k, 22), c.n, function () {
        var b = '';
        for (var i = 1; i <= n; i++) {
          var sc = scopeDi(c.k, i);
          if (!S.tec[sc]) { S.tec[sc] = {}; }
          var t = S.tec[sc];
          var conQta = n > 1 || i > 1 || c.qtyItem;
          if (conQta) {
            /* intestazione della riga: nome del prodotto + quello che è già stato scelto */
            var rias = ['larghezza','altezza','misura','tipoInf','cosa','apertura'].map(function (id) {
              var v = t[id]; if (Array.isArray(v)) { v = v.join(', '); }
              if (v === 'Su misura') { v = (t[id + 'Su'] ? t[id + 'Su'] + ' cm' : 'su misura'); }
              return v || '';
            }).filter(function (v) { return v && v !== 'Non lo so'; }).join(' · ');
            b += '<div class="dcs-item"><div class="dcs-itemHead"><b>' + (c.itemTxt || c.n) + ' ' + i +
                 (rias ? ' <span class="dcs-rias">' + esc(rias) + (t._qta ? ' · ' + esc(t._qta) + ' ' + c.u : '') + '</span>' : '') + '</b>' +
                 (i > 1 ? '<button type="button" class="dcs-del" data-del="' + c.k + '|' + i + '">togli</button>' : '') + '</div>';
            if (!c.noQty) {
              b += '<div class="dcs-q"><span class="dcs-lab">' + (c.qtyItemTxt || 'Quantità di questo prodotto') + '</span>' +
                   libero(sc, '_qta', t._qta, c.u, '', 'num') + '</div>';
            }
          }
          c.Q.forEach(function (q) { b += domanda(q, t, sc); });
          b += avvisiPer(c.k, t);
          if (conQta) { b += '</div>'; }
        }
        /* v1.7 · conteggio: quante ne sono già state divise sul totale */
        if (c.qtyItem && S.qta[c.k]) {
          var ass = 0;
          for (var z = 1; z <= n; z++) { ass += parseFloat((S.tec[scopeDi(c.k, z)] || {})._qta || 0) || 0; }
          var tot = parseFloat(S.qta[c.k]) || 0;
          b += '<div class="dcs-note' + (ass === tot ? ' is-ok' : '') + '" data-conta="' + c.k + '">Totale <b>' + tot + '</b> · divise <b>' + ass + '</b>' +
               (ass < tot ? ' · mancano <b>' + (tot - ass) + '</b>' : ass > tot ? ' · <b>' + (ass - tot) + ' in più</b> del totale' : ' · tutto diviso') + '</div>';
        }
        if (c.multi !== false) {
          b += '<button type="button" class="dcs-add" data-add="' + c.k + '">+ ' +
               (c.addTxt || 'Aggiungi un altro prodotto') + '</button>';
        }
        return b;
      }, n > 1 ? '<span class="dcs-badge">' + n + '</span>' : '');
    });

    /* v1.8 · i dati per il LEAD PREDITTIVO (§ 7.2 e § 9.1 del documento per il
       Claude di Cataldo): come ci ha conosciuto, chi è, dove, showroom,
       campioni, concorrenza, impressioni dell'agente. Nessuno è obbligatorio. */
    if (CFG.profilo) {
      h += sezione('sprof', ui('info', 20), AG_MODO ? 'Cliente e lead predittivo' : 'Come ci hai conosciuto', function () {
        var b = '';
        CFG.profilo.forEach(function (q) { b += domanda(q, S.com, 'com'); });
        return b;
      });
    }

    h += sezione('scom', ui('user', 20), 'Consegna, posa e tempi', function () {
      var b = '';
      CFG.comuni.forEach(function (q) { b += domanda(q, S.com, 'com'); });
      if (S.com.ascensore === 'No') {
        b += '<div class="dcs-note">Senza ascensore la consegna al piano ha un supplemento. Meglio saperlo adesso che nel preventivo.</div>';
      }
      return b;
    });

    h += '<p class="dcs-fam"><span>' + ui('cam', 20) + '</span> Ancora due cose</p>';
    h += '<div class="dcs-q"><span class="dcs-lab">Una foto, se ce l\'hai</span>' +
      '<p class="dcs-help">Del massetto, del pavimento attuale, del vano della porta con il metro appoggiato. Vale cinque risposte.</p>' +
      '<input class="dcs-in" type="file" accept="image/*" data-foto style="height:auto;padding:11px 13px"></div>';

    if (!ag) {
      h += '<div class="dcs-q"><span class="dcs-lab">Vuoi vedere i prodotti e parlare con un agente?</span>' +
        '<p class="dcs-help">In videochiamata ti facciamo vedere i campioni dal vivo, senza muoverti da casa. ' +
        'In showroom li tocchi. Nessuna delle due impegna a niente.</p>' +
        scelte('incontro', ['Sì, in videochiamata','Sì, in showroom','No, per ora scriviamoci'], S, 'S') + '</div>';
      if (S.incontro && S.incontro.indexOf('Sì') === 0) {
        h += '<div class="dcs-note is-ok">Ti mandiamo noi due o tre proposte di giorno e ora, ' +
             'sui giorni che hai segnato. Non devi cercare niente adesso.</div>';
      }
    }

    h += '<div class="dcs-q"><span class="dcs-lab">Hai un codice prodotto o un nome?</span>' +
      '<p class="dcs-help">Se hai visto qualcosa sul sito o su un catalogo, scrivilo qui: partiamo da lì. ' +
      'Va bene anche «quello rovere chiaro a spina».</p>' +
      libero('S', 'codiceProd', S.codiceProd, '', 'Es. 3S-ROV-NAT, oppure il nome che ricordi', 'text') + '</div>';

    h += '<div class="dcs-q"><span class="dcs-lab">' + (ag ? 'Note dell\'agente' : 'Raccontaci il resto') + '</span>' +
      '<p class="dcs-help">' + (ag
        ? 'Quello che il cliente ha detto e che non entra nelle caselle: com\'è la casa, che fretta ha, cosa lo preoccupa.'
        : 'Il prodotto che hai visto e ti piace, una stanza difficile, una data che non puoi spostare. Anche tre righe ci fanno risparmiare una telefonata.') + '</p>' +
      '<textarea class="dcs-in" data-free="S|note" placeholder="' + (ag
        ? 'Es. ha già preso i preventivi da altri due, decide entro settimana prossima…'
        : 'Es. ho visto il Rovere Naturale 3 Strip e mi piace, ma la cucina è aperta sul soggiorno e non so se regge…') + '">' + esc(S.note) + '</textarea></div>';

    if (!ag) {
      h += '<div class="dcs-q"><span class="dcs-lab">Hai già parlato con qualcuno di noi?</span>' +
        '<p class="dcs-help">Se sì, la mandiamo direttamente a lui e non ricominci da capo.</p>' +
        scelte('schedaPer', ['No, è il primo contatto'].concat(agenti().filter(function (a) { return a !== 'Il primo disponibile'; })), S, 'S') + '</div>';
    }

    h += '<div class="dcs-sum"><div class="dcs-sumHead">La richiesta</div><div class="dcs-sumBody" data-sum></div></div>';
    h += '<div class="dcs-err is-hidden" data-err></div>';
    h += '<div class="dcs-foot">' +
      '<button type="button" class="dcs-btn is-ghost" data-next="2">' + ui('left', 17) + '</button>' +
      '<button type="button" class="dcs-btn" data-invia>' + (ag ? 'Salva la scheda' : 'Invia la richiesta') + ' ' + ui('send', 17) + '</button>' +
      '</div>';
    return h;
  }

  /* ==========================================================================
     5 · DISEGNA
     ========================================================================== */
  function disegna(mantieniScroll) {
    var y = window.pageYOffset;
    ROOT.innerHTML = S.passo === 1 ? passo1() : S.passo === 2 ? passo2() : passo3();
    aggiornaSfrido();
    aggiornaRiepilogo();
    validaAvanti();
    if (mantieniScroll) { window.scrollTo(0, y); }
    else { ROOT.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  }

  function aggiornaSfrido() {
    ROOT.querySelectorAll('[data-sfrido]').forEach(function (el) {
      var k = el.getAttribute('data-sfrido');
      var mq = parseFloat(S.qta[k] || 0);
      if (!S.sel[k] || !mq) { el.className = 'dcs-sfrido is-hidden'; return; }
      el.className = 'dcs-sfrido';
      el.innerHTML = 'Per <b>' + mq + ' m²</b> di stanza servono circa <b>' + Math.ceil(mq * 1.10) +
        ' m²</b> di materiale a posa dritta, <b>' + Math.ceil(mq * 1.15) +
        ' m²</b> a spina. Lo sfrido lo calcoliamo noi: tu scrivi la stanza.';
    });
  }

  function aggiornaRiepilogo() {
    var el = ROOT.querySelector('[data-sum]');
    if (!el) { return; }
    var h = '';
    CFG.famiglie.forEach(function (c) {
      if (!S.sel[c.k]) { return; }
      h += '<div class="dcs-sumRow"><b>' + c.n + '</b><span>' +
           (c.noQty ? '—' : (S.qta[c.k] ? S.qta[c.k] + ' ' + c.u : 'da definire')) + '</span></div>';
      for (var i = 1; i <= nItem(c.k); i++) {
        var t = S.tec[scopeDi(c.k, i)] || {};
        c.Q.forEach(function (q) {
          if (q.id !== 'budget') { return; }
          var v = valore(t, q);
          if (v) { h += '<div class="dcs-sumRow"><b>&nbsp;&nbsp;budget' + (nItem(c.k) > 1 ? ' ' + i : '') + '</b><span>' + v + '</span></div>'; }
        });
      }
    });
    CFG.comuni.forEach(function (q) {
      if (q.t !== 'date' || !S.com[q.id]) { return; }
      h += '<div class="dcs-sumRow"><b>' + (q.breve || q.l) + '</b><span>' + valore(S.com, q) + '</span></div>';
    });
    if (S.com.posa)   { h += '<div class="dcs-sumRow"><b>Posa</b><span>' + S.com.posa + '</span></div>'; }
    if (S.com.piano !== undefined && String(S.com.piano).trim() !== '') {
      h += '<div class="dcs-sumRow"><b>Piano</b><span>' + S.com.piano + (S.com.ascensore === 'No' ? ' · no ascensore' : '') + '</span></div>';
    }
    if (S.citta) { h += '<div class="dcs-sumRow"><b>Dove</b><span>' + esc(S.citta) + '</span></div>'; }
    el.innerHTML = h || '<em>Niente selezionato.</em>';
  }

  function mailOk() { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((S.mail || '').trim()); }

  /* Nessun passo si blocca, tranne l'e-mail: è l'unica cosa che serve davvero.
     Chi non sa da dove partire va avanti lo stesso e lo scrive nelle note —
     una scheda con solo un indirizzo e due righe vale più di una persona che
     si arrende a metà. */
  function validaAvanti() {
    var c = ROOT.querySelector('[data-next="3"]');
    if (c) { c.disabled = !mailOk(); }
  }

  function errore(msg) {
    var e = ROOT.querySelector('[data-err]');
    if (!e) { return; }
    e.textContent = msg;
    e.className = 'dcs-err';
    e.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  /* ==========================================================================
     6 · INVIO
     ========================================================================== */
  function pacchetto() {
    var prodotti = [];
    CFG.famiglie.forEach(function (c) {
      if (!S.sel[c.k]) { return; }
      var n = nItem(c.k);
      for (var i = 1; i <= n; i++) {
        var t = S.tec[scopeDi(c.k, i)] || {}, risposte = {};
        c.Q.forEach(function (q) {
          if (q.if && !q.if(t)) { return; }
          if (q.ag && !AG_MODO) { return; }
          if (q.cl && AG_MODO) { return; }
          if (q.una && i > 1) { return; }
          var v = valore(t, q);
          if (v) { risposte[q.l] = v; }
        });
        prodotti.push({ famiglia: c.n + (n > 1 ? ' · ' + (c.itemTxt || 'prodotto').toLowerCase() + ' ' + i : ''),
                        quantita: c.noQty ? '' : ((n > 1 || c.qtyItem) ? (t._qta || (n === 1 ? S.qta[c.k] : '') || '') : (S.qta[c.k] || '')),
                        totale_famiglia: c.noQty ? '' : (S.qta[c.k] || ''),
                        unita: c.u, risposte: risposte });
      }
    });

    var comuni = {}, profilo = {};
    (CFG.profilo || []).forEach(function (q) {
      if (q.if && !q.if(S.com, S.sel)) { return; }
      if (q.ag && !AG_MODO) { return; }
      if (q.cl && AG_MODO) { return; }
      var v = valore(S.com, q);
      if (v) { profilo[q.l] = v; }
    });
    CFG.comuni.forEach(function (q) {
      if (q.if && !q.if(S.com, S.sel)) { return; }
      if (q.ag && !AG_MODO) { return; }
      var v = valore(S.com, q);
      if (v) { comuni[q.l] = v; }
    });

    var dati = {
      modo:         MODO,
      fatta_da:     S.fattaDa,
      compilata_da: S.fattaDa === 'Agente' ? S.compilataDa : '',
      codice_agente: S.fattaDa === 'Agente' ? S.codiceAgente : '',
      utente_connesso: (WP && WP.utente) || '',
      /* le due cose che il server guarda per capire se è un robot */
      trappola: S.trappola || '',
      secondi: Math.round((Date.now() - APERTA_ALLE) / 1000),
      scheda_per:   S.schedaPer || '',
      cliente: {
        nome:S.nome, email:S.mail, telefono:S.tel, citta:S.citta, tipo:S.chi,
        canale: canaleTesto(),
        richiamo: soloMail() ? '' : S.richiamo,
        giorni:  soloMail() ? [] : (S.giorni || []),
        incontro: S.incontro,
        codice_prodotto: S.codiceProd
      },
      prodotti: prodotti,
      consegna: comuni,
      profilo: profilo,
      note: S.note,
      pagina: location.pathname
    };

    /* LA REGOLA: il gclid si butta via SOLO davanti a un agente riconosciuto.
       Una scheda compilata da un agente che si porta dietro il gclid del
       computer dell'ufficio insegna a Google che un annuncio ha prodotto una
       conversione che non ha prodotto — e non si vede, i numeri sembrano buoni.
       Ma "agente" senza un codice valido è una parola: in quel caso davanti c'è
       un cliente, e il suo gclid non si perde. Il browser non può controllare
       il codice, quindi manda sempre la provenienza e decide il server. */
    /* v1.6 · promemoria «foto e video da mandare», in chiaro per la mail */
    var pm = [];
    var fv = [].concat(S.com.fotoVideo || []).filter(function (v) { return v && v.indexOf('Sì') === 0; });
    if (fv.length) { pm.push('Il cliente vuole foto e video (' + fv.map(function (v) { return v.replace('Sì, ', ''); }).join(', ') + ')'); }
    var dm = [].concat(S.com.daMandare || []).map(function (v) { return v === ALTRO ? (S.com.daMandare_x || '') : v; }).filter(Boolean);
    if (dm.length) { pm.push('Mandare: ' + dm.join(', ') + ([].concat(S.com.daMandareCome || []).length ? ' via ' + [].concat(S.com.daMandareCome).join(' e ') : '')); }
    if (S.com.daMandareCosa) { pm.push('Prodotti: ' + S.com.daMandareCosa); }
    dati.promemoria = pm.join(' · ');

    dati.provenienza = AG_MODO ? {} : PROVENIENZA;   // la scheda agente non porta mai il gclid
    dati.bozza = BOZZA_RIPRESA ? 1 : 0;

    return dati;
  }

  function invia(btn) {
    if (!mailOk()) { errore('Manca l\'e-mail, o non è scritta bene. È l\'unica cosa che ci serve per forza.'); return; }
    if (S.fattaDa === 'Agente' &&
        (!String(S.compilataDa || '').trim() || !String(S.codiceAgente || '').trim())) {
      S.passo = 1; disegna(false);
      errore('Scheda agente: servono il nome e il codice agente, altrimenti non si può inviare.');
      return;
    }
    btn.disabled = true;
    var testoOrig = btn.innerHTML;
    btn.innerHTML = 'Invio in corso…';

    var dati = pacchetto();

    /* GTM: l'evento parte solo per i clienti — e chi è cliente lo dice il
       SERVER, dopo aver controllato il codice. Qui nel browser un "sono un
       agente" senza codice valido vale zero, e non deve costare una
       conversione vera. Perciò l'evento si spinge nella risposta, non qui.
       In GTM: trigger sull'evento dc_scheda_inviata con condizione
       fatta_da = Cliente, e da lì la conversione Google Ads. Niente gtag nel
       codice: la decisione resta nel contenitore GTM-NXFPPJN. */

    if (!WP) {                                   // fuori da WordPress: prova a vuoto
      /* SOLO nel file di prova: finto controllo del codice (1101-1111).
         In WordPress lo fa il server e il codice non è mai nella pagina. */
      if (AG_MODO && !/^11(0[1-9]|1[01])$/.test(String(S.codiceAgente).trim())) {
        btn.disabled = false; btn.innerHTML = testoOrig;
        S.codiceAgente = ''; S.passo = 1; disegna(false);
        errore('Codice agente non riconosciuto: la scheda NON è stata inviata. (Prova: usa un codice da 1101 a 1111.)');
        return;
      }
      setTimeout(function () { evento(dati, S.fattaDa); fine(dati, true); }, 500);
      return;
    }

    var fd = new FormData();
    fd.append('action', 'dc_scheda_invia');
    fd.append('nonce', WP.nonce);
    fd.append('dati', JSON.stringify(dati));
    if (S.foto) { fd.append('foto', S.foto); }

    fetch(WP.ajax, { method: 'POST', body: fd, credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (r && r.success) {
          /* il server dice com'è stata registrata davvero */
          evento(dati, (r.data && r.data.fatta_da) || 'Cliente', r.data && r.data.numero);
          fine(dati, false, r.data && r.data.numero);
        }
        else { throw new Error((r && r.data) || 'errore'); }
      })
      .catch(function (err) {
        btn.disabled = false; btn.innerHTML = testoOrig;
        if (err && (err.message === 'codice' || err.message === 'troppi')) {
          S.codiceAgente = ''; S.passo = 1; disegna(false);
          errore(err.message === 'codice'
            ? 'Codice agente non riconosciuto: la scheda NON è stata inviata. Controlla il codice e riprova — i dati scritti restano.'
            : 'Troppi codici sbagliati da questa connessione. Riprova fra 15 minuti.');
          return;
        }
        errore('Non siamo riusciti a inviare. Riprova, oppure chiamaci allo ' + CFG.testi.telefono + '.');
      });
  }

  /* I nomi vengono da WordPress (pagina Persone), così la tendina e i codici
     non possono andare fuori sincrono. Fuori da WordPress — nel file di prova —
     si usa l'elenco scritto nella configurazione. */
  function agenti() {
    return (WP && WP.agenti && WP.agenti.length) ? WP.agenti : CFG.agenti;
  }

  /* La frase finale: gli si ripete quello che ha chiesto, con parole sue.
     Serve a una cosa sola — che chiuda la pagina sapendo cosa succede adesso. */
  var GIORNI_INTERI = { Lun:'lunedì', Mar:'martedì', Mer:'mercoledì',
                        Gio:'giovedì', Ven:'venerdì', Sab:'sabato' };
  function promessa() {
    if (soloMail()) {
      return 'Ti scriviamo per <b>e-mail</b>, come hai chiesto: nessuna telefonata.';
    }
    var NOMI = { WhatsApp:'su <b>WhatsApp</b>', Telefonata:'con una <b>telefonata</b>', SMS:'con un <b>SMS</b>', 'E-mail':'per <b>e-mail</b>' };
    var cc = (S.canale || []).map(function (c) { return NOMI[c]; }).filter(Boolean);
    var come = cc.length ? 'Ti contattiamo ' + (cc.length > 1 ? cc.slice(0, -1).join(', ') + ' o ' + cc[cc.length - 1] : cc[0])
                         : 'Ti rispondiamo';
    var gg = (S.giorni || []).map(function (g) { return GIORNI_INTERI[g] || g; });
    var quando = '';
    if (gg.length === 1) { quando = ' <b>' + gg[0] + '</b>'; }
    else if (gg.length > 1) {
      quando = ' <b>' + gg.slice(0, -1).join(', ') + ' o ' + gg[gg.length - 1] + '</b>';
    }
    if (S.richiamo && S.richiamo !== 'Quando volete') {
      quando += ' ' + S.richiamo.toLowerCase();
    }
    return come + quando + (quando ? '.' : ' presto, di solito entro il giorno lavorativo successivo.');
  }

  /* L'evento per GTM. Parte una volta sola, e solo per un cliente. */
  /* telefono in formato internazionale +39… (solo cifre) */
  function telE164(t) {
    var d = String(t || '').replace(/[^\d+]/g, '');
    if (!d) { return ''; }
    if (d.indexOf('+') === 0) { return d; }
    if (d.indexOf('00') === 0) { return '+' + d.slice(2); }
    return '+39' + d;
  }
  function evento(dati, fattaDa, numero) {
    if (fattaDa !== 'Cliente') { return; }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'dc_scheda_inviata',
      fatta_da: 'Cliente',
      /* integrazione · numero della scheda = order ID della conversione (§13b):
         Google toglie i doppioni e le conversioni offline si agganciano a questo. */
      lead_id: numero ? String(numero) : '',
      /* v1.9 · conversioni avanzate per i lead: il tag Google legge e-mail e
         telefono IN CHIARO (li cifra Google). Mai nell'URL, solo nel dataLayer. */
      user_data: {
        email: String(dati.cliente.email || '').trim().toLowerCase(),
        phone_number: telE164(dati.cliente.telefono)
      },
      famiglie: dati.prodotti.map(function (p) { return p.famiglia; }).join(' | '),
      gclid: (PROVENIENZA.gclid || '')
    });
  }

  function fine(dati, prova, numero) {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    var ag = S.fattaDa === 'Agente';
    ROOT.innerHTML = '<div class="dcs-done"><div class="dcs-tick">' + ui('check', 32) + '</div>' +
      (ag
        ? '<h3>Scheda salvata' + (numero ? ' · #' + numero : '') + '</h3>' +
          '<p>Compilata da <b>' + esc(S.compilataDa || '—') + '</b>, assegnata a <b>' + esc(S.schedaPer || agenti()[0]) + '</b>.<br>' +
          'Segnata come <b>interna</b>: niente <code>gclid</code>, nessuna conversione inviata a Google.</p>'
          + (dati.promemoria ? '<p class="dcs-note" style="text-align:left"><b>Promemoria:</b> ' + esc(dati.promemoria) + '</p>' : '')
        : '<h3>Ci siamo' + (S.nome ? ', ' + esc(S.nome.split(' ')[0]) : '') + '</h3>' +
          '<p>Abbiamo tutto quello che serve per prepararti una proposta vera.<br>' +
          promessa() + '</p>' +
          (S.incontro && S.incontro.indexOf('Sì') === 0
            ? '<p>E ti proponiamo due o tre orari per l\'appuntamento ' +
              (S.incontro.indexOf('video') > -1 ? 'in videochiamata' : 'in showroom') + '.</p>' : '') +
          '<p>Se hai fretta chiamaci tu: <a href="tel:' + CFG.testi.telefonoTel + '"><b>' + CFG.testi.telefono + '</b></a></p>') +
      (prova ? '<div class="dcs-debug"><b>Prova senza WordPress — questo è quello che sarebbe stato inviato:</b>' +
               esc(JSON.stringify(dati, null, 2)) + '</div>' : '') +
      '</div>';
    ROOT.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  /* ==========================================================================
     7 · EVENTI
     ========================================================================== */
  ROOT.addEventListener('click', function (e) {
    var t = e.target.closest('[data-toggle],[data-set],[data-multi],[data-next],[data-invia],[data-grp],[data-sez],[data-add],[data-del]');
    if (!t) { return; }

    if (t.hasAttribute('data-grp')) { var gk = 'g' + t.getAttribute('data-grp'); S.open[gk] = !S.open[gk]; disegna(true); return; }
    if (t.hasAttribute('data-sez')) { var sk = t.getAttribute('data-sez'); S.open[sk] = !S.open[sk]; disegna(true); return; }
    if (t.hasAttribute('data-add')) {
      var ak = t.getAttribute('data-add'); S.nItem[ak] = nItem(ak) + 1; S.open['s' + ak] = true;
      salvaBozza(); disegna(true); return;
    }
    if (t.hasAttribute('data-del')) {
      var dp = t.getAttribute('data-del').split('|'); togliItem(dp[0], parseInt(dp[1], 10));
      salvaBozza(); disegna(true); return;
    }
    if (t.hasAttribute('data-toggle')) {
      var k = t.getAttribute('data-toggle');
      S.sel[k] = !S.sel[k];
      if (!S.sel[k]) {
        delete S.qta[k];
        for (var ii = 1; ii <= nItem(k); ii++) { delete S.tec[scopeDi(k, ii)]; }
        delete S.nItem[k];
      }
      salvaBozza(); disegna(true); return;
    }
    if (t.hasAttribute('data-multi')) {
      var mid = t.getAttribute('data-multi'), mval = t.getAttribute('data-val');
      var arr = S[mid] || [];
      var i = arr.indexOf(mval);
      if (i > -1) { arr.splice(i, 1); } else { arr.push(mval); }
      S[mid] = arr; salvaBozza(); disegna(true); return;
    }
    if (t.hasAttribute('data-set')) {
      var id = t.getAttribute('data-set'), val = t.getAttribute('data-val'), sc = t.getAttribute('data-scope');
      var store = sc === 'S' ? S : sc === 'com' ? S.com : (S.tec[sc] = S.tec[sc] || {});
      if (id === 'fattaDa') {          // le due etichette lunghe, il valore corto
        S.fattaDa = (val.indexOf('agente') > -1 || val === 'Agente') ? 'Agente' : 'Cliente';
        salvaBozza(); disegna(true); return;
      }
      if (t.hasAttribute('data-m')) {                 // scelta multipla
        var arr2 = Array.isArray(store[id]) ? store[id] : (store[id] ? [store[id]] : []);
        var j2 = arr2.indexOf(val);
        if (j2 > -1) { arr2.splice(j2, 1); } else { arr2.push(val); }
        store[id] = arr2;
      } else {
        store[id] = store[id] === val ? '' : val;
      }
      salvaBozza(); disegna(true); return;
    }
    if (t.hasAttribute('data-next')) {
      var n = parseInt(t.getAttribute('data-next'), 10);
      if (n === 3 && !mailOk()) { errore('Manca l\'e-mail, o non è scritta bene.'); return; }
      S.passo = n; disegna(false); return;
    }
    if (t.hasAttribute('data-invia')) { invia(t); }
  });

  ROOT.addEventListener('input', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-qty')) {
      S.qta[el.getAttribute('data-qty')] = el.value; aggiornaSfrido(); salvaBozza(); return;
    }
    if (el.hasAttribute('data-trappola')) { S.trappola = el.value; return; }
    if (el.hasAttribute('data-free')) {
      var p = el.getAttribute('data-free').split('|'), sc = p[0], id = p[1];
      var store = sc === 'S' ? S : sc === 'com' ? S.com : (S.tec[sc] = S.tec[sc] || {});
      store[id] = el.value;
      delete store[id + '_auto'];                     // cambiato a mano: non più automatico
      aggiornaRiepilogo(); validaAvanti(); salvaBozza();
    }
  });

  ROOT.addEventListener('change', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-foto')) { S.foto = el.files && el.files[0] ? el.files[0] : null; return; }
    if (el.hasAttribute('data-free') && el.tagName === 'SELECT') {
      var p = el.getAttribute('data-free').split('|');
      if (p[0] === 'S') { S[p[1]] = el.value; salvaBozza(); }
    }
  });

  /* il piano fa comparire la domanda sull'ascensore quando esci dal campo */
  ROOT.addEventListener('blur', function (e) {
    var el = e.target;
    if (el.hasAttribute && el.hasAttribute('data-free') &&
        (el.getAttribute('data-free') === 'com|piano' || /\|_qta$/.test(el.getAttribute('data-free'))) && S.passo === 3) {
      disegna(true);
    }
  }, true);

  disegna(true);
})();

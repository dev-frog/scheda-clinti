/* ============================================================================
   Disegnarecasa — Scheda cliente e Scheda agente: LE DOMANDE
   Workstream J · v1.0 · 2026-08-28 · v1.4 e v1.5 · 2026-09-30
   ----------------------------------------------------------------------------
   QUESTO È IL FILE DA MODIFICARE per cambiare le domande.
   Non serve toccare dc-scheda.js: qui c'è solo il contenuto.

   Tipi di domanda:
     (niente)      pulsanti da scegliere
     t:'num'       campo libero numerico, con suf: 'unità'
     t:'text'      campo libero di testo
     t:'pair'      due numeri affiancati (larghezza × altezza)
     t:'grid'      più numeri affiancati, per quantità divise
     t:'date'      data con il calendario del telefono
     t:'money'     budget libero: una cifra + l'unità (u:['€/m²','€ in tutto'])
     altro:true    aggiunge il pulsante "Altro…" che apre un campo libero
     if: fn(t)     la domanda appare solo se la funzione è vera
     ag:true       la domanda compare SOLO nella Scheda agente [scheda_agente]
     uno:true      sempre scelta singola (di norma le domande dei prodotti
                   sono a scelta multipla: si possono chiedere più preventivi)
     cl:true       la domanda compare SOLO nella Scheda cliente (l'agente ha la sua versione tecnica)
     def: fn(c)    valore proposto in automatico (c.qta = quantità della famiglia);
                   resta automatico finché non lo si cambia a mano
     una:true      chiesta una volta sola per famiglia, anche se si aggiungono
                   più prodotti (es. il riscaldamento a pavimento è della casa)

   Famiglie:
     multi:false   niente pulsante «Aggiungi un altro prodotto»
     noQty:true    niente quantità al passo 1

   gruppi: come si presentano le famiglie al passo 1. Tutti CHIUSI: si apre
   solo quello che il cliente tocca (decisione di Diego, 30/9/2026).
   L'ordine conta: il parquet in legno è il 90% delle vendite e sta in cima.

   Regola: un campo lasciato vuoto vale "non lo so". Non si obbliga
   nessuno a indovinare. L'unico campo obbligatorio è l'e-mail.
   ============================================================================ */
(function (w) {
  'use strict';

  var DUNNO = 'Non lo so';
  var CONS  = 'Consigliatemi voi';
  var VAL   = 'Da valutare, dipende dal prezzo';

  /* Il budget, uguale ovunque: una cifra libera e l'unità. */
  function budget(u) {
    return { id:'budget', t:'money', l:'Budget indicativo', u: u || ['€/m²','€ in tutto'],
             h:'Anche una cifra tonda, al metro quadro o in tutto. Serve a non proporti cose fuori bersaglio.' };
  }
  /* Il prodotto visto sul sito: codice, nome o link (idea presa dalla scheda di Miju). */
  function prodotto() {
    return { id:'prodotto', t:'text', l:'Codice, nome o link del prodotto',
             h:'Se l\'hai visto sul sito o in showroom. Va bene anche «quello rovere chiaro».' };
  }
  /* Battiscopa e soglie: per tutti i pavimenti, solo nella Scheda agente. */
  function finiture() {
    return [
      { id:'battiscopa', ag:true, una:true, t:'num', suf:'m lineari', l:'Battiscopa',
        h:'Proposto in automatico: m² del pavimento + 10% di sfrido. Correggilo se serve.',
        def:function(c){ return c.qta ? Math.ceil(c.qta * 1.10) : ''; } },
      { id:'battiscopaCol', ag:true, una:true, l:'Colore del battiscopa',
        o:['In tinta con il pavimento','Bianco','Da scegliere'], altro:true },
      { id:'soglieScivolo', ag:true, una:true, t:'num', suf:'m lineari', l:'Soglie a scivolo' },
      { id:'soglieT', ag:true, una:true, t:'num', suf:'m lineari', l:'Soglie a T' },
      { id:'soglieCol', ag:true, una:true, l:'Colore delle soglie',
        o:['In tinta con il pavimento','Argento','Oro','Da scegliere'], altro:true }
    ];
  }

  var DA_POSARE = ['pav','spc','laminati','esterni','ceramiche','porte','blind','infissi',
                   'chiusure','bagno','doccia','vasche','saune','idro','accessori','altro'];

  w.DC_SCHEDA_CONFIG = {

    testi: {
      titolo:        'Richiedi il preventivo',
      titoloAgente:  'Scheda agente',
      telefono:      '02 3910 0466',
      telefonoTel:   '+390239100466',
      privacy:       'Li usiamo per prepararti il preventivo e risponderti, niente altro. Nessuna newsletter se non la chiedi.'
    },

    /* Solo per il file di prova: in WordPress i nomi arrivano da Schede cliente → Persone. */
    agenti: ['Il primo disponibile', 'Serena', 'Alex', 'Giselle', 'Iri',
             'Diego S', 'Diego J', 'Rosaria', 'Aldrin', 'Ferdinando',
             'Ferrari', 'Aldo'],

    /* --- i gruppi del passo 1, nell'ordine in cui si vedono --------------- */
    gruppi: [
      { n:'Parquet in legno',                        f:['pav'] },
      { n:'Porte interne',                           f:['porte'] },
      { n:'Porte blindate',                          f:['blind'] },
      { n:'Decking da esterno: WPC e legno',         f:['esterni'] },
      { n:'Parquet finto legno: SPC, LVT, laminati', f:['spc','laminati'], ic:'lvt' },
      { n:'Pavimenti in ceramica',                   f:['ceramiche'] },
      { n:'Arredo bagno: docce, vasche, mobili',     f:['doccia','vasche','bagno'], ic:'bagno' },
      { n:'Wellness: saune, bagno turco, minipiscine e jacuzzi', f:['saune','idro'], ic:'idro' },
      { n:'Materassi',                               f:['materassi'] },
      { n:'Infissi, tapparelle, zanzariere, garage', f:['infissi','chiusure'], ic:'infissi' },
      { n:'Arredo casa: divani, poltrone, camerette, letti, tavoli', f:['divani','camerette','arredo'], ic:'divani' },
      { n:'Edilizia, accessori e altro',             f:['accessori','altro'], ic:'altro' }
    ],

    /* --- LEAD PREDITTIVO: chi è il cliente e come ci ha trovato -----------
       Sono le variabili del documento per il Claude di Cataldo (§ 7.2, § 9.1):
       il modello le usa per stimare la probabilità di vendita e quindi il
       «Valore Predittivo Lead Qualificato» da mandare a Google. Tutte
       facoltative. Sezione a sé, chiusa come le altre. -------------------- */
    profilo: [
      { id:'fonte', l:'Come ci hai conosciuto?', multi:true,
        o:['Google','Sito Disegnarecasa','Showroom','Passaparola / amici','Facebook / Instagram','YouTube','Sono già cliente','Me l\'ha consigliato il posatore o l\'architetto'], altro:true },
      /* v1.9 · dalla ricerca: fase del progetto e motivo sono fra le variabili più predittive */
      { id:'fase', l:'A che punto sei?', o:['Casa appena comprata / rogito a breve','Lavori già iniziati','Lavori da iniziare entro 3 mesi','Sto progettando, oltre 3 mesi','Sto solo guardando'] },
      { id:'motivo', l:'Perché fai il lavoro?', multi:true, o:['Casa nuova / trasloco','Ristrutturazione','Pavimento rovinato o danno (anche infiltrazione)','Voglio cambiare stile','Casa da affittare o vendere'], altro:true },
      { id:'nAmbienti', t:'num', suf:'ambienti', l:'Quanti ambienti in tutto?' },
      { id:'showroom', l:'Sei già stato in uno dei nostri showroom?', o:['Sì, a Milano','Sì, a Roma','No, non ancora','Vorrei venire'] },
      { id:'campioni', l:'Hai già ricevuto i nostri campioni?', o:['Sì','No','Li vorrei ricevere'] },
      { id:'tipoCliente', l:'Il lavoro è per', o:['Casa mia (privato)','Un\'impresa edile','Un posatore','Un architetto o progettista','Un negozio o ufficio'] },
      { id:'eta', ag:true, l:'Fascia d\'età (stima dell\'agente)', h:'Facoltativa: ci aiuta a capire che proposte fare.',
        o:['Meno di 35','35-50','50-65','Oltre 65'], if:function(t){ return !t.tipoCliente || t.tipoCliente==='Casa mia (privato)'; } },
      { id:'altriPrev', ag:true, l:'Ha chiesto preventivi anche ad altri?', o:['No, solo a voi','Sì, a 1-2 negozi','Sì, a più di 2','Preferisco non dirlo'] },
      { id:'detrazione', l:'Userai una detrazione o un bonus?', multi:true, o:['Bonus casa (ristrutturazione)','Ecobonus (risparmio energetico)','Dispositivo medico 19% (materassi)','Nessuna',DUNNO] },

      /* --- solo Scheda agente --- */
      { id:'primoContatto', ag:true, t:'date', breve:'Primo contatto', l:'Data del primo contatto' },
      { id:'tipoContatto', ag:true, multi:true, l:'Come è avvenuto il contatto', o:['Di presenza in showroom','Telefono','E-mail','WhatsApp','Chat del sito','Modulo del sito'] },
      { id:'natoDa', ag:true, l:'Il preventivo nasce', o:['Dopo una visita in showroom','Dopo la spedizione dei campioni','Solo al telefono','Solo per e-mail / WhatsApp','Dopo un sopralluogo'] },
      { id:'puntoVendita', ag:true, l:'Punto vendita', o:['Milano','Roma','Online'] },
      { id:'giaCliente', ag:true, l:'Già cliente?', o:['Nuovo cliente','Ha già comprato da noi'] },
      { id:'iva', ag:true, l:'Regime IVA', o:['10% (con la nostra posa)','22% (solo materiale)','Art. 17 (impresa)','4% (solo costruzione della prima casa)',DUNNO] },
      { id:'beniSign', ag:true, l:'Ci sono «beni significativi» (porte, infissi, sanitari)?', h:'Al 10% solo fino al valore della manodopera, il resto al 22%: la fattura va divisa.', o:['Sì','No',DUNNO] },
      { id:'concorrente', ag:true, t:'text', l:'Concorrenti nominati e prezzo che gli hanno fatto', h:'Es. «Kaoss 30,90 €/m², Leroy Merlin». Ci serve per capire dove siamo forti.' },
      { id:'budgetTot', ag:true, t:'money', u:['€ in tutto'], l:'Budget totale dichiarato' },
      { id:'cantiere', ag:true, l:'Il cantiere è', o:['Casa abitata','Casa vuota / ristrutturazione','Nuova costruzione','Locale commerciale',DUNNO] },
      { id:'decide', ag:true, l:'Chi decide', o:['Il cliente da solo','La coppia / la famiglia','Impresa o architetto','Non chiaro'] },
      { id:'impressione', ag:true, l:'Impressione dell\'agente', o:['Caldo: vuole comprare','Tiepido: sta confrontando','Freddo: sta solo guardando'] },
      /* voto 1-10 chiesto da Diego: numerico, quindi utile al modello predittivo.
         Nota per Cataldo: usarlo solo se compilato PRIMA di mandare il valore a Google. */
      { id:'voto', ag:true, uno:true, l:'Interesse del cliente, voto da 1 a 10', h:'1 = nessun interesse, 10 = compra subito.', o:['1','2','3','4','5','6','7','8','9','10'] },
      { id:'prezzoConc', ag:true, t:'num', suf:'€/m² o € totali', l:'Prezzo fatto dal concorrente (numero)' },
      { id:'prevInviato', ag:true, t:'date', breve:'Preventivo inviato', l:'Data invio del preventivo' },
      { id:'impressioneNote', ag:true, t:'text', l:'Impressioni dell\'agente', h:'Com\'è sembrato il cliente, cosa lo frena, cosa gli piace, che fretta ha.' }
    ],

    /* --- domande comuni, chieste una volta sola --------------------------- */
    comuni: [
      { id:'posa', l:'Serve la posa?', h:'È il bivio più grosso del preventivo.',
        o:['La posate voi','Ho già il mio posatore','La faccio io',VAL,DUNNO],
        if:function(t, sel){ return DA_POSARE.some(function(k){ return sel && sel[k]; }); } },
      { id:'piano', t:'num', suf:'piano', l:'A che piano?',
        h:'Scrivi il numero: 0 per il piano terra. Anche 11, se è l\'undicesimo.' },
      { id:'ascensore', l:'C\'è l\'ascensore?', o:['Sì','No',DUNNO],
        if:function(t){ return t.piano && String(t.piano).trim()!=='' && String(t.piano).trim()!=='0'; } },
      { id:'facchinaggio', l:'Serve il facchinaggio?',
        h:'Cioè: portiamo la merce su noi, oppure lo scarico a terra va bene.',
        o:['Sì, portate su voi','No, scarico a terra va bene',VAL,DUNNO] },
      { id:'sopralluogo', l:'Serve un sopralluogo?',
        h:'Veniamo noi a misurare. Se hai già le misure si salta.',
        o:['Sì, meglio','Forse, da valutare','No, ho già le misure',DUNNO] },
      { id:'fotoVideo', l:'Vuoi ricevere foto e video dei prodotti che ti interessano?',
        h:'Ti mandiamo foto vere e brevi video dei prodotti, anche posati, per vederli prima di decidere.',
        o:['Sì, su WhatsApp','Sì, per e-mail','No, grazie'], multi:true },
      /* v1.6 · PROMEMORIA per il venditore: cosa mandare e di quali prodotti.
         Finisce in cima alla mail, subito sotto «Contattalo via…». */
      { id:'daMandare', ag:true, multi:true, l:'Promemoria: cosa mandare al cliente',
        o:['Foto','Video','Foto dei prodotti posati','Campioni','Scheda tecnica','Listino'], altro:true },
      { id:'daMandareCosa', ag:true, t:'text', l:'Di quali prodotti (nomi o codici)',
        h:'Es. «Rovere 3 strip naturale e plancia miele, blindata classe 3 bianca».' },
      { id:'daMandareCome', ag:true, multi:true, l:'Come mandarle', o:['WhatsApp','E-mail'] },
      /* v1.6 · date vere con il calendario, al posto delle fasce «entro il mese…» */
      { id:'dataIdeale', t:'date', breve:'Data ideale', l:'Data ideale di consegna o di posa',
        h:'Tocca il campo e scegli sul calendario. Se non hai una data, lascia vuoto.' },
      { id:'dataMax', t:'date', breve:'Data massima', l:'Data massima: oltre questa data non ti va più bene' },
      { id:'fretta', l:'Se non hai date', o:['Sto solo valutando','Nessuna fretta'],
        if:function(t){ return !t.dataIdeale && !t.dataMax; } },

      /* --- solo Scheda agente --- */
      { id:'accessoMezzi', ag:true, l:'Accesso per lo scarico', h:'ZTL, parcheggio, strada stretta: cambia il trasporto.', o:['Nessun problema','ZTL','Parcheggio difficile','Serve argano / piattaforma',DUNNO] },
      { id:'ascensoreMis', ag:true, t:'pair', l:'Ascensore: misure interne', pair:[{id:'larg',l:'Larghezza',suf:'cm'},{id:'prof',l:'Profondità',suf:'cm'}] },
      { id:'scalaLarg', ag:true, t:'num', suf:'cm', l:'Larghezza della scala' },
      { id:'camion', ag:true, l:'Il camion resta a più di 20 m dal portone?', o:['Sì','No',DUNNO] },
      { id:'colli', ag:true, l:'Colli più lunghi di 230 cm o più pesanti di 70 kg?', h:'Plance lunghe, lastre, vetri doccia, divani.', o:['Sì','No',DUNNO] },
      { id:'smaltimento', ag:true, l:'Smaltimento del vecchio', o:['Sì, a carico nostro','No, ci pensa il cliente','Non serve',DUNNO],
        if:function(t, sel){ return DA_POSARE.some(function(k){ return sel && sel[k]; }); } },

      /* Dati per ordine e fattura: SOLO agente e SOLO a preventivo accettato.
         Al cliente non si chiedono mai (decisione del 28/8: fanno scappare). */
      { id:'accettato', ag:true, l:'Il cliente ha accettato il preventivo?', o:['Sì','Non ancora'] },
      { id:'cfpiva', ag:true, t:'text', l:'Codice fiscale o partita IVA', if:function(t){ return t.accettato==='Sì'; } },
      { id:'ragione', ag:true, t:'text', l:'Intestazione fattura (nome o ragione sociale)', if:function(t){ return t.accettato==='Sì'; } },
      { id:'indirizzo', ag:true, t:'text', l:'Indirizzo del cantiere (via e civico)', if:function(t){ return t.accettato==='Sì'; } },
      { id:'capCitta', ag:true, t:'text', l:'CAP, città e provincia', if:function(t){ return t.accettato==='Sì'; } },
      { id:'scala', ag:true, t:'text', l:'Scala / interno', if:function(t){ return t.accettato==='Sì'; } },
      { id:'noteAccesso', ag:true, t:'text', l:'Note per l\'accesso', h:'Citofono, orari del condominio, chiavi.', if:function(t){ return t.accettato==='Sì'; } }
    ],

    famiglie: [

      /* ================= PARQUET IN LEGNO (90% delle vendite) ================ */
      { k:'pav', itemTxt:'Parquet', n:'Parquet in legno', u:'m²', ic:'pav',
        qty:'Quanti metri quadri, più o meno?',
        hint:'Anche a occhio: la superficie della stanza. Lo sfrido lo calcoliamo noi.',
        sfrido:true, addTxt:'Aggiungi un altro parquet da preventivare', Q:[
        { id:'famiglia', l:'Che tipo di parquet', o:['Parquet massello tradizionale','Parquet prefinito','Parquet massello prefinito','Massello bamboo',CONS] },
        { id:'formato', l:'Formato', o:['Listone','Plancia intera','3 strip','Spina italiana','Spina ungherese','Tavolato',CONS], altro:true },
        { id:'essenza', l:'Essenza', o:['Rovere','Teak','Doussié','Iroko','Noce','Faggio','Bamboo',CONS], altro:true },
        { id:'colore', l:'Colorazione', o:['Naturale','Chiaro o sbiancato','Miele','Grigio','Scuro',CONS], altro:true },
        { id:'aspetto', cl:true, l:'Aspetto del legno', o:['Senza nodi','Con nodi piccoli','Con nodi anche grandi','Rustica nodata',CONS] },
        { id:'posa', l:'Tipo di posa', o:['Flottante','Flottante con materassino','Incollata',CONS] },
        prodotto(),
        { id:'risc', una:true, l:'C\'è il riscaldamento a pavimento?',
          h:'Cambia la colla, la posa e metà del catalogo. Con il raffrescamento serve la posa incollata.', o:['No','Solo riscaldamento','Riscaldamento e raffrescamento',DUNNO] },
        { id:'gradini', una:true, t:'num', suf:'gradini', l:'Ci sono gradini da rivestire?', h:'Le scale si fanno a pezzo. Lascia vuoto se non ci sono.' },
        { id:'gradiniTipo', una:true, l:'Gradini', o:['Solo pedate','Pedate e alzate'], if:function(t){ return t.gradini && t.gradini!=='0'; } },
        { id:'esistente', una:true, l:'Dove si posa?', o:['Su massetto nuovo','Su massetto vecchio','Sopra il pavimento esistente','Da togliere il pavimento esistente',DUNNO] },
        { id:'altezza', una:true, t:'num', suf:'mm', l:'Quanta altezza hai a disposizione?',
          h:'Dal pavimento attuale al filo inferiore della porta. Se non lo sai lascia vuoto.',
          if:function(t){ return t.esistente==='Sopra il pavimento esistente'; } },
        { id:'ambienti', una:true, l:'Quali ambienti', o:['Tutta casa','Zona giorno','Camere','Un ambiente solo',DUNNO], altro:true },
        budget(),
        /* --- solo Scheda agente --- */
        { id:'spessore', ag:true, l:'Spessore totale', o:['10-11 mm','14-15 mm','19-22 mm',CONS], altro:true },
        { id:'nobile', ag:true, l:'Strato nobile', h:'Quante levigature regge nel tempo.', o:['2,5-3 mm','4 mm','6 mm',CONS] },
        { id:'scelta', ag:true, l:'Selezione del legno', o:['AB Top Excelsior','ABC Top Esclusive','ABCD Select','ABCD Standard','BCD Natura','CD Rustica','CDE Extra Rustica',CONS] },
        /* più voci insieme: un listone può essere spazzolato E piallato E oliato */
        { id:'lavorazione', ag:true, l:'Lavorazione della superficie', o:['Liscio','Spazzolato','Piallato a mano','Segato','Anticato / invecchiato',CONS] },
        { id:'finituraPav', ag:true, l:'Finitura', o:['Verniciato opaco','Verniciato satinato','Oliato','Olio-cera','Grezzo da finire in opera',CONS] },
        { id:'bagniPav', ag:true, una:true, t:'num', suf:'n.', l:'Quanti bagni col parquet?' },
        { id:'porteRifilare', ag:true, una:true, t:'num', suf:'porte', l:'Porte da rifilare dopo la posa' },
        { id:'levigatura', ag:true, una:true, l:'Levigatura e verniciatura in opera', o:['Sì','No',DUNNO] },
        { id:'schemaPosa', ag:true, l:'Schema di posa (listone e plancia)', o:['Dritta','Diagonale',CONS] }
      ].concat(finiture()) },

      /* ================= PAVIMENTI SPC E LAMINATI ============================ */
      { k:'spc', itemTxt:'SPC / LVT', n:'SPC e LVT (vinilici)', u:'m²', ic:'lvt', qty:'Quanti metri quadri?', sfrido:true, Q:[
        { id:'quale', l:'Quale ti interessa', h:'L\'SPC è rigido, stabile e non teme l\'acqua.',
          o:['SPC a click','LVT vinilico a click','LVT vinilico a colla',CONS] },
        { id:'formato', l:'Formato', o:['Doga standard','Plancia larga','Spina','Piastra effetto pietra',CONS], altro:true },
        { id:'effetto', l:'Effetto', o:['Legno','Pietra','Cemento',CONS], altro:true },
        { id:'colore', l:'Colorazione', o:['Chiaro','Naturale','Grigio','Scuro',CONS], altro:true },
        prodotto(),
        { id:'uso', una:true, l:'Dove va posato', o:['Casa','Negozio o ufficio','Locale pubblico',DUNNO] },
        { id:'risc', una:true, l:'C\'è il riscaldamento a pavimento?', o:['Sì','No',DUNNO] },
        { id:'esistente', una:true, l:'Dove si posa?', o:['Su massetto','Sopra il pavimento esistente','Da togliere il pavimento esistente',DUNNO] },
        { id:'sole', una:true, l:'Prende sole diretto (vetrate a terra, veranda)?', h:'Il vinilico al sole forte può scolorire.', o:['Sì','No',DUNNO] },
        { id:'lungo15', ag:true, una:true, l:'Ambiente continuo più lungo di 15 m?', h:'Servono giunti di dilatazione e profili.', o:['Sì','No',DUNNO] },
        budget(),
        { id:'spessoreLvt', ag:true, l:'Spessore totale', o:['4-5 mm','6-7 mm','8 mm',CONS] },
        { id:'usura', ag:true, l:'Strato d\'usura', o:['0,3 mm','0,55 mm','0,7 mm',CONS] },
        { id:'classeUso', ag:true, l:'Classe d\'uso', o:['23 casa','32 commerciale leggero','33 commerciale',CONS] },
        { id:'materassino', ag:true, l:'Materassino', o:['Integrato','Da aggiungere',DUNNO] }
      ].concat(finiture()) },

      { k:'laminati', itemTxt:'Laminato', n:'Laminati', u:'m²', ic:'lvt', qty:'Quanti metri quadri?', sfrido:true, Q:[
        { id:'classe', l:'Resistenza', h:'AC4 va bene per soggiorno e cucina, AC5 per negozi e uffici.',
          o:['AC3','AC4','AC5',CONS] },
        { id:'acqua', l:'Deve resistere all\'acqua?', o:['Non serve','Sì, in cucina o bagno',CONS] },
        { id:'effetto', l:'Effetto', o:['Legno','Pietra','Cemento',CONS], altro:true },
        { id:'colore', l:'Colorazione', o:['Chiaro','Naturale','Grigio','Scuro',CONS], altro:true },
        prodotto(),
        { id:'risc', una:true, l:'C\'è il riscaldamento a pavimento?', o:['Sì','No',DUNNO] },
        { id:'esistente', una:true, l:'Dove si posa?', o:['Su massetto','Sopra il pavimento esistente','Da togliere il pavimento esistente',DUNNO] },
        { id:'sole', una:true, l:'Prende sole diretto (vetrate a terra, veranda)?', h:'Il vinilico al sole forte può scolorire.', o:['Sì','No',DUNNO] },
        { id:'lungo15', ag:true, una:true, l:'Ambiente continuo più lungo di 15 m?', h:'Servono giunti di dilatazione e profili.', o:['Sì','No',DUNNO] },
        budget(),
        { id:'spessoreLam', ag:true, l:'Spessore', o:['7-8 mm','10 mm','12 mm',CONS] },
        { id:'acquaH', ag:true, l:'Resistenza all\'acqua (ore)', o:['24 h','48 h','72 h',CONS] },
        { id:'materassino', ag:true, l:'Materassino', o:['Integrato','Da aggiungere',DUNNO] }
      ].concat(finiture()) },

      /* ================= ESTERNI =========================================== */
      { k:'esterni', itemTxt:'Decking', n:'Decking da esterno: WPC e legno', u:'m²', ic:'esterni', qty:'Quanti metri quadri?', Q:[
        { id:'materiale', l:'Materiale', h:'Il legno va oliato ogni anno o due. Il WPC praticamente no.',
          o:['WPC (composito)','Legno',CONS] },
        { id:'colore', l:'Colore', o:['Teak / miele','Marrone scuro','Grigio','Antracite',CONS], altro:true },
        prodotto(),
        { id:'supporto', una:true, l:'Su cosa si posa', o:['Massetto o cemento','Terrazzo o piastrelle esistenti','Terrazzo con guaina (non si fora)','Ghiaia o terra',DUNNO] },
        { id:'dislivello', una:true, t:'num', suf:'cm', l:'Altezza disponibile o dislivello da recuperare' },
        { id:'piscina', una:true, l:'È a bordo piscina?', o:['Sì','No'] },
        budget(),
        { id:'essenzaEst', ag:true, l:'Essenza', o:['IPE','Cumaru','Massaranduba','Teak','Frassino termotrattato','Bamboo',CONS], altro:true,
          if:function(t){ return t.materiale==='Legno'; } },
        { id:'doga', ag:true, l:'Doga', o:['Cava','Piena','Coestrusa',CONS], if:function(t){ return t.materiale==='WPC (composito)'; } },
        { id:'fissaggio', ag:true, l:'Fissaggio', o:['Clip a scomparsa','Viti a vista',CONS] },
        { id:'superficie', ag:true, l:'Superficie', o:['Liscia','Zigrinata','Reversibile',CONS] },
        { id:'sottostruttura', ag:true, l:'Sottostruttura', o:['Magatelli in alluminio','Magatelli in WPC','Magatelli in legno','Piedini regolabili','C\'è già',DUNNO] },
        { id:'lungDoga', ag:true, t:'num', suf:'m', l:'Lunghezza doga' }
      ]},

      /* ================= CERAMICHE ========================================= */
      { k:'ceramiche', itemTxt:'Ceramica', n:'Pavimenti in ceramica', u:'m²', ic:'ceramiche', qty:'Quanti metri quadri?', Q:[
        { id:'uso', l:'Pavimento o rivestimento?', o:['Pavimento','Rivestimento','Tutti e due',DUNNO] },
        { id:'dove', l:'Interno o esterno?', o:['Interno','Esterno','Tutti e due'] },
        { id:'formato', l:'Formato', o:['60×120','30×60','20×120 effetto legno','Grande formato',CONS], altro:true },
        { id:'esistente', una:true, l:'Dove si posa?', o:['Su massetto','Sopra il pavimento esistente','Da togliere il pavimento esistente',DUNNO] },
        { id:'effetto', l:'Effetto', o:['Legno','Pietra','Cemento','Marmo','Tinta unita',CONS], altro:true },
        prodotto(),
        budget(),
        { id:'rettificato', ag:true, l:'Rettificato', o:['Sì','No',CONS] },
        { id:'antiscivolo', ag:true, l:'Antiscivolo', o:['R9 interno','R10','R11 esterno','R12-R13','A/B/C piedi nudi (doccia, bordo piscina)',CONS] },
        { id:'spessoreCer', ag:true, l:'Spessore', o:['6 mm','9-10 mm','20 mm (esterno)',CONS] },
        { id:'posaCer', ag:true, l:'Schema di posa', o:['Dritta','Sfalsata 1/3','Sfalsata 1/2','Diagonale','Spina',CONS] },
        { id:'mqRiv', ag:true, t:'num', suf:'m²', l:'Di cui m² di rivestimento' },
        { id:'latoLungo', ag:true, t:'num', suf:'cm', l:'Lato lungo della lastra', h:'Per ascensore e scale con il grande formato.' }
      ].concat(finiture()) },

      /* ================= PORTE INTERNE ====================================== */
      { k:'porte', n:'Porte interne', u:'porte', ic:'porte', qty:'Quante porte interne in tutto?',
        hint:'Al passo 3 le dividi: ogni riga è una misura e un\'apertura, con la sua quantità.',
        qtyItem:true, itemTxt:'Porta interna', qtyItemTxt:'Quante porte con questa misura e apertura',
        addTxt:'Aggiungi un\'altra misura o apertura', Q:[
        { id:'larghezza', l:'Misura porta (nominale)', h:'È la misura commerciale della porta: la luce libera è un po\' più piccola.', o:['60 cm','70 cm','80 cm','90 cm','Su misura',DUNNO] },
        { id:'larghezzaSu', t:'num', suf:'cm', l:'Larghezza su misura', if:function(t){ return t.larghezza==='Su misura'; } },
        { id:'altezza', l:'Altezza', o:['210 cm','220 cm','240 cm','Su misura',DUNNO] },
        { id:'altezzaSu', t:'num', suf:'cm', l:'Altezza su misura', if:function(t){ return t.altezza==='Su misura'; } },
        { id:'apertura', l:'Apertura (si guarda sempre dal lato dove si spinge)',
          h:'Mettiti dal lato dove la porta si apre spingendo: se i cardini sono a destra è una destra a spingere.',
          o:['Destra a spingere','Sinistra a spingere',DUNNO] },
        { id:'tipo', l:'Tipo', o:['Battente','Battente a due ante','Scorrevole esterno muro','Scorrevole interno muro','A libro','Rototraslante','A bilico',DUNNO] },
        { id:'vano', ag:true, t:'pair', l:'Vano muro', pair:[{id:'larg',l:'Larghezza',suf:'cm'},{id:'alt',l:'Altezza',suf:'cm'}] },
        { id:'finitura', l:'Finitura', o:['Laccata','Laminato','Legno naturale',CONS], altro:true },
        { id:'colore', l:'Colore', o:['Bianco','Legno chiaro','Legno scuro',CONS], altro:true },
        { id:'maniglia', l:'Maniglia', o:['Argento / cromo satinato','Cromo lucido','Oro','Ottone','Bronzo','Nero',CONS], altro:true },
        prodotto(),
        { id:'telaio', una:true, l:'C\'è già il telaio?', o:['Sì, sostituisco solo l\'anta','No, tutto nuovo',DUNNO] },
        budget(['€ a porta','€ in tutto']),
        { id:'telaioTipo', ag:true, l:'Telaio', o:['Tradizionale con coprifili','Complanare','Filo muro rasomuro',DUNNO] },
        { id:'controtelaioP', ag:true, l:'Controtelaio', o:['C\'è già','Da fornire','Per scorrevole (tipo Scrigno / Eclisse)',DUNNO] },
        { id:'muro', ag:true, l:'Spessore del muro', o:['8 cm','10 cm','12 cm','15 cm','Altra misura'] },
        { id:'muroSu', ag:true, t:'num', suf:'cm', l:'Spessore del muro (altra misura)', if:function(t){ return t.muro==='Altra misura'; } },
        { id:'anta', ag:true, l:'Anta', o:['Cieca','Vetrata','Pantografata',CONS] },
        { id:'cerniere', ag:true, l:'Cerniere', o:['Anuba','A scomparsa','A bilico',DUNNO] },
        { id:'serratura', ag:true, l:'Serratura', o:['Normale (patent)','Magnetica','Con chiave yale','Nottolino WC',CONS] },
        { id:'manigliaMod', ag:true, t:'text', l:'Maniglia: modello o nome' },
        { id:'db', ag:true, l:'Isolamento acustico', o:['Standard','25 dB','30 dB','35 dB','40 dB'], altro:true },
        { id:'ceramica', ag:true, una:true, l:'Ceramica sui muri accanto (bagno, cucina)?', o:['Sì','No',DUNNO] },
        { id:'pavFinito', ag:true, una:true, l:'Il pavimento finito è già posato?', o:['Sì','No, si posa dopo',DUNNO] },
        { id:'smontaggio', ag:true, una:true, l:'Smontaggio porte vecchie', o:['Sì','No',DUNNO] }
      ]},

      /* ================= PORTE BLINDATE ===================================== */
      /* Le blindate si contano sempre a pezzi (mai a m²): totale al passo 1,
         poi ogni riga = una misura + un'apertura + la sua quantità.
         L'apertura si dice SEMPRE «a spingere» (vista dal lato dove si spinge). */
      { k:'blind', n:'Porte blindate', u:'porte', ic:'blind', qty:'Quante porte blindate in tutto?',
        hint:'Al passo 3 le dividi: ogni riga è una misura e un\'apertura, con la sua quantità.',
        qtyItem:true, itemTxt:'Porta blindata', qtyItemTxt:'Quante blindate con questa misura e apertura',
        addTxt:'Aggiungi un\'altra misura o apertura', Q:[
        { id:'larghezza', l:'Larghezza (luce di passaggio)',
          o:['80 cm','85 cm','90 cm','95 cm','110 cm a due ante (80 + 30)','120 cm a due ante (90 + 30)','Su misura',DUNNO] },
        { id:'larghezzaSu', t:'num', suf:'cm', l:'Larghezza su misura', if:function(t){ return t.larghezza==='Su misura'; } },
        { id:'altezza', l:'Altezza', o:['200 cm','205 cm','210 cm','Su misura',DUNNO] },
        { id:'altezzaSu', t:'num', suf:'cm', l:'Altezza su misura', if:function(t){ return t.altezza==='Su misura'; } },
        { id:'suMisura', t:'text', l:'Descrivi la blindata su misura', h:'Con parole tue: forma, ante, sopraluce, finitura.',
          if:function(t){ return t.larghezza==='Su misura' || t.altezza==='Su misura'; } },
        { id:'apertura', l:'Apertura (si guarda sempre dal lato dove si spinge)',
          h:'Mettiti dal lato dove la porta si apre spingendo: se i cardini sono a destra è una destra a spingere.',
          o:['Destra a spingere','Sinistra a spingere',DUNNO] },
        { id:'versoApre', l:'La porta si apre verso', o:['Dentro casa','Fuori',DUNNO] },
        { id:'sopraluce', l:'Sopraluce o fiancoluce', h:'Vetro sopra o di fianco alla porta: cambia molto il prezzo.', o:['No','Sopraluce','Fiancoluce laterale','Tutti e due',DUNNO] },
        { id:'cilindri', l:'Serratura', o:['1 cilindro','2 cilindri','Combinata con elettronica',CONS] },
        { id:'classe', l:'Classe antieffrazione', h:'Per una casa di solito la 3. La 4 per ville e piani terra.',
          o:['Classe 3','Classe 4',DUNNO] },
        { id:'pannEst', l:'Pannello esterno', h:'Se prende pioggia e sole: PVC, alluminio o vetroresina.',
          o:['Laminato','PVC','Alluminio','Vetroresina','Okoumé marino','Laccato',CONS], altro:true },
        { id:'pannInt', l:'Pannello interno', o:['Liscio bianco','Laminato legno','Laccato','Uguale alle porte interne',CONS], altro:true },
        { id:'maniglia', l:'Maniglieria', o:['Argento / cromo satinato','Cromo lucido','Oro','Ottone','Bronzo','Nero',CONS], altro:true },
        { id:'condominio', l:'Il condominio impone un colore o un modello esterno?', o:['No','Sì',DUNNO] },
        { id:'condominioCol', t:'text', l:'Quale colore o modello?', h:'Anche «come quella del vicino»: una foto aiuta.',
          if:function(t){ return t.condominio==='Sì'; } },
        prodotto(),
        { id:'dove', una:true, l:'Dove si trova', o:['Pianerottolo di condominio','Esterna ma riparata (portico)','Esterna, esposta al tempo',DUNNO] },
        { id:'muroTipo', ag:true, una:true, l:'Tipo di muro', o:['Cemento armato','Mattone pieno','Forati','Cartongesso',DUNNO] },
        { id:'confina', ag:true, una:true, l:'La porta confina con', h:'Solo nei primi due casi serve l\'Ud per le detrazioni energetiche.', o:['Esterno','Vano scala non riscaldato','Vano scala riscaldato',DUNNO] },
        { id:'controtelaio', una:true, l:'C\'è già il controtelaio murato?', o:['Sì, da conservare','No',DUNNO] },
        budget(['€ a porta','€ in tutto']),
        { id:'classeAg', ag:true, l:'Classe (UNI EN 1627) se diversa', o:['Classe 2','Classe 3','Classe 4'] },
        { id:'defender', ag:true, l:'Defender', o:['Sì','No',CONS] },
        { id:'db', ag:true, l:'Isolamento acustico', o:['Standard','32 dB','37 dB','40 dB','42 dB','45 dB'], altro:true },
        { id:'ud', ag:true, l:'Isolamento termico Ud', h:'Serve se dà sull\'esterno o per la detrazione.',
          o:['Non serve','2,0 W/m²K','1,8 W/m²K','1,4 W/m²K','1,3 W/m²K','1,0 W/m²K'], altro:true },
        { id:'ingombro', ag:true, t:'pair', l:'Ingombro controtelaio / vano muro', h:'Es. passaggio 90×210 → ingombro 103×217 circa.',
          pair:[{id:'larg',l:'Larghezza',suf:'cm'},{id:'alt',l:'Altezza',suf:'cm'}] },
        { id:'muro', ag:true, l:'Spessore del muro', o:['10 cm','15 cm','20 cm','30 cm','Altra misura'] },
        { id:'muroSu', ag:true, t:'num', suf:'cm', l:'Spessore del muro (altra misura)', if:function(t){ return t.muro==='Altra misura'; } },
        { id:'extraBl', ag:true, l:'Extra', o:['Spioncino digitale','Limitatore di apertura','Soglia mobile paraspifferi','Nessuno'], altro:true },
        { id:'manigliaMod', ag:true, t:'text', l:'Maniglia / pomolo: modello' },
        { id:'vecchia', ag:true, una:true, l:'Porta esistente', o:['Da smontare e smaltire','Si riveste il telaio esistente','Nessuna porta',DUNNO] }
      ]},

      /* ================= INFISSI E CHIUSURE ================================= */
      { k:'infissi', n:'Infissi e finestre', u:'pezzi', ic:'infissi', qty:'Quanti infissi in tutto?',
        hint:'Finestre e porte-finestre. Al passo 3 li dividi per tipo e misura.',
        qtyItem:true, itemTxt:'Infisso', qtyItemTxt:'Quanti con questo tipo e questa misura', addTxt:'Aggiungi un altro tipo o misura', Q:[
        { id:'tipoInf', uno:true, l:'Tipo', o:['Finestra 1 anta','Finestra 2 ante','Porta-finestra 1 anta','Porta-finestra 2 ante','Scorrevole','Fisso','Vasistas',DUNNO] },
        { id:'misuraInf', t:'pair', l:'Misura (larghezza × altezza)', h:'Se non la sai lascia vuoto: la prendiamo al sopralluogo.',
          pair:[{id:'larg',l:'Larghezza',suf:'cm'},{id:'alt',l:'Altezza',suf:'cm'}] },
        { id:'aperturaInf', l:'Apertura (vista da dentro)', o:['Destra','Sinistra','Non serve',DUNNO] },
        { id:'materiale', l:'Materiale', o:['PVC','Legno','Alluminio','Legno-alluminio',CONS], altro:true },
        { id:'apre', l:'Apertura', h:'L\'anta-ribalta si apre anche a vasistas.',
          o:['Battente','Anta-ribalta','Scorrevole','Alzante scorrevole',CONS] },
        { id:'vetro', l:'Vetro', o:['Doppio','Triplo',CONS] },
        { id:'colore', l:'Colore', o:['Bianco','Legno','Grigio antracite',CONS], altro:true },
        { id:'lavoro', una:true, l:'Sostituzione o costruzione nuova?', o:['Sostituzione','Costruzione nuova',DUNNO] },
        { id:'prima', una:true, l:'È l\'abitazione principale?', h:'Nel 2026 la detrazione è del 50% sull\'abitazione principale, 36% sugli altri immobili.', o:['Sì, abitazione principale','No',DUNNO] },
        { id:'accessori', una:true, l:'Servono anche', o:['Tapparelle','Persiane','Zanzariere','No, solo infissi',VAL], altro:true },
        budget(['€ in tutto','€ a finestra']),
        { id:'coloreInt', ag:true, t:'text', l:'Colore interno' },
        { id:'coloreEst', ag:true, t:'text', l:'Colore esterno' },
        { id:'camere', ag:true, l:'Profilo', o:['5 camere','6 camere','7 camere','Taglio termico (alluminio)',CONS] },
        { id:'vetroTipo', ag:true, l:'Tipo di vetro', o:['Basso emissivo','Stratificato di sicurezza','Acustico','Satinato (bagno)',CONS] },
        { id:'uw', ag:true, t:'num', suf:'W/m²K', l:'Uw richiesto (finestra intera)' },
        { id:'comune', ag:true, una:true, t:'text', l:'Comune', h:'Per la zona climatica e la detrazione.' },
        { id:'telai', ag:true, una:true, l:'I vecchi telai', o:['Si tolgono','Si posa sopra',CONS] },
        { id:'cassonetto', ag:true, una:true, l:'Cassonetto', o:['Non c\'è','C\'è, da conservare','C\'è, da isolare o sostituire','Monoblocco nuovo',DUNNO] },
        { id:'soglia', ag:true, l:'Soglia porte-finestra', o:['Ribassata','Standard',CONS] },
        { id:'ferramenta', ag:true, l:'Ferramenta', o:['Standard','Antieffrazione',CONS] }
      ]},

      { k:'chiusure', n:'Tapparelle, persiane, zanzariere, inferiate, garage', u:'pezzi', ic:'chiusure', qty:'Quanti pezzi in tutto?',
        qtyItem:true, itemTxt:'Chiusura', qtyItemTxt:'Quanti con questa misura', addTxt:'Aggiungi un\'altra misura o prodotto', Q:[
        { id:'cosa', l:'Che cosa', o:['Tapparelle','Persiane','Zanzariere','Inferiate / grate','Porta da garage'], altro:true },
        { id:'misuraCh', t:'pair', l:'Misura (larghezza × altezza)', pair:[{id:'larg',l:'Larghezza',suf:'cm'},{id:'alt',l:'Altezza',suf:'cm'}] },
        { id:'motore', l:'Motorizzata?', o:['Sì','No',CONS], if:function(t){ return t.cosa==='Tapparelle' || t.cosa==='Porta da garage'; } },
        prodotto(),
        budget(['€ in tutto','€ a pezzo']),
        { id:'garageTipo', ag:true, l:'Porta garage: tipo', o:['Sezionale','Basculante','Avvolgibile',CONS], if:function(t){ return t.cosa==='Porta da garage'; } },
        { id:'classeInf', ag:true, l:'Classe antieffrazione', o:['Classe 2','Classe 3','Classe 4',DUNNO], if:function(t){ return t.cosa==='Inferiate / grate'; } },
        { id:'zanzTipo', ag:true, l:'Zanzariera', o:['A rullo verticale','Laterale','Plissé','Fissa',CONS], if:function(t){ return t.cosa==='Zanzariere'; } },
        { id:'matChius', ag:true, l:'Materiale', o:['Alluminio','PVC','Acciaio','Legno',CONS] },
        { id:'ral', ag:true, t:'text', l:'Colore RAL' }
      ]},

      /* ================= ARREDO BAGNO ====================================== */
      { k:'doccia', n:'Box doccia e cabine', u:'box', ic:'doccia', qty:'Quanti box doccia in tutto?',
        qtyItem:true, itemTxt:'Box doccia', qtyItemTxt:'Quanti box con questa misura', addTxt:'Aggiungi un\'altra misura', Q:[
        { id:'tipo', l:'Come è messa la doccia', h:'Nicchia = fra tre muri. Angolo = fra due. Walk-in = una parete sola.',
          o:['In nicchia','Ad angolo','Tre lati','Walk-in','Semicircolare',DUNNO] },
        { id:'piastrellato', una:true, l:'Il bagno è già piastrellato e il piatto posato?', h:'Le misure vanno prese sul bagno finito.', o:['Sì','No',DUNNO] },
        { id:'misura', l:'Misura del piatto', o:['70×90','80×80','80×100','80×120','90×90','90×120','100×100','Su misura',DUNNO] },
        { id:'misureSu', t:'pair', l:'Misura su misura', pair:[{id:'larg',l:'Larghezza',suf:'cm'},{id:'prof',l:'Profondità',suf:'cm'}],
          if:function(t){ return t.misura==='Su misura'; } },
        { id:'apertura', l:'Apertura', o:['Scorrevole','Battente','Fissa senza porta',CONS] },
        { id:'profilo', l:'Colore del profilo', o:['Cromato','Nero opaco','Oro spazzolato','Senza profilo',CONS], altro:true },
        { id:'piatto', l:'Serve anche il piatto?', o:['Sì, a filo pavimento','Sì, appoggiato','No, ce l\'ho',DUNNO] },
        prodotto(),
        budget(['€ a box','€ in tutto']),
        { id:'regolazione', ag:true, t:'pair', l:'Regolazione min–max necessaria', pair:[{id:'min',l:'Da',suf:'cm'},{id:'max',l:'A',suf:'cm'}] },
        { id:'altezza', ag:true, t:'num', suf:'cm', l:'Altezza del box' },
        { id:'cristallo', ag:true, l:'Cristallo', o:['6 mm','8 mm','10 mm (walk-in)',CONS] },
        { id:'reversibile', ag:true, l:'Lato', o:['Reversibile','Fisso a destra','Fisso a sinistra',DUNNO] },
        { id:'anticalcare', ag:true, l:'Anticalcare', o:['Sì','No',CONS] },
        { id:'piattoMat', ag:true, l:'Materiale del piatto', o:['Resina effetto pietra','Ceramica','Acrilico',CONS] },
        { id:'scarico', ag:true, l:'Scarico', o:['Al centro','Laterale',DUNNO] }
      ]},

      { k:'vasche', n:'Vasche da bagno', u:'vasche', ic:'vasche', qty:'Quante vasche in tutto?',
        qtyItem:true, itemTxt:'Vasca', qtyItemTxt:'Quante vasche con questa misura', addTxt:'Aggiungi un\'altra misura', Q:[
        { id:'tipo', l:'Che tipo', o:['Freestanding','Da incasso','Angolare','Rettangolare a muro',CONS] },
        { id:'idro', l:'Idromassaggio', o:['No, normale','Sì, getti d\'acqua','Sì, acqua + aria',CONS] },
        { id:'misura', l:'Misura', o:['160×70','170×70','170×75','180×80','Su misura',DUNNO] },
        { id:'misureSu', t:'pair', l:'Misura su misura', pair:[{id:'lung',l:'Lunghezza',suf:'cm'},{id:'larg',l:'Larghezza',suf:'cm'}],
          if:function(t){ return t.misura==='Su misura'; } },
        { id:'lato', l:'Lato (vista di fronte)', o:['Destra','Sinistra',DUNNO] },
        prodotto(),
        budget(['€ a vasca','€ in tutto']),
        { id:'materialeV', ag:true, l:'Materiale', o:['Acrilico','Resina / solid surface',CONS] },
        { id:'pannellatura', ag:true, l:'Pannellatura', o:['Pannello frontale','Frontale e laterale','Da murare e piastrellare',DUNNO] },
        { id:'solaio', ag:true, l:'Solaio (piena supera i 300 kg)', o:['Nessun problema','Da verificare',DUNNO] },
        { id:'rubinetto', ag:true, l:'Rubinetteria', o:['A bordo vasca','A pavimento','A muro','Ce l\'ha già',CONS] },
        { id:'presa', ag:true, l:'Presa elettrica per l\'idromassaggio', o:['C\'è','Da fare',DUNNO], if:function(t){ return t.idro && t.idro.indexOf('Sì')===0; } }
      ]},

      { k:'bagno', n:'Mobili da bagno', u:'mobili', ic:'bagno', qty:'Quanti mobili in tutto?',
        qtyItem:true, itemTxt:'Mobile bagno', qtyItemTxt:'Quanti mobili con questa larghezza', addTxt:'Aggiungi un\'altra larghezza', Q:[
        { id:'larghezza', uno:true, l:'Larghezza', o:['60 cm','70 cm','80 cm','90 cm','100 cm','120 cm (doppio lavabo)','Su misura',DUNNO] },
        { id:'larghezzaSu', t:'num', suf:'cm', l:'Larghezza su misura', if:function(t){ return t.larghezza==='Su misura'; } },
        { id:'tipo', l:'Sospeso o a terra?', o:['Sospeso','A terra',CONS] },
        { id:'lavabo', l:'Il lavabo', o:['Integrato nel piano','Da appoggio',CONS] },
        { id:'specchio', l:'Serve lo specchio?', o:['Sì, con luce','Sì, semplice','No',CONS] },
        { id:'colonne', l:'Pensili o colonne?', o:['Sì','No',CONS] },
        prodotto(),
        { id:'altro', una:true, l:'Serve anche', o:['Sanitari','Rubinetteria','Tutti e due','No, solo il mobile',VAL] },
        budget(['€ a mobile','€ in tutto']),
        { id:'profondita', ag:true, l:'Profondità', o:['Salvaspazio 35-40 cm','Standard 45-50 cm',CONS] },
        { id:'matMobile', ag:true, l:'Materiale', o:['Pietra ricostruita','Laccato','Legno','Idrofugo melaminico',CONS] },
        { id:'foroRub', ag:true, l:'Foro rubinetto', o:['1 foro','3 fori','Nessuno (rubinetto a muro)',DUNNO] },
        { id:'cassetti', ag:true, l:'Cassetti o ante', o:['Cassetti rallentati','Ante','Vano a giorno',CONS] },
        { id:'scarico', ag:true, una:true, l:'Scarico', o:['A parete','A pavimento',DUNNO] },
        { id:'montaggio', ag:true, l:'Consegna', o:['Montato','Da montare',CONS] }
      ]},

      /* ================= WELLNESS ========================================== */
      { k:'saune', itemTxt:'Sauna', n:'Saune e bagno turco', u:'posti', ic:'saune', qty:'Per quante persone?', Q:[
        { id:'tipo', l:'Che tipo', h:'Finlandese 70-100 °C; infrarossi 40-60 °C, si scalda in pochi minuti.',
          o:['Sauna finlandese','Sauna a infrarossi','Combinata','Bagno turco',CONS] },
        { id:'dove', l:'Dove va', o:['Dentro casa','All\'esterno',DUNNO] },
        { id:'spazio', t:'pair', l:'Spazio disponibile', pair:[{id:'larg',l:'Larghezza',suf:'cm'},{id:'prof',l:'Profondità',suf:'cm'}] },
        { id:'soffitto', t:'num', suf:'cm', l:'Altezza del soffitto' },
        prodotto(),
        budget(['€ in tutto']),
        { id:'corrente', ag:true, l:'Corrente', o:['230 V','400 V trifase',DUNNO] },
        { id:'kw', ag:true, t:'num', suf:'kW', l:'Potenza del contatore' },
        { id:'legno', ag:true, l:'Legno', o:['Abete','Hemlock','Cedro rosso','Termotrattato',CONS] },
        { id:'turcoTipo', ag:true, l:'Bagno turco', h:'In muratura serve un generatore più potente, scarico a pavimento e soffitto inclinato.', o:['Cabina pronta','Da costruire in muratura',DUNNO], if:function(t){ return t.tipo==='Bagno turco'; } },
        { id:'acqua', ag:true, l:'Acqua e scarico vicino (bagno turco)', o:['Sì','No',DUNNO], if:function(t){ return t.tipo==='Bagno turco'; } },
        { id:'montaggioS', ag:true, l:'Montaggio', o:['Nostro','Del cliente',CONS] }
      ]},

      /* Solo quelle del sito: minipiscine, jacuzzi, piscine fuori terra.
         Niente interrate: niente scavi, permessi o coperture (sono già incluse). */
      { k:'idro', itemTxt:'Minipiscina', n:'Minipiscine, jacuzzi e piscine', u:'pezzi', ic:'idro', qty:'Quante?', Q:[
        { id:'tipo', l:'Che cosa', o:['Minipiscina / jacuzzi rigida','Jacuzzi gonfiabile','Piscina fuori terra',CONS] },
        { id:'posti', t:'num', suf:'posti', l:'Per quante persone', if:function(t){ return t.tipo!=='Piscina fuori terra'; } },
        { id:'misure', t:'text', l:'Spazio disponibile', h:'Es. «4×3 metri in giardino».' },
        { id:'dove', l:'Dove va', h:'Su un terrazzo o dentro casa il peso va verificato: piena pesa molto.',
          o:['In giardino','Su terrazzo o balcone','Dentro casa',DUNNO] },
        { id:'base', l:'Su che base va', h:'Su prato o ghiaia non si può: serve una base piana e solida.', o:['Soletta in cemento','Pavimento esistente','Decking','Prato o ghiaia',DUNNO] },
        prodotto(),
        budget(['€ in tutto']),
        { id:'gru', ag:true, l:'Serve la gru?', o:['Sì','No','Da valutare'] },
        { id:'solaio', l:'Solaio verificato da un tecnico?', o:['Sì','No',DUNNO], if:function(t){ return t.dove==='Su terrazzo o balcone' || t.dove==='Dentro casa'; } },
        { id:'linea', ag:true, l:'Linea elettrica', o:['230 V 16 A','230 V 32 A dedicata','400 V trifase',DUNNO] },
        { id:'passaggio', ag:true, t:'num', suf:'cm', l:'Passaggio più stretto per la consegna' },
        { id:'allacci', ag:true, l:'Acqua e scarico vicino', o:['Sì','No',DUNNO] },
        { id:'coloreSpa', ag:true, l:'Colore', o:['Grigio','Bianco perla','Legno',CONS], altro:true }
      ]},

      /* ================= MATERASSI ========================================= */
      { k:'materassi', n:'Materassi', u:'pezzi', ic:'materassi', qty:'Quanti materassi in tutto?',
        qtyItem:true, itemTxt:'Materasso', qtyItemTxt:'Quanti materassi di questa misura',
        addTxt:'Aggiungi un\'altra misura', Q:[
        { id:'misura', uno:true, l:'Misura', o:['80×190','80×200','90×190','90×200','120×190','120×200','140×200','160×190','160×200','180×200','Su misura',DUNNO], altro:true },
        { id:'tipo', l:'Tipo', o:['Memory','Molle insacchettate','Lattice','Ibrido',CONS], altro:true },
        { id:'rigidita', l:'Rigidità', o:['Morbido','Medio','Rigido',CONS] },
        { id:'per', l:'Per chi', o:['Adulti','Bambini e ragazzi','Ospiti'] },
        prodotto(),
        { id:'posizione', una:true, l:'Come dormi di solito', o:['Di lato','A pancia in su','A pancia in giù','Un po\' di tutto',CONS] },
        { id:'medico', una:true, l:'Ti interessa un materasso dispositivo medico?',
          h:'Certificato CE classe I: si detrae al 19% con pagamento tracciabile.',
          o:['Sì, mi interessa','No','Spiegatemelo'] },
        { id:'cfDetrae', ag:true, una:true, t:'text', l:'Codice fiscale di chi detrae', h:'Serve in fattura per la detrazione del 19%.', if:function(t){ return t.medico==='Sì, mi interessa'; } },
        { id:'rete', l:'Serve anche la rete?', o:['Sì, fissa','Sì, motorizzata','No',DUNNO] },
        budget(['€ a materasso','€ in tutto']),
        { id:'altezzaMat', ag:true, l:'Altezza', o:['18-20 cm','22-25 cm','Oltre 25 cm',CONS] },
        { id:'sfoderabile', ag:true, l:'Sfoderabile', o:['Sì','Indifferente'] },
        { id:'guanciali', ag:true, t:'num', suf:'n.', l:'Guanciali' }
      ]},

      /* ================= ARREDO CASA ======================================= */
      { k:'divani', itemTxt:'Divano', n:'Divani e poltrone', u:'pezzi', ic:'divani', qty:'Quanti divani o poltrone?',
        addTxt:'Aggiungi un altro divano o poltrona', Q:[
        { id:'cosa', l:'Che cosa', o:['Divano','Divano letto','Poltrona','Poltrona relax','Pouf'], altro:true },
        { id:'posti', l:'Posti', o:['1','2','2 e mezzo','3','4','5 o più',DUNNO],
          if:function(t){ return t.cosa!=='Poltrona' && t.cosa!=='Poltrona relax' && t.cosa!=='Pouf'; } },
        { id:'forma', l:'Forma', o:['Lineare','Con penisola','Angolare','Modulare',CONS] },
        { id:'stile', l:'Stile', o:['Moderno','Chesterfield','Classico','Scandinavo','Industriale',CONS], altro:true },
        { id:'riv', l:'Rivestimento', o:['Tessuto','Tessuto Chesterfield (capitonné)','Pelle','Ecopelle','Velluto','Bouclé','Microfibra',CONS], altro:true },
        { id:'colore', l:'Colore', o:['Grigio','Beige / tortora','Bianco panna','Marrone / cuoio','Blu','Verde','Nero',CONS], altro:true },
        { id:'larghezza', l:'Larghezza massima disponibile', o:['Fino a 180 cm','180-220 cm','220-260 cm','260-300 cm','Oltre 300 cm','Su misura',DUNNO] },
        { id:'larghezzaSu', t:'num', suf:'cm', l:'Larghezza su misura', if:function(t){ return t.larghezza==='Su misura'; } },
        { id:'funzioni', l:'Funzioni', o:['Relax elettrico','Poggiatesta regolabili','Contenitore','Sfoderabile','Nessuna'] },
        prodotto(),
        budget(['€ a pezzo','€ in tutto']),
        { id:'penisola', ag:true, l:'Lato penisola (visto di fronte)', o:['Destra','Sinistra','Reversibile',DUNNO] },
        { id:'seduta', ag:true, l:'Profondità della seduta', o:['Standard 55-60 cm','Profonda 65 cm e oltre',CONS] },
        { id:'imbottitura', ag:true, l:'Imbottitura', o:['Poliuretano','Memory','Piuma','Molle insacchettate',CONS] },
        { id:'piedi', ag:true, l:'Piedini', o:['Legno','Metallo','Nascosti',CONS] },
        { id:'passaggioDiv', ag:true, t:'num', suf:'cm', l:'Passaggio più stretto per la consegna', h:'Porta, scala, ascensore.' }
      ]},

      { k:'camerette', itemTxt:'Cameretta', n:'Camerette', u:'camerette', ic:'camerette', qty:'Quante camerette?', Q:[
        { id:'letto', l:'Che letto', o:['Singoli','A castello','A soppalco','Scorrevole',CONS], altro:true },
        { id:'stanza', t:'pair', l:'Misure della stanza', pair:[{id:'larg',l:'Larghezza',suf:'cm'},{id:'lung',l:'Lunghezza',suf:'cm'}] },
        { id:'armadio', l:'Serve l\'armadio?', o:['Sì','No',DUNNO] },
        { id:'scrivania', l:'Serve la scrivania?', o:['Sì','No',DUNNO] },
        prodotto(),
        budget(['€ in tutto']),
        { id:'eta', ag:true, t:'text', l:'Età dei bambini', h:'Castello e soppalco: sopra solo dai 6 anni.' },
        { id:'soffitto', ag:true, t:'num', suf:'cm', l:'Altezza del soffitto' },
        { id:'materassoIncl', ag:true, l:'Materassi', o:['Inclusi','Li hanno già','Da aggiungere',CONS] },
        { id:'scaletta', ag:true, l:'Lato della scaletta', o:['Destra','Sinistra','Indifferente'] },
        { id:'coloreCam', ag:true, l:'Colore', o:['Bianco','Legno naturale','Colorato',CONS], altro:true }
      ]},

      { k:'arredo', itemTxt:'Arredo', n:'Letti, tavoli, sedie, armadi', u:'pezzi', ic:'arredo', qty:'Quanti pezzi?', Q:[
        { id:'cosa', l:'Che cosa', o:['Letto','Tavolo','Sedie','Poltrone','Armadio','Madia','Tavolini'], altro:true },
        { id:'spazio', t:'text', l:'Spazio o misure', h:'Es. «tavolo per 6, allungabile», «parete di 250 cm».' },
        { id:'stile', l:'Stile', o:['Moderno','Classico','Industriale','Scandinavo',CONS] },
        prodotto(),
        budget(['€ in tutto','€ a pezzo']),
        { id:'misuraLetto', ag:true, l:'Letto: misura', o:['80/90','120','160','180',DUNNO], if:function(t){ return t.cosa==='Letto'; } },
        { id:'contenitore', ag:true, l:'Letto: contenitore', o:['Sì','No',CONS], if:function(t){ return t.cosa==='Letto'; } },
        { id:'allungabile', ag:true, l:'Tavolo: allungabile', o:['Sì','No',CONS], if:function(t){ return t.cosa==='Tavolo'; } },
        { id:'piano', ag:true, l:'Tavolo: piano', o:['Vetro','Ceramica','Legno','Marmo',CONS], if:function(t){ return t.cosa==='Tavolo'; } },
        { id:'rivArredo', ag:true, l:'Materiale', o:['Tessuto','Pelle / ecopelle','Velluto','Legno','Metallo',CONS], altro:true },
        { id:'coloreArr', ag:true, t:'text', l:'Colore' }
      ]},

      /* ================= EDILIZIA, ACCESSORI, ALTRO ======================== */
      { k:'accessori', n:'Accessori per pavimenti: battiscopa, soglie, colle', u:'', ic:'accessori', noQty:true, multi:false, Q:[
        { id:'cosa', l:'Che cosa ti serve', o:['Battiscopa','Soglie e profili','Colle e vernici','Prodotti per la pulizia'], altro:true },
        { id:'ml', t:'num', suf:'metri lineari', l:'Quanti metri?', if:function(t){ return t.cosa==='Battiscopa' || t.cosa==='Soglie e profili'; } },
        { id:'abbinato', t:'text', l:'Da abbinare a che pavimento?' },
        budget(['€ in tutto'])
      ]},

      { k:'altro', n:'Edilizia e altro', u:'', ic:'altro', noQty:true, multi:false, Q:[
        { id:'cosa', l:'Di che cosa si tratta', o:['Ristrutturazione / edilizia','Fotovoltaico e batterie','Allarmi, telecamere, domotica','Gazebo e pergole','Giochi: biliardo, calcio balilla, Montessori','Pannelli 3D e rivestimenti murali'], altro:true },
        { id:'descrizione', t:'text', l:'Che cosa ti serve?', h:'Con parole tue: ci pensiamo noi.' },
        budget(['€ in tutto']),
        /* dalla vecchia «Scheda clienti edilizia» */
        { id:'mqCasa', ag:true, t:'num', suf:'m²', l:'Superficie dell\'appartamento', if:function(t){ return t.cosa==='Ristrutturazione / edilizia'; } },
        { id:'massettoEd', ag:true, l:'Massetto da rifare', o:['Sì, tutto','In parte','No',DUNNO], if:function(t){ return t.cosa==='Ristrutturazione / edilizia'; } },
        { id:'tramezzi', ag:true, t:'num', suf:'m²', l:'Tramezzi / muri da costruire', if:function(t){ return t.cosa==='Ristrutturazione / edilizia'; } },
        { id:'bagniEd', ag:true, t:'num', suf:'bagni', l:'Bagni da ristrutturare', if:function(t){ return t.cosa==='Ristrutturazione / edilizia'; } },
        { id:'impianti', ag:true, l:'Impianti', o:['Elettrico','Idraulico','Elettrico + idraulico','Domotica / antifurto','Nessuno'], if:function(t){ return t.cosa==='Ristrutturazione / edilizia'; } },
        { id:'certificazione', ag:true, l:'Certificazione degli impianti', o:['Sì','No',DUNNO], if:function(t){ return t.cosa==='Ristrutturazione / edilizia'; } },
        { id:'pratiche', ag:true, l:'Pratiche', o:['CILA','SCIA','Nessuna','Già fatte',DUNNO], if:function(t){ return t.cosa==='Ristrutturazione / edilizia'; } },
        { id:'kwp', ag:true, t:'num', suf:'kWp', l:'Potenza fotovoltaico', if:function(t){ return t.cosa==='Fotovoltaico e batterie'; } },
        { id:'kwh', ag:true, t:'num', suf:'kWh', l:'Batteria', if:function(t){ return t.cosa==='Fotovoltaico e batterie'; } },
        { id:'fase', ag:true, l:'Contatore', o:['Monofase','Trifase',DUNNO], if:function(t){ return t.cosa==='Fotovoltaico e batterie'; } }
      ]}
    ],

    /* --- avvisi che compaiono da soli ------------------------------------ */
    avvisi: [
      { k:'porte', when:function(t){ return t.tipo==='Scorrevole interno muro'; },
        html:'<b>Serve un muro di almeno 10 cm</b> per far scomparire l\'anta. Se è più sottile si va di scorrevole esterno muro.' },
      { k:'blind', when:function(t){ return t.apertura===DUNNO; },
        html:'<b>Nessun problema.</b> L\'apertura la rileviamo insieme al sopralluogo.' },
      { k:'porte', when:function(t){ return t.apertura===DUNNO; },
        html:'<b>Nessun problema.</b> L\'apertura la rileviamo insieme: una porta con la mano sbagliata non si può cambiare.' },
      { k:'ceramiche', when:function(t){ return t.dove==='Esterno' || t.dove==='Tutti e due'; },
        html:'Per fuori servono piastrelle <b>antiscivolo</b> e resistenti al gelo: è un\'altra gamma.' },
      { k:'esterni', when:function(t){ return t.piscina==='Sì'; },
        html:'A bordo piscina cloro e sale rovinano certi materiali: ti proponiamo solo quelli che reggono.' },
      { k:'doccia', when:function(t){ return t.piatto==='Sì, a filo pavimento'; },
        html:'Il piatto a filo pavimento vuole lo scarico nel posto giusto. Se non si può, si fa un piatto ultrasottile.' },
      { k:'idro', when:function(t){ return t.dove==='Su terrazzo o balcone' || t.dove==='Dentro casa'; },
        html:'<b>Prima di tutto il solaio.</b> Una minipiscina piena, con le persone dentro, arriva a circa <b>360 kg per m²</b>: serve la verifica di un tecnico.' },
      { k:'materassi', when:function(t){ return t.medico==='Spiegatemelo'; }, ok:true,
        html:'<b>In due righe:</b> alcuni materassi sono dispositivi medici CE di classe I. Si detraggono al <b>19%</b> pagando con carta o bonifico e con la dicitura giusta in fattura.' }
    ]
  };
})(window);

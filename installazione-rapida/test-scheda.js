/* =============================================================================
   Prova automatica della Scheda cliente e della Scheda agente (v1.9)
   Uso:  npm i playwright && npx playwright install chromium
         SCHEDA_CODICE=xxxx node test-scheda.js https://staging.parquet.disegnarecasa.com
         (il codice agente vero va nella variabile SCHEDA_CODICE, così non resta nella
          cronologia come argomento; mettere uno spazio davanti al comando lo esclude
          dalla cronologia in bash/zsh. Come secondo argomento funziona ancora.)
   ATTENZIONE: crea 2 schede di prova vere nello staging (e-mail test+...@example.com).
   Si può provare anche sul file di prova:  node test-scheda.js ./PROVA-scheda-cliente.html 1101
   ============================================================================= */
const { chromium } = require('playwright');
const path = require('path');
const base = process.argv[2], codice = process.env.SCHEDA_CODICE || process.argv[3] || '1101';
if (!base) { console.log('Uso: node test-scheda.js <url del sito o file PROVA> <codice agente>'); process.exit(1); }
const locale = !/^https?:/.test(base);
const url = (pagina, qs) => locale
  ? 'file://' + path.resolve(base) + (qs ? '?' + qs : '') + (pagina === 'agente' ? '#agente' : '')
  : base.replace(/\/$/, '') + '/scheda-' + pagina + '/' + (qs ? '?' + qs : '');
let ok = 0, ko = 0;
const check = (cond, msg) => { console.log((cond ? 'OK  ' : 'NO  ') + msg); cond ? ok++ : ko++; };

(async () => {
  const b = await chromium.launch();
  const errori = [];
  const nuova = async () => { const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errori.push(e.message)); return p; };

  // ---------- 1. Scheda cliente con gclid ----------
  let p = await nuova();
  await p.goto(url('cliente', 'gclid=TEST123'));
  check(await p.locator('#dc-scheda').count() === 1, 'Scheda cliente: modulo presente');
  check(await p.locator('[data-free="S|codiceAgente"]').count() === 0, 'Scheda cliente: nessun campo codice agente');
  await p.click('[data-toggle="pav"]'); await p.fill('[data-qty="pav"]', '60');
  await p.waitForTimeout(4500);                                    // l'antispam scarta gli invii sotto i 4 secondi
  await p.click('[data-next="2"]');
  await p.fill('#dcs-mail', 'test+cliente@example.com'); await p.fill('#dcs-tel', '347 000 0000');
  await p.click('[data-next="3"]'); await p.click('[data-invia]');
  await p.waitForSelector('.dcs-done', { timeout: 15000 });
  const dl = await p.evaluate(() => window.dataLayer || []);
  const ev = dl.find(e => e.event === 'dc_scheda_inviata');
  check(!!ev, 'Scheda cliente: evento dc_scheda_inviata nel dataLayer');
  check(ev && ev.user_data && ev.user_data.email === 'test+cliente@example.com', 'Scheda cliente: user_data.email');
  check(ev && ev.user_data && ev.user_data.phone_number === '+393470000000', 'Scheda cliente: user_data.phone_number in +39');
  check(ev && ev.gclid === 'TEST123', 'Scheda cliente: gclid TEST123 letto');
  if (!locale) check(ev && /^\d+$/.test(ev.lead_id || ''), 'Scheda cliente: lead_id (numero scheda) nel dataLayer per l\'Order ID');
  check(!p.url().includes('%40') && !p.url().includes('@'), 'Nessuna e-mail nell\'indirizzo della pagina');

  // ---------- 2. Scheda agente, codice sbagliato ----------
  p = await nuova();
  await p.goto(url('agente', 'gclid=TEST123'));
  check(await p.locator('[data-free="S|codiceAgente"]').count() === 1, 'Scheda agente: campo codice presente');
  const html = await p.content();
  check(!html.includes('= ' + codice + ' ='), 'Scheda agente: il codice non compare nel sorgente');
  await p.click('[data-toggle="blind"]'); await p.fill('[data-qty="blind"]', '2');
  await p.fill('[data-free="S|compilataDa"]', 'Prova automatica'); await p.fill('[data-free="S|codiceAgente"]', 'SBAGLIATO9');
  await p.waitForTimeout(4500);
  await p.click('[data-next="2"]'); await p.fill('#dcs-mail', 'test+agente@example.com');
  await p.click('[data-next="3"]'); await p.click('[data-invia]');
  await p.waitForSelector('[data-err]:not(.is-hidden)', { timeout: 15000 });
  check(/non riconosciuto/i.test(await p.locator('[data-err]').innerText()), 'Scheda agente: codice sbagliato RIFIUTATO');

  // ---------- 3. Scheda agente, codice giusto ----------
  await p.fill('[data-free="S|codiceAgente"]', codice);
  await p.click('[data-next="2"]'); await p.click('[data-next="3"]'); await p.click('[data-invia]');
  await p.waitForSelector('.dcs-done', { timeout: 15000 });
  check(/Scheda salvata/i.test(await p.locator('.dcs-done').innerText()), 'Scheda agente: salvata con il codice giusto');
  const dl2 = await p.evaluate(() => window.dataLayer || []);
  check(!dl2.some(e => e.event === 'dc_scheda_inviata'), 'Scheda agente: NESSUN evento per Google');

  check(errori.length === 0, 'Nessun errore JavaScript' + (errori.length ? ': ' + errori.join(' | ') : ''));
  console.log('\n' + ok + ' prove OK, ' + ko + ' da sistemare.' + (locale ? '' : '\nControlla in wp-admin > Schede cliente: la scheda cliente ha _dc_gclid = TEST123, quella agente no.'));
  await b.close(); process.exit(ko ? 1 : 0);
})();

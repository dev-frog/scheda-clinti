# Scheda cliente + Scheda agente — Complete Handover

| | |
|---|---|
| **Site** | parquet.disegnarecasa.com · WordPress + WooCommerce + Elementor |
| **Workstream** | J — Customer enquiry sheet |
| **Version** | **1.9 · 30 September 2026** (replaces 1.3 of 28 August) |
| **Replaces** | the form at `/scheda-clienti/` |
| **Go-live** | **staging first, never live** until Diego says so |

---

## 00 · What changed on 30 September (v1.9) — read this first

Diego reviewed the form product by product on 30/9. The big changes:

1. **Two pages, two buttons, same plugin.**
   - **`[scheda_cliente]`** → public page (the site's "Richiedi il preventivo" button and the thank-you flow). It **keeps the gclid** (and gbraid/wbraid, UTM) and fires the Google Ads conversion. **Only the e-mail is required.** Mobile and city are shown as *"altamente consigliato"* (red badge) but not required.
   - **`[scheda_agente]`** → internal page for our sales agents (a separate button, not in menus, `noindex` is added automatically). Agent name + **agent code are required** and the code is checked **on the server**: a wrong code → the sheet is **refused** (error, nothing saved, the agent's data stays in the browser draft). After 8 wrong codes in 15 minutes from one IP, 15-minute lock. **No gclid, no dataLayer event, ever.**
   - This replaces the v1.3 rule "wrong code → saved as Cliente": that rule existed only because customer and agent shared one page. With two pages a customer can never land on the agent page.
2. **Everything closed.** Step 1: families grouped in 12 **closed groups** (parquet first — it is 90% of sales). Step 3: every selected product is a **closed section**, opened on tap.
3. **Rows with quantities.** Only floors go in m². Doors, security doors, showers, bathtubs, bathroom furniture, mattresses, windows, shutters: total at step 1, then at step 3 one **row per size + opening + quantity**, with a counter ("Totale 8 · divise 5 · mancano 3"). Row header shows the choice ("Porta blindata 1 — 90 cm · Sinistra a spingere · 5 porte").
4. **Sizes always from a table** + "Su misura" that opens a free field (e.g. security doors 80/85/90/95/110 (80+30)/120 (90+30) × 200/205/210). Door opening is always "destra/sinistra **a spingere**".
5. **Multiple choice** on product questions (a customer asks several quotes: plancia + 3 strip, spazzolato + piallato). Stays single: yes/no questions and questions other questions depend on.
6. **Contact:** several channels at once (WhatsApp, phone, SMS, e-mail). **Dates with the phone's calendar** (ideal date, latest date). "Hai già parlato con qualcuno di noi?" defaults to **"No, è il primo contatto"**.
7. **Budget** = free number + unit (€/m², € in tutto, € a porta…).
8. **New section for the predictive lead** (Diego's "Valore Predittivo Lead Qualificato", computed in the management software from 10 years of quotes/invoices). Customer: how they found us, project stage, reason for the work, rooms, showroom visited, samples received, who the work is for, tax bonus. Agent only: first-contact date, contact type, what the quote comes from, sales point, new/returning, VAT regime, competitors and their price (number), total budget, who decides, **agent's impression**, **interest score 1–10**, quote-sent date. Saved as `_dc_profilo` and printed in the mail under "CLIENTE E LEAD PREDITTIVO".
9. **Agent reminder** ("promemoria"): what to send the customer (photos, videos, samples, data sheet, price list), of which products, via WhatsApp/e-mail → first line of the salesperson's mail (`>> PROMEMORIA: …`).
10. **Enhanced conversions for leads:** the `dc_scheda_inviata` push now includes `user_data.email` (lower-case) and `user_data.phone_number` (+39…) in clear text — Google hashes them. Never put them in a URL.
11. **Dark-mode bug fixed:** on phones in dark mode the product names were white on white. Colours are now fixed and the form is always light (`color-scheme: light`).
12. **Elementor:** `dc_scheda_ha_shortcode()` now also looks inside `_elementor_data`, so assets load and `noindex` works when the shortcode is in an Elementor widget.

**Try both before touching code** (private links, ask Diego to share them): the "Scheda cliente" and "Scheda agente" artifacts on claude.ai, or double-click `PROVA-scheda-cliente.html` (top buttons switch cliente/agente; demo agent codes 1101–1111).

**Plugin choice.** This package is the plugin `dc-scheda-cliente` v1.9 (vanilla JS, no build). If you prefer to keep your React plugin `scheda-clienti` (github.com/dev-frog/scheda-clinti), port **everything** in this document — above all the questions exactly as in `dc-scheda-config.js`, the two shortcodes and the server-side rules — and tell Diego before starting. Either way the questions live in one editable config, never hard-coded.

## 0 · The tasks

Everything is written and tested. You install, configure and wire.

| # | Task | Where | Time |
|---|---|---|---|
| 1 | Copy the plugin folder, activate it | `wp-content/plugins/` | 5 min |
| 2 | Page **Scheda cliente**: `[scheda_cliente]`, linked from the "Richiedi preventivo" buttons | Elementor Shortcode widget | 10 min |
| 3 | Page **Scheda agente**: `[scheda_agente]`, not in menus/sitemap, separate button for staff | Elementor Shortcode widget | 10 min |
| 4 | Fill in **Schede cliente → Persone** (names, **real codes from Diego**, e-mails) | wp-admin | 10 min |
| 5 | GTM: trigger on `dc_scheda_inviata` with `fatta_da = Cliente`, Google Ads conversion + **enhanced conversions** from `user_data` | GTM-NXFPPJN | 30 min |
| 6 | Exclude the Scheda agente page from every conversion trigger | GTM | 5 min |

Then run the acceptance list in §12 and tell Diego it is on staging.

**Shortcut: the folder `installazione-rapida/`** does tasks 1–4 with one WP-CLI script, task 5–6 with a GTM import file, and the main acceptance checks with an automatic test (13 checks). Start from `installazione-rapida/00-READ-ME-FIRST.md`.

---

## 1 · What this is

A three-step enquiry form that produces a sheet a salesperson can act on
**without making a phone call first**. Twenty product families (v1.9), each with its
own questions, and only the ones the customer actually picked ever appear.

```
Step 1  ·  What do you need, and how much of it   (20 families in 12 closed groups)
Step 2  ·  Who you are                            (e-mail is the only required field)
Step 3  ·  The details                            (per-family questions, photo, notes)
```

It ships as a WordPress plugin with a shortcode, so it drops into the existing
page including Elementor's Shortcode widget, which is what this site uses.

```
[scheda_cliente]
```

**Four files, 2,100 lines, no dependencies.** No jQuery, no framework, no build
step, no npm. Vanilla ES5-compatible JS and inline SVG. Nothing to compile,
nothing to keep updated.

---

## 2 · What is on the page today, and why we replace it

I could read the **live** page but not staging (staging is `robots.txt`
disallowed). Live `/scheda-clienti/` runs:

- **Elementor** as page builder (`elementor-action` markers in the source)
- a **`[mailup_form]`** shortcode — the current form is MailUp
- **Google Tag Manager `GTM-NXFPPJN`**, plus a first-party measurement domain
  at `load.measure.disegnarecasa.com`

The version in Diego's screenshots is something newer on staging. If you want
to know what it is: open the staging page, `Ctrl+U`, look at where the
`<script src>` lines point. `/wp-content/plugins/<name>/` names a plugin; a
single hashed `main.[hash].js` means a React or Vue bundle.

**Recommendation: replace, do not extend.** Not because the current one is bad,
but because this form has to grow — twenty families, conditional questions, a
config file Diego edits himself. That is a lot to bolt onto something built for
a different shape. And since it is a shortcode, you can put both on the same
page and compare before switching.

---

## 3 · Install

### 3.1 The files

```
wp-content/plugins/dc-scheda-cliente/
├── dc-scheda-cliente.php       752 lines · CPT, AJAX, mail, admin, settings
└── assets/
    ├── dc-scheda.css           230 lines · all scoped under #dc-scheda
    ├── dc-scheda-config.js     370 lines · ← THE QUESTIONS. Diego's file.
    └── dc-scheda.js            760 lines · the engine. Do not edit for text.
```

### 3.2 The steps

```bash
# on staging
cd wp-content/plugins/
# copy the dc-scheda-cliente/ folder here, then:
wp plugin activate dc-scheda-cliente
```

Then edit the page `/scheda-clienti/` in Elementor, drop in a **Shortcode**
widget, and put `[scheda_cliente]` in it. Nothing else.

### 3.3 Assets load only where they are needed

```php
function dc_scheda_assets() {
	global $post;
	if ( ! $post || ! has_shortcode( $post->post_content, 'scheda_cliente' ) ) { return; }
	// … enqueue …
}
add_action( 'wp_enqueue_scripts', 'dc_scheda_assets' );
```

This site is slow and nothing should be added to pages that do not need it.
**Do not move these to a global enqueue** — that is the single easiest way to
make the whole site 60 KB heavier for no reason.

⚠️ **Elementor caveat:** `has_shortcode()` reads `$post->post_content`. When a
page is built in Elementor the shortcode lives in `_elementor_data`, not in
`post_content`. If the assets do not load, that is why. The fix:

```php
if ( ! $post ) { return; }
$in_content = has_shortcode( $post->post_content, 'scheda_cliente' );
$in_builder = false !== strpos(
	(string) get_post_meta( $post->ID, '_elementor_data', true ), 'scheda_cliente' );
if ( ! $in_content && ! $in_builder ) { return; }
```

Add that only if you actually see the problem — test first.

---

## 4 · The people: one table, three jobs

**This is the part Diego cares about most, so get it right.**

There is exactly **one** list of staff, at **Schede cliente → Persone**, and
three separate things read from it:

1. the **"Scheda per"** dropdown the customer sees in the form
2. the **agent code check** when somebody says "I am an agent"
3. the **e-mail address** the sheet gets forwarded to

One table means they cannot drift apart. There is no second list anywhere —
`CFG.agenti` in the config file is only a fallback for the offline prototype and
is ignored on WordPress.

### 4.1 The format

```
Nome = codice = email
```

### 4.2 The eleven people, with starter codes

Paste this into the Persone box. **The codes are placeholders — Diego changes
them before go-live** and fills in the e-mails.

```
Serena     = 1101 = serena@disegnarecasa.com
Alex       = 1102 = alex@disegnarecasa.com
Giselle    = 1103 = giselle@disegnarecasa.com
Iri        = 1104 = iri@disegnarecasa.com
Diego S    = 1105 = diegos@disegnarecasa.com
Diego J    = 1106 = diegoj@disegnarecasa.com
Rosaria    = 1107 = rosaria@disegnarecasa.com
Aldrin     = 1108 = aldrin@disegnarecasa.com
Ferdinando = 1109 = ferdinando@disegnarecasa.com
Ferrari    = 1110 = ferrari@disegnarecasa.com
Aldo       = 1111 = aldo@disegnarecasa.com
```

The plugin ships with the same eleven names and codes but **empty e-mails**
(`DC_SCHEDA_PERSONE_INIZIALI`), so it is safe to activate before Diego has
decided the addresses. A person with no e-mail is not broken: their sheets go to
the general inbox and nothing is lost. The settings page prints a table showing
exactly who is missing what.

Note **"Diego S" and "Diego J" are two different people.** Do not merge them, do
not "fix" the spelling. Same for "Ferrari", which is how they refer to him.

### 4.3 The API

```php
dc_scheda_persone()             // [ ['nome'=>…, 'codice'=>…, 'email'=>…], … ]
dc_scheda_nomi()                // ['Il primo disponibile', 'Serena', …] → the dropdown
dc_scheda_agente_da_codice($c)  // 'Serena' or '' — hash_equals, no timing leak
dc_scheda_email_di($nome)       // 'serena@…' or ''
dc_scheda_casella_generale()    // the catch-all; falls back to admin_email
```

The names reach the browser through `wp_localize_script`:

```php
wp_localize_script( 'dc-scheda', 'DC_SCHEDA_WP', array(
	'ajax'   => admin_url( 'admin-ajax.php' ),
	'nonce'  => wp_create_nonce( 'dc_scheda' ),
	'utente' => dc_scheda_utente(),
	'agenti' => dc_scheda_nomi(),
) );
```

and the engine prefers them over the config file:

```js
function agenti() {
  return (WP && WP.agenti && WP.agenti.length) ? WP.agenti : CFG.agenti;
}
```

### 4.4 Where each sheet is sent

Three possible recipients, and **no step can make a sheet disappear**:

```php
$a = array( dc_scheda_casella_generale() );      // 3 · always, the safety net

$diretta = dc_scheda_email_di( $per );           // 1 · "Scheda per"
if ( $diretta ) { $a[] = $diretta; }

$compilata = get_post_meta( $id, '_dc_agente_codice', true );
if ( $compilata && $compilata !== $per ) {       // 2 · the agent who filled it in
	$e = dc_scheda_email_di( $compilata );
	if ( $e ) { $a[] = $e; }
}

$a = array_values( array_unique( array_filter( $a, 'is_email' ) ) );
$a = apply_filters( 'dc_scheda_destinatari', $a, $id, $per );
```

The general inbox receives **a copy of everything**, including sheets already
routed to a person. That is deliberate: somebody on holiday, or a missing
address, must never mean a request sits unanswered.

The subject line carries the routing so it can be filtered in Outlook or Gmail:

```
[DAL SITO]   Scheda #412 — Pavimenti in legno, 95 m² · per Serena
[DA AGENTE]  Scheda #413 — Porte interne, 5 porte · per Rosaria
[DAL SITO]   Scheda #414 — Materassi, 2 pezzi · da assegnare
```

`Reply-To` is set to the **customer's** address, so hitting reply writes to the
customer, not to WordPress.

> **A note for Diego, in the docs on purpose:** a per-person redirect is only as
> good as the person's presence. The general-inbox copy is what makes it safe.
> Do not remove it to "reduce noise" — use a mail-client filter instead.

---

## 5 · The rule the whole thing is built around (v1.9)

> **The Scheda cliente always carries the gclid. The Scheda agente never does,
> and cannot be sent without a valid agent code.**

The `gclid` lets us upload **offline conversions** later (Lead Qualificato with the predictive value, Lead Convertito with the invoice) and teach Google which clicks became money. An agent sheet carrying the office browser's gclid would teach Google the opposite.

### 5.1 Why a code and not a login

An agent at a customer's house, on a phone, is not logged into WordPress. So the agent page asks for **name + short code** (from **Schede cliente → Persone**). The code is not a password; it protects data quality. It must **never appear in the page source**.

### 5.2 The decision is server-side. All of it.

The page mode comes from the **shortcode** (`data-modo="agente"` on `#dc-scheda`), never from a URL parameter. The browser sends `modo`; the server decides:

```php
$modo = ( 'agente' === ( $d['modo'] ?? '' ) ) ? 'agente' : 'cliente';
if ( 'cliente' === $modo ) { $d['fatta_da'] = 'Cliente'; }   // the public page cannot declare itself agent
if ( 'agente' === $modo ) {
	// 8 wrong codes / 15 min / IP → wp_send_json_error('troppi')
	if ( '' === $agente_pre || '' === trim( $d['compilata_da'] ?? '' ) ) {
		wp_send_json_error( 'codice' );          // refused, nothing saved
	}
	$d['fatta_da'] = 'Agente';
}
// provenance / gclid saved ONLY when fatta_da = Cliente
```

| Page | Saved as | `_dc_gclid` | dataLayer |
|---|---|---|---|
| Scheda cliente | `Cliente` | kept | `dc_scheda_inviata` + `user_data` |
| Scheda agente + valid code | `Agente` | **never** (the browser does not even send it) | silent |
| Scheda agente + wrong/empty code | **refused** (`codice`) | — | — |

### 5.3 The GTM event follows the server's answer

```js
fetch(WP.ajax, { method:'POST', body: fd, credentials:'same-origin' })
  .then(function (r) { return r.json(); })
  .then(function (r) {
    if (r && r.success) {
      evento(dati, (r.data && r.data.fatta_da) || 'Cliente');   // ← server's word
      fine(dati, false, r.data && r.data.numero);
    }
  });

function evento(dati, fattaDa) {
  if (fattaDa !== 'Cliente') { return; }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'dc_scheda_inviata',
    fatta_da: 'Cliente',
    lead_id: '412',                                  // sheet number → conversion Order ID (§13b)
    user_data: {                                     // v1.9 · enhanced conversions for leads
      email: 'mario.rossi@gmail.com',                // trimmed, lower-case
      phone_number: '+393471234567'                  // E.164
    },
    famiglie: dati.prodotti.map(function (p) { return p.famiglia; }).join(' | '),
    gclid: (PROVENIENZA.gclid || '')
  });
}
```

Nothing is pushed before the response comes back. **This is a change from
version 1.0** — do not "optimise" it back to firing on click.

**It must never depend on a URL parameter.** A `?agente=1` link ends up in a
WhatsApp group, a customer opens it, and a real lead's `gclid` is gone.

### 5.4 Capturing the gclid

Read **on arrival**, not on submit — people look at a floor today and write
three weeks later — and kept in a first-party cookie for 90 days. `wbraid` and
`gbraid` are captured too: they replace the `gclid` on iOS, and without them a
slice of Google traffic looks "direct".

### 5.5 The GTM wiring (task 4)

In **GTM-NXFPPJN**:

1. **Trigger** — Custom Event, event name `dc_scheda_inviata`,
   with condition `fatta_da` **equals** `Cliente`.
   (Create a Data Layer Variable `fatta_da` first.)
2. **Tag** — Google Ads Conversion Tracking, fired on that trigger, with **"Include user-provided data"** on and a *User-Provided Data* variable reading `user_data.email` and `user_data.phone_number` (Data Layer Variables).
3. Nothing in the theme. No `gtag` in the form.
4. The Scheda agente page must be **excluded** from every Google Ads / GA4 conversion trigger (it never pushes the event, but page-view based triggers could still fire).

The decision stays in GTM where the marketing side can see it, not buried in a
PHP file. Sheets from a verified agent never fire the event at all, so they can
never be counted.

### 5.6 Closing the loop

**Schede → Esporta conversioni** produces the CSV Google Ads wants: only
`Cliente` sheets, with a `gclid`, in state **Chiusa**. The euro value is left
blank on purpose — that is the amount actually invoiced, and only Diego knows
it.

---

## 6 · Anti-spam: four invisible checks, no CAPTCHA

`dc_scheda_e_spam( $d, $agente )` runs **before anything is written** and
returns a reason string to drop, or `false`.

```php
function dc_scheda_e_spam( $d, $agente = '' ) {

	// 1 · the trap
	if ( ! empty( $d['trappola'] ) ) { return 'trappola'; }

	// 2 · the clock — skipped when a saved draft was restored
	$secondi = (int) ( $d['secondi'] ?? 0 );
	if ( empty( $d['bozza'] ) && $secondi > 0 && $secondi < 4 ) {
		return 'troppo veloce (' . $secondi . 's)';
	}

	// 3 · the note
	$note = (string) ( $d['note'] ?? '' );
	if ( preg_match_all( '#https?://|www\.#i', $note ) >= 2 ) { return 'link nelle note'; }
	if ( preg_match( '/\p{Cyrillic}/u', $note ) ) { return 'alfabeto cirillico'; }

	// 4 · the rate — verified agents are exempt
	if ( '' === $agente ) {
		$chiave = 'dc_scheda_ip_' . md5( dc_scheda_ip() );
		$n      = (int) get_transient( $chiave );
		if ( $n >= 5 ) { return 'troppe richieste dallo stesso indirizzo'; }
		set_transient( $chiave, $n + 1, 10 * MINUTE_IN_SECONDS );
	}

	return apply_filters( 'dc_scheda_spam', false, $d );
}
```

| # | Check | Why it is shaped that way |
|---|---|---|
| 1 | **Honeypot** — off-screen `input[name=dc_sito_web]`, `tabindex="-1"`, wrapper `aria-hidden` | A human never sees it and cannot Tab into it. Form-filling bots fill every field they find. |
| 2 | **Time trap** — under 4 s | **Skipped when `bozza` is set.** A visitor who restored a draft can legitimately hit send in two seconds, and must not be lost. |
| 3 | **Content** — 2+ URLs, or Cyrillic | The note describes a floor. It has no use for links. |
| 4 | **Rate** — 5 per 10 min per IP | **Skipped for a verified agent code:** a sales office is one IP and five sheets in an afternoon is normal. |

Note the **ordering** in the AJAX handler: the agent code is resolved *before*
the spam gate, precisely so check 4 can be skipped.

```php
// the page mode (shortcode) decides, never the declared fatta_da — see §5.2
$agente_pre = ( 'agente' === $modo )
	? dc_scheda_agente_da_codice( sanitize_text_field( $d['codice_agente'] ?? '' ) ) : '';

$spam = dc_scheda_e_spam( $d, $agente_pre );
if ( $spam ) {
	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) { error_log( 'dc-scheda: scartata — ' . $spam ); }
	wp_send_json_success( array( 'numero' => 0, 'fatta_da' => 'Agente' ) );
}
```

A dropped submission gets **`wp_send_json_success`**. A bot told it failed just
retries by another route; one that thinks it won goes away. Reasons go to
`error_log` under `WP_DEBUG` only — never to the response.

**No CAPTCHA, deliberately.** A CAPTCHA taxes every real visitor to stop a few
bots, and reCAPTCHA additionally loads Google tracking onto a page full of
personal data. If spam does get through, the hook is already there:

```php
add_filter( 'dc_scheda_spam', function ( $motivo, $d ) {
	if ( $motivo ) { return $motivo; }                       // already dropped
	return turnstile_ok( $d['turnstile'] ?? '' ) ? false : 'turnstile';
}, 10, 2 );
```

**Watch `WP_DEBUG` for a week after launch** and see what is actually being
dropped before adding anything heavier.

---

## 7 · Nothing blocks except the e-mail

Diego is explicit and this is not negotiable: a customer must be able to leave
everything blank and still send.

```js
function validaAvanti() {
  var c = ROOT.querySelector('[data-next="3"]');
  if (c) { c.disabled = !mailOk(); }
}
```

That is the whole gate. Specifically:

- **Only `email` is required.** One asterisk on the whole form.
- **Step 1 does not require a family.** Somebody who does not know where to
  start goes through and writes it in the notes; a hint tells them so.
- **Every chip question has an escape**: `DUNNO` (*Non lo so*), `CONS`
  (*Consigliatemi voi*), `VAL` (*Da valutare, dipende dal prezzo* — on
  portering, on installation, on accessories). These are answers, not gaps: they
  tell the salesperson to ask.
- **A red callout** (`.dcs-solo`, brand red `#d80612`) sits at the top of steps
  1 and 2 saying only the e-mail is required.
- **A soft hint** under the phone field — *"se ce lo lasci ti richiamiamo noi"* —
  invites without demanding.
- **The floor number is a free field**, not a dropdown: it can be the eleventh.

The only other block is the agent code, and the message names the way out:

```js
if (S.fattaDa === 'Agente' &&
    (!String(S.compilataDa||'').trim() || !String(S.codiceAgente||'').trim())) {
  S.passo = 1; disegna(false);
  errore('Hai segnato che la compila un agente: servono il nome e il codice. ' +
         'Se non hai un codice scegli «Il cliente»: la scheda arriva lo stesso.');
  return;
}
```

⚠️ Note the order: `disegna()` **first**, then `errore()`. Reversing it wipes
the message, because `disegna()` re-renders the container. This was an actual
bug; do not undo the fix.

**Do not add required fields.** Every one of them is people who stop.
Conversion drops from about 17% at five fields to about 11% at seven.

---

## 8 · Contact preference, days, and the meeting

Four questions, chosen carefully. Diego asked *"what can we add without
overdoing it?"* — these four are the answer, and §8.3 is what was left out.

### 8.1 Step 2, after the contact fields

| Field | Type | Meta |
|---|---|---|
| *Come preferisci essere contattato* | **multi-select** chips — WhatsApp / Telefonata / SMS / E-mail (v1.9); only E-mail = sent as `Solo e-mail` | `_dc_canale` |
| *In che fascia oraria* | chips | `_dc_richiamo` |
| *In che giorni* | **multi-select** chips, Lun–Sab | `_dc_giorni` (array) |

The last two render **only when the channel is not "Solo e-mail"**, and the
payload blanks them in that case too — so a "do not call me" preference cannot
be contradicted by a stale value:

```js
richiamo: S.canale === 'Solo e-mail' ? '' : S.richiamo,
giorni:   S.canale === 'Solo e-mail' ? [] : (S.giorni || []),
```

`scelteMulte()` is a new helper next to `scelte()`: same markup, `data-multi`
instead of `data-set`, toggling into an array on `S`.

```js
function scelteMulte(id, lista) {
  var att = S[id] || [];
  return '<div class="dcs-opts" role="group">' + lista.map(function (o) {
    var acceso = att.indexOf(o) > -1;
    return '<button type="button" class="dcs-opt' + (acceso ? ' is-on' : '') +
           '" data-multi="' + id + '" data-val="' + esc(o) + '" aria-pressed="' + acceso + '">' + o + '</button>';
  }).join('') + '</div>';
}
```

### 8.2 Step 3, before the notes

| Field | Type | Meta |
|---|---|---|
| *Vuoi vedere i prodotti e parlare con un agente?* | chips — videochiamata / showroom / no | `_dc_incontro` |
| *Hai un codice prodotto o un nome?* | free text | `_dc_codice_prod` |

Answering yes shows a green note saying **we** will propose two or three slots.

All of it goes to the **top** of the salesperson e-mail, above the products:

```
>> CONTATTALO VIA WHATSAPP  —  Di pomeriggio, Mar / Gio
   Appuntamento: Sì, in videochiamata
   Ha in mente: 3S-ROV-NAT
```

and "Solo e-mail" additionally prints *"Ha chiesto di NON essere chiamato."*

The confirmation screen plays the choice back in the customer's own terms —
*"Ti scriviamo su WhatsApp martedì o giovedì dopo le 18."* — via `promessa()`,
which expands the short day chips to full Italian day names.

### 8.3 What was deliberately left out

- **A date/time picker.** That needs agent availability, Google Calendar sync
  and cancellations. On a quote form it is an obstacle, and whoever meets it
  leaves. The days the customer ticked are enough for a human to propose a time.
- **An exact hour.** "Di pomeriggio" is enough to organise a phone call and
  nobody ends up feeling late.
- **A second phone number, or a separate marketing consent checkbox.** Nobody
  uses the first; the second belongs in the privacy policy, not in the form.

---

## 9 · The families (v1.9: 20 families in 12 closed groups)

Order of the groups (Diego's order): Parquet in legno · Porte interne · Porte blindate · Decking da esterno (WPC e legno) · Parquet finto legno (SPC, LVT, laminati) · Pavimenti in ceramica · Arredo bagno (docce, vasche, mobili) · Wellness (saune, bagno turco, minipiscine e jacuzzi) · Materassi · Infissi, tapparelle, zanzariere, garage · Arredo casa (divani e poltrone, camerette, letti, tavoli) · Edilizia, accessori e altro.

The full list of questions, options and who sees them (all / agent only) is in **`ELENCO DOMANDE scheda cliente e agente - 30-9-2026.md`** in this folder, generated from the config. The config file is the source of truth.

Catalogue facts Diego gave on 30/9 (do not "correct" them):
- Parquet types: massello tradizionale, prefinito, massello prefinito, massello bamboo.
- Wood grades (agent): AB Top Excelsior, ABC Top Esclusive, ABCD Select, ABCD Standard, BCD Natura, CD Rustica, CDE Extra Rustica. Customer sees: senza nodi / nodi piccoli / nodi anche grandi / rustica nodata.
- Skirting proposed automatically = m² + 10% waste; the agent can change it.
- Security doors: new doors only, 1 or 2 cylinders or combined with electronic lock; external panel also in fibreglass (vetroresina); building-imposed colour asked.
- Pools: only above-ground pools, minipools and hot tubs from the site (no in-ground, no permits, covers included).

### 9.1 Common questions now know the context

`if:` on a common question receives a **second argument**: the selected families.

```js
var DA_POSARE = ['pav','lvt','esterni','ceramiche','porte','blind','infissi',
                 'bagno','doccia','piscine','idro','accessori','altro'];

{ id:'posa', l:'Serve la posa?', …,
  if:function(t, sel){ return DA_POSARE.some(function(k){ return sel && sel[k]; }); } }
```

So *"Serve la posa?"* no longer appears to somebody asking only about a mattress
or a sofa. Both `domanda()` and the payload builder pass `S.sel`.

### 9.2 The technical warnings

Some answers trigger a note *before* the sheet is even sent — the screed under a
month old, the 1.7% moisture limit on cementitious screed with underfloor
heating, 0.2% on anhydrite, the flush shower tray needing the drain in the right
place. They live in `CFG.avvisi` and are matched by family plus a `when()`
predicate. **Check the numbers still render correctly** — they are the kind of
thing that silently breaks and nobody notices for a month.

---

## 10 · Where the questions live

`assets/dc-scheda-config.js`, and **only** there. Diego edits labels, options and whole families without touching logic and without a deployment.

| Key | Meaning |
|---|---|
| chips (default) | `{ id, l, o:[…] }` — multi-select on product questions, single on yes/no and on questions others depend on |
| `t:'num'` · `t:'text'` · `t:'date'` | number with `suf`, free text, phone calendar |
| `t:'pair'` · `t:'grid'` | two / several numbers side by side |
| `t:'money'` | free amount + unit chips (`u:['€/m²','€ in tutto']`) |
| `altro:true` | adds "Altro…" opening a free field |
| `if:` | conditional, receives `(store, sel)` |
| `ag:true` / `cl:true` | only on the agent page / only on the customer page |
| `una:true` | asked once per family even with several rows |
| `uno:true` · `multi:true` | force single / multiple choice |
| `def:fn` | automatic proposed value (e.g. skirting from m²) |
| family `qtyItem:true`, `itemTxt`, `qtyItemTxt`, `addTxt` | rows with their own quantity |
| `gruppi` | the closed groups of step 1, in order |
| `profilo` | the predictive-lead section |

**Do not move question text into PHP or into the engine.**

## 11 · What the salesperson gets

A **plain-text e-mail**, laid out as lines and not as a table (tables break in
half the mail clients Italian sales teams actually use), plus the same sheet
inside wp-admin under **Schede cliente**, with:

- a **Stato** taxonomy: Nuova · Richiamata · Preventivo mandato · Chiusa · Persa
- a filter **Dal sito / Da agente** — that is the number that matters when you
  look at what Google actually brought
- columns for origin, what was asked with quantities, contacts, and who the
  sheet is for
- a red flag on sheets where an agent was declared with an unrecognised code

An inbox loses requests; a list with a state does not.

### 11.1 The meta keys, in full

| Key | Contents |
|---|---|
| `_dc_fatta_da` | `Cliente` or `Agente` — **as registered**, not as declared |
| `_dc_compilata_da` | the name typed in the form |
| `_dc_agente_codice` | the name **resolved from the code** — trust this one |
| `_dc_codice_errato` | `1` when an agent was declared with a bad code |
| `_dc_utente_connesso` | who was logged in, if anyone |
| `_dc_scheda_per` | the person chosen in the dropdown |
| `_dc_email` `_dc_nome` `_dc_telefono` `_dc_citta` | contacts |
| `_dc_canale` `_dc_richiamo` `_dc_giorni` | how and when to contact |
| `_dc_incontro` `_dc_codice_prod` | meeting, product they have in mind |
| `_dc_tipo_cliente` | privato / impresa / architetto |
| `_dc_prodotti` `_dc_consegna` | the answers, nested arrays |
| `_dc_note` `_dc_foto` `_dc_pagina` | notes, attachment ID, source page |
| `_dc_provenienza` `_dc_gclid` | **Cliente sheets only** |
| `_dc_profilo` | v1.9 · predictive-lead answers (label → value) |
| `_dc_promemoria` | v1.9 · what the agent must send the customer |

---

## 12 · Acceptance criteria

Run all of these on staging before telling Diego it is ready.

**Install**

- [ ] `[scheda_cliente]` **and** `[scheda_agente]` render inside Elementor Shortcode widgets
- [ ] The agent page has `noindex, nofollow` and is not in menus or the sitemap
- [ ] CSS and JS load **only** on pages containing the shortcode
- [ ] Nothing collides: all styles scoped under `#dc-scheda`, all classes `dcs-`
- [ ] The form looks identical whether you are logged in or not

**People and routing**

- [ ] All eleven names appear in the "Scheda per" dropdown, from the DB not the config
- [ ] The settings table flags who is missing a code or an e-mail
- [ ] Sheet "per Serena" reaches Serena's address **and** the general inbox
- [ ] A person with no e-mail → the sheet still reaches the general inbox
- [ ] An agent-filled sheet also reaches the filling agent
- [ ] `Reply-To` is the **customer's** address
- [ ] The subject reads `· per <Nome>` or `· da assegnare`

**Origin and gclid — check the post meta, not the payload**

- [ ] `?gclid=TEST123`, *Il cliente* → `Cliente`, `_dc_gclid` = TEST123
- [ ] Scheda agente with `?gclid=TEST123`, code `1101` → `Agente`, **no** `_dc_gclid`, `_dc_agente_codice` = `Serena`
- [ ] Scheda agente, code `9999` → **refused** with the red message, **no post created**, form data still there
- [ ] 9 wrong codes in a row → "Troppi codici sbagliati", locked 15 min
- [ ] `dataLayer` gets `dc_scheda_inviata` **with `user_data.email` and `user_data.phone_number`** only from the Scheda cliente; nothing from the Scheda agente
- [ ] The event fires **only after** the AJAX response, never before
- [ ] A forged `POST` to the customer page with `fatta_da=Agente` → saved as `Cliente`
- [ ] The agent code never appears in the page source

**Anti-spam**

- [ ] Filling `dc_sito_web` by script → HTTP success, **no post created**
- [ ] Submitting in under 4 s → dropped
- [ ] The same submission with a restored draft (`bozza`) → **accepted**
- [ ] 6 submissions in 10 min from one IP → the 6th dropped
- [ ] The same six with a valid agent code → **all six accepted**
- [ ] `add_filter('dc_scheda_spam', …)` can drop a submission

**Nothing blocks except the e-mail**

- [ ] Submit with **only** an e-mail, no family, no answers → sheet created
- [ ] Step 1 → 2 works with nothing selected
- [ ] Scheda agente with an empty name or code blocks the send, message points to step 1
- [ ] Mobile and city show the red "altamente consigliato" badge, but are not required
- [ ] Rows: blindate total 8, rows 5 + 3 → counter "tutto diviso"; each row in the payload with its own quantity
- [ ] Parquet 80 m² → skirting proposed 88 m (agent page), editable
- [ ] Multi-select works (formato: plancia + 3 strip) and arrives as "Plancia intera, 3 strip"
- [ ] Phone in **dark mode**: product names readable
- [ ] Every chip question offers *Non lo so* / *Consigliatemi voi* / *Da valutare*
- [ ] The red "solo l'e-mail" callout shows on steps 1 and 2

**The rest**

- [ ] Channels are multi-select; only *E-mail* chosen → time and days hidden **and** blanked (sent as `Solo e-mail`)
- [ ] Day chips are multi-select; two ticked → both in `_dc_giorni`
- [ ] The confirmation reads back channel, days and time in full words
- [ ] Only *Materassi* selected → *"Serve la posa?"* absent; add *Pavimenti* → present
- [ ] All twenty families render their own questions when selected (customer and agent)
- [ ] A half-filled form survives a reload; the **agent code is not in the draft**
- [ ] Conditionals work: Su misura → free field; piano → ascensore; minipiscina on terrace → solaio
- [ ] The sheet arrives by e-mail **and** appears under Schede cliente, state Nuova
- [ ] Works on a real iPhone and a real Android, not only in DevTools

---

## 13 · Three things to decide with Diego before go-live

1. **The photo upload lands in `wp-content/uploads/`, world-readable by URL.**
   The sheet is private, the file is not, and it is a photo of somebody's home.
   Two options: move uploads for this post type outside the web root, or add a
   rewrite rule blocking direct access. Propose both, let Diego choose, **do not
   ship without deciding.**
2. **Photo size.** A phone photo is 3–5 MB. The plugin rejects above 12 MB, but
   on a mobile connection even 5 MB is slow. Consider client-side canvas
   resizing if abandonment shows up in the numbers.
3. **The real agent codes and e-mails.** Four-digit placeholders ship with the
   plugin. Diego changes them. Since v1.9 **an agent without a valid code cannot send**
   the Scheda agente — make sure every agent has theirs before go-live.
4. **Privacy notice:** the predictive lead score is profiling (GDPR art. 13/21) — the privacy text must mention it. Diego/consultant to confirm the wording.

---

## 13b · Google rules and the lead file (from Diego's checks of 30/9)

- Enhanced conversions for leads work in two stages: the Google tag reads e-mail/phone when the customer submits the **website form**; later we upload the sale with the same e-mail/phone and Google links it to the click. GCLID is required for leads that did **not** go through a tagged website form — so agent-only leads cannot be reliably attributed. That is why the agent must type **the same e-mail and phone the customer used**.
- Never pass e-mail or phone in a URL (thank-you page included).
- The Google Sheet **"Lead Disegnare Casa"** is read by Google every night. If you write to it from the plugin (only after Diego's OK): one new row with e-mail, phone, lead number, date/time, product, source. **Never write column Q** (it holds an ARRAYFORMULA) and check that the header of column A is `" email in chiaro"` (leading space). Diego makes a dated backup of the sheet before any change.
- Google accepts offline conversions up to **90 days** after the click; store date and time with the time zone (`+01:00` / `+02:00`) and the sheet number as order ID.
- Consent Mode: store the `ad_user_data` consent state with each sheet if available from CookieYes.

## 13c · "Campioni omaggio" personal link (to recover gclid + customer e-mail)

After the first contact, the agent sends the customer a personal link to the existing samples page `/campionatura/`:

1. `https://parquet.disegnarecasa.com/campionatura/?lid=<sheet number>&utm_source=agente&utm_medium=email` — **only the id, never e-mail or phone in the URL**.
2. The page pre-fills the customer's data **server-side** from the id. The customer confirms e-mail, phone and shipping address.
3. A separate, **optional, unticked** checkbox: "Acconsento all'uso della mia email e del mio telefono per misurare l'efficacia della pubblicità (Google)" → `consent_ads_data`.
4. Samples go to **everyone**. **No cookie wall** (Garante Privacy cookie guidelines 2021, §6.1). CookieYes stays with "Accetta" and "Rifiuta" equally visible.
5. It is a **separate, secondary** conversion ("Conferma dati cliente – campioni"), not the main lead conversion.
6. Demo: `campioni-omaggio.html` (in the "30-9-2026 SCHEDE per Miju" folder).

## 14 · Constraints — non-negotiable

- **One red only:** `#d80612`. No second red anywhere.
- All classes prefixed `dcs-`, scoped under `#dc-scheda`, so nothing can collide
  with Elementor or the theme.
- **No new libraries**, no build step, no jQuery. Vanilla JS and inline SVG.
- One font link only: Manrope + Fraunces + JetBrains Mono.
- The form is always light (`color-scheme: light`) and every text colour is explicit — the phone's dark mode must not change it.
- Assets load only on pages containing the shortcode.
- **Interface text in Italian, code and comments in English.**
- **No health data.** The mattress question asks about interest in a *dispositivo
  medico*, not about back problems. That gets the same commercial outcome
  without a diagnosis in the database, and GDPR treats the two very differently.
  **Keep it that way.**
- Sticky/animated elements move with `transform`, never by changing height —
  changing height changes `scrollHeight`, which fires another scroll event, which
  is an infinite oscillation. This bit us on the mobile nav; do not repeat it.
- **Staging only until Diego says otherwise.**

---

## 15 · If something is unclear

Do not guess and do not redesign — ask Diego. Every decision in here was made
with a reason and most of them are written down next to the code. The comments
in the PHP and JS are part of the deliverable: they explain *why*, not *what*.

*Prototype: `PROVA-scheda-cliente.html` — double-click it, it works offline (top buttons: cliente / agente).*
*Online (private, ask Diego to share): artifacts "Scheda cliente" and "Scheda agente" on claude.ai.*

# Integration notes — dc-scheda-cliente v1.9 in this repo (7 Oct 2026)

This repo now holds two plugins side by side:

| Folder | What | Status |
|---|---|---|
| `scheda-clienti-wordpress/` + `src/` | the old React plugin, shortcode `[scheda_clienti]` | **untouched**, kept for rollback |
| `dc-scheda-cliente/` | Diego's v1.9 plugin, shortcodes `[scheda_cliente]` and `[scheda_agente]` | **the one to install on staging** |
| `installazione-rapida/` | WP-CLI install script, GTM import, Playwright test, persone.txt | |
| `docs/scheda-v1.9/` | handover, question list, offline prototype, samples-link demo | |

`dc-scheda-cliente/` has no build step: zip the folder or copy it to `wp-content/plugins/`. Do **not** run `build.sh` for it.

## What was changed from the package Diego sent (and why)

Questions, design and CSS are unchanged. `assets/dc-scheda-config.js` is byte-identical to the delivered file.

1. **Order ID** — `dc-scheda.js` (and the same engine inside `PROVA-scheda-cliente.html`): the `dc_scheda_inviata` push now includes `lead_id` = the sheet number returned by the server. GTM sends it as the conversion's Order ID. Why: §13b asks for the sheet number as order ID, so Google removes duplicates and offline conversions match.
2. **GTM agent-page exclusion** — `gtm-scheda-cliente-IMPORT.json`: added `ESCLUSIONE - pagina Scheda agente - tutti gli eventi` (custom event `.*` + path contains `/scheda-agente`). Why: a GTM exception only blocks tags firing on the same event; the original page-view exception did not stop click/form/custom-event conversion tags.
3. **GTM** — added `DLV - lead_id`, `orderId` on the conversion tag, and a note to verify in Tag Assistant that the user-provided data reaches the conversion hit (the handover says "Include user-provided data" inside the conversion tag; the import uses a separate UPD tag).
4. **Stale text** — `dc-scheda-cliente.php`: the comment and the wp-admin Persone page still said "wrong code → saved as Cliente" (v1.3 rule). Now they say what v1.9 does: wrong code → refused, lockout after 8.
5. **Handover §6 snippet** corrected to resolve the agent code from `$modo` (as the PHP does), not from `fatta_da`.
6. **Test** — `test-scheda.js`: reads the real agent code from `SCHEDA_CODICE` (keeps it out of shell history), and checks `lead_id` on the site → **14 checks** on staging, 13 on the offline PROVA file.
7. **Install script** — final instructions mention both exception triggers and `SCHEDA_CODICE`.

## Still to decide with Diego before go-live

- `/scheda-cliente/` (created by the script) vs the existing `/scheda-clienti/` page: relink the buttons or put the shortcode on the old page.
- Photo uploads are world-readable in `wp-content/uploads/` (handover §13.1).
- Real agent codes and e-mails (never in git).
- Privacy text for the predictive lead score (GDPR art. 13/21).
- Primary or secondary conversion in Google Ads.

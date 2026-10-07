# Quick install — Scheda cliente + Scheda agente v1.9 (30 Sept 2026)

Hi Miju, this folder does most of the work for you. About **1 hour** instead of half a day.

| File | What it does |
|---|---|
| `installa-staging.sh` | WP-CLI script for **staging**. It refuses to run on the live site. It backs up the database, installs and activates the plugin, creates the pages `/scheda-cliente/` and `/scheda-agente/`, loads the agents list and checks the pages: form present, `noindex` on the agent page, no agent code in the page source. |
| `persone.txt` | The agents: `Name = code = e-mail`. **Diego fills in the real codes and e-mails before you run the script.** Do not commit the real codes to git. |
| `gtm-scheda-cliente-IMPORT.json` | GTM import for GTM-NXFPPJN. It adds the trigger on `dc_scheda_inviata` with `fatta_da = Cliente`, the Google Ads conversion tag (Order ID = sheet number) and the user-provided data tag (enhanced conversions from `user_data`). It also adds **two** exception triggers for the agent page (page view + all events). |
| `test-scheda.js` | Automatic acceptance test with Playwright: 14 checks on the site (13 on the offline PROVA file). It creates 2 test sheets on staging. |

## Steps

1. Upload the package to the staging server and put `persone.txt` next to the `dc-scheda-cliente/` folder.
2. From the WordPress folder: `bash installa-staging.sh /path/to/the-folder`.
   Every line of the final checks must say `OK`. If you see `NO manca il modulo`, the page is built with Elementor. In that case put the shortcode in an Elementor Shortcode widget. The plugin already finds shortcodes inside `_elementor_data`.
   **Decide with Diego** whether the "Richiedi preventivo" buttons point to the new `/scheda-cliente/` or whether `[scheda_cliente]` goes onto the existing `/scheda-clienti/` page (old links must not break).
3. In Google Ads, create or choose the conversion action for the Scheda cliente, then ask Diego whether it should be primary or secondary. Copy its conversion ID and label.
4. In GTM: **Admin → Import container → choose the JSON → Merge → "Rename conflicting tags, triggers and variables"**. Then:
   - put the ID and the label in `CONFIG - Scheda - AW Conversion ID` and `… Label`;
   - add **both** `ESCLUSIONE - pagina Scheda agente` and `ESCLUSIONE - pagina Scheda agente - tutti gli eventi` as **exceptions** to every existing Google Ads and GA4 conversion tag (a GTM exception only blocks tags that fire on the same event type);
   - turn on enhanced conversions for leads in Google Ads (Goals → Settings), if it is not on already;
   - Preview with Tag Assistant: check the conversion hit carries the Order ID and the user-provided data. **Do not publish** until Diego says so.
5. `npm i playwright && npx playwright install chromium`, then
   ` SCHEDA_CODICE=<real agent code> node test-scheda.js https://staging.parquet.disegnarecasa.com`
   (leading space = not saved in shell history). The result must be 14 OK.
   Note: the agent test sheet is e-mailed to the agent whose code you use and to the general inbox — warn them.
6. In wp-admin → Schede cliente, check the result: the customer test sheet has `_dc_gclid = TEST123` and the agent sheet has none. Delete the 2 test sheets.
7. Send Diego the two staging links and 3 phone screenshots. Then go through the full checklist in §12 of `docs/MIJU-HANDOVER-EN.md`.

## Do not

- run anything on the live site;
- change the questions outside `assets/dc-scheda-config.js`;
- put e-mail or phone numbers in any URL;
- write to column Q of the "Lead Disegnare Casa" sheet.

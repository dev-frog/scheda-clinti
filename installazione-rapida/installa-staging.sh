#!/usr/bin/env bash
# =============================================================================
#  Disegnarecasa — Scheda cliente + Scheda agente v1.9 — installazione rapida
#  30/9/2026 · da lanciare sul server di STAGING, nella cartella di WordPress
#
#  Cosa fa, in ordine (si ferma al primo errore):
#    1. controlla di essere su STAGING (non sul sito vero)
#    2. fa il backup del database (file .sql con data e ora)
#    3. copia e attiva il plugin dc-scheda-cliente
#    4. crea le due pagine: /scheda-cliente/ e /scheda-agente/
#    5. carica le persone (nome = codice = e-mail) da persone.txt
#    6. controlla le due pagine (modulo presente, noindex, codici non visibili)
#
#  Uso:   bash installa-staging.sh  /percorso/della/cartella/PER-MIJU
#         (la cartella che contiene dc-scheda-cliente/ e persone.txt)
#  Serve: WP-CLI (comando "wp") e curl.
# =============================================================================
set -euo pipefail

PACCHETTO="${1:-.}"
ORA="$(date +%Y-%m-%d_%H-%M)"

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
ko()  { printf '\n\033[31mSTOP: %s\033[0m\n' "$*"; exit 1; }

command -v wp   >/dev/null || ko "WP-CLI non trovato (comando wp)."
command -v curl >/dev/null || ko "curl non trovato."
[ -d "$PACCHETTO/dc-scheda-cliente" ] || ko "Non trovo $PACCHETTO/dc-scheda-cliente"

# --- 1. solo staging ----------------------------------------------------------
SITO="$(wp option get siteurl)"
say "1/6 · Sito: $SITO"
case "$SITO" in
  *staging*) echo "OK, è lo staging." ;;
  *) [ "${FORZA_LIVE:-0}" = "1" ] || ko "Non sembra lo staging. Regola di Diego: prima lo staging, mai il sito vero." ;;
esac

# --- 2. backup ------------------------------------------------------------------
say "2/6 · Backup del database"
mkdir -p ../backup-scheda
wp db export "../backup-scheda/db-prima-della-scheda_${ORA}.sql"

# --- 3. plugin ------------------------------------------------------------------
say "3/6 · Plugin dc-scheda-cliente"
DEST="$(wp eval 'echo WP_PLUGIN_DIR;')/dc-scheda-cliente"
if [ -d "$DEST" ]; then
  mv "$DEST" "${DEST}_copia_${ORA}"          # la versione vecchia resta, rinominata
  echo "Versione precedente spostata in ${DEST}_copia_${ORA}"
fi
cp -r "$PACCHETTO/dc-scheda-cliente" "$DEST"
wp plugin activate dc-scheda-cliente
wp plugin get dc-scheda-cliente --field=version

# --- 4. le due pagine -------------------------------------------------------------
say "4/6 · Pagine"
crea_pagina() {  # $1 slug  $2 titolo  $3 shortcode
  local id
  id="$(wp post list --post_type=page --name="$1" --field=ID --post_status=any | head -n1)"
  if [ -n "$id" ]; then
    echo "La pagina /$1/ esiste già (ID $id): NON la tocco. Metti $3 a mano se manca."
  else
    id="$(wp post create --post_type=page --post_status=publish --post_title="$2" \
          --post_name="$1" --post_content="$3" --porcelain)"
    echo "Creata /$1/ (ID $id) con $3"
  fi
}
crea_pagina "scheda-cliente" "Scheda cliente" "[scheda_cliente]"
crea_pagina "scheda-agente"  "Scheda agente"  "[scheda_agente]"

# --- 5. persone e casella generale ---------------------------------------------------
say "5/6 · Persone"
if [ -f "$PACCHETTO/persone.txt" ]; then
  wp option update dc_scheda_persone "$(grep -v '^[[:space:]]*#' "$PACCHETTO/persone.txt")"
  wp option get dc_scheda_persone | sed 's/= *[^=]*=/= **** =/'   # i codici non si stampano
else
  echo "persone.txt non c'è: restano i codici di prova 1101-1111. Da cambiare prima di andare live."
fi
[ -n "${CASELLA:-}" ] && wp option update dc_scheda_casella "$CASELLA"

# --- 6. controlli -------------------------------------------------------------------
say "6/6 · Controlli"
CLI="$(curl -fsSL "$SITO/scheda-cliente/")" || ko "Non riesco ad aprire /scheda-cliente/"
AGE="$(curl -fsSL "$SITO/scheda-agente/")"  || ko "Non riesco ad aprire /scheda-agente/"

grep -q 'id="dc-scheda"'           <<<"$CLI" && echo "OK  modulo presente nella Scheda cliente" || echo "NO  manca il modulo nella Scheda cliente (Elementor? vedi §3.3 del documento)"
grep -q 'dc-scheda-config'         <<<"$CLI" && echo "OK  script caricati"                     || echo "NO  script non caricati sulla Scheda cliente"
grep -q 'data-modo="agente"'       <<<"$AGE" && echo "OK  Scheda agente in modalità agente"    || echo "NO  la Scheda agente non è in modalità agente"
grep -qi 'noindex'                 <<<"$AGE" && echo "OK  Scheda agente noindex"               || echo "NO  manca noindex sulla Scheda agente"
grep -qi 'noindex'                 <<<"$CLI" && echo "ATTENZIONE: la Scheda cliente è noindex (è normale solo se tutto lo staging lo è)"
# nessun codice agente nel sorgente della pagina
TROVATO=0
while IFS='=' read -r _ cod _; do
  cod="$(echo "$cod" | tr -d '[:space:]')"
  [ -n "$cod" ] && grep -q "$cod" <<<"$AGE" && TROVATO=1
done < <(wp option get dc_scheda_persone)
[ "$TROVATO" = "0" ] && echo "OK  nessun codice agente nel sorgente" || echo "NO  un codice agente compare nel sorgente della pagina!"

say "Fatto. Adesso:"
cat <<TXT
  - GTM: importa gtm-scheda-cliente-IMPORT.json (Amministratore > Importa container > UNISCI, "rinomina i conflitti"),
    metti ID ed etichetta della conversione nelle due variabili CONFIG, e aggiungi i DUE trigger
    "ESCLUSIONE - pagina Scheda agente" e "... - tutti gli eventi" come eccezione ai tag di conversione già esistenti.
  - Prova automatica:   SCHEDA_CODICE=<codice vero> node test-scheda.js $SITO
    (lo spazio iniziale tiene il comando fuori dalla cronologia; sul sito vale 14 OK)
  - Poi la lista del §12 di MIJU-HANDOVER-EN.md e manda a Diego i link di staging.
  Backup del database: ../backup-scheda/db-prima-della-scheda_${ORA}.sql
TXT

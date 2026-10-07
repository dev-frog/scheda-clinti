<?php
/**
 * Plugin Name: Disegnarecasa — Scheda cliente
 * Description: Il modulo di richiesta preventivo a tre passi, con le domande per famiglia di prodotto, la separazione fra scheda fatta dal cliente e fatta da un agente, e l'archivio in wp-admin. Shortcode: [scheda_cliente] (pubblica) e [scheda_agente] (interna, codice obbligatorio)
 * Version:     1.9.0
 * Author:      Disegnarecasa
 * Text Domain: dc-scheda
 *
 * ----------------------------------------------------------------------------
 * COME SI INSTALLA
 *   1. Copia la cartella dc-scheda-cliente/ in wp-content/plugins/
 *   2. Attiva il plugin
 *   3. Metti [scheda_cliente] in una pagina — funziona anche dentro il widget
 *      "Shortcode" di Elementor, che è quello che il sito usa già
 *
 * PERCHÉ UNO SHORTCODE E NON UN BLOCCO O UN WIDGET ELEMENTOR
 *   Perché entra ovunque senza sapere niente del tema: pagina classica, blocco
 *   Gutenberg, widget Elementor. Se un domani il tema cambia, questo resta.
 *
 * COSA NON FA, DI PROPOSITO
 *   Non tocca il carrello, non crea utenti, non manda newsletter, e non
 *   installa nessuna libreria. Fa una cosa sola.
 *
 * @package Disegnarecasa
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'DC_SCHEDA_VER',  '1.9.0' );
define( 'DC_SCHEDA_DIR',  plugin_dir_path( __FILE__ ) );
define( 'DC_SCHEDA_URL',  plugin_dir_url( __FILE__ ) );

/* ===========================================================================
 * 1 · L'ARCHIVIO
 * --------------------------------------------------------------------------
 * Un tipo di contenuto suo, non visibile al pubblico. Le schede stanno qui,
 * non solo in una e-mail: una casella di posta perde le richieste, un elenco
 * con uno stato no.
 * ======================================================================== */
function dc_scheda_cpt() {
	register_post_type( 'dc_scheda', array(
		'labels' => array(
			'name'          => 'Schede cliente',
			'singular_name' => 'Scheda cliente',
			'menu_name'     => 'Schede cliente',
			'all_items'     => 'Tutte le schede',
		),
		'public'              => false,
		'show_ui'             => true,
		'show_in_rest'        => false,   // niente API pubblica su dati personali
		'exclude_from_search' => true,
		'menu_icon'           => 'dashicons-clipboard',
		'menu_position'       => 26,
		'capability_type'     => 'post',
		'map_meta_cap'        => true,
		'supports'            => array( 'title' ),
	) );

	// Stato della lavorazione: è la colonna che fa la differenza fra un
	// archivio e una casella di posta.
	register_taxonomy( 'dc_stato', 'dc_scheda', array(
		'labels'       => array( 'name' => 'Stato', 'singular_name' => 'Stato' ),
		'public'       => false,
		'show_ui'      => true,
		'show_in_rest' => false,
		'hierarchical' => true,
	) );
}
add_action( 'init', 'dc_scheda_cpt' );

/** Gli stati di partenza, creati una volta sola. */
function dc_scheda_stati() {
	foreach ( array( 'Nuova', 'Richiamata', 'Preventivo mandato', 'Chiusa', 'Persa' ) as $s ) {
		if ( ! term_exists( $s, 'dc_stato' ) ) {
			wp_insert_term( $s, 'dc_stato' );
		}
	}
}
register_activation_hook( __FILE__, function () {
	dc_scheda_cpt();
	dc_scheda_stati();
	flush_rewrite_rules();
} );

/* ===========================================================================
 * 2 · GLI ASSET
 * --------------------------------------------------------------------------
 * Caricati SOLO nelle pagine dove c'è lo shortcode. Il sito è lento: non si
 * aggiunge un file a tutte le pagine per una che serve.
 * ======================================================================== */
function dc_scheda_assets() {
	if ( ! is_singular() ) { return; }
	global $post;
	if ( ! $post || ! dc_scheda_ha_shortcode( $post ) ) { return; }

	wp_enqueue_style( 'dc-scheda', DC_SCHEDA_URL . 'assets/dc-scheda.css', array(), DC_SCHEDA_VER );

	wp_enqueue_script( 'dc-scheda-config', DC_SCHEDA_URL . 'assets/dc-scheda-config.js', array(), DC_SCHEDA_VER, true );
	wp_enqueue_script( 'dc-scheda', DC_SCHEDA_URL . 'assets/dc-scheda.js', array( 'dc-scheda-config' ), DC_SCHEDA_VER, true );

	wp_localize_script( 'dc-scheda', 'DC_SCHEDA_WP', array(
		'ajax'   => admin_url( 'admin-ajax.php' ),
		'nonce'  => wp_create_nonce( 'dc_scheda' ),
		'utente' => dc_scheda_utente(),
		/* I nomi arrivano da qui, non dal file di configurazione: così la
		   tendina «Scheda per» e i codici non possono più andare fuori sincrono. */
		'agenti' => dc_scheda_nomi(),
	) );
}
add_action( 'wp_enqueue_scripts', 'dc_scheda_assets' );

/**
 * Se chi sta guardando la pagina è connesso, il nome dell'agente si
 * precompila: un campo in meno da scrivere, e un errore in meno.
 * Non è un permesso: la scheda resta pubblica e la scelta la fa il modulo.
 */
function dc_scheda_utente() {
	return is_user_logged_in() ? wp_get_current_user()->display_name : '';
}

/* ===========================================================================
 * 3 · LO SHORTCODE
 * ======================================================================== */
/* v1.4 · 30/9/2026 — DUE PAGINE (decisione di Diego).
 * [scheda_cliente] → pubblica, va nella thank-you page: sempre «Cliente», gclid tenuto,
 *                    evento dc_scheda_inviata per Google Ads. Solo l'e-mail è obbligatoria.
 * [scheda_agente]  → interna (noindex, fuori dai menu): sempre «Agente», nome + codice
 *                    obbligatori e controllati QUI sul server; codice sbagliato = scheda
 *                    rifiutata. Niente gclid, nessun evento. Stessa e-mail del cliente.
 * Un cliente non arriva mai sulla pagina agente, quindi non può più «dichiararsi agente
 * per sbaglio»: per questo il codice sbagliato ora blocca invece di salvare come Cliente. */
/* Cerca lo shortcode anche dentro Elementor (_elementor_data), dove il sito
 * mette i widget: has_shortcode() da solo non lo vede. $quale = '' → tutti e due. */
function dc_scheda_ha_shortcode( $post, $quale = '' ) {
	if ( ! $post ) { return false; }
	$nomi = $quale ? array( $quale ) : array( 'scheda_cliente', 'scheda_agente' );
	$el   = (string) get_post_meta( $post->ID, '_elementor_data', true );
	foreach ( $nomi as $n ) {
		if ( has_shortcode( $post->post_content, $n ) || false !== strpos( $el, '[' . $n ) ) { return true; }
	}
	return false;
}
function dc_scheda_shortcode_agente() {
	return '<div id="dc-scheda" data-modo="agente"><noscript><p>Serve JavaScript attivo.</p></noscript></div>';
}
add_shortcode( 'scheda_agente', 'dc_scheda_shortcode_agente' );

/* La pagina agente non deve finire su Google. */
add_filter( 'wp_robots', function ( $robots ) {
	if ( is_singular() ) {
		global $post;
		if ( $post && dc_scheda_ha_shortcode( $post, 'scheda_agente' ) ) {
			$robots['noindex'] = true; $robots['nofollow'] = true;
		}
	}
	return $robots;
} );

function dc_scheda_shortcode() {
	// Pagina pubblica: il modulo del cliente. Nessuna domanda "chi compila".
	return '<div id="dc-scheda"><noscript><p>Per compilare la scheda serve JavaScript attivo. '
	     . 'Oppure chiamaci allo <a href="tel:+390239100466">02 3910 0466</a>.</p></noscript></div>';
}
/* L'organico, come punto di partenza. I codici sono da cambiare prima di
 * andare in linea, e le e-mail si mettono dalla pagina Persone. */
define( 'DC_SCHEDA_PERSONE_INIZIALI',
	"Serena     = 1101 = \n" .
	"Alex       = 1102 = \n" .
	"Giselle    = 1103 = \n" .
	"Iri        = 1104 = \n" .
	"Diego S    = 1105 = \n" .
	"Diego J    = 1106 = \n" .
	"Rosaria    = 1107 = \n" .
	"Aldrin     = 1108 = \n" .
	"Ferdinando = 1109 = \n" .
	"Ferrari    = 1110 = \n" .
	"Aldo       = 1111 = " );

add_shortcode( 'scheda_cliente', 'dc_scheda_shortcode' );

/* ===========================================================================
 * 4 · LA RICEZIONE
 * ======================================================================== */
function dc_scheda_invia() {

	check_ajax_referer( 'dc_scheda', 'nonce' );

	$raw = isset( $_POST['dati'] ) ? wp_unslash( $_POST['dati'] ) : '';
	$d   = json_decode( $raw, true );
	if ( ! is_array( $d ) ) {
		wp_send_json_error( 'dati non validi' );
	}

	// L'e-mail è l'unico campo obbligatorio, per scelta: ogni asterisco in più
	// è gente che si ferma.
	$email = isset( $d['cliente']['email'] ) ? sanitize_email( $d['cliente']['email'] ) : '';
	if ( ! is_email( $email ) ) {
		wp_send_json_error( 'e-mail non valida' );
	}

	/* v1.4 · la modalità viene dalla pagina (shortcode). */
	$modo = ( 'agente' === ( $d['modo'] ?? '' ) ) ? 'agente' : 'cliente';
	if ( 'cliente' === $modo ) { $d['fatta_da'] = 'Cliente'; }   // la pagina cliente non può dichiararsi agente

	/* Il codice si legge prima dell'antispam: un agente riconosciuto non
	 * passa dal limite per indirizzo (in ufficio escono tutti dallo stesso). */
	$agente_pre = ( 'agente' === $modo )
		? dc_scheda_agente_da_codice( sanitize_text_field( $d['codice_agente'] ?? '' ) ) : '';

	/* Scheda agente: codice obbligatorio. Sbagliato = rifiutata (i dati restano nel
	 * browser dell'agente). Dopo 8 codici sbagliati in 15 minuti dallo stesso
	 * indirizzo si blocca: così nessuno prova i codici a tentativi. */
	if ( 'agente' === $modo ) {
		$k_err = 'dc_scheda_cod_' . md5( dc_scheda_ip() );
		$n_err = (int) get_transient( $k_err );
		if ( $n_err >= 8 ) { wp_send_json_error( 'troppi' ); }
		if ( '' === $agente_pre || '' === trim( (string) ( $d['compilata_da'] ?? '' ) ) ) {
			set_transient( $k_err, $n_err + 1, 15 * MINUTE_IN_SECONDS );
			wp_send_json_error( 'codice' );
		}
		$d['fatta_da'] = 'Agente';
	}

	/* --- ANTISPAM ---
	 * Nessun CAPTCHA: costa moduli inviati, e su un modulo in tre passi con
	 * sedici famiglie i robot generici non arrivano nemmeno in fondo.
	 * Quattro controlli invisibili, che non chiedono niente a nessuno. */
	$spam = dc_scheda_e_spam( $d, $agente_pre );
	if ( $spam ) {
		// Al robot si risponde "fatto". Se capisce di essere stato bloccato,
		// riprova cambiando strada; se crede di aver vinto, se ne va.
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) { error_log( 'dc-scheda: scartata — ' . $spam ); }
		wp_send_json_success( array( 'numero' => 0, 'fatta_da' => 'Agente' ) );
	}

	/* --- CHI L'HA COMPILATA ---
	 * La scheda è pubblica: un agente a casa del cliente, dal telefono, non è
	 * connesso a WordPress. Quindi non si può chiedere una password.
	 * Si chiede un CODICE, che il cliente non ha e non indovina.
	 *
	 * v1.9: sulla Scheda agente un codice sbagliato è già stato RIFIUTATO
	 * sopra (errore 'codice', niente salvato, i dati restano nel browser).
	 * Sulla Scheda cliente fatta_da è forzato a 'Cliente'. Quindi qui
	 * $codice_errato resta sempre false: si tiene solo per le schede vecchie
	 * (v1.3) che hanno ancora _dc_codice_errato = 1. */
	$dichiarata = ( 'Agente' === ( $d['fatta_da'] ?? '' ) );
	$agente     = $agente_pre;

	$fatta_da       = ( $dichiarata && $agente ) ? 'Agente' : 'Cliente';
	$codice_errato  = ( $dichiarata && ! $agente );
	$connesso       = is_user_logged_in() ? wp_get_current_user()->display_name : '';

	$nome  = sanitize_text_field( $d['cliente']['nome'] ?? '' );
	$citta = sanitize_text_field( $d['cliente']['citta'] ?? '' );

	$titolo = trim( ( $nome ?: $email ) . ( $citta ? ' — ' . $citta : '' ) );

	$id = wp_insert_post( array(
		'post_type'   => 'dc_scheda',
		'post_status' => 'publish',
		'post_title'  => $titolo,
	), true );

	if ( is_wp_error( $id ) ) {
		wp_send_json_error( 'salvataggio fallito' );
	}

	wp_set_object_terms( $id, 'Nuova', 'dc_stato' );

	/* --- i campi --- */
	update_post_meta( $id, '_dc_fatta_da',     $fatta_da );
	update_post_meta( $id, '_dc_compilata_da', 'Agente' === $fatta_da ? sanitize_text_field( $d['compilata_da'] ?? '' ) : '' );
	update_post_meta( $id, '_dc_agente_codice', 'Agente' === $fatta_da ? $agente : '' );
	update_post_meta( $id, '_dc_utente_connesso', $connesso );
	if ( $codice_errato ) { update_post_meta( $id, '_dc_codice_errato', 1 ); }
	update_post_meta( $id, '_dc_scheda_per',   sanitize_text_field( $d['scheda_per'] ?? '' ) );
	update_post_meta( $id, '_dc_email',        $email );
	update_post_meta( $id, '_dc_nome',         $nome );
	update_post_meta( $id, '_dc_telefono',     sanitize_text_field( $d['cliente']['telefono'] ?? '' ) );
	update_post_meta( $id, '_dc_citta',        $citta );
	update_post_meta( $id, '_dc_richiamo',     sanitize_text_field( $d['cliente']['richiamo'] ?? '' ) );
	update_post_meta( $id, '_dc_canale',       sanitize_text_field( $d['cliente']['canale'] ?? '' ) );
	update_post_meta( $id, '_dc_giorni',       dc_scheda_pulisci( $d['cliente']['giorni'] ?? array() ) );
	update_post_meta( $id, '_dc_incontro',     sanitize_text_field( $d['cliente']['incontro'] ?? '' ) );
	update_post_meta( $id, '_dc_codice_prod',  sanitize_text_field( $d['cliente']['codice_prodotto'] ?? '' ) );
	update_post_meta( $id, '_dc_tipo_cliente', sanitize_text_field( $d['cliente']['tipo'] ?? '' ) );
	update_post_meta( $id, '_dc_note',         sanitize_textarea_field( $d['note'] ?? '' ) );
	update_post_meta( $id, '_dc_promemoria',   sanitize_text_field( $d['promemoria'] ?? '' ) );
	update_post_meta( $id, '_dc_pagina',       esc_url_raw( home_url( $d['pagina'] ?? '/' ) ) );
	update_post_meta( $id, '_dc_prodotti',     dc_scheda_pulisci( $d['prodotti'] ?? array() ) );
	update_post_meta( $id, '_dc_consegna',     dc_scheda_pulisci( $d['consegna'] ?? array() ) );
	update_post_meta( $id, '_dc_profilo',      dc_scheda_pulisci( $d['profilo'] ?? array() ) );   // v1.8 · dati per il lead predittivo

	/* --- LA PROVENIENZA: solo per le schede fatte dal cliente ---
	 * Una scheda compilata da un agente che si porta dietro il gclid del
	 * computer dell'ufficio insegna a Google che un annuncio ha prodotto una
	 * conversione che non ha prodotto. Qui si taglia, lato server, sempre. */
	if ( 'Cliente' === $fatta_da && ! empty( $d['provenienza'] ) ) {
		update_post_meta( $id, '_dc_provenienza', dc_scheda_pulisci( $d['provenienza'] ) );
		if ( ! empty( $d['provenienza']['gclid'] ) ) {
			update_post_meta( $id, '_dc_gclid', sanitize_text_field( $d['provenienza']['gclid'] ) );
		}
	}

	/* --- la foto --- */
	if ( ! empty( $_FILES['foto']['tmp_name'] ) ) {
		$allegato = dc_scheda_salva_foto( $id );
		if ( $allegato ) { update_post_meta( $id, '_dc_foto', (int) $allegato ); }
	}

	dc_scheda_avvisa( $id );

	/* Si restituisce come è stata REGISTRATA, non come era stata dichiarata:
	 * il browser spinge l'evento per Google Ads solo su questa risposta. */
	wp_send_json_success( array( 'numero' => $id, 'fatta_da' => $fatta_da ) );
}
add_action( 'wp_ajax_dc_scheda_invia',        'dc_scheda_invia' );
add_action( 'wp_ajax_nopriv_dc_scheda_invia', 'dc_scheda_invia' );

/** Pulizia ricorsiva: niente HTML dentro i dati salvati. */
function dc_scheda_pulisci( $v ) {
	if ( is_array( $v ) ) {
		$out = array();
		foreach ( $v as $k => $x ) {
			$out[ sanitize_text_field( (string) $k ) ] = dc_scheda_pulisci( $x );
		}
		return $out;
	}
	return sanitize_text_field( (string) $v );
}

/**
 * La foto: ridimensionata da WordPress, e allegata alla scheda.
 * Non finisce in un indirizzo indovinabile perché la scheda non è pubblica —
 * ma il file in uploads/ lo è: vedi la nota in MIJU-SCHEDA-EN.md §6.
 */
function dc_scheda_salva_foto( $post_id ) {
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$tipo = wp_check_filetype( $_FILES['foto']['name'] );
	if ( ! in_array( strtolower( $tipo['ext'] ), array( 'jpg', 'jpeg', 'png', 'webp', 'heic' ), true ) ) {
		return 0;
	}
	if ( $_FILES['foto']['size'] > 12 * 1024 * 1024 ) { return 0; }

	$id = media_handle_upload( 'foto', $post_id );
	return is_wp_error( $id ) ? 0 : $id;
}

/* ===========================================================================
 * 5 · L'AVVISO A CHI DEVE LAVORARLA
 * ======================================================================== */
function dc_scheda_avvisa( $id ) {

	$fatta_da = get_post_meta( $id, '_dc_fatta_da', true );
	$per      = get_post_meta( $id, '_dc_scheda_per', true );

	/* --- A CHI VA ---
	 * Tre destinatari possibili, e nessuno di questi passaggi può far sparire
	 * una scheda: se non si trova nessun indirizzo resta sempre la generale.
	 *   1. la persona indicata in «Scheda per»
	 *   2. l'agente che l'ha compilata (l'ha in mano lui, la segue lui)
	 *   3. la casella generale, sempre, come rete di sicurezza
	 */
	$a = array( dc_scheda_casella_generale() );

	$diretta = dc_scheda_email_di( $per );
	if ( $diretta ) { $a[] = $diretta; }

	$compilata = get_post_meta( $id, '_dc_agente_codice', true );
	if ( $compilata && $compilata !== $per ) {
		$e = dc_scheda_email_di( $compilata );
		if ( $e ) { $a[] = $e; }
	}

	$a = array_values( array_unique( array_filter( $a, 'is_email' ) ) );
	$a = apply_filters( 'dc_scheda_destinatari', $a, $id, $per );

	$oggetto = sprintf( '[%s] Scheda #%d — %s%s',
		'Cliente' === $fatta_da ? 'DAL SITO' : 'DA AGENTE',
		$id,
		get_the_title( $id ),
		$per && 'Il primo disponibile' !== $per ? ' · per ' . $per : ' · da assegnare'
	);

	$corpo  = dc_scheda_testo( $id );
	$header = array( 'Content-Type: text/plain; charset=UTF-8' );

	$email = get_post_meta( $id, '_dc_email', true );
	if ( is_email( $email ) ) { $header[] = 'Reply-To: ' . $email; }

	wp_mail( $a, $oggetto, $corpo, $header );
}

/** La scheda come la legge un venditore: righe, non tabelle. */
function dc_scheda_testo( $id ) {
	$g = function ( $k ) use ( $id ) { return get_post_meta( $id, '_dc_' . $k, true ); };
	$r = array();

	$r[] = 'SCHEDA #' . $id . '  ·  ' . get_the_date( 'd/m/Y H:i', $id );
	$r[] = str_repeat( '-', 58 );
	$r[] = 'Compilata da: ' . ( 'Agente' === $g( 'fatta_da' ) ? 'un agente' : 'il cliente' )
	     . ( $g( 'agente_codice' ) ? ' — ' . $g( 'agente_codice' ) . ' (codice verificato)' : '' )
	     . ( $g( 'compilata_da' ) && ! $g( 'agente_codice' ) ? ' — ' . $g( 'compilata_da' ) : '' )
	     . ( $g( 'utente_connesso' ) ? '  [connesso come ' . $g( 'utente_connesso' ) . ']' : '' );
	if ( $g( 'codice_errato' ) ) {
		$r[] = '              !! dichiarata da agente ma con un codice non riconosciuto — controllare';
	}
	if ( $g( 'scheda_per' ) ) { $r[] = 'Scheda per:   ' . $g( 'scheda_per' ); }
	$r[] = '';
	$r[] = 'CLIENTE';
	$r[] = '  ' . ( $g( 'nome' ) ?: '(senza nome)' ) . ( $g( 'tipo_cliente' ) ? ' — ' . $g( 'tipo_cliente' ) : '' );
	$r[] = '  ' . $g( 'email' ) . ( $g( 'telefono' ) ? '  ·  tel. ' . $g( 'telefono' ) : '  ·  (nessun telefono)' );
	$r[] = '  ' . ( $g( 'citta' ) ?: '—' );

	/* Come e quando vuole essere contattato: è la prima cosa che deve leggere
	 * chi prende in mano la scheda, prima ancora dei prodotti. */
	$giorni = $g( 'giorni' );
	$quando = trim( ( $g( 'richiamo' ) ?: '' ) . ( is_array( $giorni ) && $giorni ? ', ' . implode( ' / ', $giorni ) : '' ), ', ' );
	if ( $g( 'canale' ) ) {
		$r[] = '';
		$r[] = '>> CONTATTALO VIA ' . strtoupper( $g( 'canale' ) )
		     . ( $quando ? '  —  ' . $quando : '' );
		if ( 'Solo e-mail' === $g( 'canale' ) ) {
			$r[] = '   Ha chiesto di NON essere chiamato. Rispondere per e-mail.';
		}
	}
	/* v1.6 · promemoria: foto e video da mandare, subito in cima */
	if ( $g( 'promemoria' ) ) { $r[] = '>> PROMEMORIA: ' . $g( 'promemoria' ); }
	if ( $g( 'incontro' ) ) { $r[] = '   Appuntamento: ' . $g( 'incontro' ); }
	if ( $g( 'codice_prod' ) ) { $r[] = '   Ha in mente: ' . $g( 'codice_prod' ); }

	$prodotti = $g( 'prodotti' );
	if ( is_array( $prodotti ) && $prodotti ) {
		$r[] = '';
		$r[] = 'CHIEDE';
		foreach ( $prodotti as $p ) {
			$r[] = '  ' . $p['famiglia'] . ( $p['quantita'] ? ' — ' . $p['quantita'] . ' ' . $p['unita'] : '' );
			if ( ! empty( $p['risposte'] ) ) {
				foreach ( $p['risposte'] as $k => $v ) {
					$r[] = '      ' . $k . ': ' . $v;
				}
			}
		}
	}

	/* v1.8 · dati per il lead predittivo */
	$profilo = $g( 'profilo' );
	if ( is_array( $profilo ) && $profilo ) {
		$r[] = '';
		$r[] = 'CLIENTE E LEAD PREDITTIVO';
		foreach ( $profilo as $k => $v ) { $r[] = '  ' . $k . ': ' . $v; }
	}

	$consegna = $g( 'consegna' );
	if ( is_array( $consegna ) && $consegna ) {
		$r[] = '';
		$r[] = 'CONSEGNA E POSA';
		foreach ( $consegna as $k => $v ) { $r[] = '  ' . $k . ': ' . $v; }
	}

	if ( $g( 'note' ) ) {
		$r[] = '';
		$r[] = 'NOTE';
		$r[] = '  ' . $g( 'note' );
	}

	$prov = $g( 'provenienza' );
	if ( is_array( $prov ) && $prov ) {
		$r[] = '';
		$r[] = 'PROVENIENZA';
		foreach ( $prov as $k => $v ) { $r[] = '  ' . $k . ': ' . $v; }
	}

	$r[] = '';
	$r[] = 'Apri la scheda: ' . admin_url( 'post.php?post=' . $id . '&action=edit' );
	return implode( "\n", $r );
}

/* ===========================================================================
 * 6 · L'ELENCO IN WP-ADMIN
 * ======================================================================== */
function dc_scheda_colonne( $c ) {
	return array(
		'cb'          => $c['cb'],
		'title'       => 'Cliente',
		'dc_origine'  => 'Origine',
		'dc_chiede'   => 'Chiede',
		'dc_contatti' => 'Contatti',
		'dc_per'      => 'Per',
		'taxonomy-dc_stato' => 'Stato',
		'date'        => 'Arrivata',
	);
}
add_filter( 'manage_dc_scheda_posts_columns', 'dc_scheda_colonne' );

function dc_scheda_colonna( $col, $id ) {
	$g = function ( $k ) use ( $id ) { return get_post_meta( $id, '_dc_' . $k, true ); };

	if ( 'dc_origine' === $col ) {
		if ( 'Agente' === $g( 'fatta_da' ) ) {
			printf( '<span style="background:rgba(181,132,63,.16);color:#8a6520;padding:2px 8px;border-radius:5px;font-size:11px;font-weight:600">DA AGENTE</span><br><small><b>%s</b></small>%s',
				esc_html( $g( 'agente_codice' ) ?: $g( 'compilata_da' ) ),
				$g( 'compilata_da' ) && $g( 'agente_codice' ) && $g( 'compilata_da' ) !== $g( 'agente_codice' )
					? '<br><small style="color:#8C817B">ha scritto: ' . esc_html( $g( 'compilata_da' ) ) . '</small>' : '' );
		} else {
			$gclid = $g( 'gclid' );
			printf( '<span style="background:rgba(23,114,69,.12);color:#177245;padding:2px 8px;border-radius:5px;font-size:11px;font-weight:600">DAL SITO</span>%s%s',
				$gclid ? '<br><small>gclid presente</small>' : '',
				$g( 'codice_errato' ) ? '<br><small style="color:#d80612">dichiarata agente, codice non riconosciuto</small>' : '' );
		}
		return;
	}
	if ( 'dc_chiede' === $col ) {
		$p = $g( 'prodotti' );
		if ( ! is_array( $p ) || ! $p ) { echo '—'; return; }
		$righe = array();
		foreach ( $p as $x ) {
			$righe[] = esc_html( $x['famiglia'] . ( $x['quantita'] ? ' · ' . $x['quantita'] . ' ' . $x['unita'] : '' ) );
		}
		echo implode( '<br>', $righe );
		return;
	}
	if ( 'dc_contatti' === $col ) {
		printf( '<a href="mailto:%1$s">%1$s</a>%2$s',
			esc_attr( $g( 'email' ) ),
			$g( 'telefono' ) ? '<br><a href="tel:' . esc_attr( $g( 'telefono' ) ) . '">' . esc_html( $g( 'telefono' ) ) . '</a>' : '<br><em style="color:#b32">no telefono</em>'
		);
		return;
	}
	if ( 'dc_per' === $col ) {
		echo esc_html( $g( 'scheda_per' ) ?: '—' );
	}
}
add_action( 'manage_dc_scheda_posts_custom_column', 'dc_scheda_colonna', 10, 2 );

/** Filtro: dal sito / da agente. È il numero che conta quando guardi Google Ads. */
function dc_scheda_filtro() {
	global $typenow;
	if ( 'dc_scheda' !== $typenow ) { return; }
	$cur = isset( $_GET['dc_origine'] ) ? sanitize_key( $_GET['dc_origine'] ) : '';
	echo '<select name="dc_origine">
		<option value="">Tutte le origini</option>
		<option value="cliente"' . selected( $cur, 'cliente', false ) . '>Dal sito</option>
		<option value="agente"' . selected( $cur, 'agente', false ) . '>Da agente</option>
	</select>';
}
add_action( 'restrict_manage_posts', 'dc_scheda_filtro' );

function dc_scheda_filtro_query( $q ) {
	if ( ! is_admin() || ! $q->is_main_query() || 'dc_scheda' !== $q->get( 'post_type' ) ) { return; }
	if ( empty( $_GET['dc_origine'] ) ) { return; }
	$q->set( 'meta_query', array( array(
		'key'   => '_dc_fatta_da',
		'value' => 'agente' === sanitize_key( $_GET['dc_origine'] ) ? 'Agente' : 'Cliente',
	) ) );
}
add_action( 'pre_get_posts', 'dc_scheda_filtro_query' );

/* ===========================================================================
 * 7 · LA SCHEDA APERTA
 * ======================================================================== */
function dc_scheda_box() {
	add_meta_box( 'dc_scheda_box', 'La richiesta', function ( $post ) {
		echo '<pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.6;margin:0">'
		   . esc_html( dc_scheda_testo( $post->ID ) ) . '</pre>';
		$foto = get_post_meta( $post->ID, '_dc_foto', true );
		if ( $foto ) {
			echo '<p style="margin-top:16px"><strong>Foto allegata</strong></p>';
			echo wp_get_attachment_image( (int) $foto, 'medium', false, array( 'style' => 'max-width:100%;height:auto;border-radius:6px' ) );
		}
	}, 'dc_scheda', 'normal', 'high' );
}
add_action( 'add_meta_boxes', 'dc_scheda_box' );

/* ===========================================================================
 * 8 · ESPORTAZIONE PER LE CONVERSIONI OFFLINE DI GOOGLE ADS
 * --------------------------------------------------------------------------
 * Quando una scheda si chiude in vendita, il gclid salvato permette di
 * ricaricare la conversione su Google Ads CON IL VALORE VERO IN EURO. È il
 * motivo per cui il gclid si salva: senza, Google ottimizza sui moduli
 * inviati invece che sui soldi incassati.
 *
 * Schede → Esporta conversioni: produce il CSV nel formato che Google chiede.
 * ======================================================================== */
function dc_scheda_export_menu() {
	add_submenu_page( 'edit.php?post_type=dc_scheda', 'Esporta conversioni', 'Esporta conversioni',
		'manage_options', 'dc-scheda-export', 'dc_scheda_export_page' );
}
add_action( 'admin_menu', 'dc_scheda_export_menu' );

function dc_scheda_export_page() {
	echo '<div class="wrap"><h1>Esporta conversioni per Google Ads</h1>';
	echo '<p>Solo le schede <strong>arrivate dal sito</strong>, con un <code>gclid</code>, e con stato <strong>Chiusa</strong>. '
	   . 'Le schede fatte da un agente non ci sono e non ci devono essere.</p>';
	echo '<p><a class="button button-primary" href="' . esc_url( wp_nonce_url( admin_url( 'edit.php?post_type=dc_scheda&dc_export=1' ), 'dc_scheda_export' ) ) . '">Scarica il CSV</a></p>';
	echo '<p style="color:#666;max-width:70ch">Il valore in euro va scritto a mano nella colonna <code>Conversion Value</code> prima di caricarlo: '
	   . 'è l\'importo davvero fatturato, e nessuno tranne voi lo sa.</p></div>';
}

function dc_scheda_export() {
	if ( ! isset( $_GET['dc_export'] ) || ! current_user_can( 'manage_options' ) ) { return; }
	check_admin_referer( 'dc_scheda_export' );

	$q = new WP_Query( array(
		'post_type'      => 'dc_scheda',
		'posts_per_page' => -1,
		'dc_stato'       => 'chiusa',
		'meta_query'     => array(
			array( 'key' => '_dc_gclid', 'compare' => 'EXISTS' ),
			array( 'key' => '_dc_fatta_da', 'value' => 'Cliente' ),
		),
	) );

	nocache_headers();
	header( 'Content-Type: text/csv; charset=utf-8' );
	header( 'Content-Disposition: attachment; filename=conversioni-' . gmdate( 'Y-m-d' ) . '.csv' );

	$out = fopen( 'php://output', 'w' );
	// Intestazione nel formato che Google Ads si aspetta.
	fputcsv( $out, array( 'Google Click ID', 'Conversion Name', 'Conversion Time', 'Conversion Value', 'Conversion Currency' ) );
	foreach ( $q->posts as $p ) {
		fputcsv( $out, array(
			get_post_meta( $p->ID, '_dc_gclid', true ),
			'Scheda cliente chiusa',
			get_the_date( 'Y-m-d H:i:s O', $p ),
			'',      // da compilare: l'importo fatturato
			'EUR',
		) );
	}
	fclose( $out );
	exit;
}
add_action( 'admin_init', 'dc_scheda_export' );


/* ===========================================================================
 * 9 · LE PERSONE
 * --------------------------------------------------------------------------
 * Una tabella sola, in un posto solo: nome, codice, e-mail. Da qui escono
 * tre cose che prima sarebbero state tre elenchi da tenere allineati a mano:
 *
 *   · l'elenco «Scheda per» che il cliente vede nel modulo
 *   · il controllo del codice quando qualcuno dice «sono un agente»
 *   · l'indirizzo a cui la scheda viene girata
 *
 * Si gestisce da Schede cliente → Persone, una riga per persona:
 *
 *     Serena = 4417 = serena@disegnarecasa.com
 *
 * L'e-mail può mancare: finché non c'è, le schede di quella persona arrivano
 * comunque alla casella generale e non si perde niente.
 * ======================================================================== */

/** Le persone come le ha scritte Diego. @return array di [nome, codice, email]. */
function dc_scheda_persone() {
	static $cache = null;
	if ( null !== $cache ) { return $cache; }

	$cache = array();
	foreach ( preg_split( '/\r\n|\n|\r/', (string) get_option( 'dc_scheda_persone', '' ) ) as $riga ) {
		$riga = trim( $riga );
		if ( '' === $riga || 0 === strpos( $riga, '#' ) ) { continue; }
		$p = array_map( 'trim', explode( '=', $riga ) );
		if ( '' === $p[0] ) { continue; }
		$cache[] = array(
			'nome'   => $p[0],
			'codice' => isset( $p[1] ) ? strtoupper( $p[1] ) : '',
			'email'  => isset( $p[2] ) && is_email( $p[2] ) ? $p[2] : '',
		);
	}
	return $cache;
}

/** I nomi, per la tendina «Scheda per». */
function dc_scheda_nomi() {
	$n = array( 'Il primo disponibile' );
	foreach ( dc_scheda_persone() as $p ) { $n[] = $p['nome']; }
	return $n;
}

/**
 * Il nome di chi ha quel codice, o '' se il codice non esiste.
 * hash_equals per non far capire dai tempi di risposta quanto ci si avvicina.
 */
function dc_scheda_agente_da_codice( $codice ) {
	$codice = strtoupper( trim( (string) $codice ) );
	if ( '' === $codice ) { return ''; }
	foreach ( dc_scheda_persone() as $p ) {
		if ( '' !== $p['codice'] && hash_equals( $p['codice'], $codice ) ) { return $p['nome']; }
	}
	return '';
}

/** L'e-mail di una persona, o '' se non gliel'abbiamo ancora messa. */
function dc_scheda_email_di( $nome ) {
	$nome = trim( (string) $nome );
	if ( '' === $nome ) { return ''; }
	foreach ( dc_scheda_persone() as $p ) {
		if ( 0 === strcasecmp( $p['nome'], $nome ) ) { return $p['email']; }
	}
	return '';
}

/** La casella che riceve sempre tutto: la rete di sicurezza. */
function dc_scheda_casella_generale() {
	$e = get_option( 'dc_scheda_casella', '' );
	return is_email( $e ) ? $e : get_option( 'admin_email' );
}

/* --- la pagina delle impostazioni --------------------------------------- */
function dc_scheda_pagina_persone() {
	add_submenu_page( 'edit.php?post_type=dc_scheda', 'Persone', 'Persone',
		'manage_options', 'dc-scheda-persone', 'dc_scheda_render_persone' );
}
add_action( 'admin_menu', 'dc_scheda_pagina_persone' );

function dc_scheda_render_persone() {
	if ( isset( $_POST['dc_persone'] ) && check_admin_referer( 'dc_scheda_persone' ) ) {
		update_option( 'dc_scheda_persone', sanitize_textarea_field( wp_unslash( $_POST['dc_persone'] ) ) );
		update_option( 'dc_scheda_casella', sanitize_email( wp_unslash( $_POST['dc_casella'] ?? '' ) ) );
		wp_cache_flush();
		echo '<div class="notice notice-success"><p>Salvato.</p></div>';
	}

	$val = get_option( 'dc_scheda_persone', DC_SCHEDA_PERSONE_INIZIALI );
	$cas = get_option( 'dc_scheda_casella', '' );

	echo '<div class="wrap"><h1>Persone</h1>';
	echo '<p style="max-width:74ch">Una riga per persona: <code>Nome = codice = e-mail</code>. '
	   . 'Da qui escono tutte e tre le cose — l\'elenco «Scheda per» nel modulo, il controllo del codice, '
	   . 'e l\'indirizzo a cui la scheda viene girata.</p>';
	echo '<p style="max-width:74ch;color:#666"><b>Il codice</b> serve per la <b>Scheda agente</b> ([scheda_agente]). '
	   . 'Non è una password, ma <b>senza il codice giusto la Scheda agente non parte</b>: il server la rifiuta e i dati '
	   . 'restano nel telefono dell\'agente. Dopo 8 codici sbagliati in 15 minuti dalla stessa connessione si blocca per 15 minuti. '
	   . 'Usate codici da 4 a 6 caratteri, non banali, e non metteteli mai in git o in una e-mail.<br>'
	   . '<b>L\'e-mail può mancare:</b> finché non c\'è, quelle schede arrivano solo alla casella generale.</p>';

	echo '<form method="post">';
	echo '<textarea name="dc_persone" rows="14" style="width:100%;max-width:620px;font-family:ui-monospace,Menlo,monospace;font-size:13px">'
	   . esc_textarea( $val ) . '</textarea>';
	echo '<h2 style="margin-top:26px">Casella generale</h2>';
	echo '<p style="max-width:74ch">Riceve <b>una copia di tutto</b>, anche delle schede già girate a qualcuno. '
	   . 'È la rete di sicurezza: se una persona è in ferie o le manca l\'e-mail, la richiesta non resta ferma.</p>';
	echo '<input type="email" name="dc_casella" value="' . esc_attr( $cas ) . '" class="regular-text" placeholder="'
	   . esc_attr( get_option( 'admin_email' ) ) . '">';
	wp_nonce_field( 'dc_scheda_persone' );
	echo '<p style="margin-top:22px"><button class="button button-primary">Salva</button></p></form>';

	// specchietto di controllo: chi è a posto e chi no
	$persone = dc_scheda_persone();
	if ( $persone ) {
		echo '<h2 style="margin-top:30px">Come sono messe adesso</h2>';
		echo '<table class="widefat striped" style="max-width:620px"><thead><tr>'
		   . '<th>Nome</th><th>Codice</th><th>E-mail</th></tr></thead><tbody>';
		foreach ( $persone as $p ) {
			printf( '<tr><td><b>%s</b></td><td>%s</td><td>%s</td></tr>',
				esc_html( $p['nome'] ),
				$p['codice'] ? esc_html( $p['codice'] ) : '<span style="color:#d80612">manca</span>',
				$p['email']  ? esc_html( $p['email'] )  : '<span style="color:#b58800">manca — va alla casella generale</span>' );
		}
		echo '</tbody></table>';
	}
	echo '</div>';
}

/* ===========================================================================
 * 10 · ANTISPAM
 * --------------------------------------------------------------------------
 * Quattro controlli, tutti invisibili. Nessun CAPTCHA: un CAPTCHA costa
 * moduli inviati a tutti per fermare pochi, e reCAPTCHA mette per giunta un
 * tracciamento Google su una pagina piena di dati personali.
 *
 * Se un giorno lo spam passa lo stesso, si aggiunge Cloudflare Turnstile
 * agganciandosi al filtro dc_scheda_spam qui sotto, senza toccare altro.
 * ======================================================================== */
function dc_scheda_e_spam( $d, $agente = '' ) {

	// 1 · la trappola: un campo invisibile che solo un robot riempie
	if ( ! empty( $d['trappola'] ) ) { return 'trappola'; }

	/* 2 · il tempo: tre passi non si compilano in tre secondi.
	 *     Salta se la scheda ripartiva da una bozza salvata: uno che torna e
	 *     preme "invia" subito è una persona vera, e non si perde. */
	$secondi = (int) ( $d['secondi'] ?? 0 );
	if ( empty( $d['bozza'] ) && $secondi > 0 && $secondi < 4 ) {
		return 'troppo veloce (' . $secondi . 's)';
	}

	// 3 · i link nelle note: il modulo non ne ha bisogno, lo spam vive di quelli
	$note = (string) ( $d['note'] ?? '' );
	if ( preg_match_all( '#https?://|www\.#i', $note ) >= 2 ) { return 'link nelle note'; }
	if ( preg_match( '/\p{Cyrillic}/u', $note ) ) { return 'alfabeto cirillico'; }

	/* 4 · quante ne arrivano dallo stesso indirizzo.
	 *     Un agente con il codice giusto NON passa di qui: in ufficio escono
	 *     tutti dallo stesso indirizzo, e cinque schede di fila sono normali. */
	if ( '' === $agente ) {
		$chiave = 'dc_scheda_ip_' . md5( dc_scheda_ip() );
		$n      = (int) get_transient( $chiave );
		if ( $n >= 5 ) { return 'troppe richieste dallo stesso indirizzo'; }
		set_transient( $chiave, $n + 1, 10 * MINUTE_IN_SECONDS );
	}

	/* Aggancio per il futuro: Cloudflare Turnstile o altro.
	 * Deve restituire una stringa (il motivo) per scartare, o false. */
	return apply_filters( 'dc_scheda_spam', false, $d );
}

function dc_scheda_ip() {
	foreach ( array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'REMOTE_ADDR' ) as $k ) {
		if ( ! empty( $_SERVER[ $k ] ) ) {
			return sanitize_text_field( wp_unslash( $_SERVER[ $k ] ) );
		}
	}
	return '0.0.0.0';
}

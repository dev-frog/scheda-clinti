<?php
/**
 * Data Handler Class
 *
 * Manages custom post type and admin functionality
 */

if (!defined('ABSPATH')) {
    exit;
}

class SC_Data_Handler {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', [$this, 'register_order_post_type']);
        add_action('add_meta_boxes', [$this, 'add_order_meta_boxes']);
        add_filter('manage_scheda_order_posts_columns', [$this, 'set_custom_columns']);
        add_action('manage_scheda_order_posts_custom_column', [$this, 'custom_column_content'], 10, 2);

        // Admin menu
        add_action('admin_menu', [$this, 'add_settings_page']);
        add_action('admin_init', [$this, 'register_settings']);
    }

    /**
     * Register order post type
     */
    public function register_order_post_type() {
        $labels = [
            'name' => __('Ordini', 'scheda-clienti'),
            'singular_name' => __('Ordine', 'scheda-clienti'),
            'menu_name' => __('Ordini Scheda', 'scheda-clienti'),
            'name_admin_bar' => __('Ordine', 'scheda-clienti'),
            'add_new' => __('Aggiungi Nuovo', 'scheda-clienti'),
            'add_new_item' => __('Aggiungi Nuovo Ordine', 'scheda-clienti'),
            'edit_item' => __('Modifica Ordine', 'scheda-clienti'),
            'new_item' => __('Nuovo Ordine', 'scheda-clienti'),
            'view_item' => __('Visualizza Ordine', 'scheda-clienti'),
            'view_items' => __('Visualizza Ordini', 'scheda-clienti'),
            'search_items' => __('Cerca Ordini', 'scheda-clienti'),
            'not_found' => __('Nessun ordine trovato', 'scheda-clienti'),
            'not_found_in_trash' => __('Nessun ordine trovato nel cestino', 'scheda-clienti'),
            'all_items' => __('Tutti gli ordini', 'scheda-clienti'),
        ];

        $args = [
            'labels' => $labels,
            'description' => __('Ordini di arredamento inviati tramite il modulo', 'scheda-clienti'),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_admin_bar' => false,
            'show_in_nav_menus' => false,
            'capability_type' => 'post',
            'supports' => ['title'],
            'menu_icon' => 'dashicons-cart',
            'menu_position' => 25,
            'has_archive' => false,
            'exclude_from_search' => true,
        ];

        register_post_type('scheda_order', $args);
    }

    /**
     * Add meta boxes for order details
     */
    public function add_order_meta_boxes() {
        add_meta_box(
            'sc_customer_details',
            __('Dettagli Cliente', 'scheda-clienti'),
            [$this, 'render_customer_meta_box'],
            'scheda_order',
            'normal',
            'high'
        );

        add_meta_box(
            'sc_order_details',
            __('Dettagli Ordine', 'scheda-clienti'),
            [$this, 'render_order_meta_box'],
            'scheda_order',
            'normal',
            'high'
        );

        add_meta_box(
            'sc_order_status',
            __('Stato Ordine', 'scheda-clienti'),
            [$this, 'render_status_meta_box'],
            'scheda_order',
            'side',
            'default'
        );
    }

    /**
     * Render customer details meta box
     */
    public function render_customer_meta_box($post) {
        wp_nonce_field('sc_save_order_meta', 'sc_order_meta_nonce');

        $fields = [
            'customer_name' => __('Nome', 'scheda-clienti'),
            'customer_email' => __('Email', 'scheda-clienti'),
            'customer_telephone' => __('Telefono', 'scheda-clienti'),
            'customer_city' => __('Città', 'scheda-clienti'),
            'customer_address' => __('Indirizzo', 'scheda-clienti'),
            'customer_additional_notes' => __('Note Aggiuntive', 'scheda-clienti'),
        ];

        echo '<table class="form-table">';

        foreach ($fields as $meta_key => $label) {
            $value = get_post_meta($post->ID, $meta_key, true);
            echo '<tr>';
            echo '<th><label>' . esc_html($label) . '</label></th>';
            echo '<td>' . esc_html($value) . '</td>';
            echo '</tr>';
        }

        echo '</table>';
    }

    /**
     * Render order details meta box
     */
    public function render_order_meta_box($post) {
        $products = get_post_meta($post->ID, 'order_products', true);

        if (empty($products)) {
            echo '<p>' . __('Nessun prodotto in questo ordine.', 'scheda-clienti') . '</p>';
            return;
        }

        // Group products by type
        $grouped = [];
        foreach ($products as $product) {
            if (!isset($grouped[$product['type']])) {
                $grouped[$product['type']] = [];
            }
            $grouped[$product['type']][] = $product;
        }

        echo '<div class="sc-order-products">';

        foreach ($grouped as $type => $items) {
            echo '<h4>' . esc_html($type) . ' (' . count($items) . ')</h4>';

            foreach ($items as $index => $item) {
                echo '<div style="background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 3px solid #14b8a6;">';
                echo '<h5 style="margin: 0 0 10px 0;">' . sprintf(__('Articolo %d', 'scheda-clienti'), $index + 1) . '</h5>';

                if (!empty($item['details'])) {
                    echo '<table class="form-table" style="margin: 0;">';
                    foreach ($item['details'] as $key => $value) {
                        if ($key !== 'id' && $value) {
                            echo '<tr>';
                            echo '<th style="width: 150px;">' . esc_html(ucfirst(str_replace('_', ' ', $key))) . '</th>';
                            echo '<td>' . esc_html(is_array($value) ? implode(', ', $value) : $value) . '</td>';
                            echo '</tr>';
                        }
                    }
                    echo '</table>';
                }

                echo '</div>';
            }
        }

        echo '</div>';
    }

    /**
     * Render status meta box
     */
    public function render_status_meta_box($post) {
        $status = get_post_meta($post->ID, 'order_status', true);
        $statuses = [
            'pending' => __('In attesa', 'scheda-clienti'),
            'processing' => __('In lavorazione', 'scheda-clienti'),
            'completed' => __('Completato', 'scheda-clienti'),
            'cancelled' => __('Annullato', 'scheda-clienti'),
        ];

        echo '<select name="order_status" style="width: 100%;">';
        foreach ($statuses as $value => $label) {
            $selected = selected($status, $value, false);
            echo '<option value="' . esc_attr($value) . '" ' . $selected . '>' . esc_html($label) . '</option>';
        }
        echo '</select>';

        echo '<p class="description">';
        _e('Aggiorna lo stato di questo ordine.', 'scheda-clienti');
        echo '</p>';
    }

    /**
     * Set custom columns for orders list
     */
    public function set_custom_columns($columns) {
        $new_columns = [];

        foreach ($columns as $key => $value) {
            if ($key === 'title') {
                $new_columns['order_number'] = __('Ordine #', 'scheda-clienti');
            }
            $new_columns[$key] = $value;
        }

        $new_columns['customer_email'] = __('Email Cliente', 'scheda-clienti');
        $new_columns['order_status'] = __('Stato', 'scheda-clienti');
        $new_columns['order_date'] = __('Data', 'scheda-clienti');

        return $new_columns;
    }

    /**
     * Custom column content
     */
    public function custom_column_content($column, $post_id) {
        switch ($column) {
            case 'order_number':
                echo 'SC-' . str_pad($post_id, 6, '0', STR_PAD_LEFT);
                break;

            case 'customer_email':
                $email = get_post_meta($post_id, 'customer_email', true);
                echo esc_html($email);
                break;

            case 'order_status':
                $status = get_post_meta($post_id, 'order_status', true);
                $status_labels = [
                    'pending' => __('In attesa', 'scheda-clienti'),
                    'processing' => __('In lavorazione', 'scheda-clienti'),
                    'completed' => __('Completato', 'scheda-clienti'),
                    'cancelled' => __('Annullato', 'scheda-clienti'),
                ];
                echo esc_html($status_labels[$status] ?? $status);
                break;

            case 'order_date':
                $date = get_post_meta($post_id, 'order_date', true);
                echo $date ? esc_html($date) : get_the_date('Y-m-d H:i', $post_id);
                break;
        }
    }

    /**
     * Add settings page
     */
    public function add_settings_page() {
        add_submenu_page(
            'edit.php?post_type=scheda_order',
            __('Impostazioni', 'scheda-clienti'),
            __('Impostazioni', 'scheda-clienti'),
            'manage_options',
            'sc-settings',
            [$this, 'render_settings_page']
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('sc_settings_group', 'sc_email_recipient');
        register_setting('sc_settings_group', 'sc_success_message');
        register_setting('sc_settings_group', 'sc_enable_notifications');
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        ?>
        <div class="wrap">
            <h1><?php _e('Impostazioni Scheda Clienti', 'scheda-clienti'); ?></h1>

            <form method="post" action="options.php">
                <?php
                settings_fields('sc_settings_group');
                do_settings_sections('sc_settings_group');
                ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="sc_email_recipient">
                                <?php _e('Destinatario Email', 'scheda-clienti'); ?>
                            </label>
                        </th>
                        <td>
                            <input type="email"
                                   id="sc_email_recipient"
                                   name="sc_email_recipient"
                                   value="<?php echo esc_attr(get_option('sc_email_recipient', get_option('admin_email'))); ?>"
                                   class="regular-text">
                            <p class="description">
                                <?php _e('Indirizzo email per ricevere le notifiche dei nuovi ordini.', 'scheda-clienti'); ?>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="sc_success_message">
                                <?php _e('Messaggio di Successo', 'scheda-clienti'); ?>
                            </label>
                        </th>
                        <td>
                            <textarea id="sc_success_message"
                                      name="sc_success_message"
                                      rows="4"
                                      class="large-text"><?php echo esc_textarea(get_option('sc_success_message',
                                __('Grazie! Il tuo ordine è stato inviato con successo. Ti contatteremo al più presto.', 'scheda-clienti')
                            )); ?></textarea>
                            <p class="description">
                                <?php _e('Messaggio mostrato ai clienti dopo l\'invio del modulo.', 'scheda-clienti'); ?>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <?php _e('Notifiche Email', 'scheda-clienti'); ?>
                        </th>
                        <td>
                            <label>
                                <input type="checkbox"
                                       name="sc_enable_notifications"
                                       value="1"
                                    <?php checked(get_option('sc_enable_notifications', '1'), '1'); ?>>
                                <?php _e('Abilita le notifiche email per i nuovi ordini', 'scheda-clienti'); ?>
                            </label>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>

            <hr>

            <h2><?php _e('Utilizzo Shortcode', 'scheda-clienti'); ?></h2>
            <p><?php _e('Usa il seguente shortcode per visualizzare il modulo:', 'scheda-clienti'); ?></p>

            <code>[scheda_clienti]</code>

            <p><?php _e('Con attributi personalizzati:', 'scheda-clienti'); ?></p>
            <code>[scheda_clienti title="Custom Title" description="Custom Description" class="my-custom-class"]</code>

            <hr>

            <h2><?php _e('Informazioni Plugin', 'scheda-clienti'); ?></h2>
            <table class="form-table">
                <tr>
                    <th><?php _e('Versione', 'scheda-clienti'); ?></th>
                    <td><?php echo SC_VERSION; ?></td>
                </tr>
                <tr>
                    <th><?php _e('Versione Database', 'scheda-clienti'); ?></th>
                    <td><?php echo get_option('sc_db_version', '1.0'); ?></td>
                </tr>
            </table>
        </div>
        <?php
    }

    /**
     * Save order meta
     */
    public function save_order_meta($post_id) {
        // Check nonce
        if (!isset($_POST['sc_order_meta_nonce']) ||
            !wp_verify_nonce($_POST['sc_order_meta_nonce'], 'sc_save_order_meta')) {
            return;
        }

        // Check autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Check permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Save order status
        if (isset($_POST['order_status'])) {
            update_post_meta($post_id, 'order_status', sanitize_text_field($_POST['order_status']));
        }
    }
}

// Hook to save meta
add_action('save_post_scheda_order', function($post_id) {
    $handler = new SC_Data_Handler();
    $handler->save_order_meta($post_id);
});

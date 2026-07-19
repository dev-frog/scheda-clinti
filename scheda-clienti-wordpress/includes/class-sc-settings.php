<?php
/**
 * Settings Page Class
 *
 * Handles the admin settings page for multiple email recipients and plugin configuration
 */

if (!defined('ABSPATH')) {
    exit;
}

class SC_Settings_Page {

    /**
     * Single instance of the class
     */
    private static $instance = null;

    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Add settings menu
        add_action('admin_menu', [$this, 'add_settings_menu']);

        // Register settings
        add_action('admin_init', [$this, 'register_settings']);

        // Load admin scripts
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);

        // Add settings link to plugins page
        add_filter('plugin_action_links_' . SC_PLUGIN_BASENAME, [$this, 'add_settings_link']);
    }

    /**
     * Add settings menu to WordPress admin
     */
    public function add_settings_menu() {
        add_submenu_page(
            'edit.php?post_type=scheda_order', // Parent menu (orders page)
            __('Impostazioni Scheda Clienti', 'scheda-clienti'),
            __('Impostazioni', 'scheda-clienti'),
            'manage_options',
            'sc-settings',
            [$this, 'render_settings_page']
        );
    }

    /**
     * Register plugin settings
     */
    public function register_settings() {
        // Register settings group
        register_setting('sc_settings_group', 'sc_sales_emails', [
            'type' => 'array',
            'sanitize_callback' => [$this, 'sanitize_email_array'],
            'default' => []
        ]);

        register_setting('sc_settings_group', 'sc_enable_notifications', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => '1'
        ]);

        register_setting('sc_settings_group', 'sc_email_from_name', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => get_bloginfo('name')
        ]);

        register_setting('sc_settings_group', 'sc_email_from_address', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_email',
            'default' => get_option('admin_email')
        ]);

        register_setting('sc_settings_group', 'sc_company_name', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => get_bloginfo('name')
        ]);

        register_setting('sc_settings_group', 'sc_company_address', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_textarea_field',
            'default' => ''
        ]);

        register_setting('sc_settings_group', 'sc_company_phone', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => ''
        ]);

        register_setting('sc_settings_group', 'sc_company_vat', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => ''
        ]);
    }

    /**
     * Sanitize email array
     */
    public function sanitize_email_array($emails) {
        if (!is_array($emails)) {
            return [];
        }

        $sanitized = [];
        foreach ($emails as $email) {
            $email = sanitize_email($email);
            if (is_email($email)) {
                $sanitized[] = $email;
            }
        }

        return array_unique($sanitized);
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('Non hai i permessi sufficienti per accedere a questa pagina.', 'scheda-clienti'));
        }

        // Get current settings
        $sales_emails = get_option('sc_sales_emails', []);
        $enable_notifications = get_option('sc_enable_notifications', '1');
        $email_from_name = get_option('sc_email_from_name', get_bloginfo('name'));
        $email_from_address = get_option('sc_email_from_address', get_option('admin_email'));
        $company_name = get_option('sc_company_name', get_bloginfo('name'));
        $company_address = get_option('sc_company_address', '');
        $company_phone = get_option('sc_company_phone', '');
        $company_vat = get_option('sc_company_vat', '');

        ?>
        <div class="wrap">
            <h1><?php _e('Impostazioni Scheda Clienti', 'scheda-clienti'); ?></h1>

            <form method="post" action="options.php">
                <?php settings_fields('sc_settings_group'); ?>

                <div class="sc-settings-container">
                    <!-- Notifications Section -->
                    <div class="sc-settings-section">
                        <h2><?php _e('Notifiche Email', 'scheda-clienti'); ?></h2>

                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="sc_enable_notifications"><?php _e('Abilita Notifiche', 'scheda-clienti'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox"
                                           id="sc_enable_notifications"
                                           name="sc_enable_notifications"
                                           value="1"
                                           <?php checked($enable_notifications, '1'); ?> />
                                    <p class="description"><?php _e('Invia notifiche email quando viene ricevuto un nuovo preventivo.', 'scheda-clienti'); ?></p>
                                </td>
                            </tr>

                            <tr>
                                <th scope="row">
                                    <label for="sc_sales_emails"><?php _e('Email Vendite (Multiple)', 'scheda-clienti'); ?></label>
                                </th>
                                <td>
                                    <div id="sc-emails-container">
                                        <?php if (empty($sales_emails)) : ?>
                                            <div class="sc-email-row">
                                                <input type="email"
                                                       name="sc_sales_emails[]"
                                                       class="regular-text sc-email-input"
                                                       placeholder="sales@example.com" />
                                                <button type="button" class="button sc-remove-email" style="display:none;">
                                                    <span class="dashicons dashicons-no-alt"></span>
                                                </button>
                                            </div>
                                        <?php else : ?>
                                            <?php foreach ($sales_emails as $index => $email) : ?>
                                                <div class="sc-email-row">
                                                    <input type="email"
                                                           name="sc_sales_emails[]"
                                                           class="regular-text sc-email-input"
                                                           value="<?php echo esc_attr($email); ?>"
                                                           placeholder="sales@example.com" />
                                                    <button type="button" class="button sc-remove-email">
                                                        <span class="dashicons dashicons-no-alt"></span>
                                                    </button>
                                                </div>
                                            <?php endforeach; ?>
                                        <?php endif; ?>
                                    </div>
                                    <button type="button" class="button" id="sc-add-email">
                                        <span class="dashicons dashicons-plus"></span>
                                        <?php _e('Aggiungi Email', 'scheda-clienti'); ?>
                                    </button>
                                    <p class="description">
                                        <?php _e('Aggiungi gli indirizzi email che devono ricevere le notifiche dei nuovi preventivi. Puoi aggiungere più indirizzi (es. Gmail, Outlook, ecc.).', 'scheda-clienti'); ?>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Email Configuration Section -->
                    <div class="sc-settings-section">
                        <h2><?php _e('Configurazione Email', 'scheda-clienti'); ?></h2>

                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="sc_email_from_name"><?php _e('Nome Mittente', 'scheda-clienti'); ?></label>
                                </th>
                                <td>
                                    <input type="text"
                                           id="sc_email_from_name"
                                           name="sc_email_from_name"
                                           class="regular-text"
                                           value="<?php echo esc_attr($email_from_name); ?>" />
                                    <p class="description"><?php _e('Il nome visualizzato come mittente delle email.', 'scheda-clienti'); ?></p>
                                </td>
                            </tr>

                            <tr>
                                <th scope="row">
                                    <label for="sc_email_from_address"><?php _e('Email Mittente', 'scheda-clienti'); ?></label>
                                </th>
                                <td>
                                    <input type="email"
                                           id="sc_email_from_address"
                                           name="sc_email_from_address"
                                           class="regular-text"
                                           value="<?php echo esc_attr($email_from_address); ?>" />
                                    <p class="description"><?php _e('L\'indirizzo email utilizzato come mittente. Usa un indirizzo email del tuo dominio per evitare problemi di spam.', 'scheda-clienti'); ?></p>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Company Information Section -->
                    <div class="sc-settings-section">
                        <h2><?php _e('Informazioni Azienda', 'scheda-clienti'); ?></h2>
                        <p class="description"><?php _e('Queste informazioni verranno mostrate nelle fatture via email.', 'scheda-clienti'); ?></p>

                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="sc_company_name"><?php _e('Nome Azienda', 'scheda-clienti'); ?></label>
                                </th>
                                <td>
                                    <input type="text"
                                           id="sc_company_name"
                                           name="sc_company_name"
                                           class="regular-text"
                                           value="<?php echo esc_attr($company_name); ?>" />
                                </td>
                            </tr>

                            <tr>
                                <th scope="row">
                                    <label for="sc_company_address"><?php _e('Indirizzo', 'scheda-clienti'); ?></label>
                                </th>
                                <td>
                                    <textarea id="sc_company_address"
                                              name="sc_company_address"
                                              class="regular-text"
                                              rows="3"><?php echo esc_textarea($company_address); ?></textarea>
                                </td>
                            </tr>

                            <tr>
                                <th scope="row">
                                    <label for="sc_company_phone"><?php _e('Telefono', 'scheda-clienti'); ?></label>
                                </th>
                                <td>
                                    <input type="text"
                                           id="sc_company_phone"
                                           name="sc_company_phone"
                                           class="regular-text"
                                           value="<?php echo esc_attr($company_phone); ?>" />
                                </td>
                            </tr>

                            <tr>
                                <th scope="row">
                                    <label for="sc_company_vat"><?php _e('P.IVA / Partita IVA', 'scheda-clienti'); ?></label>
                                </th>
                                <td>
                                    <input type="text"
                                           id="sc_company_vat"
                                           name="sc_company_vat"
                                           class="regular-text"
                                           value="<?php echo esc_attr($company_vat); ?>" />
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Save Button -->
                    <p class="submit">
                        <?php submit_button(__('Salva Impostazioni', 'scheda-clienti'), 'primary', 'submit', false); ?>
                    </p>
                </div>
            </form>

            <!-- Test Email Section -->
            <div class="sc-settings-section" style="margin-top: 20px; padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
                <h2><?php _e('Test Email', 'scheda-clienti'); ?></h2>
                <p><?php _e('Invia un\'email di prova per verificare la configurazione.', 'scheda-clienti'); ?></p>

                <button type="button" class="button" id="sc-send-test-email">
                    <?php _e('Invia Email di Prova', 'scheda-clienti'); ?>
                </button>
                <span class="sc-test-result" style="margin-left: 10px;"></span>
            </div>
        </div>

        <style>
        .sc-settings-container {
            max-width: 800px;
        }
        .sc-settings-section {
            background: #fff;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #ccd0d4;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
        }
        .sc-email-row {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .sc-email-row input {
            flex: 1;
            margin-right: 10px;
        }
        .sc-email-row .button {
            flex-shrink: 0;
        }
        .sc-remove-email .dashicons {
            font-size: 16px;
            width: 16px;
            height: 16px;
        }
        #sc-add-email {
            margin-top: 10px;
        }
        #sc-add-email .dashicons {
            font-size: 16px;
            width: 16px;
            height: 16px;
            vertical-align: middle;
        }
        </style>
        <?php
    }

    /**
     * Add settings link to plugins page
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="' . admin_url('edit.php?post_type=scheda_order&page=sc-settings') . '">' . __('Impostazioni', 'scheda-clienti') . '</a>';
        array_push($links, $settings_link);
        return $links;
    }

    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on our settings page
        if (isset($_GET['page']) && $_GET['page'] === 'sc-settings') {
            // Enqueue jQuery (already loaded, but ensuring availability)
            wp_enqueue_script('jquery');

            // Add inline script for our settings page
            wp_add_inline_script('jquery', $this->get_admin_inline_script());
        }
    }

    /**
     * Get inline JavaScript for admin settings
     */
    private function get_admin_inline_script() {
        $sending_text = __('Invio in corso...', 'scheda-clienti');
        $success_text = __('Email di prova inviata con successo!', 'scheda-clienti');
        $error_prefix = __('Errore nell\'invio dell\'email: ', 'scheda-clienti');
        $server_error = __('Errore di comunicazione con il server.', 'scheda-clienti');
        $send_button_text = __('Invia Email di Prova', 'scheda-clienti');
        $nonce = wp_create_nonce('sc_test_email_nonce');

        ob_start();
        ?>
        jQuery(document).ready(function($) {
            // Add email row
            $('#sc-add-email').on('click', function() {
                var newRow = '<div class="sc-email-row">' +
                    '<input type="email" name="sc_sales_emails[]" class="regular-text sc-email-input" placeholder="sales@example.com" />' +
                    '<button type="button" class="button sc-remove-email"><span class="dashicons dashicons-no-alt"></span></button>' +
                    '</div>';
                $('#sc-emails-container').append(newRow);
                updateRemoveButtons();
            });

            // Remove email row
            $(document).on('click', '.sc-remove-email', function() {
                $(this).closest('.sc-email-row').remove();
                updateRemoveButtons();
            });

            // Update remove buttons visibility
            function updateRemoveButtons() {
                var rows = $('.sc-email-row');
                if (rows.length > 1) {
                    rows.find('.sc-remove-email').show();
                } else {
                    rows.find('.sc-remove-email').hide();
                }
            }

            // Initialize remove buttons
            updateRemoveButtons();

            // Test email functionality
            $('#sc-send-test-email').on('click', function() {
                var $button = $(this);
                var $result = $('.sc-test-result');

                $button.prop('disabled', true).text('<?php echo esc_js($sending_text); ?>');
                $result.html('');

                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'sc_send_test_email',
                        nonce: '<?php echo esc_js($nonce); ?>'
                    },
                    success: function(response) {
                        if (response.success) {
                            $result.html('<span style="color: green;"><?php echo esc_js($success_text); ?></span>');
                        } else {
                            var errorMsg = response.data && response.data.message ? response.data.message : 'Unknown error';
                            $result.html('<span style="color: red;"><?php echo esc_js($error_prefix); ?>' + errorMsg + '</span>');
                        }
                    },
                    error: function() {
                        $result.html('<span style="color: red;"><?php echo esc_js($server_error); ?></span>');
                    },
                    complete: function() {
                        $button.prop('disabled', false).text('<?php echo esc_js($send_button_text); ?>');
                    }
                });
            });
        });
        <?php
        return ob_get_clean();
    }
}


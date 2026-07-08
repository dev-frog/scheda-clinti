<?php
/**
 * AJAX Handler Class
 *
 * Handles all AJAX requests for the Scheda Clienti plugin
 */

if (!defined('ABSPATH')) {
    exit;
}

class SC_AJAX_Handler {

    /**
     * Constructor
     */
    public function __construct() {
        // Register AJAX actions for logged-in users
        add_action('wp_ajax_sc_submit_form', [$this, 'handle_form_submission']);
        add_action('wp_ajax_sc_get_orders', [$this, 'handle_get_orders']);
        add_action('wp_ajax_sc_send_test_email', [$this, 'handle_test_email']);

        // Register AJAX actions for non-logged-in users
        add_action('wp_ajax_nopriv_sc_submit_form', [$this, 'handle_form_submission']);
    }

    /**
     * Handle form submission
     */
    public function handle_form_submission() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'sc_ajax_nonce')) {
            error_log('Scheda Clienti: Invalid nonce');
            wp_send_json_error([
                'message' => __('Token di sicurezza non valido.', 'scheda-clienti')
            ], 403);
        }

        // Check if form data is present
        if (!isset($_POST['form_data'])) {
            error_log('Scheda Clienti: No form data received');
            wp_send_json_error([
                'message' => __('Nessun dato del modulo ricevuto.', 'scheda-clienti')
            ], 400);
        }

        // Parse JSON form data
        $form_data = json_decode(stripslashes($_POST['form_data']), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Scheda Clienti: JSON decode error: ' . json_last_error_msg());
            wp_send_json_error([
                'message' => __('Formato dati del modulo non valido.', 'scheda-clienti')
            ], 400);
        }

        // Normalize data structure (handle flat structure from React)
        $normalized_data = $this->normalize_form_data($form_data);

        // Validate required fields
        $validation_result = $this->validate_form_data($normalized_data);
        if (is_wp_error($validation_result)) {
            error_log('Scheda Clienti: Validation error: ' . $validation_result->get_error_message());
            wp_send_json_error([
                'message' => $validation_result->get_error_message()
            ], 400);
        }

        // Sanitize data
        $sanitized_data = $this->sanitize_form_data($normalized_data);

        // Save order to database (backup)
        $order_id = $this->save_order($sanitized_data);

        if (is_wp_error($order_id)) {
            error_log('Scheda Clienti: Save error: ' . $order_id->get_error_message());
            // We still try to send email even if save fails
        }

        // Send email notifications (Primary focus)
        $this->send_notifications($sanitized_data, is_wp_error($order_id) ? 0 : $order_id);

        // Return success response
        wp_send_json_success([
            'message' => $this->get_success_message(),
            'order_id' => is_wp_error($order_id) ? 0 : $order_id,
            'order_number' => is_wp_error($order_id) ? 'N/A' : $this->format_order_number($order_id)
        ]);
    }

    /**
     * Normalize form data to expected structure
     */
    private function normalize_form_data($data) {
        // If data is already in customer_info format, return it
        if (isset($data['customer_info']) && is_array($data['customer_info'])) {
            return $data;
        }

        // Otherwise, move top-level customer fields into customer_info
        $normalized = [
            'customer_info' => [],
            'products' => isset($data['products']) ? $data['products'] : []
        ];

        // Updated customer fields with new anagrafica structure
        $customer_fields = [
            'name', 'taxId', 'telephone', 'email',
            'addressStreet', 'addressNumber', 'zipCode', 'city', 'province',
            'floor', 'stairInternal', 'hasElevator', 'accessNotes',
            'additionalNotes'
        ];

        foreach ($customer_fields as $field) {
            if (isset($data[$field])) {
                $normalized['customer_info'][$field] = $data[$field];
            }
        }

        return $normalized;
    }

    /**
     * Validate form data
     */
    private function validate_form_data($data) {
        // Check customer info
        if (!isset($data['customer_info']) || !is_array($data['customer_info'])) {
            return new WP_Error('missing_info', __('Informazioni cliente mancanti.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['name'])) {
            return new WP_Error('missing_name', __('Il nome è obbligatorio.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['taxId'])) {
            return new WP_Error('missing_taxid', __('Il Codice Fiscale/P.IVA è obbligatorio.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['telephone'])) {
            return new WP_Error('missing_phone', __('Il telefono è obbligatorio.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['email']) || !is_email($data['customer_info']['email'])) {
            return new WP_Error('invalid_email', __('È richiesta un\'email valida.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['addressStreet'])) {
            return new WP_Error('missing_street', __('La via/piazza è obbligatoria.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['addressNumber'])) {
            return new WP_Error('missing_number', __('Il civico è obbligatorio.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['zipCode'])) {
            return new WP_Error('missing_zip', __('Il CAP è obbligatorio.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['city'])) {
            return new WP_Error('missing_city', __('La città è obbligatoria.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['province'])) {
            return new WP_Error('missing_province', __('La provincia è obbligatoria.', 'scheda-clienti'));
        }

        return true;
    }

    /**
     * Sanitize form data
     */
    private function sanitize_form_data($data) {
        $sanitized = [
            'customer_info' => [],
            'products' => []
        ];

        // Sanitize customer info - updated with new fields
        $customer_fields = [
            'name', 'taxId', 'telephone', 'email',
            'addressStreet', 'addressNumber', 'zipCode', 'city', 'province',
            'floor', 'stairInternal', 'accessNotes', 'additionalNotes'
        ];

        foreach ($customer_fields as $field) {
            if (isset($data['customer_info'][$field])) {
                $sanitized['customer_info'][$field] = sanitize_text_field($data['customer_info'][$field]);
            }
        }

        // Sanitize email
        if (isset($sanitized['customer_info']['email'])) {
            $sanitized['customer_info']['email'] = sanitize_email($sanitized['customer_info']['email']);
        }

        // Handle elevator boolean
        if (isset($data['customer_info']['hasElevator'])) {
            $sanitized['customer_info']['hasElevator'] = rest_sanitize_boolean($data['customer_info']['hasElevator']);
        }

        // Sanitize products
        if (isset($data['products']) && is_array($data['products'])) {
            foreach ($data['products'] as $product) {
                $sanitized_product = [
                    'type' => sanitize_text_field($product['type']),
                    'details' => []
                ];

                if (isset($product['details']) && is_array($product['details'])) {
                    foreach ($product['details'] as $key => $value) {
                        if (is_array($value)) {
                            $sanitized_product['details'][$key] = array_map('sanitize_text_field', $value);
                        } else {
                            $sanitized_product['details'][$key] = sanitize_text_field($value);
                        }
                    }
                }

                $sanitized['products'][] = $sanitized_product;
            }
        }

        return $sanitized;
    }

    /**
     * Save order to database
     */
    private function save_order($data) {
        $customer_name = $data['customer_info']['name'];

        // Create post
        $post_data = [
            'post_title' => sprintf(__('Ordine da %s', 'scheda-clienti'), $customer_name),
            'post_type' => 'scheda_order',
            'post_status' => 'draft', // Changed from 'private' to 'draft' for better visibility
            'post_author' => 1,
        ];

        $post_id = wp_insert_post($post_data);

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        // Store customer info as post meta
        foreach ($data['customer_info'] as $key => $value) {
            update_post_meta($post_id, 'customer_' . $key, $value);
        }

        // Store products as post meta
        update_post_meta($post_id, 'order_products', $data['products']);

        // Store order metadata
        update_post_meta($post_id, 'order_date', current_time('mysql'));
        update_post_meta($post_id, 'order_status', 'pending');

        // Store customer email for easy access
        update_post_meta($post_id, 'customer_email', $data['customer_info']['email']);

        /**
         * Action hook after order is saved
         */
        do_action('sc_order_saved', $post_id, $data);

        return $post_id;
    }

    /**
     * Send email notifications
     */
    private function send_notifications($data, $order_id) {
        // Check if notifications are enabled
        if (!get_option('sc_enable_notifications', '1')) {
            error_log('Scheda Clienti: Notifications are disabled in settings');
            return;
        }

        // Get sales emails (multiple recipients)
        $sales_emails = get_option('sc_sales_emails', []);

        // Fallback to admin email if no sales emails configured
        if (empty($sales_emails)) {
            $sales_emails = [get_option('admin_email')];
        }

        $order_number = ($order_id > 0) ? $this->format_order_number($order_id) : 'N/A';
        $subject = sprintf(__('Nuovo Ordine: %s', 'scheda-clienti'), $order_number);
        $message = $this->format_email_message($data, $order_id);

        // Get email configuration
        $from_name = get_option('sc_email_from_name', get_bloginfo('name'));
        $from_address = get_option('sc_email_from_address', get_option('admin_email'));

        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $from_name . ' <' . $from_address . '>',
            'Reply-To: ' . $data['customer_info']['name'] . ' <' . $data['customer_info']['email'] . '>'
        ];

        // Send to all sales email recipients
        $success_count = 0;
        foreach ($sales_emails as $recipient) {
            if (!is_email($recipient)) {
                error_log('Scheda Clienti: Invalid email address: ' . $recipient);
                continue;
            }

            $admin_sent = wp_mail($recipient, $subject, $message, $headers);
            if (!$admin_sent) {
                error_log('Scheda Clienti: Failed to send admin notification to ' . $recipient);
            } else {
                error_log('Scheda Clienti: Admin notification sent successfully to ' . $recipient);
                $success_count++;
            }
        }

        error_log('Scheda Clienti: Successfully sent ' . $success_count . ' of ' . count($sales_emails) . ' admin notifications');

        // Send confirmation to customer
        if (!empty($data['customer_info']['email'])) {
            $customer_subject = __('Conferma del tuo ordine', 'scheda-clienti');
            $customer_message = $this->format_customer_confirmation($data, $order_id);
            $customer_sent = wp_mail($data['customer_info']['email'], $customer_subject, $customer_message, $headers);
            if (!$customer_sent) {
                error_log('Scheda Clienti: Failed to send customer confirmation to ' . $data['customer_info']['email']);
            } else {
                error_log('Scheda Clienti: Customer confirmation sent successfully to ' . $data['customer_info']['email']);
            }
        }
    }

    /**
     * Format email message for admin
     */
    private function format_email_message($data, $order_id) {
        $blog_name = get_bloginfo('name');
        $order_number = $this->format_order_number($order_id);

        // Get company information
        $company_name = get_option('sc_company_name', $blog_name);
        $company_address = get_option('sc_company_address', '');
        $company_phone = get_option('sc_company_phone', '');
        $company_vat = get_option('sc_company_vat', '');

        ob_start();
        ?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><?php printf(__('Fattura Ordine: %s', 'scheda-clienti'), $order_number); ?></title>
    <style>
        .invoice-container { max-width: 700px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
        .invoice-header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .invoice-body { background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; }
        .invoice-footer { background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
        .company-info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .info-item { padding: 10px; background: #f9fafb; border-radius: 5px; }
        .info-label { font-weight: bold; color: #374151; font-size: 12px; }
        .info-value { color: #6b7280; margin-top: 5px; }
        .product-section { margin-top: 25px; }
        .product-item { background: #f9fafb; padding: 15px; margin: 10px 0; border-left: 4px solid #14b8a6; border-radius: 5px; }
        .section-title { color: #14b8a6; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #14b8a6; padding-bottom: 5px; }
        .btn-view { background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 15px; }
        .btn-view:hover { background: #0d9488; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    </style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
    <div class="invoice-container">
        <!-- Invoice Header -->
        <div class="invoice-header">
            <h1 style="margin: 0; font-size: 24px;"><?php _e('FATTURA ORDINE', 'scheda-clienti'); ?></h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;"><?php echo esc_html($order_number); ?></p>
            <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px;"><?php echo current_time('d/m/Y H:i'); ?></p>
        </div>

        <!-- Invoice Body -->
        <div class="invoice-body">
            <!-- Company Information -->
            <div class="company-info">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <h3 style="margin: 0 0 10px 0; color: #14b8a6;"><?php echo esc_html($company_name); ?></h3>
                        <?php if ($company_address): ?>
                            <p style="margin: 5px 0; color: #6b7280; font-size: 13px;">
                                <strong><?php _e('Indirizzo:', 'scheda-clienti'); ?></strong><br>
                                <?php echo nl2br(esc_html($company_address)); ?>
                            </p>
                        <?php endif; ?>
                        <?php if ($company_phone): ?>
                            <p style="margin: 5px 0; color: #6b7280; font-size: 13px;">
                                <strong><?php _e('Tel:', 'scheda-clienti'); ?></strong> <?php echo esc_html($company_phone); ?>
                            </p>
                        <?php endif; ?>
                        <?php if ($company_vat): ?>
                            <p style="margin: 5px 0; color: #6b7280; font-size: 13px;">
                                <strong><?php _e('P.IVA:', 'scheda-clienti'); ?></strong> <?php echo esc_html($company_vat); ?>
                            </p>
                        <?php endif; ?>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px;">
                            <strong><?php _e('Data Ordine:', 'scheda-clienti'); ?></strong><br>
                            <span style="font-size: 16px; color: #14b8a6;"><?php echo current_time('d/m/Y'); ?></span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Customer Information -->
            <div class="section-title">
                <?php _e('INFORMAZIONI CLIENTE', 'scheda-clienti'); ?>
            </div>
            <div class="info-grid">
                <?php if (!empty($data['customer_info']['name'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('NOME/RAGIONE SOCIALE', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo esc_html($data['customer_info']['name']); ?></div>
                </div>
                <?php endif; ?>
                <?php if (!empty($data['customer_info']['taxId'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('CODICE FISCALE/P.IVA', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo esc_html($data['customer_info']['taxId']); ?></div>
                </div>
                <?php endif; ?>
                <?php if (!empty($data['customer_info']['telephone'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('CELLULARE', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo esc_html($data['customer_info']['telephone']); ?></div>
                </div>
                <?php endif; ?>
                <?php if (!empty($data['customer_info']['email'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('EMAIL', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo esc_html($data['customer_info']['email']); ?></div>
                </div>
                <?php endif; ?>
            </div>

            <!-- Installation Address -->
            <div class="section-title" style="margin-top: 25px;">
                <?php _e('INDIRIZZO DI INSTALLAZIONE', 'scheda-clienti'); ?>
            </div>
            <div class="info-grid">
                <?php if (!empty($data['customer_info']['addressStreet'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('VIA/PIAZZA', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo esc_html($data['customer_info']['addressStreet']); ?></div>
                </div>
                <?php endif; ?>
                <?php if (!empty($data['customer_info']['addressNumber'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('CIVICO', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo esc_html($data['customer_info']['addressNumber']); ?></div>
                </div>
                <?php endif; ?>
                <?php if (!empty($data['customer_info']['zipCode'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('CAP', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo esc_html($data['customer_info']['zipCode']); ?></div>
                </div>
                <?php endif; ?>
                <?php if (!empty($data['customer_info']['city'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('CITTÀ', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo esc_html($data['customer_info']['city']); ?></div>
                </div>
                <?php endif; ?>
                <?php if (!empty($data['customer_info']['province'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('PROVINCIA', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo esc_html($data['customer_info']['province']); ?></div>
                </div>
                <?php endif; ?>
            </div>

            <!-- Logistical Details -->
            <div class="section-title" style="margin-top: 25px;">
                <?php _e('DETTAGLI LOGISTICI CANTIERE', 'scheda-clienti'); ?>
            </div>
            <div class="info-grid">
                <?php if (!empty($data['customer_info']['floor'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('PIANO', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo esc_html($data['customer_info']['floor']); ?></div>
                </div>
                <?php endif; ?>
                <?php if (!empty($data['customer_info']['stairInternal'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('SCALA/INTERNO', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo esc_html($data['customer_info']['stairInternal']); ?></div>
                </div>
                <?php endif; ?>
                <?php if (isset($data['customer_info']['hasElevator'])): ?>
                <div class="info-item">
                    <div class="info-label"><?php _e('ASCENSORE', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo $data['customer_info']['hasElevator'] ? __('Sì', 'scheda-clienti') : __('No', 'scheda-clienti'); ?></div>
                </div>
                <?php endif; ?>
                <?php if (!empty($data['customer_info']['accessNotes'])): ?>
                <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="info-label"><?php _e('NOTE ACCESSO', 'scheda-clienti'); ?></div>
                    <div class="info-value"><?php echo nl2br(esc_html($data['customer_info']['accessNotes'])); ?></div>
                </div>
                <?php endif; ?>
            </div>

            <!-- Products Section -->
            <div class="product-section">
                <div class="section-title">
                    <?php _e('ARTICOLI ORDINATI', 'scheda-clienti'); ?>
                </div>

                <?php if (!empty($data['products'])): ?>
                    <?php
                    $grouped = [];
                    foreach ($data['products'] as $product) {
                        if (!isset($grouped[$product['type']])) {
                            $grouped[$product['type']] = [];
                        }
                        $grouped[$product['type']][] = $product;
                    }

                    $total_items = 0;
                    foreach ($grouped as $type => $items): ?>
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #374151; margin-bottom: 10px;">
                                <?php echo esc_html($type); ?>
                                <span style="background: #14b8a6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">
                                    <?php echo count($items); ?> <?php _e('articoli', 'scheda-clienti'); ?>
                                </span>
                            </h4>
                            <?php foreach ($items as $index => $item): ?>
                                <div class="product-item">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <h5 style="margin: 0 0 10px 0; color: #14b8a6;">
                                            <?php printf(__('Articolo %d', 'scheda-clienti'), $index + 1); ?>
                                        </h5>
                                        <span style="font-size: 11px; color: #9ca3af;">#<?php echo $total_items + $index + 1; ?></span>
                                    </div>
                                    <table style="margin: 0;">
                                        <?php foreach ($item['details'] as $key => $value): ?>
                                            <?php if ($key !== 'id' && $value): ?>
                                                <tr>
                                                    <td style="width: 40%; font-weight: 500; color: #374151;">
                                                        <?php echo esc_html(ucfirst(str_replace('_', ' ', $key))); ?>
                                                    </td>
                                                    <td style="color: #6b7280;">
                                                        <?php echo esc_html(is_array($value) ? implode(', ', $value) : $value); ?>
                                                    </td>
                                                </tr>
                                            <?php endif; ?>
                                        <?php endforeach; ?>
                                    </table>
                                </div>
                            <?php endforeach; ?>
                            <?php $total_items += count($items); ?>
                        </div>
                    <?php endforeach; ?>

                    <!-- Summary -->
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
                        <p style="margin: 0; font-size: 16px; color: #374151;">
                            <strong><?php _e('Totale Articoli:', 'scheda-clienti'); ?></strong>
                            <span style="color: #14b8a6; font-size: 24px; margin-left: 10px;"><?php echo $total_items; ?></span>
                        </p>
                    </div>
                <?php else: ?>
                    <p style="text-align: center; color: #9ca3af; padding: 20px;">
                        <?php _e('Nessun prodotto selezionato.', 'scheda-clienti'); ?>
                    </p>
                <?php endif; ?>
            </div>

            <!-- Additional Notes -->
            <?php if (!empty($data['customer_info']['additional_notes'])): ?>
                <div style="margin-top: 20px; padding: 15px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 5px;">
                    <div style="font-weight: bold; color: #92400e; margin-bottom: 5px;">
                        <?php _e('NOTE ADDIZIONALI:', 'scheda-clienti'); ?>
                    </div>
                    <div style="color: #b45309;">
                        <?php echo nl2br(esc_html($data['customer_info']['additional_notes'])); ?>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Action Button -->
            <div style="text-align: center; margin-top: 30px;">
                <a href="<?php echo admin_url('post.php?post=' . $order_id . '&action=edit'); ?>" class="btn-view">
                    <?php _e('VISUALIZZA ORDINE IN ADMIN', 'scheda-clienti'); ?>
                </a>
            </div>
        </div>

        <!-- Invoice Footer -->
        <div class="invoice-footer">
            <p style="margin: 0;"><?php printf(__('Generato da %s - Plugin Scheda Clienti v%s', 'scheda-clienti'), $blog_name, SC_VERSION); ?></p>
            <p style="margin: 5px 0 0 0;"><?php echo current_time('d/m/Y H:i:s'); ?></p>
        </div>
    </div>
</body>
</html>
        <?php
        return ob_get_clean();
    }

    /**
     * Format customer confirmation email
     */
    private function format_customer_confirmation($data, $order_id) {
        $blog_name = get_bloginfo('name');
        $order_number = $this->format_order_number($order_id);

        // Get company information
        $company_name = get_option('sc_company_name', $blog_name);
        $company_phone = get_option('sc_company_phone', '');

        ob_start();
        ?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><?php _e('Conferma Ordine', 'scheda-clienti'); ?></title>
    <style>
        .confirm-container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
        .confirm-header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .confirm-body { background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; }
        .confirm-footer { background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
        .order-summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 600; color: #374151; }
        .info-value { color: #6b7280; }
        .product-list { list-style: none; padding: 0; margin: 15px 0; }
        .product-list li { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .product-list li:last-child { border-bottom: none; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
    </style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
    <div class="confirm-container">
        <!-- Header -->
        <div class="confirm-header">
            <div class="success-icon">✓</div>
            <h1 style="margin: 10px 0; font-size: 24px;">
                <?php _e('GRAZIE PER IL TUO ORDINE!', 'scheda-clienti'); ?>
            </h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">
                <?php echo esc_html($order_number); ?>
            </p>
        </div>

        <!-- Body -->
        <div class="confirm-body">
            <p style="font-size: 16px; color: #374151; text-align: center; margin: 20px 0;">
                <?php _e('Abbiamo ricevuto il tuo ordine con successo. Ti contatteremo al più presto per confermare i dettagli e procedere con la consegna.', 'scheda-clienti'); ?>
            </p>

            <!-- Order Summary -->
            <div class="order-summary">
                <h3 style="margin: 0 0 15px 0; color: #14b8a6; text-align: center;">
                    <?php _e('RIEPILOGO ORDINE', 'scheda-clienti'); ?>
                </h3>

                <div class="info-row">
                    <span class="info-label"><?php _e('Numero Ordine:', 'scheda-clienti'); ?></span>
                    <span class="info-value"><?php echo esc_html($order_number); ?></span>
                </div>
                <div class="info-row">
                    <span class="info-label"><?php _e('Data:', 'scheda-clienti'); ?></span>
                    <span class="info-value"><?php echo current_time('d/m/Y H:i'); ?></span>
                </div>
                <?php if (!empty($data['customer_info']['name'])): ?>
                <div class="info-row">
                    <span class="info-label"><?php _e('Nome:', 'scheda-clienti'); ?></span>
                    <span class="info-value"><?php echo esc_html($data['customer_info']['name']); ?></span>
                </div>
                <?php endif; ?>
                <?php if (!empty($data['customer_info']['taxId'])): ?>
                <div class="info-row">
                    <span class="info-label"><?php _e('CF/P.IVA:', 'scheda-clienti'); ?></span>
                    <span class="info-value"><?php echo esc_html($data['customer_info']['taxId']); ?></span>
                </div>
                <?php endif; ?>
                <?php if (!empty($data['customer_info']['email'])): ?>
                <div class="info-row">
                    <span class="info-label"><?php _e('Email:', 'scheda-clienti'); ?></span>
                    <span class="info-value"><?php echo esc_html($data['customer_info']['email']); ?></span>
                </div>
                <?php endif; ?>

                <!-- Installation Address -->
                <?php if (!empty($data['customer_info']['addressStreet']) || !empty($data['customer_info']['city'])): ?>
                <div style="margin-top: 15px; padding: 10px; background: #f9fafb; border-radius: 5px;">
                    <div style="font-weight: 600; color: #14b8a6; margin-bottom: 8px;">
                        <?php _e('Indirizzo Installazione:', 'scheda-clienti'); ?>
                    </div>
                    <?php if (!empty($data['customer_info']['addressStreet'])): ?>
                    <div style="color: #6b7280; font-size: 14px;">
                        <?php echo esc_html($data['customer_info']['addressStreet']); ?>
                        <?php if (!empty($data['customer_info']['addressNumber'])) echo ' ' . esc_html($data['customer_info']['addressNumber']); ?>
                    </div>
                    <?php endif; ?>
                    <?php if (!empty($data['customer_info']['zipCode']) || !empty($data['customer_info']['city'])): ?>
                    <div style="color: #6b7280; font-size: 14px;">
                        <?php echo esc_html($data['customer_info']['zipCode']); ?> <?php echo esc_html($data['customer_info']['city']); ?>
                        <?php if (!empty($data['customer_info']['province'])) echo ' (' . esc_html($data['customer_info']['province']) . ')'; ?>
                    </div>
                    <?php endif; ?>
                </div>
                <?php endif; ?>

                <!-- Logistical Details -->
                <?php if (!empty($data['customer_info']['floor']) || !empty($data['customer_info']['hasElevator'])): ?>
                <div style="margin-top: 10px; padding: 10px; background: #f9fafb; border-radius: 5px;">
                    <div style="font-weight: 600; color: #14b8a6; margin-bottom: 8px;">
                        <?php _e('Dettagli Logistici:', 'scheda-clienti'); ?>
                    </div>
                    <?php if (!empty($data['customer_info']['floor'])): ?>
                    <div style="color: #6b7280; font-size: 14px;">
                        <strong><?php _e('Piano:', 'scheda-clienti'); ?></strong> <?php echo esc_html($data['customer_info']['floor']); ?>
                    </div>
                    <?php endif; ?>
                    <?php if (isset($data['customer_info']['hasElevator'])): ?>
                    <div style="color: #6b7280; font-size: 14px;">
                        <strong><?php _e('Ascensore:', 'scheda-clienti'); ?></strong> <?php echo $data['customer_info']['hasElevator'] ? __('Sì', 'scheda-clienti') : __('No', 'scheda-clienti'); ?>
                    </div>
                    <?php endif; ?>
                </div>
                <?php endif; ?>
            </div>

            <!-- Products -->
            <div style="margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #14b8a6; text-align: center;">
                    <?php _e('PRODOTTI SELEZIONATI', 'scheda-clienti'); ?>
                </h3>
                <ul class="product-list">
                    <?php if (!empty($data['products'])): ?>
                        <?php
                        $grouped = [];
                        foreach ($data['products'] as $product) {
                            if (!isset($grouped[$product['type']])) {
                                $grouped[$product['type']] = 0;
                            }
                            $grouped[$product['type']]++;
                        }

                        foreach ($grouped as $type => $count): ?>
                            <li>
                                <span style="font-weight: 500; color: #374151;">
                                    <?php echo esc_html($type); ?>
                                </span>
                                <span style="float: right; background: #14b8a6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
                                    ×<?php echo $count; ?>
                                </span>
                            </li>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <li style="text-align: center; color: #9ca3af;">
                            <?php _e('Nessun prodotto selezionato.', 'scheda-clienti'); ?>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>

            <!-- Next Steps -->
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #14b8a6;">
                <h4 style="margin: 0 0 10px 0; color: #14b8a6;">
                    <?php _e('PROSSIMI PASSI', 'scheda-clienti'); ?>
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: #065f46; font-size: 14px;">
                    <li><?php _e('Riceverai una email di conferma con i dettagli del tuo ordine', 'scheda-clienti'); ?></li>
                    <li><?php _e('Il nostro team ti contatterà entro 24-48 ore per confermare l\'ordine', 'scheda-clienti'); ?></li>
                    <li><?php _e('Concorderemo insieme i tempi di consegna e il pagamento', 'scheda-clienti'); ?></li>
                </ul>
            </div>

            <!-- Contact -->
            <?php if ($company_phone): ?>
            <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    <?php _e('Per domande o assistenza, contattaci al:', 'scheda-clienti'); ?>
                </p>
                <p style="margin: 5px 0 0 0; font-weight: bold; color: #14b8a6; font-size: 16px;">
                    <?php echo esc_html($company_phone); ?>
                </p>
            </div>
            <?php endif; ?>
        </div>

        <!-- Footer -->
        <div class="confirm-footer">
            <p style="margin: 0;">
                <strong><?php echo esc_html($company_name); ?></strong>
            </p>
            <p style="margin: 5px 0 0 0;">
                <?php printf(__('Plugin Scheda Clienti v%s', 'scheda-clienti'), SC_VERSION); ?>
            </p>
            <p style="margin: 5px 0 0 0;">
                <?php echo current_time('d/m/Y H:i:s'); ?>
            </p>
        </div>
    </div>
</body>
</html>
        <?php
        return ob_get_clean();
    }

    /**
     * Format order number
     */
    private function format_order_number($order_id) {
        return 'SC-' . str_pad($order_id, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get success message
     */
    private function get_success_message() {
        return get_option('sc_success_message',
            __('Grazie! Il tuo ordine è stato inviato con successo. Ti contatteremo al più presto.', 'scheda-clienti')
        );
    }

    /**
     * Handle get orders request (admin only)
     */
    public function handle_get_orders() {
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error([
                'message' => __('Non autorizzato', 'scheda-clienti')
            ], 403);
        }

        // Get orders
        $orders = get_posts([
            'post_type' => 'scheda_order',
            'posts_per_page' => -1,
            'orderby' => 'date',
            'order' => 'DESC'
        ]);

        $orders_data = [];
        foreach ($orders as $order) {
            $orders_data[] = [
                'id' => $order->ID,
                'title' => $order->post_title,
                'date' => $order->post_date,
                'status' => $order->post_status,
                'customer_email' => get_post_meta($order->ID, 'customer_email', true),
                'order_status' => get_post_meta($order->ID, 'order_status', true)
            ];
        }

        wp_send_json_success(['orders' => $orders_data]);
    }

    /**
     * Handle test email request
     */
    public function handle_test_email() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'sc_test_email_nonce')) {
            wp_send_json_error([
                'message' => __('Token di sicurezza non valido.', 'scheda-clienti')
            ], 403);
        }

        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error([
                'message' => __('Non autorizzato', 'scheda-clienti')
            ], 403);
        }

        // Get sales emails
        $sales_emails = get_option('sc_sales_emails', []);

        // Fallback to admin email if no sales emails configured
        if (empty($sales_emails)) {
            $sales_emails = [get_option('admin_email')];
        }

        $from_name = get_option('sc_email_from_name', get_bloginfo('name'));
        $from_address = get_option('sc_email_from_address', get_option('admin_email'));

        $subject = __('Email di Prova - Scheda Clienti', 'scheda-clienti');
        $message = $this->format_test_email_message();

        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $from_name . ' <' . $from_address . '>'
        ];

        $success_count = 0;
        foreach ($sales_emails as $recipient) {
            if (!is_email($recipient)) {
                continue;
            }

            $sent = wp_mail($recipient, $subject, $message, $headers);
            if ($sent) {
                $success_count++;
            }
        }

        if ($success_count > 0) {
            wp_send_json_success([
                'message' => sprintf(__('Email di prova inviata con successo a %d destinatari.', 'scheda-clienti'), $success_count)
            ]);
        } else {
            wp_send_json_error([
                'message' => __('Impossibile inviare l\'email di prova. Verifica la configurazione del server.', 'scheda-clienti')
            ]);
        }
    }

    /**
     * Format test email message
     */
    private function format_test_email_message() {
        $blog_name = get_bloginfo('name');
        $company_name = get_option('sc_company_name', $blog_name);

        ob_start();
        ?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><?php _e('Email di Prova', 'scheda-clienti'); ?></title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #14b8a6;"><?php _e('Email di Prova', 'scheda-clienti'); ?></h2>

        <p><?php printf(__('Questa è un\'email di prova inviata dal plugin %s.', 'scheda-clienti'), $company_name); ?></p>

        <p><?php _e('Se ricevi questa email, la configurazione delle notifiche è corretta.', 'scheda-clienti'); ?></p>

        <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 3px solid #14b8a6;">
            <h3 style="margin-top: 0;"><?php _e('Dettagli Configurazione', 'scheda-clienti'); ?></h3>
            <ul style="list-style: none; padding: 0;">
                <li><strong><?php _e('Azienda:', 'scheda-clienti'); ?></strong> <?php echo esc_html($company_name); ?></li>
                <li><strong><?php _e('Data:', 'scheda-clienti'); ?></strong> <?php echo current_time('Y-m-d H:i'); ?></li>
                <li><strong><?php _e('Plugin:', 'scheda-clienti'); ?></strong> Scheda Clienti v<?php echo SC_VERSION; ?></li>
            </ul>
        </div>

        <p style="color: #666; font-size: 12px;">
            <?php printf(__('%s', 'scheda-clienti'), $blog_name); ?>
        </p>
    </div>
</body>
</html>
        <?php
        return ob_get_clean();
    }
}

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
                'message' => __('Invalid security token.', 'scheda-clienti')
            ], 403);
        }

        // Check if form data is present
        if (!isset($_POST['form_data'])) {
            error_log('Scheda Clienti: No form data received');
            wp_send_json_error([
                'message' => __('No form data received.', 'scheda-clienti')
            ], 400);
        }

        // Parse JSON form data
        $form_data = json_decode(stripslashes($_POST['form_data']), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Scheda Clienti: JSON decode error: ' . json_last_error_msg());
            wp_send_json_error([
                'message' => __('Invalid form data format.', 'scheda-clienti')
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

        $customer_fields = ['name', 'email', 'telephone', 'city', 'address', 'additionalNotes'];
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
            return new WP_Error('missing_info', __('Customer information is missing.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['name'])) {
            return new WP_Error('missing_name', __('Name is required.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['email']) || !is_email($data['customer_info']['email'])) {
            return new WP_Error('invalid_email', __('Valid email is required.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['telephone'])) {
            return new WP_Error('missing_phone', __('Telephone is required.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['city'])) {
            return new WP_Error('missing_city', __('City is required.', 'scheda-clienti'));
        }

        if (empty($data['customer_info']['address'])) {
            return new WP_Error('missing_address', __('Address is required.', 'scheda-clienti'));
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

        // Sanitize customer info
        $customer_fields = ['name', 'email', 'telephone', 'city', 'address', 'additional_notes'];
        foreach ($customer_fields as $field) {
            $key = $field === 'additional_notes' ? 'additionalNotes' : $field;
            if (isset($data['customer_info'][$key])) {
                $sanitized['customer_info'][$field] = sanitize_text_field($data['customer_info'][$key]);
            }
        }

        // Sanitize email
        if (isset($sanitized['customer_info']['email'])) {
            $sanitized['customer_info']['email'] = sanitize_email($sanitized['customer_info']['email']);
        }

        // Sanitize textarea
        if (isset($data['customer_info']['address'])) {
            $sanitized['customer_info']['address'] = sanitize_textarea_field($data['customer_info']['address']);
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
            'post_title' => sprintf(__('Order from %s', 'scheda-clienti'), $customer_name),
            'post_type' => 'scheda_order',
            'post_status' => 'private',
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

        $recipient = get_option('sc_email_recipient', get_option('admin_email'));

        if (empty($recipient)) {
            error_log('Scheda Clienti: No recipient email configured');
            return;
        }

        $order_number = ($order_id > 0) ? $this->format_order_number($order_id) : 'N/A';
        $subject = sprintf(__('New Order: %s', 'scheda-clienti'), $order_number);
        $message = $this->format_email_message($data, $order_id);

        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . get_bloginfo('name') . ' <' . get_option('admin_email') . '>',
            'Reply-To: ' . $data['customer_info']['name'] . ' <' . $data['customer_info']['email'] . '>'
        ];

        // Send to admin
        $admin_sent = wp_mail($recipient, $subject, $message, $headers);
        if (!$admin_sent) {
            error_log('Scheda Clienti: Failed to send admin notification to ' . $recipient);
        } else {
            error_log('Scheda Clienti: Admin notification sent successfully to ' . $recipient);
        }

        // Send confirmation to customer
        if (!empty($data['customer_info']['email'])) {
            $customer_subject = __('Your Order Confirmation', 'scheda-clienti');
            $customer_message = $this->format_customer_confirmation($data, $order_id);
            $customer_sent = wp_mail($data['customer_info']['email'], $customer_subject, $customer_message, $headers);
            if (!$customer_sent) {
                error_log('Scheda Clienti: Failed to send customer confirmation to ' . $data['customer_info']['email']);
            }
        }
    }

    /**
     * Format email message for admin
     */
    private function format_email_message($data, $order_id) {
        $blog_name = get_bloginfo('name');
        $order_number = $this->format_order_number($order_id);

        ob_start();
        ?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><?php printf(__('New Order: %s', 'scheda-clienti'), $order_number); ?></title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #14b8a6;"><?php _e('New Order Received', 'scheda-clienti'); ?></h2>

        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong><?php _e('Order Number:', 'scheda-clienti'); ?></strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><?php echo esc_html($order_number); ?></td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong><?php _e('Date:', 'scheda-clienti'); ?></strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><?php echo current_time('Y-m-d H:i'); ?></td>
            </tr>
        </table>

        <h3 style="color: #14b8a6; margin-top: 20px;"><?php _e('Customer Information', 'scheda-clienti'); ?></h3>
        <table style="width: 100%; border-collapse: collapse;">
            <?php foreach ($data['customer_info'] as $key => $value): ?>
                <?php if ($value): ?>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; width: 30%;"><strong><?php echo esc_html(ucfirst(str_replace('_', ' ', $key))); ?>:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><?php echo esc_html($value); ?></td>
                </tr>
                <?php endif; ?>
            <?php endforeach; ?>
        </table>

        <h3 style="color: #14b8a6; margin-top: 20px;"><?php _e('Order Items', 'scheda-clienti'); ?></h3>
        <?php if (!empty($data['products'])): ?>
            <?php
            $grouped = [];
            foreach ($data['products'] as $product) {
                if (!isset($grouped[$product['type']])) {
                    $grouped[$product['type']] = [];
                }
                $grouped[$product['type']][] = $product;
            }

            foreach ($grouped as $type => $items): ?>
                <h4 style="margin-top: 15px;"><?php echo esc_html($type); ?> (<?php echo count($items); ?>)</h4>
                <?php foreach ($items as $index => $item): ?>
                    <div style="background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 3px solid #14b8a6;">
                        <h5 style="margin: 0 0 10px 0;"><?php printf(__('Item %d', 'scheda-clienti'), $index + 1); ?></h5>
                        <?php foreach ($item['details'] as $key => $value): ?>
                            <?php if ($key !== 'id' && $value): ?>
                                <p style="margin: 5px 0;">
                                    <strong><?php echo esc_html(ucfirst(str_replace('_', ' ', $key))); ?>:</strong>
                                    <?php echo esc_html(is_array($value) ? implode(', ', $value) : $value); ?>
                                </p>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </div>
                <?php endforeach; ?>
            <?php endforeach; ?>
        <?php else: ?>
            <p><?php _e('No products selected.', 'scheda-clienti'); ?></p>
        <?php endif; ?>

        <p style="margin-top: 30px; padding: 15px; background: #f3f4f6; border-radius: 5px;">
            <a href="<?php echo admin_url('post.php?post=' . $order_id . '&action=edit'); ?>" style="background: #14b8a6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                <?php _e('View Order in Admin', 'scheda-clienti'); ?>
            </a>
        </p>
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

        ob_start();
        ?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><?php _e('Order Confirmation', 'scheda-clienti'); ?></title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #14b8a6;"><?php printf(__('Thank you for your order!', 'scheda-clienti')); ?></h1>

        <p><?php printf(__('We have received your order and will contact you shortly.', 'scheda-clienti')); ?></p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong><?php _e('Order Number:', 'scheda-clienti'); ?></strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><?php echo esc_html($order_number); ?></td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong><?php _e('Name:', 'scheda-clienti'); ?></strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><?php echo esc_html($data['customer_info']['name']); ?></td>
            </tr>
        </table>

        <h3 style="color: #14b8a6;"><?php _e('Order Summary', 'scheda-clienti'); ?></h3>
        <ul>
            <?php foreach ($data['products'] as $product): ?>
                <li><?php echo esc_html($product['type']); ?></li>
            <?php endforeach; ?>
        </ul>

        <p style="margin-top: 30px;">
            <?php _e('If you have any questions, please contact us.', 'scheda-clienti'); ?>
        </p>

        <p style="font-size: 12px; color: #999;">
            <?php printf(__('%s', 'scheda-clienti'), $blog_name); ?>
        </p>
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
            __('Thank you! Your order has been placed successfully. We will contact you shortly.', 'scheda-clienti')
        );
    }

    /**
     * Handle get orders request (admin only)
     */
    public function handle_get_orders() {
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error([
                'message' => __('Unauthorized', 'scheda-clienti')
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
}

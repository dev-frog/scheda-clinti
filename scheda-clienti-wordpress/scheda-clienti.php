<?php
/**
 * Plugin Name: Scheda Clienti - Furniture Order Form
 * Plugin URI: https://github.com/your-repo/scheda-clienti
 * Description: A modern furniture ordering form plugin for WordPress. Display the form with shortcode [scheda_clienti]
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: scheda-clienti
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('SC_VERSION', '1.0.0');
define('SC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SC_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main Scheda Clienti Plugin Class
 */
class Scheda_Clienti_Plugin {

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
        $this->includes();
        $this->init_classes();
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Enqueue frontend assets
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);

        // Register shortcode
        add_shortcode('scheda_clienti', [$this, 'render_shortcode']);

        // Register activation/deactivation hooks
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);

        // Load text domain
        add_action('init', [$this, 'load_textdomain']);
    }

    /**
     * Include required files
     */
    private function includes() {
        require_once SC_PLUGIN_DIR . 'includes/class-sc-ajax.php';
        require_once SC_PLUGIN_DIR . 'includes/class-sc-data.php';
    }

    /**
     * Initialize plugin classes
     */
    private function init_classes() {
        // Initialize AJAX handler
        new SC_AJAX_Handler();
        // Initialize data handler
        new SC_Data_Handler();
    }

    /**
     * Enqueue frontend assets
     */
    public function enqueue_assets() {
        // Only load assets on pages containing our shortcode
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'scheda_clienti')) {

            // Enqueue CSS (using hashed filename)
            wp_enqueue_style(
                'scheda-clienti-css',
                SC_PLUGIN_URL . 'assets/index-CIiFNmIw.css',
                [],
                SC_VERSION
            );

            // Enqueue WordPress bridge script (must load before React)
            wp_enqueue_script(
                'scheda-clienti-bridge',
                SC_PLUGIN_URL . 'assets/wp-bridge.js',
                [],
                SC_VERSION,
                true
            );

            // Enqueue React app (using hashed filename)
            wp_enqueue_script(
                'scheda-clienti-js',
                SC_PLUGIN_URL . 'assets/index-DDqDgeVF.js',
                ['scheda-clienti-bridge'],
                SC_VERSION,
                true
            );

            // Localize script with AJAX URL and nonce
            wp_localize_script('scheda-clienti-js', 'scPlugin', [
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('sc_ajax_nonce'),
                'adminEmail' => get_option('admin_email'),
                'strings' => [
                    'success' => __('Order placed successfully!', 'scheda-clienti'),
                    'error' => __('Error submitting form. Please try again.', 'scheda-clienti'),
                    'loading' => __('Submitting...', 'scheda-clienti')
                ]
            ]);
        }
    }

    /**
     * Render shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string Rendered HTML
     */
    public function render_shortcode($atts) {
        $atts = shortcode_atts([
            'title' => __('Scheda Clienti', 'scheda-clienti'),
            'description' => __('Complete the form below to place your furniture order.', 'scheda-clienti'),
            'class' => ''
        ], $atts, 'scheda_clienti');

        ob_start();
        ?>
        <div id="scheda-clienti-root" class="scheda-clienti-wrapper <?php echo esc_attr($atts['class']); ?>"
             data-title="<?php echo esc_attr($atts['title']); ?>"
             data-description="<?php echo esc_attr($atts['description']); ?>">
            <!-- React app will mount here -->
            <div class="sc-loading">
                <p><?php _e('Loading form...', 'scheda-clienti'); ?></p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Create custom post type for orders
        $this->create_order_post_type();

        // Flush rewrite rules
        flush_rewrite_rules();

        // Set default options
        $this->set_default_options();
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Create custom post type for orders
     */
    private function create_order_post_type() {
        // This will be called during activation
        // The actual registration happens in SC_Data_Handler
    }

    /**
     * Set default plugin options
     */
    private function set_default_options() {
        $defaults = [
            'sc_email_recipient' => get_option('admin_email'),
            'sc_success_message' => __('Thank you! Your order has been placed successfully. We will contact you shortly.', 'scheda-clienti'),
            'sc_enable_notifications' => '1'
        ];

        foreach ($defaults as $key => $value) {
            if (get_option($key) === false) {
                add_option($key, $value);
            }
        }
    }

    /**
     * Load plugin text domain
     */
    public function load_textdomain() {
        load_plugin_textdomain('scheda-clienti', false, dirname(SC_PLUGIN_BASENAME) . '/languages');
    }
}

/**
 * Initialize the plugin
 */
function scheda_clienti_init() {
    return Scheda_Clienti_Plugin::get_instance();
}

// Start the plugin
scheda_clienti_init();

/**
 * Plugin activation helper
 */
register_activation_hook(__FILE__, function() {
    // Register post type during activation
    if (!post_type_exists('scheda_order')) {
        $labels = [
            'name' => __('Orders', 'scheda-clienti'),
            'singular_name' => __('Order', 'scheda-clienti'),
            'menu_name' => __('Orders', 'scheda-clienti'),
            'add_new' => __('Add New', 'scheda-clienti'),
            'add_new_item' => __('Add New Order', 'scheda-clienti'),
            'edit' => __('Edit', 'scheda-clienti'),
            'edit_item' => __('Edit Order', 'scheda-clienti'),
            'new_item' => __('New Order', 'scheda-clienti'),
            'view' => __('View Order', 'scheda-clienti'),
            'view_item' => __('View Order', 'scheda-clienti'),
            'search_items' => __('Search Orders', 'scheda-clienti'),
            'not_found' => __('No orders found', 'scheda-clienti'),
            'not_found_in_trash' => __('No orders found in trash', 'scheda-clienti'),
        ];

        $args = [
            'labels' => $labels,
            'description' => __('Furniture orders', 'scheda-clienti'),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'capability_type' => 'post',
            'supports' => ['title'],
            'menu_icon' => 'dashicons-cart',
            'menu_position' => 20,
        ];

        register_post_type('scheda_order', $args);
    }
});

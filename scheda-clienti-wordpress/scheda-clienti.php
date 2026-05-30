<?php
/**
 * Plugin Name: Scheda Clienti - Furniture Order Form
 * Plugin URI: https://github.com/dev-frog/scheda-clinti
 * Description: A modern furniture ordering form plugin for WordPress. Display the form with shortcode [scheda_clienti]
 * Version: 1.0.0
 * Author: dev-frog
 * Author URI: https://dev-frog.github.io/blog
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
            
            // Find the latest CSS and JS files dynamically (matches index.js or index-hash.js)
            $css_file = $this->find_asset('assets/index*.css');
            $js_file = $this->find_asset('assets/index*.js');

            if ($css_file) {
                wp_enqueue_style(
                    'scheda-clienti-css',
                    SC_PLUGIN_URL . $css_file,
                    [],
                    SC_VERSION
                );
            }

            if ($js_file) {
                // Enqueue bridge script first
                wp_enqueue_script(
                    'scheda-clienti-bridge',
                    SC_PLUGIN_URL . 'assets/wp-bridge.js',
                    [],
                    SC_VERSION,
                    true
                );

                // Localize script with AJAX URL and nonce to the bridge script
                wp_localize_script('scheda-clienti-bridge', 'scPlugin', [
                    'ajaxUrl' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('sc_ajax_nonce'),
                    'adminEmail' => get_option('admin_email'),
                    'strings' => [
                        'success' => __('Order placed successfully!', 'scheda-clienti'),
                        'error' => __('Error submitting form. Please try again.', 'scheda-clienti'),
                        'loading' => __('Submitting...', 'scheda-clienti')
                    ]
                ]);

                wp_enqueue_script(
                    'scheda-clienti-js',
                    SC_PLUGIN_URL . $js_file,
                    ['scheda-clienti-bridge'], // Depend on bridge
                    SC_VERSION,
                    true // Load in footer
                );
            }
        }
    }

    /**
     * Helper to find the latest asset matching a pattern
     */
    private function find_asset($pattern) {
        $files = glob(SC_PLUGIN_DIR . $pattern);
        if (!$files) {
            return false;
        }
        
        // Sort by modification time to get the latest
        usort($files, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        
        return str_replace(SC_PLUGIN_DIR, '', $files[0]);
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
            <div class="sc-loading" style="padding: 40px; text-align: center; color: #666; font-family: sans-serif;">
                <div class="sc-spinner" style="margin-bottom: 10px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; animation: sc-spin 1s linear infinite;">
                        <style>@keyframes sc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
                        <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
                        <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69,1.57,1.57,0,0,0,10.14,1.16Z"/>
                    </svg>
                </div>
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

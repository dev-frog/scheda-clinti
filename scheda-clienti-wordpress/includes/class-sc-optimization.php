<?php
/**
 * CSS Optimization Class
 *
 * Handles critical CSS, preloading, and performance optimizations
 */

if (!defined('ABSPATH')) {
    exit;
}

class SC_CSS_Optimization {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('wp_head', [$this, 'add_critical_css'], 1);
        add_action('wp_head', [$this, 'add_preload_links'], 0);
        add_action('scheda_clienti_before_render', [$this, 'add_loading_state']);
        add_filter('style_loader_tag', [$this, 'add_async_css'], 10, 3);
    }

    /**
     * Add critical CSS inline for immediate rendering
     */
    public function add_critical_css() {
        global $post;

        // Only add on pages with our shortcode
        if (!is_a($post, 'WP_Post') || !has_shortcode($post->post_content, 'scheda_clienti')) {
            return;
        }
        ?>
        <style id="scheda-clienti-critical-css">
            /* Critical CSS for immediate rendering */
            #scheda-clienti-root {
                min-height: 400px;
                position: relative;
                background: linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%);
                border-radius: 8px;
                overflow: hidden;
            }

            /* Loading state styles */
            .sc-loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 400px;
                padding: 40px;
                text-align: center;
                background: linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%);
                border-radius: 8px;
                color: #64748b;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }

            .sc-spinner {
                width: 50px;
                height: 50px;
                margin-bottom: 20px;
                animation: sc-spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            }

            @keyframes sc-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .sc-loading-text {
                font-size: 18px;
                font-weight: 500;
                color: #334155;
                margin-bottom: 8px;
            }

            .sc-loading-subtext {
                font-size: 14px;
                color: #64748b;
            }

            /* Hide main content until loaded */
            .scheda-clienti-wrapper > *:not(.sc-loading-container) {
                opacity: 0;
                transition: opacity 0.3s ease-in;
            }

            .scheda-clienti-wrapper.loaded > *:not(.sc-loading-container) {
                opacity: 1;
            }

            /* Prevent flash of unstyled content */
            #scheda-clienti-root > * {
                visibility: hidden;
            }

            #scheda-clienti-root.loaded > * {
                visibility: visible;
            }
        </style>
        <?php
    }

    /**
     * Add preload and prefetch hints
     */
    public function add_preload_links() {
        global $post;

        if (!is_a($post, 'WP_Post') || !has_shortcode($post->post_content, 'scheda_clienti')) {
            return;
        }

        // Preload critical assets
        $css_file = $this->find_asset('assets/index*.css');
        if ($css_file) {
            echo '<link rel="preload" href="' . SC_PLUGIN_URL . $css_file . '" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">' . "\n";
        }
    }

    /**
     * Make CSS load asynchronously
     */
    public function add_async_css($tag, $handle, $href) {
        // Only apply to our stylesheet
        if ($handle !== 'scheda-clienti-css') {
            return $tag;
        }

        // Add media attribute for non-blocking load
        return str_replace(
            "media='all'",
            "media='not all' onload=\"if(media!='all')media='all'\"",
            $tag
        );
    }

    /**
     * Add inline loading state
     */
    public function add_loading_state() {
        ?>
        <div class="sc-loading-container" id="sc-loading-state">
            <div class="sc-spinner">
                <svg viewBox="0 0 50 50" class="w-full h-full">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="80" stroke-dashoffset="60">
                        <animate attributeName="stroke-dashoffset" from="60" to="140" dur="1.5s" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" from="140" to="60" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                </svg>
            </div>
            <div class="sc-loading-text">Caricamento modulo...</div>
            <div class="sc-loading-subtext">Stiamo preparando la tua esperienza</div>
        </div>
        <script>
            // Hide loading state when app mounts
            window.addEventListener('scAppMounted', function() {
                const loadingState = document.getElementById('sc-loading-state');
                const rootElement = document.getElementById('scheda-clienti-root');
                if (loadingState) {
                    loadingState.style.display = 'none';
                }
                if (rootElement) {
                    rootElement.classList.add('loaded');
                }
            });
        </script>
        <?php
    }

    /**
     * Helper to find the latest asset matching a pattern
     */
    private function find_asset($pattern) {
        $files = glob(SC_PLUGIN_DIR . $pattern);
        if (!$files) {
            return false;
        }

        usort($files, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });

        return str_replace(SC_PLUGIN_DIR, '', $files[0]);
    }
}

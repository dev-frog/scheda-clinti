/**
 * WordPress App Initialization
 *
 * This script initializes the React app and handles the WordPress-specific setup
 */

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    function initApp() {
        // Find the root element
        const rootElement = document.getElementById('scheda-clienti-root');

        if (!rootElement) {
            console.error('Scheda Clienti: Root element not found');
            return;
        }

        // Remove loading message when app mounts
        const loadingMessage = rootElement.querySelector('.sc-loading');
        if (loadingMessage) {
            // Hide loading message
            loadingMessage.style.display = 'none';
        }

        // Dispatch custom event to let the app know it can remove loading
        window.dispatchEvent(new CustomEvent('scAppMounted'));

        console.log('Scheda Clienti: App initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // DOM already loaded
        initApp();
    }

    // Also initialize after a short delay to ensure React app is loaded
    setTimeout(initApp, 100);
})();

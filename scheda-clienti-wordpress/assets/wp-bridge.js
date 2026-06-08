/**
 * WordPress Bridge Script
 *
 * This script bridges the React app with WordPress AJAX functionality
 * It provides the necessary hooks and data submission handlers
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Check if root element exists
        const rootElement = document.getElementById('scheda-clienti-root');
        if (!rootElement) {
            return;
        }

        // Get WordPress config from data attributes
        const config = {
            title: rootElement.getAttribute('data-title') || 'Scheda Clienti',
            description: rootElement.getAttribute('data-description') || 'Completa il modulo sottostante per effettuare il tuo ordine di mobili.'
        };

        // Inject WordPress AJAX handler into window for React app
        window.wordpressConfig = config;

        /**
         * WordPress Form Submission Handler
         */
        window.submitToWordPress = function(formData) {
            return new Promise((resolve, reject) => {
                // Check if scPlugin is available (localized from WordPress)
                if (typeof scPlugin === 'undefined') {
                    reject(new Error('WordPress plugin not initialized'));
                    return;
                }

                // Prepare AJAX request
                const xhr = new XMLHttpRequest();
                xhr.open('POST', scPlugin.ajaxUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            if (response.success) {
                                resolve(response.data);
                            } else {
                                reject(new Error(response.data.message || 'Submission failed'));
                            }
                        } catch (e) {
                            reject(new Error('Invalid response from server'));
                        }
                    } else {
                        reject(new Error('Server error: ' + xhr.status));
                    }
                };

                xhr.onerror = function() {
                    reject(new Error('Network error'));
                };

                // Prepare form data
                const params = new URLSearchParams();
                params.append('action', 'sc_submit_form');
                params.append('nonce', scPlugin.nonce);
                params.append('form_data', JSON.stringify(formData));

                xhr.send(params.toString());
            });
        };

        /**
         * Show WordPress success message
         */
        window.showWordPressSuccess = function() {
            const successDiv = document.createElement('div');
            successDiv.className = 'sc-wordpress-success';
            successDiv.style.cssText = `
                padding: 20px;
                background: #d1fae5;
                border-radius: 8px;
                color: #065f46;
                margin-top: 20px;
                text-align: center;
            `;
            successDiv.textContent = scPlugin?.strings?.success || 'Ordine inviato con successo!';

            // Hide loading message
            const loadingDiv = rootElement.querySelector('.sc-loading');
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
            }

            // Append success message
            rootElement.appendChild(successDiv);

            // Reset form after 3 seconds
            setTimeout(function() {
                successDiv.remove();
                if (loadingDiv) {
                    loadingDiv.style.display = 'block';
                }
                // Trigger form reset via custom event
                window.dispatchEvent(new CustomEvent('scResetForm'));
            }, 3000);
        };

        // Remove loading message once React app mounts
        window.addEventListener('scAppMounted', function() {
            const loadingDiv = rootElement.querySelector('.sc-loading');
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
            }
        });
    });
})();

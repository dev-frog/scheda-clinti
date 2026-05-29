# Quick Start Guide - Elementor Addon Development

Fast-track instructions for creating the Scheda Clienti Elementor addon.

## Overview

This guide provides the essential steps to convert the React furniture ordering form into a WordPress Elementor widget plugin.

---

## Prerequisites

- WordPress installation with Elementor (free or pro)
- PHP 7.4+
- Basic understanding of:
  - WordPress plugin development
  - Elementor widget API
  - AJAX in WordPress
  - JavaScript/jQuery

---

## Step-by-Step Implementation

### Phase 1: Plugin Setup (30 minutes)

#### 1. Create Plugin Structure

```bash
cd wp-content/plugins/
mkdir scheda-clienti-elementor
cd scheda-clienti-elementor

# Create directory structure
mkdir -p widgets
mkdir -p assets/css
mkdir -p assets/js
mkdir -p includes
```

#### 2. Create Main Plugin File

**File:** `scheda-clienti-elementor.php`

```php
<?php
/**
 * Plugin Name: Scheda Clienti - Elementor Widget
 * Description: Furniture ordering form widget for Elementor
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

define('SC_ELEMENTOR_VERSION', '1.0.0');
define('SC_ELEMENTOR_PATH', plugin_dir_path(__FILE__));
define('SC_ELEMENTOR_URL', plugins_url('/', __FILE__));

class SchedaClienti_Elementor {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action('elementor/widgets/register', [$this, 'register_widgets']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
    }

    public function register_widgets() {
        require_once SC_ELEMENTOR_PATH . 'widgets/scheda-clienti-form.php';
        \Elementor\Plugin::instance()->widgets_manager->register(new \Elementor_Scheda_Clienti_Form());
    }

    public function enqueue_assets() {
        wp_enqueue_style('sc-frontend', SC_ELEMENTOR_URL . 'assets/css/frontend.css', [], SC_ELEMENTOR_VERSION);
        wp_enqueue_script('sc-frontend', SC_ELEMENTOR_URL . 'assets/js/frontend.js', ['jquery'], SC_ELEMENTOR_VERSION, true);

        wp_localize_script('sc-frontend', 'scAjax', [
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('sc_nonce')
        ]);
    }
}

SchedaClienti_Elementor::get_instance();

// Include AJAX handlers
require_once SC_ELEMENTOR_PATH . 'includes/class-scheda-clienti-ajax.php';
```

---

### Phase 2: Widget Registration (45 minutes)

#### Create Elementor Widget

**File:** `widgets/scheda-clienti-form.php`

```php
<?php
if (!defined('ABSPATH')) {
    exit;
}

class Elementor_Scheda_Clienti_Form extends \Elementor\Widget_Base {

    public function get_name() {
        return 'scheda-clienti-form';
    }

    public function get_title() {
        return 'Scheda Clienti Form';
    }

    public function get_icon() {
        return 'eicon-form-vertical';
    }

    public function get_categories() {
        return ['general-elements'];
    }

    protected function register_controls() {
        $this->start_controls_section('content_settings', [
            'label' => 'Form Settings',
            'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
        ]);

        $this->add_control('form_title', [
            'label' => 'Form Title',
            'type' => \Elementor\Controls_Manager::TEXT,
            'default' => 'Scheda Clienti',
        ]);

        $this->add_control('form_description', [
            'label' => 'Form Description',
            'type' => \Elementor\Controls_Manager::TEXTAREA,
            'default' => 'Complete the form below to place your furniture order.',
        ]);

        $this->add_control('email_recipient', [
            'label' => 'Email Recipient',
            'type' => \Elementor\Controls_Manager::TEXT,
            'default' => get_option('admin_email'),
        ]);

        $this->add_control('success_message', [
            'label' => 'Success Message',
            'type' => \Elementor\Controls_Manager::TEXTAREA,
            'default' => 'Order placed successfully!',
        ]);

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        include SC_ELEMENTOR_PATH . 'widgets/form-template.php';
    }
}
```

---

### Phase 3: Form Template (1 hour)

#### Create Form Template

**File:** `widgets/form-template.php`

```php
<div class="sc-form-container" data-settings='<?php echo json_encode($settings); ?>'>
    <div class="sc-header">
        <h1 class="sc-title"><?php echo esc_html($settings['form_title']); ?></h1>
        <p class="sc-description"><?php echo esc_html($settings['form_description']); ?></p>
    </div>

    <!-- Progress Bar -->
    <div class="sc-progress">
        <div class="sc-progress-bar">
            <div class="sc-progress-fill" style="width: 50%"></div>
        </div>
        <div class="sc-progress-text">Step <span class="sc-current-step">1</span> of 2</div>
    </div>

    <!-- Form -->
    <form class="sc-form" id="sc-scheda-form">

        <!-- Step 1: Customer Information -->
        <div class="sc-step sc-step-active" data-step="1">
            <h2>Let's Get Started - Tell Us About You</h2>

            <div class="sc-grid sc-grid-2">
                <div class="sc-field">
                    <label for="sc-name">Name *</label>
                    <input type="text" id="sc-name" name="name" required>
                    <span class="sc-error"></span>
                </div>

                <div class="sc-field">
                    <label for="sc-email">Email *</label>
                    <input type="email" id="sc-email" name="email" required>
                    <span class="sc-error"></span>
                </div>

                <div class="sc-field">
                    <label for="sc-telephone">Telephone *</label>
                    <input type="text" id="sc-telephone" name="telephone" required>
                    <span class="sc-error"></span>
                </div>

                <div class="sc-field">
                    <label for="sc-city">City *</label>
                    <input type="text" id="sc-city" name="city" required>
                    <span class="sc-error"></span>
                </div>
            </div>

            <div class="sc-field">
                <label for="sc-address">Indirizzo Completo (Full Address) *</label>
                <textarea id="sc-address" name="address" required></textarea>
                <span class="sc-error"></span>
            </div>

            <div class="sc-field">
                <label for="sc-notes">Additional Notes (Optional)</label>
                <textarea id="sc-notes" name="additionalNotes"></textarea>
            </div>
        </div>

        <!-- Step 2: Product Selection -->
        <div class="sc-step" data-step="2" style="display: none;">
            <div class="sc-step-header">
                <button type="button" class="sc-back-btn">
                    ← Back
                </button>
                <h2>Choose Your Products</h2>
            </div>

            <!-- Product Accordion -->
            <div class="sc-accordion">
                <!-- Flooring Section -->
                <div class="sc-accordion-item" data-product="flooring">
                    <div class="sc-accordion-trigger">
                        <span>Package (Flooring)</span>
                        <span class="sc-icon">+</span>
                    </div>
                    <div class="sc-accordion-content">
                        <!-- Dynamic content loaded by JS -->
                    </div>
                </div>

                <!-- Add other 8 categories similarly -->
            </div>

            <!-- Order Summary -->
            <div class="sc-order-summary">
                <h3>Order Summary</h3>
                <div class="sc-summary-content">
                    <p>No products selected yet.</p>
                </div>
            </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="sc-submit-btn">
            Next: Select Your Products
        </button>
    </form>

    <!-- Success Message -->
    <div class="sc-success-message" style="display: none;">
        <?php echo esc_html($settings['success_message']); ?>
    </div>
</div>
```

---

### Phase 4: Styling (45 minutes)

#### Create CSS

**File:** `assets/css/frontend.css`

```css
/* Base Styles */
.sc-form-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
}

.sc-header {
    margin-bottom: 2rem;
}

.sc-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.sc-description {
    color: #6b7280;
}

/* Progress Bar */
.sc-progress {
    margin-bottom: 2rem;
}

.sc-progress-bar {
    height: 8px;
    border-radius: 9999px;
    overflow: hidden;
    background: #e5e7eb;
}

.sc-progress-fill {
    height: 100%;
    background: #14b8a6;
    transition: width 300ms ease-in-out;
}

/* Form Fields */
.sc-grid {
    display: grid;
    gap: 1.5rem;
}

.sc-grid-2 {
    grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 640px) {
    .sc-grid-2 {
        grid-template-columns: 1fr;
    }
}

.sc-field {
    text-align: left;
    margin-bottom: 1rem;
}

.sc-field label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.sc-field input,
.sc-field textarea,
.sc-field select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 1rem;
}

.sc-field textarea {
    min-height: 80px;
    resize: vertical;
}

.sc-error {
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
}

/* Accordion */
.sc-accordion-item {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    overflow: hidden;
}

.sc-accordion-trigger {
    background: #f3f4f630;
    padding: 0.75rem 1rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
}

.sc-accordion-trigger:hover {
    background: #f3f4f650;
}

.sc-accordion-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out;
    padding: 0 1rem;
}

.sc-accordion-content.sc-open {
    max-height: 2000px;
    padding: 1rem;
}

/* Buttons */
.sc-submit-btn {
    width: 100%;
    padding: 1.5rem;
    background: #0d9488;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 1.125rem;
    font-weight: 500;
    cursor: pointer;
    margin-top: 2rem;
}

.sc-submit-btn:hover {
    background: #0f766e;
}

.sc-back-btn {
    background: transparent;
    border: 1px solid #e5e7eb;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    margin-right: 0.5rem;
}

/* Cards */
.sc-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1rem;
    position: relative;
}

.sc-card-header {
    position: absolute;
    top: 0;
    right: 0;
    background: #f3f4f6;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    border-bottom-left-radius: 0.375rem;
}

/* Order Summary */
.sc-order-summary {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-top: 2rem;
}

.sc-summary-item {
    margin-bottom: 1rem;
}

.sc-summary-item-header {
    font-weight: 500;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
}

/* Success Message */
.sc-success-message {
    padding: 2rem;
    background: #d1fae5;
    border-radius: 0.5rem;
    color: #065f46;
    margin-top: 2rem;
}
```

---

### Phase 5: JavaScript (2 hours)

#### Create Frontend JS

**File:** `assets/js/frontend.js`

```javascript
(function($) {
    'use strict';

    const SchedaClienti = {
        currentStep: 1,
        formData: {
            customerInfo: {},
            products: []
        },

        init() {
            this.bindEvents();
            this.initProductSections();
        },

        bindEvents() {
            // Form submission
            $(document).on('submit', '#sc-scheda-form', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });

            // Back button
            $(document).on('click', '.sc-back-btn', () => {
                this.prevStep();
            });

            // Accordion toggle
            $(document).on('click', '.sc-accordion-trigger', (e) => {
                const $trigger = $(e.currentTarget);
                const $content = $trigger.next('.sc-accordion-content');
                const $icon = $trigger.find('.sc-icon');

                $content.toggleClass('sc-open');
                $icon.text($content.hasClass('sc-open') ? '-' : '+');
            });
        },

        initProductSections() {
            // Initialize all product sections
            this.initFlooringSection();
            this.initInteriorDoorsSection();
            // ... initialize other sections
        },

        handleSubmit() {
            if (this.currentStep === 1) {
                if (this.validateStep1()) {
                    this.collectStep1Data();
                    this.nextStep();
                }
            } else {
                if (this.validateStep2()) {
                    this.collectStep2Data();
                    this.submitForm();
                }
            }
        },

        validateStep1() {
            let isValid = true;
            const fields = ['name', 'email', 'telephone', 'city', 'address'];

            fields.forEach(field => {
                const $input = $(`#sc-${field}`);
                const value = $input.val();
                const $error = $input.next('.sc-error');

                $error.text('');

                if (!value || value.length < this.getMinLength(field)) {
                    $error.text(this.getErrorMessage(field));
                    isValid = false;
                }

                if (field === 'email' && !this.isValidEmail(value)) {
                    $error.text('Please enter a valid email');
                    isValid = false;
                }
            });

            return isValid;
        },

        collectStep1Data() {
            this.formData.customerInfo = {
                name: $('#sc-name').val(),
                email: $('#sc-email').val(),
                telephone: $('#sc-telephone').val(),
                city: $('#sc-city').val(),
                address: $('#sc-address').val(),
                additionalNotes: $('#sc-notes').val()
            };
        },

        collectStep2Data() {
            this.formData.products = [];

            // Collect data from each product section
            this.formData.products.push(...this.getFlooringData());
            this.formData.products.push(...this.getInteriorDoorsData());
            // ... collect other products
        },

        nextStep() {
            this.currentStep = 2;
            $('.sc-step[data-step="1"]').hide();
            $('.sc-step[data-step="2"]').fadeIn();
            $('.sc-progress-fill').css('width', '100%');
            $('.sc-current-step').text('2');
            $('.sc-submit-btn').text('Place Your Order');
        },

        prevStep() {
            this.currentStep = 1;
            $('.sc-step[data-step="2"]').hide();
            $('.sc-step[data-step="1"]').fadeIn();
            $('.sc-progress-fill').css('width', '50%');
            $('.sc-current-step').text('1');
            $('.sc-submit-btn').text('Next: Select Your Products');
        },

        submitForm() {
            $.ajax({
                url: scAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'sc_submit_form',
                    nonce: scAjax.nonce,
                    form_data: JSON.stringify(this.formData)
                },
                success: (response) => {
                    if (response.success) {
                        this.showSuccess();
                    }
                },
                error: () => {
                    alert('Error submitting form');
                }
            });
        },

        showSuccess() {
            $('#sc-scheda-form').hide();
            $('.sc-success-message').fadeIn();
            this.resetForm();
        },

        resetForm() {
            this.currentStep = 1;
            this.formData = { customerInfo: {}, products: [] };
            setTimeout(() => {
                $('#sc-scheda-form')[0].reset();
                $('.sc-step').hide();
                $('.sc-step[data-step="1"]').fadeIn();
                $('.sc-progress-fill').css('width', '50%');
                $('.sc-current-step').text('1');
                $('.sc-submit-btn').text('Next: Select Your Products');
                $('.sc-success-message').hide();
                $('#sc-scheda-form').fadeIn();
            }, 3000);
        },

        getMinLength(field) {
            const lengths = { name: 2, telephone: 5, city: 2, address: 5 };
            return lengths[field] || 1;
        },

        getErrorMessage(field) {
            const messages = {
                name: 'Name must be at least 2 characters',
                telephone: 'Phone must be at least 5 characters',
                city: 'City must be at least 2 characters',
                address: 'Address must be at least 5 characters'
            };
            return messages[field] || 'This field is required';
        },

        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        // Product Section Methods
        initFlooringSection() {
            // Initialize flooring section with add/remove functionality
            // See detailed implementation in main documentation
        },

        getFlooringData() {
            // Collect flooring section data
            return [];
        },

        // ... other product methods
    };

    $(document).ready(() => {
        SchedaClienti.init();
    });

})(jQuery);
```

---

### Phase 6: AJAX Handler (30 minutes)

#### Create AJAX Handler

**File:** `includes/class-scheda-clienti-ajax.php`

```php
<?php
if (!defined('ABSPATH')) {
    exit;
}

class Scheda_Clienti_AJAX {

    public function __construct() {
        add_action('wp_ajax_sc_submit_form', [$this, 'handle_form_submission']);
        add_action('wp_ajax_nopriv_sc_submit_form', [$this, 'handle_form_submission']);
    }

    public function handle_form_submission() {
        check_ajax_referer('sc_nonce', 'nonce');

        $form_data = json_decode(stripslashes($_POST['form_data']), true);

        // Store in database
        $post_id = $this->save_order($form_data);

        // Send email
        $this->send_notification_email($form_data, $post_id);

        wp_send_json_success([
            'message' => 'Order placed successfully',
            'order_id' => $post_id
        ]);
    }

    private function save_order($data) {
        $post_id = wp_insert_post([
            'post_type' => 'scheda_order',
            'post_status' => 'private',
            'post_title' => 'Order from ' . $data['customerInfo']['name']
        ]);

        update_post_meta($post_id, 'order_data', $data);
        update_post_meta($post_id, 'customer_email', $data['customerInfo']['email']);

        return $post_id;
    }

    private function send_notification_email($data, $order_id) {
        $to = get_option('admin_email');
        $subject = 'New Order: ' . $data['customerInfo']['name'];
        $message = $this->format_email_message($data, $order_id);

        wp_mail($to, $subject, $message, ['Content-Type: text/html']);
    }

    private function format_email_message($data, $order_id) {
        $html = '<h2>New Order Received</h2>';
        $html .= '<p><strong>Order ID:</strong> #' . $order_id . '</p>';

        $html .= '<h3>Customer Information</h3>';
        foreach ($data['customerInfo'] as $key => $value) {
            $html .= '<p><strong>' . ucfirst($key) . ':</strong> ' . esc_html($value) . '</p>';
        }

        $html .= '<h3>Order Items</h3>';
        foreach ($data['products'] as $product) {
            $html .= '<div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd;">';
            $html .= '<h4>' . esc_html($product['type']) . '</h4>';
            foreach ($product['details'] as $key => $value) {
                if ($key !== 'id') {
                    $html .= '<p><strong>' . ucfirst($key) . ':</strong> ' . esc_html($value) . '</p>';
                }
            }
            $html .= '</div>';
        }

        return $html;
    }
}

new Scheda_Clienti_AJAX();
```

---

## Installation

1. Upload the plugin folder to `wp-content/plugins/`
2. Activate from WordPress admin
3. Edit any page with Elementor
4. Search for "Scheda Clienti Form" widget
5. Drag to page and configure settings

---

## Development Checklist

- [ ] Plugin structure created
- [ ] Main plugin file setup
- [ ] Elementor widget registered
- [ ] Form template created
- [ ] Customer info fields (Step 1)
- [ ] Product accordion structure
- [ ] All 9 product sections
- [ ] Add/remove functionality
- [ ] Conditional fields
- [ ] Order summary
- [ ] CSS styling
- [ ] JavaScript functionality
- [ ] AJAX submission
- [ ] Data storage
- [ ] Email notifications
- [ ] Testing completed

---

## Support Files

For complete details, refer to:
- `ELEMENTOR_ADDON_INSTRUCTIONS.md` - Full specifications
- `COMPONENT_REFERENCE.md` - Component documentation
- `README.md` - Project overview

---

**Estimated Total Development Time:** 5-6 hours

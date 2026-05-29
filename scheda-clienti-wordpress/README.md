# Scheda Clienti - WordPress Plugin

> A modern furniture ordering form plugin for WordPress with shortcode support and admin dashboard.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Admin Panel](#admin-panel)
- [Product Categories](#product-categories)
- [Shortcode Reference](#shortcode-reference)
- [Email Notifications](#email-notifications)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [API Reference](#api-reference)
- [Changelog](#changelog)

## Overview

**Scheda Clienti** is a comprehensive WordPress plugin that provides a modern, two-step furniture ordering form. Built from a React application and converted into a WordPress plugin, it offers seamless integration with WordPress admin functionality while maintaining a beautiful, responsive user interface.

### What It Does

- Collects customer information through a multi-step form
- Allows customers to select from 9 furniture product categories
- Manages orders through WordPress admin dashboard
- Sends email notifications to admins and customers
- Provides full order history and status tracking

### Perfect For

- Furniture stores
- Interior design companies
- Home improvement businesses
- Custom furniture manufacturers
- Any business needing detailed product ordering

## Features

### Core Functionality
- ✅ **Two-step form workflow** with visual progress indicator
- ✅ **Customer information collection** (name, email, phone, city, address, notes)
- ✅ **9 product categories** with accordion-style navigation
- ✅ **Dynamic add/remove** - Multiple items per category
- ✅ **Conditional fields** - Show/hide based on user selections
- ✅ **Real-time order summary** - See selected items before submitting
- ✅ **AJAX form submission** - No page reloads
- ✅ **Form validation** - Client-side and server-side
- ✅ **Email notifications** - Admin and customer confirmations
- ✅ **Admin dashboard** - Complete order management
- ✅ **Order status tracking** - Pending, Processing, Completed, Cancelled
- ✅ **Shortcode integration** - Add to any page or widget
- ✅ **Responsive design** - Works on all devices
- ✅ **WordPress native** - Uses custom post types and standard WordPress APIs

### User Experience
- Clean, modern interface
- Intuitive step-by-step process
- Clear feedback and error messages
- Mobile-friendly design
- Fast AJAX-powered interactions

### Admin Features
- Dedicated admin menu for orders
- Custom columns for order data
- Detailed order view with all customer and product information
- Bulk status updates
- Export capabilities (via standard WordPress export)
- Settings page for configuration

## Installation

### Method 1: WordPress Admin Upload (Recommended)

1. **Download the plugin ZIP file**
   ```
   scheda-clienti-plugin.zip
   ```

2. **Log in to WordPress Admin**
   - Go to: `Plugins → Add New`

3. **Upload Plugin**
   - Click: `Upload Plugin`
   - Choose the ZIP file
   - Click: `Install Now`

4. **Activate Plugin**
   - Click: `Activate Plugin`
   - Plugin is now ready to use!

### Method 2: FTP Upload

1. **Extract the ZIP file** on your computer

2. **Connect to your server** via FTP or SFTP

3. **Upload the folder** to:
   ```
   /wp-content/plugins/scheda-clienti-wordpress/
   ```

4. **Log in to WordPress Admin**
   - Go to: `Plugins`

5. **Activate the plugin**
   - Find "Scheda Clienti - Furniture Order Form"
   - Click "Activate"

### Method 3: Direct Upload (cPanel/File Manager)

1. **Extract ZIP file** on your computer

2. **Go to cPanel → File Manager**

3. **Navigate to**:
   ```
   public_html/wp-content/plugins/
   ```

4. **Upload** the `scheda-clienti-wordpress` folder

5. **Log in to WordPress Admin** and activate the plugin

## Quick Start

### 5 Minutes to Your First Order

1. **Install & Activate** the plugin (see [Installation](#installation))

2. **Configure Settings**
   - Go to: `Scheda Orders → Settings`
   - Set your email for notifications
   - Customize the success message
   - Click "Save Changes"

3. **Add Form to a Page**
   - Create or edit a page
   - Add shortcode: `[scheda_clienti]`
   - Publish the page

4. **Test the Form**
   - Visit the page
   - Fill out customer information
   - Select some products
   - Submit the form

5. **View Your First Order**
   - Go to: `Scheda Orders`
   - Click on the order to see details

**That's it! You're now collecting furniture orders.**

## Usage

### Basic Shortcode

Add this shortcode to any page, post, or widget:

```
[scheda_clienti]
```

### Shortcode with Attributes

```
[scheda_clienti
    title="Order Your Furniture"
    description="Complete the form below to place your order"
    class="my-custom-class"]
```

### Shortcode Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `title` | "Scheda Clienti" | Main heading displayed above form |
| `description` | "Complete the form..." | Subtitle text |
| `class` | "" | Additional CSS classes for styling |

### Usage Examples

#### In Page Content
```
[scheda_clienti]
```

#### In Theme Files (PHP)
```php
<?php echo do_shortcode('[scheda_clienti]'); ?>
```

#### In Sidebar/Widget
1. Go to: `Appearance → Widgets`
2. Add a **Text** or **Custom HTML** widget
3. Add: `[scheda_clienti]`

#### In Page Builder (Elementor, Divi, etc.)
Use the **Shortcode** or **HTML** widget and add:
```
[scheda_clienti]
```

#### With Custom Styling
```
[scheda_clienti class="container-fluid my-form"]
```

Then add CSS:
```css
.my-form {
    max-width: 1200px;
    margin: 0 auto;
}
```

### Multiple Forms

You can use the shortcode on multiple pages:

- **Contact Page**: `[scheda_clienti title="Request a Quote"]`
- **Product Page**: `[scheda_clienti title="Order This Product"]`
- **Custom Page**: `[scheda_clienti title="Custom Order"]`

## Admin Panel

After activation, you'll find a new admin menu:

### 📦 Scheda Orders Menu

Located in the WordPress admin sidebar (below Comments), this menu provides:

#### Orders List
- **View all orders** in a table format
- **Columns**: Order #, Title, Customer Email, Status, Date
- **Bulk actions**: Change status, delete
- **Search**: Find orders by customer name or email
- **Filter**: By status or date

#### Individual Order View
Each order shows:

**Customer Details:**
- Name
- Email
- Telephone
- City
- Address
- Additional Notes

**Order Details:**
- All selected products grouped by category
- Product specifications and options
- Quantity and variations

**Order Management:**
- Update order status
- View order timestamp
- Direct access to customer email

#### Settings Page

Go to: `Scheda Orders → Settings`

**Email Recipient**
- Default: WordPress admin email
- Who receives new order notifications
- Can be different from admin email

**Success Message**
- Default: "Thank you! Your order has been placed successfully. We will contact you shortly."
- Message shown to customers after submission
- Supports plain text or HTML

**Email Notifications**
- Checkbox to enable/disable
- Controls both admin and customer emails
- Useful for testing or temporary disabling

### Order Status Workflow

Orders can have one of these statuses:

1. **Pending** - New order, not yet processed
2. **Processing** - Order is being prepared
3. **Completed** - Order fulfilled and delivered
4. **Cancelled** - Order cancelled by admin or customer

**Status Badge Colors:**
- Pending: Yellow
- Processing: Blue
- Completed: Green
- Cancelled: Red

## Product Categories

The form includes **9 comprehensive product categories**:

### 1. Flooring (Package)
**Fields:**
- Flooring Type: Solid, Pre-finished, Laminate, SPC, Outdoor Flooring
- Installation Type: Floating, Glue

### 2. Interior Doors
**Fields:**
- Sense of Opening: Holy, Right
- Length: 60, 70, 80, 90, Out of Measure
- Custom Length (conditional)
- Number of Doors
- Dimensions (textarea)
- Height: 210, Out of Measure
- Custom Height (conditional)
- Handle: Yes, No
- Handle Name (conditional)
- Pose: Yes, No
- Installation Type: Floating, Glue

### 3. Armored Door
**Fields:** Same as Interior Doors

### 4. Bathroom Furniture
**Fields:**
- Name
- Product Code
- Product Link
- Transport: Yes, No

### 5. Fixtures
**Fields:** Similar to Bathroom Furniture

### 6. Mattresses
**Fields:** Product-specific options

### 7. Ceramics
**Fields:** Product-specific options

### 8. Sofas
**Fields:** Product-specific options

### 9. Children's Bedrooms
**Fields:** Product-specific options

### Category Features

Each category supports:
- **Multiple items**: Add unlimited items per category
- **Remove items**: Delete unwanted items (minimum 1)
- **Item counter**: See how many items in each category
- **Accordion navigation**: Expand/collapse categories
- **Order summary**: See all selections before submitting

## Form Flow

### Step-by-Step Process

#### Step 1: Customer Information
1. Customer fills in personal details
2. Fields: Name, Email, Telephone, City, Address, Notes
3. All fields except Notes are required
4. Real-time validation shows errors
5. Click "Next: Select Your Products"

#### Step 2: Product Selection
1. Customer sees 9 product categories
2. Expands categories to select products
3. Adds multiple items as needed
4. Fills in product-specific details
5. Reviews order summary
6. Clicks "Place Your Order"

#### Submission Process
1. Form validates all fields
2. Data sent via AJAX (no page reload)
3. Order saved to WordPress database
4. Email notifications sent
5. Success message displayed
6. Form resets for next order

### User Experience Features

- **Progress bar** shows current step
- **Back button** to return to Step 1
- **Loading states** during submission
- **Success animation** when complete
- **Error messages** for validation failures
- **Auto-scroll** to errors on validation fail

## Shortcode Reference

### Basic Syntax

```
[scheda_clienti]
```

### All Attributes

```
[scheda_clienti
    title="Form Title"
    description="Form Description"
    class="custom-css-class"]
```

### Attribute Details

#### Title
- **Default**: "Scheda Clienti"
- **Type**: Text
- **HTML**: Allowed (will be escaped)
- **Purpose**: Main heading above form

#### Description
- **Default**: "Complete the form below to place your furniture order."
- **Type**: Text
- **HTML**: Allowed (will be escaped)
- **Purpose**: Subtitle below title

#### Class
- **Default**: "" (empty)
- **Type**: CSS class names
- **HTML**: Not allowed (class names only)
- **Purpose**: Add custom styling
- **Example**: "container my-class another-class"

### Advanced Usage

#### Conditional Shortcode
```php
<?php
if (is_page('order')) {
    echo do_shortcode('[scheda_clienti]');
}
?>
```

#### With PHP Variables
```php
<?php
$title = get_option('my_form_title');
echo do_shortcode("[scheda_clienti title=\"$title\"]");
?>
```

#### Multiple Forms on Same Page
Not recommended. Use separate pages for each form instance.

## Email Notifications

### Admin Notification Email

**Sent to:** Email recipient set in Settings

**Includes:**
- Order number (e.g., SC-000123)
- Submission date and time
- Complete customer information:
  - Name
  - Email (clickable mailto link)
  - Telephone
  - City
  - Full address
  - Additional notes (if any)
- All order items grouped by category
  - Product type
  - Item number
  - All specifications and options
- Direct link to view order in WordPress admin
- HTML formatted, responsive design

**Email Template:**
```
Subject: New Order: SC-000123 - [Customer Name]

[Order Details]
[Customer Information]
[Order Items - Full Details]
[View Order Button]
```

### Customer Confirmation Email

**Sent to:** Email address provided by customer

**Includes:**
- Order number
- Thank you message
- Order summary (product categories only)
- Expected next steps
- Contact information
- HTML formatted, responsive design

**Email Template:**
```
Subject: Your Order Confirmation

[Thank You Message]
[Order Number]
[Order Summary]
[Next Steps]
[Contact Info]
```

### Email Configuration

#### WordPress Default
Uses `wp_mail()` function which relies on:
- PHP mail() function
- Server SMTP configuration

#### SMTP Plugin (Recommended)
For better deliverability:
1. Install SMTP plugin (WP Mail SMTP, Post SMTP, etc.)
2. Configure SMTP settings
3. Test email sending
4. Plugin emails will use SMTP

#### Custom SMTP (Advanced)
Add to `functions.php` or custom plugin:

```php
add_action('phpmailer_init', function($phpmailer) {
    $phpmailer->isSMTP();
    $phpmailer->Host = 'smtp.example.com';
    $phpmailer->SMTPAuth = true;
    $phpmailer->Port = 587;
    $phpmailer->Username = 'your@email.com';
    $phpmailer->Password = 'your-password';
});
```

### Email Troubleshooting

**Emails not arriving?**

1. Check spam folder
2. Verify email address in Settings
3. Test with SMTP plugin
4. Check server mail logs
5. Verify WordPress can send emails:
   ```php
   // Test in functions.php temporarily
   wp_mail('your@email.com', 'Test', 'Test email');
   ```

6. Check firewall/security plugin settings
7. Contact hosting provider about email limits

## Customization

### CSS Styling

#### Override Plugin Styles

Add to your theme's `style.css` or **Appearance → Customize → Additional CSS**:

```css
/* Container */
.scheda-clienti-wrapper {
    max-width: 1200px !important;
    margin: 0 auto;
}

/* Loading message */
.sc-loading {
    text-align: center;
    padding: 60px 20px;
    font-size: 18px;
    color: #666;
}

/* Success message */
.sc-wordpress-success {
    background: #10b981;
    color: white;
    padding: 30px;
    border-radius: 12px;
    margin: 30px 0;
    text-align: center;
    font-size: 18px;
}

/* Form container */
.scheda-clienti-wrapper form {
    max-width: 100%;
}
```

#### Mobile Responsiveness
```css
@media (max-width: 768px) {
    .scheda-clienti-wrapper {
        padding: 10px;
    }

    .sc-wordpress-success {
        font-size: 16px;
        padding: 20px;
    }
}
```

### Hooks and Filters

#### Action Hooks

**After Order Saved**
```php
add_action('sc_order_saved', function($post_id, $data) {
    // $post_id: Order post ID
    // $data: Complete form data array

    // Log to custom file
    error_log('New order: ' . $post_id);

    // Send to external API
    wp_remote_post('https://api.example.com/orders', [
        'body' => json_encode($data)
    ]);
}, 10, 2);
```

#### Filter Hooks

**Custom Admin Columns**
```php
add_filter('manage_scheda_order_posts_columns', function($columns) {
    // Add custom column
    $columns['customer_phone'] = 'Phone';
    $columns['order_total'] = 'Total';
    return $columns;
});

add_action('manage_scheda_order_posts_custom_column', function($column, $post_id) {
    switch ($column) {
        case 'customer_phone':
            echo get_post_meta($post_id, 'customer_telephone', true);
            break;
        case 'order_total':
            echo '$0.00'; // Calculate total if you add pricing
            break;
    }
}, 10, 2);
```

**Modify Order Data Before Save**
```php
add_filter('sc_order_data_before_save', function($data) {
    // Add custom data
    $data['customer_info']['ip_address'] = $_SERVER['REMOTE_ADDR'];
    $data['customer_info']['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
    return $data;
});
```

### Custom Order Status

Add to `functions.php`:

```php
// Add custom order statuses
add_filter('sc_order_statuses', function($statuses) {
    $statuses['on_hold'] = 'On Hold';
    $statuses['refunded'] = 'Refunded';
    return $statuses;
});
```

### Integration with Other Plugins

#### WooCommerce Integration
```php
add_action('sc_order_saved', function($post_id, $data) {
    // Create WooCommerce order
    if (class_exists('WooCommerce')) {
        $order = wc_create_order([]);
        $order->set_customer_id(get_current_user_id());
        $order->save();
    }
});
```

#### Google Sheets
```php
add_action('sc_order_saved', function($post_id, $data) {
    // Send to Google Sheets via API
    // Requires Google Sheets API setup
});
```

#### Slack/Discord Notification
```php
add_action('sc_order_saved', function($post_id, $data) {
    $webhook_url = 'YOUR_WEBHOOK_URL';
    $message = sprintf(
        'New order from %s (%s)',
        $data['customer_info']['name'],
        $data['customer_info']['email']
    );

    wp_remote_post($webhook_url, [
        'body' => json_encode(['text' => $message])
    ]);
});
```

## Troubleshooting

### Common Issues and Solutions

#### Form Not Displaying

**Symptoms:**
- Shortcode shows as text
- Page shows "Loading form..." indefinitely
- Form container is empty

**Solutions:**
1. **Check plugin activation**
   - Go to: `Plugins`
   - Verify "Scheda Clienti" is active

2. **Clear cache**
   - Clear browser cache
   - Clear page cache (if using caching plugin)
   - Clear server cache

3. **Check for JavaScript errors**
   - Open browser console (F12)
   - Look for red error messages
   - Fix or report errors

4. **Verify shortcode syntax**
   ```
   [scheda_clienti]  // Correct
   [scheda_clienti] // Wrong (quotes)
   ```

5. **Test on another page**
   - Create new test page
   - Add only the shortcode
   - Check if it works

#### Form Submission Failing

**Symptoms:**
- Submit button does nothing
- "Submitting..." never completes
- Error message appears

**Solutions:**
1. **Enable WordPress debug**
   ```php
   // In wp-config.php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```
   Check `/wp-content/debug.log`

2. **Check AJAX endpoint**
   - Verify `admin-ajax.php` is accessible
   - Test at: `yourdomain.com/wp-admin/admin-ajax.php`

3. **Disable other plugins**
   - Deactivate all plugins
   - Reactivate Scheda Clienti
   - Test form
   - If works, reactivate others one by one

4. **Check theme conflicts**
   - Switch to default theme (Twenty Twenty-Four)
   - Test form
   - If works, theme has conflict

5. **Check browser console**
   - Network tab: Look for failed requests
   - Console: Look for JavaScript errors
   - Check response codes (should be 200)

#### Emails Not Sending

**Symptoms:**
- Orders save but no emails received
- Only admin email missing
- Only customer email missing

**Solutions:**
1. **Check settings**
   - Go to: `Scheda Orders → Settings`
   - Verify email address is correct
   - Ensure "Email Notifications" is checked

2. **Check spam folder**
   - Gmail: Check Spam folder
   - Outlook: Check Junk folder
   - Add sender to safe senders

3. **Test WordPress email**
   ```php
   // Add temporarily to functions.php
   add_action('wp_head', function() {
       wp_mail('your@email.com', 'Test', 'Testing WordPress mail');
   });
   ```
   Visit homepage and check email

4. **Install SMTP plugin**
   - WP Mail SMTP (recommended)
   - Post SMTP
   - Configure with your SMTP details
   - Test email sending

5. **Check server configuration**
   - Contact hosting provider
   - Verify mail() function works
   - Check for email sending limits
   - Verify SPF/DKIM records

#### Orders Not Appearing in Admin

**Symptoms:**
- Form submits successfully
- No orders in "Scheda Orders" menu
- Orders not saving

**Solutions:**
1. **Check custom post type registration**
   - Go to: `Scheda Orders → Settings`
   - Scroll to "Plugin Information"
   - Verify "Database Version" matches

2. **Check user permissions**
   - Ensure you have `edit_posts` capability
   - Check user role has appropriate access
   - Try with administrator account

3. **Verify database**
   - Check if `scheda_order` post type exists in database
   - Look for posts with `post_type = 'scheda_order'`
   - Check `wp_postmeta` table for order data

4. **Flush rewrite rules**
   - Go to: `Settings → Permalinks`
   - Click "Save Changes"
   - This refreshes WordPress routing

#### Performance Issues

**Symptoms:**
- Form loads slowly
- Page takes long to load
- High memory usage

**Solutions:**
1. **Optimize assets**
   - Enable page caching (exclude AJAX endpoint)
   - Use CDN for static files
   - Enable GZIP compression

2. **Database optimization**
   - Clean up old test orders
   - Optimize WordPress database tables
   - Use database caching plugin

3. **Server optimization**
   - Increase PHP memory limit
   - Enable OPcache
   - Use PHP 8.0+ for better performance

## Requirements

### System Requirements

**WordPress:**
- Minimum: WordPress 5.0
- Recommended: WordPress 6.0 or higher
- Must support custom post types
- Must support shortcodes

**PHP:**
- Minimum: PHP 7.4
- Recommended: PHP 8.0 or higher
- Extensions: JSON, mbstring
- Memory limit: 128MB recommended

**Server:**
- Apache or Nginx
- mod_rewrite (for pretty permalinks)
- Ability to send emails (SMTP or mail())
- SSL/TLS recommended

**Browser:**
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Plugin Compatibility

**Compatible with:**
- Most WordPress themes
- Popular page builders (Elementor, Divi, Beaver Builder)
- Caching plugins (WP Rocket, W3 Total Cache)
- Security plugins (Wordfence, iThemes Security)
- Most standard plugins

**Known conflicts:**
- Other form plugins with same shortcode
- Very aggressive caching (may need AJAX exclusion)
- Some minification plugins (may break React)

## Security

### Security Features

**Input Validation:**
- All user input sanitized before storage
- Email addresses validated
- SQL injection prevention via WordPress APIs
- XSS protection with output escaping

**AJAX Security:**
- WordPress nonce verification on all requests
- Capability checks for admin functions
- Rate limiting via WordPress core
- Referrer checking

**Data Protection:**
- Customer data stored securely in database
- No sensitive data logged
- Passwords never collected or stored
- GDPR compliant design

**Best Practices:**
- Regular security updates
- WordPress coding standards followed
- No hardcoded credentials
- Secure file permissions

### Recommended Security Measures

1. **Keep plugin updated**
2. **Use SSL/HTTPS**
3. **Regular backups**
4. **Security plugin** (Wordfence, iThemes)
5. **Strong passwords**
6. **Limit login attempts**
7. **Keep WordPress updated**
8. **Use reputable hosting**

## Development

### File Structure

```
scheda-clienti-wordpress/
├── scheda-clienti.php           # Main plugin file (8KB)
├── README.md                     # This file
├── includes/
│   ├── class-sc-ajax.php         # AJAX handlers (12KB)
│   │   ├── Form submission
│   │   ├── Data validation
│   │   ├── Email notifications
│   │   └── Order management
│   └── class-sc-data.php         # Data management (11KB)
│   ├── Custom post type registration
│   ├── Admin meta boxes
│   ├── Settings page
│   └── Admin columns
└── assets/
    ├── index-CIiFNmIw.css        # React app styles (21KB)
    ├── index-DDqDgeVF.js         # React app bundle (393KB)
    └── wp-bridge.js              # WordPress bridge (4KB)
```

### Code Architecture

**Main Plugin Class** (`scheda-clienti.php`)
- Singleton pattern
- Initializes all components
- Registers shortcode
- Enqueues assets
- Handles activation/deactivation

**AJAX Handler** (`class-sc-ajax.php`)
- Processes form submissions
- Validates data
- Saves orders
- Sends emails
- Handles AJAX responses

**Data Handler** (`class-sc-data.php`)
- Registers custom post type
- Creates admin interface
- Manages meta boxes
- Handles settings page
- Customizes admin columns

**Frontend Assets**
- React app bundle (pre-built)
- WordPress bridge script
- CSS styles

### Building the React App

If you want to modify the React form interface:

1. **Navigate to source directory**
   ```bash
   cd /Users/frog/code/github/frog/scheda-clinti
   ```

2. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Make your changes**
   - Edit files in `src/` directory
   - See `COMPONENT_REFERENCE.md` for details

4. **Build the app**
   ```bash
   npm run build
   ```

5. **Copy assets to plugin**
   ```bash
   cp dist/assets/*.scheda-clienti-wordpress/assets/
   ```

6. **Update filenames** in `scheda-clienti.php` if they changed
   - Look for hash suffixes
   - Update CSS and JS filenames

7. **Test thoroughly**
   - Deactivate/reactivate plugin
   - Clear all caches
   - Test form submission
   - Verify email sending

### Development Workflow

**For CSS changes:**
1. Edit source files
2. `npm run build`
3. Copy CSS to plugin
4. Test in browser

**For form logic changes:**
1. Edit React components
2. `npm run build`
3. Copy JS to plugin
4. Test entire form flow

**For WordPress integration:**
1. Edit PHP files directly
2. No build step needed
3. Just save and test

### Debug Mode

Enable WordPress debugging:

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Check log file:
```bash
tail -f wp-content/debug.log
```

### Testing Checklist

- [ ] Form displays correctly
- [ ] Step 1 validation works
- [ ] Step 2 validation works
- [ ] Product categories expand/collapse
- [ ] Add/remove items works
- [ ] Form submits via AJAX
- [ ] Order saves to database
- [ ] Admin email sent
- [ ] Customer email sent
- [ ] Order appears in admin
- [ ] Order status can be changed
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## API Reference

### Shortcode API

**Function:** `scheda_clienti_shortcode`

**Parameters:**
- `$atts` (array): Shortcode attributes
- `$content` (string): Content between shortcode tags (unused)

**Returns:** HTML string

**Example:**
```php
echo do_shortcode('[scheda_clienti title="Custom"]');
```

### AJAX API

**Action:** `sc_submit_form`

**Method:** POST

**Parameters:**
- `action` (string): "sc_submit_form"
- `nonce` (string): WordPress nonce
- `form_data` (string): JSON-encoded form data

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Order placed successfully",
    "order_id": 123,
    "order_number": "SC-000123"
  }
}
```

### Database Schema

**Custom Post Type:** `scheda_order`

**Post Meta:**
- `customer_name` - Customer name
- `customer_email` - Customer email
- `customer_telephone` - Customer phone
- `customer_city` - Customer city
- `customer_address` - Customer address
- `customer_additional_notes` - Additional notes
- `order_products` - JSON array of products
- `order_date` - Order timestamp
- `order_status` - Order status

**Options:**
- `sc_email_recipient` - Admin email
- `sc_success_message` - Success message
- `sc_enable_notifications` - Email toggle
- `sc_db_version` - Database version

### Hooks Reference

**Actions:**
- `sc_order_saved` - After order saved (params: $post_id, $data)
- `sc_order_status_changed` - When status changes

**Filters:**
- `sc_order_data_before_save` - Modify data before saving
- `sc_email_message` - Modify email content
- `sc_success_message` - Modify success message

## Changelog

### Version 1.0.0 (2024-01-29)
- Initial release
- Two-step form with customer info and product selection
- 9 product categories with dynamic fields
- AJAX form submission
- Email notifications (admin & customer)
- Admin dashboard for order management
- Shortcode integration
- Order status tracking
- Custom post type for orders
- Settings page for configuration
- Responsive design
- WordPress 5.0+ compatibility
- PHP 7.4+ compatibility

### Future Plans
- [ ] Price calculation
- [ ] Payment gateway integration
- [ ] Customer portal
- [ ] PDF invoice generation
- [ ] Multi-language support
- [ ] Product images
- [ ] Inventory management
- [ ] Order export (CSV/Excel)
- [ ] SMS notifications
- [ ] Analytics dashboard

## Support

### Getting Help

**Documentation:**
- This README file
- Installation guide: `INSTALLATION_GUIDE.md`
- Component reference: `COMPONENT_REFERENCE.md`

**Troubleshooting:**
- See [Troubleshooting section](#troubleshooting)
- Check WordPress debug log
- Enable WP_DEBUG for detailed errors

**Community:**
- Report issues via GitHub
- Check for existing solutions
- Share your improvements

### Contributing

Want to contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

**Areas for contribution:**
- Translations
- Bug fixes
- Feature additions
- Documentation improvements
- Code optimization

## Credits

**Developed by:** Your Name

**Based on:** React Scheda Clienti form application

**Technologies:**
- React 18
- WordPress 5.0+
- PHP 7.4+
- Tailwind CSS

## License

GPL v2 or later

**License URI:** https://www.gnu.org/licenses/gpl-2.0.html

---

**Thank you for using Scheda Clienti!**

For the latest updates and support, visit the project repository.

---

## Quick Reference

### Shortcode
```
[scheda_clienti]
```

### Admin Menu
**Scheda Orders** (below Comments)

### Settings
**Scheda Orders → Settings**

### Requirements
- WordPress 5.0+
- PHP 7.4+
- 128MB memory

### Support
See [Support section](#support)

**Version:** 1.0.0
**Last Updated:** 2024-01-29

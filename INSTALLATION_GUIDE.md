# WordPress Plugin Installation Guide

Follow these steps to install and use the Scheda Clienti WordPress plugin.

## Step 1: Prepare the Plugin

The plugin has been created in the `scheda-clienti-wordpress/` directory.

### Option A: Create ZIP File

```bash
# Navigate to the project directory
cd /Users/frog/code/github/frog/scheda-clinti

# Create ZIP file
zip -r scheda-clienti-wordpress.zip scheda-clienti-wordpress/ -x "*.DS_Store"
```

Then upload `scheda-clienti-wordpress.zip` through WordPress admin.

### Option B: Direct FTP Upload

Upload the entire `scheda-clienti-wordpress/` folder to:
```
/wp-content/plugins/
```

## Step 2: Install in WordPress

1. Log in to your WordPress admin panel
2. Go to **Plugins** → **Add New**
3. Click **Upload Plugin**
4. Choose the ZIP file and click **Install Now**
5. **Activate** the plugin

## Step 3: Configure Settings

1. Go to **Scheda Orders** → **Settings**
2. Configure the following:
   - **Email Recipient**: Enter your email address
   - **Success Message**: Customize the confirmation message
   - **Email Notifications**: Keep checked to receive order emails

## Step 4: Add Form to a Page

### Method 1: Using Shortcode in Page Editor

1. Create or edit a page
2. Add the shortcode:
   ```
   [scheda_clienti]
   ```
3. Publish/Update the page

### Method 2: With Custom Options

```
[scheda_clienti
    title="Order Your Furniture"
    description="Fill out the form below to place your order"
    class="container-fluid"]
```

### Method 3: In Theme Files

```php
<?php echo do_shortcode('[scheda_clienti]'); ?>
```

### Method 4: In Sidebar/Widget

1. Go to **Appearance** → **Widgets**
2. Add a **Text Widget** or **Custom HTML** widget
3. Add the shortcode: `[scheda_clienti]`

## Step 5: Test the Form

1. Visit the page with the shortcode
2. Fill out the customer information
3. Select some products
4. Submit the form
5. Check:
   - Success message appears
   - Email received (if configured)
   - Order appears in **Scheda Orders** menu

## Viewing Orders

1. Go to **Scheda Orders** in WordPress admin
2. Click on any order to view:
   - Customer details
   - Selected products
   - Update order status

## Troubleshooting

### Form Not Displaying

**Check:**
- Plugin is activated
- Shortcode syntax is correct
- No JavaScript errors in browser console
- Page is not cached

**Solution:**
- Clear page cache
- Check browser console for errors
- Verify assets are loading

### Shortcode Shows as Text

**Problem:** Shortcode appears as literal text instead of form

**Solutions:**
- Ensure plugin is activated
- Try in a different page
- Check for plugin conflicts
- Verify WordPress version compatibility

### AJAX Not Working

**Problem:** Form loads but submission fails

**Solutions:**
- Check browser console for errors
- Verify admin-ajax.php is accessible
- Check WordPress nonce generation
- Disable other plugins to test for conflicts

### Emails Not Sending

**Problem:** Orders save but no emails received

**Solutions:**
- Check spam folder
- Verify WordPress email configuration
- Test with SMTP plugin
- Check server mail logs
- Verify email address in settings

### Permission Issues

**Problem:** Cannot access order details

**Solutions:**
- Ensure user has `manage_options` capability
- Check custom post type permissions
- Verify user role has appropriate access

## Advanced Configuration

### Custom CSS

Add to your theme's `style.css` or Appearance → Customize → Additional CSS:

```css
/* Customize form container */
.scheda-clienti-wrapper {
    max-width: 1200px;
    margin: 0 auto;
}

/* Customize loading message */
.sc-loading {
    text-align: center;
    padding: 40px;
}

/* Customize success message */
.sc-wordpress-success {
    background: #d1fae5;
    color: #065f46;
    padding: 20px;
    border-radius: 8px;
}
```

### Hook Examples

Add to your theme's `functions.php`:

```php
// Log order data after save
add_action('sc_order_saved', function($post_id, $data) {
    error_log('New order: ' . $post_id);
}, 10, 2);

// Modify admin columns
add_filter('manage_scheda_order_posts_columns', function($columns) {
    $columns['phone'] = 'Phone';
    return $columns;
});
```

## Updating the Plugin

When you rebuild the React app:

1. Build the React app: `npm run build`
2. Copy new assets:
   ```bash
   cp dist/assets/* scheda-clienti-wordpress/assets/
   ```
3. Update filenames in `scheda-clienti.php` if they changed
4. Re-upload the plugin or replace files via FTP
5. Clear any caches

## Security Notes

- The plugin uses WordPress nonces for AJAX protection
- All input is sanitized before storage
- Output is escaped to prevent XSS
- Users need appropriate permissions to view orders

## Performance Tips

1. **Caching**: Use page caching with AJAX excluded
2. **CDN**: Serve assets through CDN for faster loading
3. **Optimization**: Consider deferring JavaScript loading
4. **Database**: Clean up old test orders periodically

## Support Resources

- WordPress Admin: **Scheda Orders → Settings**
- Plugin files: `wp-content/plugins/scheda-clienti-wordpress/`
- Debug mode: Enable `WP_DEBUG` in wp-config.php for error logs

## Quick Reference

### Shortcode
```
[scheda_clienti]
```

### Menu Location
**Scheda Orders** (below Comments)

### Settings Page
**Scheda Orders → Settings**

### Post Type
`scheda_order`

### Database Options
- `sc_email_recipient`
- `sc_success_message`
- `sc_enable_notifications`

---

**Need Help?** Check the main README.md file or review WordPress documentation.

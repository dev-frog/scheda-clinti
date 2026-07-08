# Multi-Email Invoice Feature Guide

## Overview

The Multi-Email Invoice feature allows you to configure multiple sales email recipients to receive professional invoice notifications when clients submit orders through the Scheda Clienti form.

## Features

- **Multiple Email Recipients**: Add unlimited email addresses (Gmail, Outlook, custom domains, etc.)
- **Professional Invoice Format**: Beautiful HTML invoices with company branding
- **Company Information**: Configure your company details for invoices
- **Test Email Functionality**: Verify your email configuration before going live
- **Customer Notifications**: Automatic order confirmation emails to clients
- **WordPress Integration**: Seamless integration with WordPress admin dashboard

## Accessing the Settings Page

### Method 1: Via WordPress Admin Menu

1. Log in to your WordPress admin dashboard
2. Navigate to **Ordini** (Orders) in the left sidebar menu
3. Click on **Impostazioni** (Settings) under the Ordini menu

### Method 2: Via Plugins Page

1. Go to **Plugins** > **Installed Plugins**
2. Find "Scheda Clienti - Furniture Order Form"
3. Click on the **Impostazioni** link below the plugin name

## Configuration Options

### 1. Notification Settings

#### Enable/Disable Notifications
- **Abilita Notifiche**: Checkbox to enable or disable all email notifications
- **Default**: Enabled

#### Sales Emails (Multiple)
- **Email Vendite (Multiple)**: Add multiple email addresses to receive order notifications
- **Supported Formats**: Any valid email address (Gmail, Outlook, custom domains, etc.)
- **How to Add**:
  1. Enter email address in the input field
  2. Click **Aggiungi Email** to add more recipients
  3. Click the **X** button to remove an email address
- **Validation**: Only valid email addresses are accepted
- **Default**: WordPress admin email

### 2. Email Configuration

#### Sender Information
- **Nome Mittente**: The name displayed as the sender of emails
- **Email Mittente**: The email address used as the sender
- **Best Practice**: Use an email address from your domain to avoid spam filters
- **Default**: WordPress site name and admin email

### 3. Company Information

These details appear on the invoice emails sent to sales recipients:

- **Nome Azienda**: Your company name for invoices
- **Indirizzo**: Company address (multi-line)
- **Telefono**: Company contact phone number
- **P.IVA / Partita IVA**: VAT number for Italian businesses
- **Display**: Shown in the header of professional invoice emails

## Using the Test Email Feature

### How to Send a Test Email

1. Configure your settings (see above)
2. Scroll to the **Test Email** section at the bottom of the settings page
3. Click **Invia Email di Prova** (Send Test Email)
4. Wait for the confirmation message

### Test Email Results

- **Success**: Green confirmation message with number of recipients
- **Error**: Red error message with specific error details
- **No Emails Configured**: Falls back to WordPress admin email

### Troubleshooting Test Emails

If test emails fail:

1. **Check SMTP Configuration**: Ensure your WordPress site has proper SMTP settings
2. **Verify Email Addresses**: Confirm all email addresses are valid
3. **Check Spam Folder**: Test emails may be filtered as spam
4. **Server Logs**: Check WordPress error logs for specific failures

## Email Templates

### Admin/Sales Invoice Email

The invoice email includes:

- **Professional Header**: Company logo placeholder and order number
- **Company Information**: Configured company details and contact info
- **Order Details**: Order number, date, and status
- **Customer Information**: Name, email, phone, address, city
- **Product List**: Grouped by product type with quantities and details
- **Item Details**: Specific configurations for each product
- **Additional Notes**: Customer notes if provided
- **Admin Link**: Direct link to view order in WordPress admin
- **Professional Footer**: Plugin version and generation timestamp

### Customer Confirmation Email

The confirmation email includes:

- **Success Header**: Thank you message with order confirmation
- **Order Summary**: Order number, date, and customer details
- **Product Overview**: List of selected products with quantities
- **Next Steps**: Information about order processing and contact
- **Company Contact**: Company phone number if configured
- **Professional Footer**: Company name and timestamp

## Email Sending Process

### When Orders Are Submitted

1. **Form Submission**: Client submits the furniture order form
2. **Data Processing**: WordPress validates and sanitizes the form data
3. **Order Creation**: Order is saved to WordPress database (backup)
4. **Email Generation**: Professional HTML invoices are generated
5. **Multi-Recipient Sending**: Emails are sent to all configured recipients
6. **Customer Confirmation**: Separate confirmation email sent to client
7. **Logging**: All email activities are logged for troubleshooting

### Error Handling

- **Individual Recipient Failures**: Failed emails for specific recipients don't stop others from being sent
- **Database Failures**: Emails are still sent even if database save fails
- **Detailed Logging**: All successes and failures are logged in WordPress error log

## Email Deliverability Best Practices

### To Avoid Spam Filters

1. **Use Custom Domain Email**: Don't use Gmail/Outlook as sender address
2. **Configure SPF/DKIM**: Set up proper email authentication for your domain
3. **Use SMTP Plugin**: Install a WordPress SMTP plugin for reliable delivery
4. **Test Regularly**: Use the test email feature to verify configuration
5. **Monitor Spam Folder**: Check recipient spam folders periodically

### Recommended SMTP Plugins

- **WP Mail SMTP**: Popular choice with detailed logging
- **Post SMTP**: Advanced authentication and debugging
- **Easy WP SMTP**: Simple configuration for basic needs
- **Gmail SMTP**: If using Gmail as your email provider

## Troubleshooting

### Emails Not Arriving

1. **Check Settings**: Verify notifications are enabled and emails are configured
2. **Test Email**: Use the test email feature to verify basic functionality
3. **Check Spam Folder**: Emails may be filtered by spam filters
4. **Review Error Logs**: Check WordPress error logs for specific failures
5. **Verify SMTP**: Ensure SMTP plugin is properly configured
6. **Test Recipient Email**: Verify recipient email addresses are valid

### Emails Going to Spam

1. **Sender Address**: Use your domain email, not free email services
2. **Email Authentication**: Set up SPF and DKIM records
3. **Content Quality**: Avoid spam-like content in emails
4. **Volume**: Don't send too many emails in a short period
5. **Reputation**: Monitor your domain's email reputation

### Configuration Issues

1. **Clear Cache**: Clear WordPress and browser cache after changes
2. **Re-save Settings**: Re-save settings after making changes
3. **Check Plugin Conflicts**: Disable other plugins temporarily to test
4. **Theme Compatibility**: Test with default WordPress theme
5. **WordPress Version**: Ensure WordPress is up to date

## API Integration

### JavaScript/React Integration

The configuration is available in the React app via `scPlugin` global:

```javascript
// Access configuration
const salesEmails = window.scPlugin.salesEmails;
const companyName = window.scPlugin.companyName;
const adminEmail = window.scPlugin.adminEmail;
```

### WordPress Hooks

The plugin provides several hooks for customization:

```php
// After order is saved
do_action('sc_order_saved', $post_id, $data);

// Custom email filtering
add_filter('sc_sales_emails', function($emails) {
    // Add custom email addresses
    $emails[] = 'custom@example.com';
    return $emails;
});
```

## Security Features

- **Nonce Verification**: All AJAX requests require valid security tokens
- **Capability Checks**: Settings page requires admin privileges
- **Email Validation**: All email addresses are validated before sending
- **Data Sanitization**: All form data is sanitized before storage
- **XSS Protection**: All output is properly escaped

## Performance Considerations

- **Email Queue**: Multiple emails are sent sequentially
- **Timeout Handling**: PHP execution time limits are respected
- **Error Recovery**: Failed emails don't prevent order completion
- **Logging**: Minimal performance impact from logging activities

## Future Enhancements

Planned features for future versions:

- Email template customization
- Attachment support for PDF invoices
- Email scheduling for batch processing
- Advanced email analytics and tracking
- Multi-language support for emails
- Custom email HTML editor

## Support

For issues or questions:

1. Check WordPress error logs: `wp-content/debug.log`
2. Review plugin documentation: `README.md`
3. Test with test email feature before going live
4. Check plugin compatibility with other plugins
5. Verify WordPress and PHP version requirements

## Version History

- **1.0.1**: Initial multi-email invoice feature implementation
- **1.0.0**: Base plugin functionality

## License

This feature is part of the Scheda Clienti plugin and is licensed under GPL v2 or later.
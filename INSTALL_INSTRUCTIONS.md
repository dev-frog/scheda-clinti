# 🚀 WordPress Plugin Installation Guide

## Step-by-Step Instructions to Install and Use Scheda Clienti Plugin

---

## 📦 STEP 1: Install the Plugin

### Method A: WordPress Admin Upload (Recommended)

### 1. Download the Plugin ZIP

The plugin file is located at:

```bash
/Users/frog/code/github/frog/scheda-clinti/scheda-clienti-plugin.zip
```

### 2. Log in to WordPress

Go to your website admin area:

```bash
https://yourdomain.com/wp-admin
```

### 3. Navigate to Plugins

- In the left sidebar, click **Plugins**
- Click **Add New** button

### 4. Upload Plugin

- Click **Upload Plugin** button (top of page)
- Click **Choose File**
- Select `scheda-clienti-plugin.zip` from your computer
- Click **Install Now**

### 5. Activate Plugin

- After upload completes, click **Activate Plugin**
- You'll see: "Plugin activated successfully!"

---

## ⚙️ STEP 2: Configure Settings

### 1. Access Settings Page

- In WordPress admin, look for **Scheda Orders** menu (below Comments)
- Click **Settings**

### 2. Configure Email Notifications

**Email Recipient:**

- Enter your email address
- This is where new order notifications will be sent
- Default: WordPress admin email

**Success Message:**

- Customize the message customers see after submitting
- Default: "Thank you! Your order has been placed successfully. We will contact you shortly."

**Email Notifications:**

- Keep checkbox **checked** to enable emails
- Uncheck to disable (useful for testing)

### 3. Save Changes

- Click **Save Changes** button

---

## 📝 STEP 3: Add Form to Your Site

### Option A: Add to Existing Page

#### 1. Create or Edit a Page

- Go to **Pages** → **Add New** (or edit existing page)
- Give it a title: "Order Form" or "Furniture Order"

#### 2. Add the Shortcode

In the page editor, add:

```bash
[scheda_clienti]
```

#### 3. Publish the Page

- Click **Publish** or **Update**
- View the page to see your form!

### Option B: Create a New Order Page

#### 1. Create New Page

- **Pages** → **Add New**
- Title: "Place Your Order"
- Permalink: `/order` or `/furniture-order`

#### 2. Add Shortcode

```bash
[scheda_clienti]
```

#### 3. Add Optional Content (Above Form)

```bash
Welcome to our furniture ordering system!

Please fill out the form below to place your order.

[scheda_clienti]

Questions? Contact us at info@yourdomain.com
```

#### 4. Publish Page

- Click **Publish**
- Add to your navigation menu if desired

### Option C: Add to Homepage

#### 1. Edit Homepage

- Go to **Pages** and find your homepage
- Click **Edit**

#### 2. Add Shortcode

Scroll to where you want the form and add:

```bash
[scheda_clienti]
```

#### 3. Update Page

---

## 🎨 STEP 4: Customize the Form (Optional)

### Change Form Title

```bash
[scheda_clienti title="Order Your Furniture"]
```

### Add Custom Description

```bash
[scheda_clienti
    title="Place Your Order"
    description="Complete the form below to order your furniture"]
```

### Add Custom CSS Class

```bash
[scheda_clienti class="container my-custom-form"]
```

### Complete Example

```bash
[scheda_clienti
    title="Furniture Order Form"
    description="Tell us about yourself and select your products"
    class="main-form-container"]
```

---

## 📱 STEP 5: Add to Navigation Menu (Optional)

### 1. Go to Menus

- **Appearance** → **Menus**

### 2. Add Page to Menu

- Find your order page in the list of pages
- Check the box next to it
- Click **Add to Menu**

### 3. Save Menu

- Click **Save Menu**

---

## ✅ STEP 6: Test Your Form

### 1. Visit Your Form Page

Go to the page where you added the shortcode

### 2. Fill Out Step 1

- Name: Test User
- Email: `test@example.com`
- Telephone: 1234567890
- City: Test City
- Address: 123 Test Street
- Additional Notes: (optional) This is a test

### 3. Click "Next: Select Your Products"

### 4. Fill Out Step 2

- Click on a product category (e.g., "Flooring")
- Select a product type
- Add another item if you want
- Review the order summary

### 5. Click "Place Your Order"

### 6. Verify Success

- You should see a success message
- Check your email for order notification
- Go to **Scheda Orders** in WordPress admin
- Click on the new order to see details

---

## 🔧 STEP 7: View and Manage Orders

### Access Orders Dashboard

- In WordPress admin, click **Scheda Orders**
- You'll see all submitted orders

### View Individual Order

- Click on an order title
- See customer details and order items
- Update order status if needed

### Order Status Options

- **Pending** - New order, not processed yet
- **Processing** - Order is being prepared
- **Completed** - Order fulfilled
- **Cancelled** - Order cancelled

---

## 🌐 STEP 8: Add to Multiple Pages (Optional)

You can use the shortcode on multiple pages with different titles:

### Contact Page

```bash
[scheda_clienti title="Request a Quote"]
```

### Product Page

```bash
[scheda_clienti title="Order This Product"]
```

### Custom Page

```bash
[scheda_clienti title="Custom Order Form"]
```

---

## 📧 STEP 9: Configure Email (If Not Working)

### Check WordPress Email Settings

If emails aren't being sent:

#### Option 1: Install SMTP Plugin (Recommended)

1. Install **WP Mail SMTP** plugin
2. Configure with your SMTP details
3. Test email sending
4. Your order emails will now use SMTP

#### Option 2: Use Plugin Settings

1. Go to **Scheda Orders** → **Settings**
2. Verify email recipient is correct
3. Ensure "Email Notifications" is checked
4. Save changes

#### Option 3: Check Spam Folder

- Gmail: Check **Spam** folder
- Outlook: Check **Junk** folder
- Add sender to safe senders

---

## 🎯 Common Locations for Shortcode

### In Page Content

```bash
[scheda_clienti]
```

### In Sidebar Widget

1. **Appearance** → **Widgets**
2. Add **Text** or **Custom HTML** widget
3. Add shortcode:

```bash
[scheda_clienti]
```

### In Footer

1. **Appearance** → **Widgets**
2. Add to **Footer** widget area
3. Add shortcode

### In Template File (PHP)

```php
<?php echo do_shortcode('[scheda_clienti]'); ?>
```

---

## 🔍 Troubleshooting

### Form Not Showing

**Problem:** Shortcode appears as text or form doesn't load

**Solutions:**

1. Clear browser cache
2. Clear WordPress cache (if using cache plugin)
3. Verify plugin is activated
4. Check for JavaScript errors in browser console
5. Try on a different page

### Form Submits But No Email

**Problem:** Order saves but no email received

**Solutions:**

1. Check spam folder
2. Verify email in Settings page
3. Install SMTP plugin
4. Test with different email address
5. Check server email logs

### Can't Find Orders in Admin

**Problem:** Orders submitted but not showing

**Solutions:**

1. Go to **Scheda Orders** menu
2. Check **All Orders** view
3. Verify you're logged in as admin
4. Clear WordPress cache

---

## ✅ Quick Checklist

Before going live:

- [ ] Plugin installed and activated
- [ ] Settings configured (email, success message)
- [ ] Shortcode added to page
- [ ] Page published and visible
- [ ] Form tested with test submission
- [ ] Email notifications working
- [ ] Orders appearing in admin
- [ ] Page added to navigation menu
- [ ] Mobile tested (form responsive)
- [ ] Different browsers tested

---

## 🎉 You're Ready

Your furniture ordering form is now live and ready to accept orders!

**Your Form URL:**

```curl
https://yourdomain.com/your-page-slug/
```

**Admin Access:**

```curl
https://yourdomain.com/wp-admin/admin.php?page=sc-settings
```

**Orders Dashboard:**

```curl
https://yourdomain.com/wp-admin/admin.php?page=sc-settings
```

---

## 📞 Need Help?

**Check These Resources:**

- This installation guide
- Plugin settings page (has shortcode examples)
- WordPress admin area (Scheda Orders → Settings)
- Browser console for JavaScript errors

**Common Issues:**

- See Troubleshooting section above
- Check WordPress debug log
- Verify plugin compatibility

---

**Version:** 1.0.0
**Last Updated:** 2024-05-29

Happy ordering!

# Scheda Clienti - Furniture Ordering Form

> A modern, multi-step furniture ordering form built with React, now available as a WordPress plugin with shortcode support.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![WordPress](https://img.shields.io/badge/WordPress-5.0%2B-blue.svg)](https://wordpress.org)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-purple.svg)](https://php.net)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [WordPress Plugin](#wordpress-plugin)
- [Development](#development)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

**Scheda Clienti** (Customer Card) is a comprehensive furniture ordering system designed for furniture stores, interior design companies, and home improvement businesses. It started as a modern React application and has been converted into a fully-featured WordPress plugin.

### What It Does

- **Collects customer information** through a beautiful two-step form
- **Manages product selection** across 9 furniture categories
- **Handles dynamic ordering** with add/remove functionality
- **Provides order management** through WordPress admin dashboard
- **Sends notifications** via email to admins and customers
- **Tracks order status** through fulfillment workflow

### Available As

1. **React Application** - Standalone React/TypeScript app
2. **WordPress Plugin** - Complete plugin with shortcode support
3. **Elementor Widget** - Elementor addon (in development)

## Features

### Core Functionality
- ✅ **Two-step form workflow** with visual progress indicator
- ✅ **Customer information collection** (name, email, phone, city, address, notes)
- ✅ **9 product categories** with accordion-style navigation
- ✅ **Dynamic add/remove** - Unlimited items per category
- ✅ **Conditional fields** - Show/hide based on selections
- ✅ **Real-time order summary** - See selections before submitting
- ✅ **Form validation** - Client-side and server-side
- ✅ **Email notifications** - Admin and customer confirmations
- ✅ **Order management** - WordPress admin dashboard
- ✅ **Status tracking** - Pending, Processing, Completed, Cancelled
- ✅ **Responsive design** - Works on all devices
- ✅ **AJAX submission** - No page reloads

### Product Categories

1. **Flooring (Package)** - Type, installation method
2. **Interior Doors** - Size, handle, dimensions, installation
3. **Armored Door** - Same as interior doors
4. **Bathroom Furniture** - Name, code, link, transport
5. **Fixtures** - Product details and transport
6. **Mattresses** - Product-specific options
7. **Ceramics** - Product-specific options
8. **Sofas** - Product-specific options
9. **Children's Bedrooms** - Product-specific options

## Project Structure

### Root Structure

```
scheda-clinti/
├── src/                          # React application source
├── dist/                         # Built React app
├── scheda-clienti-wordpress/    # WordPress plugin
├── public/                       # Public assets
├── docs/                         # Documentation files
├── index.html                    # React app entry
├── package.json                  # Dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
└── README.md                     # This file
```

### React Application Structure

```
src/
├── components/
│   ├── scheda-clienti-form.tsx      # Main form container
│   ├── customer-onboarding.tsx      # Step 1: Customer info
│   ├── product-selection.tsx        # Step 2: Product categories
│   ├── product-sections/            # Product category components
│   │   ├── flooring-section.tsx
│   │   ├── interior-doors-section.tsx
│   │   ├── armored-door-section.tsx
│   │   ├── bathroom-furniture-section.tsx
│   │   ├── fixtures-section.tsx
│   │   ├── mattresses-section.tsx
│   │   ├── ceramics-section.tsx
│   │   ├── sofas-section.tsx
│   │   └── children-bedrooms-section.tsx
│   └── ui/                          # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── select.tsx
│       ├── radio-group.tsx
│       ├── checkbox.tsx
│       ├── label.tsx
│       ├── form.tsx
│       ├── card.tsx
│       └── accordion.tsx
├── lib/
│   └── utils.ts                     # Utility functions
├── App.tsx                          # Root component
├── App.css                          # Global styles
├── index.css                        # Tailwind imports
└── main.tsx                         # Entry point
```

### WordPress Plugin Structure

```
scheda-clienti-wordpress/
├── scheda-clienti.php              # Main plugin file
├── README.md                        # Plugin documentation
├── includes/
│   ├── class-sc-ajax.php            # AJAX handlers
│   └── class-sc-data.php            # Data management
└── assets/
    ├── index-CIiFNmIw.css           # React app styles
    ├── index-DDqDgeVF.js            # React app bundle
    └── wp-bridge.js                 # WordPress bridge
```

## Tech Stack

### React Application
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Radix UI** - Unstyled components
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### WordPress Plugin
- **WordPress 5.0+** - CMS platform
- **PHP 7.4+** - Server language
- **jQuery** - JavaScript library
- **WordPress APIs** - Custom post types, AJAX, etc.

## Installation

### React Application

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Steps

1. **Clone or download** the repository

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

### WordPress Plugin

#### Option 1: Upload ZIP (Recommended)

1. **Download plugin ZIP**
   ```bash
   zip -r scheda-clienti-plugin.zip scheda-clienti-wordpress/
   ```

2. **Upload to WordPress**
   - Go to: `Plugins → Add New → Upload Plugin`
   - Select ZIP and install
   - Activate the plugin

3. **Add shortcode** to any page:
   ```
   [scheda_clienti]
   ```

#### Option 2: Manual Upload

1. **Upload folder** to `/wp-content/plugins/`

2. **Activate** in WordPress admin

3. **Configure settings** in `Scheda Orders → Settings`

See [WordPress Plugin README](scheda-clienti-wordpress/README.md) for detailed instructions.

## Quick Start

### React Application

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:5173` to see the form.

### WordPress Plugin

1. **Install and activate** the plugin
2. **Add shortcode** to a page: `[scheda_clienti]`
3. **Configure settings** in WordPress admin
4. **Test the form** by submitting a test order

See [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) for step-by-step instructions.

## Usage

### React Application

After starting the development server:

1. **Fill customer information** (Step 1)
   - Name, Email, Telephone
   - City, Address
   - Additional Notes (optional)

2. **Select products** (Step 2)
   - Expand product categories
   - Add items as needed
   - Fill in product details
   - Review order summary

3. **Submit the form**
   - Form validates automatically
   - Success toast appears
   - Data logged to console

### WordPress Plugin

#### Adding the Form

**On a page:**
```
[scheda_clienti]
```

**With custom options:**
```
[scheda_clienti
    title="Order Your Furniture"
    description="Place your order below"
    class="custom-class"]
```

#### Managing Orders

1. Go to: `Scheda Orders` in WordPress admin
2. View all submitted orders
3. Click on an order to see details
4. Update order status as needed

#### Configuring Settings

Go to: `Scheda Orders → Settings`

- **Email Recipient**: Set notification email
- **Success Message**: Customize confirmation
- **Email Notifications**: Toggle on/off

## WordPress Plugin

The WordPress plugin provides complete integration with WordPress admin functionality.

### Features

- ✅ **Shortcode integration** - Add to any page
- ✅ **Admin dashboard** - Manage orders
- ✅ **Email notifications** - Automatic emails
- ✅ **Order tracking** - Status management
- ✅ **Settings page** - Easy configuration
- ✅ **Custom post type** - Native WordPress data
- ✅ **AJAX submission** - Seamless UX
- ✅ **Responsive design** - Mobile-friendly

### Shortcode

```
[scheda_clienti]
```

**Attributes:**
- `title` - Form heading
- `description` - Form subtitle
- `class` - Additional CSS classes

### Admin Menu

After activation, find **Scheda Orders** in WordPress admin:

- **Orders** - View all orders
- **Settings** - Configure plugin
- **Status** - Pending, Processing, Completed, Cancelled

### Email Notifications

**Admin Email Includes:**
- Order number and date
- Complete customer details
- All order items
- Direct link to order

**Customer Email Includes:**
- Order number
- Order summary
- Confirmation message

### Documentation

See [WordPress Plugin README](scheda-clienti-wordpress/README.md) for complete documentation.

## Development

### React Application Development

#### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type checking
tsc --noEmit
```

#### Project Setup

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Open browser to http://localhost:5173
```

#### Build Process

```bash
# TypeScript compilation
tsc

# Vite build
vite build

# Output in dist/ directory
```

#### Development Workflow

1. Make changes in `src/` directory
2. Vite hot-reloads automatically
3. See changes immediately in browser
4. Build when ready for production

### WordPress Plugin Development

#### File Structure

```
scheda-clienti-wordpress/
├── scheda-clienti.php              # Main plugin
├── includes/
│   ├── class-sc-ajax.php            # AJAX handlers
│   └── class-sc-data.php            # Data management
└── assets/
    ├── index-CIiFNmIw.css           # Styles
    ├── index-DDqDgeVF.js            # React app
    └── wp-bridge.js                 # Bridge script
```

#### Modifying React App

1. Make changes in `src/` directory
2. Build: `npm run build`
3. Copy assets: `cp dist/assets/* scheda-clienti-wordpress/assets/`
4. Update filenames in `scheda-clienti.php` if changed
5. Test in WordPress

#### Modifying WordPress Code

Edit PHP files directly:
- `scheda-clienti.php` - Main functionality
- `includes/class-sc-ajax.php` - AJAX handlers
- `includes/class-sc-data.php` - Admin interface

No build step needed for PHP changes.

### Testing

#### React Application

```bash
# Run tests (when implemented)
npm test

# Type checking
tsc --noEmit

# Linting
npm run lint
```

#### WordPress Plugin

1. **Enable debug mode**
   ```php
   define('WP_DEBUG', true);
   ```

2. **Test form submission**
   - Fill out form completely
   - Verify order saves
   - Check emails received

3. **Test admin functionality**
   - View orders in admin
   - Update order status
   - Test settings page

## Documentation

### Available Documentation

- **README.md** (this file) - Project overview
- **INSTALLATION_GUIDE.md** - Installation instructions
- **WORDPRESS_PLUGIN_SUMMARY.md** - Plugin quick reference
- **ELEMENTOR_ADDON_INSTRUCTIONS.md** - Elementor widget specs
- **COMPONENT_REFERENCE.md** - Component documentation
- **WordPress Plugin README** - Complete plugin guide

### Component Reference

See [COMPONENT_REFERENCE.md](COMPONENT_REFERENCE.md) for:
- Detailed component documentation
- Props and interfaces
- State management patterns
- Styling reference
- Data structures

### WordPress Plugin Guide

See [scheda-clienti-wordpress/README.md](scheda-clienti-wordpress/README.md) for:
- Complete plugin documentation
- Installation instructions
- Usage examples
- Admin interface guide
- Troubleshooting
- API reference

### Elementor Addon

See [ELEMENTOR_ADDON_INSTRUCTIONS.md](ELEMENTOR_ADDON_INSTRUCTIONS.md) for:
- Widget specifications
- All form fields
- Product categories
- Implementation guide
- Code examples

## Form Schema

### Customer Information (Step 1)

```typescript
{
  name: string;           // min 2 chars, required
  email: string;          // valid email, required
  telephone: string;      // min 5 chars, required
  city: string;           // min 2 chars, required
  address: string;        // min 5 chars, required
  additionalNotes: string; // optional
}
```

### Product Selection (Step 2)

```typescript
{
  products: Array<{
    type: string;        // Product category
    details: {
      id: string;        // Unique item ID
      [key: string]: any; // Product-specific fields
    };
  }>;
}
```

## Styling

The project uses Tailwind CSS with custom configuration:

### Primary Colors

```css
teal-500: #14b8a6     /* Primary */
teal-600: #0d9488     /* Button */
teal-700: #0f766e     /* Hover */
```

### Muted Colors

```css
muted-50: #fafaf9
muted-100: #f5f5f4
muted-200: #e7e5e4
```

### Border Radius

```css
lg: 0.5rem
md: calc(0.5rem - 2px)
sm: calc(0.5rem - 4px)
```

## Deployment

### React Application

```bash
# Build production bundle
npm run build

# Output in dist/ directory
# Deploy dist/ contents to web server
```

### WordPress Plugin

```bash
# Create distribution ZIP
zip -r scheda-clienti-plugin.zip scheda-clienti-wordpress/

# Upload to WordPress or distribute
```

## Requirements

### React Application

- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

### WordPress Plugin

- **WordPress**: 5.0 or higher
- **PHP**: 7.4 or higher
- **Memory**: 128MB or higher recommended
- **Server**: Apache or Nginx with mod_rewrite

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Setup

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Coding Standards

- **React**: Follow React best practices
- **TypeScript**: Use proper typing
- **WordPress**: Follow WordPress coding standards
- **PHP**: Use PSR-12 coding standards

## Future Enhancements

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
- [ ] Elementor widget
- [ ] REST API endpoints

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

- **React Application**: Built with React, TypeScript, Vite
- **UI Components**: Based on Radix UI and Tailwind CSS
- **WordPress Plugin**: Native WordPress implementation
- **Icons**: Lucide React

## Support

### Documentation

- [README.md](README.md) - This file
- [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) - Installation
- [WORDPRESS_PLUGIN_SUMMARY.md](WORDPRESS_PLUGIN_SUMMARY.md) - Plugin guide
- [COMPONENT_REFERENCE.md](COMPONENT_REFERENCE.md) - Components
- [ELEMENTOR_ADDON_INSTRUCTIONS.md](ELEMENTOR_ADDON_INSTRUCTIONS.md) - Elementor

### Getting Help

1. Check the documentation
2. Review troubleshooting sections
3. Search existing issues
4. Create a new issue with details

---

**Version:** 1.0.0
**Last Updated:** 2024-01-29

## Quick Commands

### React App

```bash
# Install
npm install

# Develop
npm run dev

# Build
npm run build

# Preview
npm run preview
```

### WordPress Plugin

```bash
# Build ZIP
zip -r scheda-clienti-plugin.zip scheda-clienti-wordpress/

# Update React app in plugin
npm run build
cp dist/assets/* scheda-clienti-wordpress/assets/
```

### Shortcode

```
[scheda_clienti]
```

---

**Thank you for using Scheda Clienti!**

For the latest updates and support, visit the project repository.

# Elementor Addon Instructions for Scheda Clienti Form

> Use these instructions to create an Elementor addon that replicates this furniture ordering form

## Project Overview

**Scheda Clienti** is a two-step customer ordering form for a furniture company with:

- **Step 1:** Customer information collection
- **Step 2:** Product selection from 9 categories with dynamic item management
- Features: Real-time order summary, form validation, toast notifications

---

## Widget Requirements

### Main Widget: "Scheda Clienti Form"

#### Structure
- Two-step form with progress bar (Step 1 of 2 / Step 2 of 2)
- Navigation between steps with Next/Back buttons
- Submit button on final step with success notification

---

## Step 1 - Customer Information

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | Text input | Yes | Min 2 characters |
| Email | Email input | Yes | Valid email format |
| Telephone | Text input | Yes | Min 5 characters |
| City | Text input | Yes | Min 2 characters |
| Address | Textarea | Yes | Min 5 characters |
| Additional Notes | Textarea | No | - |

---

## Step 2 - Product Selection

Accordion-style product categories (9 total). Each category includes:

### 1. Flooring (Package)
**Fields:**
- **Type** (dropdown): Solid, Pre-finished, Laminate, SPC, Outdoor Flooring
- **Installation Type** (radio): Floating, Glue

### 2. Interior Doors
**Fields:**
- **Sense of Opening** (radio): Holy, Right
- **Length** (dropdown): 60, 70, 80, 90, Out of Measure
  - Shows **Custom Length** input when "Out of Measure" selected
- **Number of Doors** (number input): Min 1
- **Dimensions** (textarea)
- **Height** (dropdown): 210, Out of Measure
  - Shows **Custom Height** input when "Out of Measure" selected
- **Handle** (radio): Yes, No
  - Shows **Handle Name** input when "Yes" selected
- **Pose** (radio): Yes, No
- **Installation Type** (radio): Floating, Glue

### 3. Armored Door
Same fields as Interior Doors

### 4. Bathroom Furniture
**Fields:**
- **Name** (text input)
- **Product Code** (text input)
- **Product Link** (text input)
- **Transport** (radio): Yes, No

### 5. Fixtures
Similar to Bathroom Furniture (name, code, link, transport)

### 6. Mattresses
Product-specific fields (verify from source code)

### 7. Ceramics
Product-specific fields (verify from source code)

### 8. Sofas
Product-specific fields (verify from source code)

### 9. Children's Bedrooms
Product-specific fields (verify from source code)

---

## Dynamic Item Management

**Each category should:**
- Start with 1 item
- Have "Add [Product]" button to add more items
- Display item counter (e.g., "Flooring (3)")
- Show "Remove" button for each item (disabled when only 1 item remains)
- Display item number in corner of each card (e.g., "Item 1", "Item 2")

---

## Order Summary

**Display at bottom of Step 2:**
- Group products by type with count
- Show all details for each selected item
- Format as cards with item details in grid layout

---

## Technical Requirements

### Form Handling
- Use AJAX for form submission
- Store form data in WordPress database (custom post type or options table)
- Validate all required fields before submission
- Show success message/toast on submission
- Send email notification to admin with formatted order details

### Elementor Controls (Widget Settings)

| Control Name | Type | Default | Description |
|--------------|------|---------|-------------|
| form_title | Text | "Scheda Clienti" | Main heading |
| form_description | Textarea | "Complete the form..." | Subtitle text |
| button_text | Text | "Place Your Order" | Submit button label |
| email_recipient | Text | admin email | Notification email |
| success_message | Textarea | "Order placed successfully!" | Confirmation message |

### Styling Requirements

**Match existing Tailwind design:**
- Primary color: Teal (#14b8a6, #0d9488 hover)
- Card backgrounds with muted borders
- Rounded corners (lg, md, sm variants)
- Consistent spacing (gap-4, gap-6)
- Progress bar with animated fill
- Accordion expand/collapse with Plus/Minus icons
- Responsive grid layouts (sm:grid-cols-2)

**CSS Classes Reference:**
```css
/* Progress Bar */
.progress-bar { height: 8px; border-radius: 9999px; overflow: hidden; }
.progress-fill { background: #14b8a6; transition: width 300ms ease-in-out; }

/* Cards */
.card { padding: 2rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
.card-header { position: absolute; top: 0; right: 0; background: #f3f4f6; padding: 0.25rem 0.75rem; }

/* Accordion */
.accordion-item { border: 1px solid #e5e7eb; border-radius: 0.5rem; margin-bottom: 1rem; overflow: hidden; }
.accordion-trigger { background: #f3f4f630; padding: 0.75rem 1rem; }
.accordion-trigger:hover { background: #f3f4f650; }

/* Buttons */
.btn-primary { background: #0d9488; color: white; padding: 1.5rem; width: 100%; }
.btn-primary:hover { background: #0f766e; }
.btn-outline { border: 1px solid #e5e7eb; background: transparent; }
```

### Data Structure

**Store submission as JSON:**
```json
{
  "customer_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "telephone": "+39 123 456 7890",
    "city": "Milan",
    "address": "Via Roma 123",
    "additional_notes": "Please call before delivery"
  },
  "products": [
    {
      "type": "Flooring",
      "details": {
        "id": "flooring-1",
        "type": "Solid",
        "installationType": "Floating"
      }
    },
    {
      "type": "Interior Door",
      "details": {
        "id": "door-1",
        "senseOfOpening": "Holy",
        "length": "80",
        "customLength": "",
        "numberOfDoors": "2",
        "dimensions": "Standard size",
        "height": "210",
        "customHeight": "",
        "handle": "Yes",
        "handleName": "Modern Handle",
        "pose": "No",
        "installationType": "Floating"
      }
    }
  ],
  "submitted_at": "2024-01-01 12:00:00"
}
```

---

## File Structure

```
wp-content/plugins/scheda-clienti-elementor/
├── scheda-clienti-elementor.php          # Main plugin file
├── widgets/
│   └── scheda-clienti-form.php           # Elementor widget
├── assets/
│   ├── css/
│   │   └── frontend.css                  # Frontend styling
│   └── js/
│       └── frontend.js                   # Form interactivity
└── includes/
    ├── class-scheda-clienti-ajax.php     # AJAX handlers
    └── class-scheda-clienti-data.php     # Data storage
```

---

## Key Features to Implement

### 1. Multi-step Form with State Management
```javascript
let currentStep = 1;
let formData = {
  customer_info: {},
  products: []
};

function nextStep() {
  if (validateStep(currentStep)) {
    currentStep++;
    updateUI();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
  }
}
```

### 2. Accordion Component
```javascript
function toggleAccordion(sectionId) {
  const content = document.getElementById(`${sectionId}-content`);
  const icon = document.getElementById(`${sectionId}-icon`);

  if (content.style.maxHeight) {
    content.style.maxHeight = null;
    icon.textContent = '+';
  } else {
    content.style.maxHeight = content.scrollHeight + 'px';
    icon.textContent = '-';
  }
}
```

### 3. Dynamic Add/Remove Items
```javascript
function addItem(productType) {
  const items = getItems(productType);
  const newId = `${productType}-${items.length + 1}`;

  items.push({
    id: newId,
    // default values
  });

  renderItems(productType);
  updateOrderSummary();
}

function removeItem(productType, itemId) {
  const items = getItems(productType);
  if (items.length > 1) {
    const index = items.findIndex(i => i.id === itemId);
    items.splice(index, 1);
    renderItems(productType);
    updateOrderSummary();
  }
}
```

### 4. Conditional Field Display
```javascript
function showConditionalField(parentField, childFieldId) {
  const childField = document.getElementById(childFieldId);

  parentField.addEventListener('change', (e) => {
    if (e.target.value === 'Out of Measure' || e.target.value === 'Yes') {
      childField.style.display = 'block';
    } else {
      childField.style.display = 'none';
    }
  });
}
```

### 5. Real-time Order Summary
```javascript
function updateOrderSummary() {
  const products = formData.products;
  const grouped = products.reduce((acc, product) => {
    if (!acc[product.type]) acc[product.type] = [];
    acc[product.type].push(product);
    return acc;
  }, {});

  renderOrderSummary(grouped);
}
```

### 6. AJAX Submission
```php
// In class-scheda-clienti-ajax.php
public function handle_form_submission() {
    check_ajax_referer('scheda_clienti_nonce', 'nonce');

    $data = json_decode(stripslashes($_POST['form_data']), true);

    // Store in database
    $post_id = wp_insert_post([
        'post_type' => 'scheda_order',
        'post_status' => 'private',
        'post_title' => 'Order from ' . $data['customer_info']['name']
    ]);

    update_post_meta($post_id, 'order_data', $data);

    // Send email
    $this->send_notification_email($data);

    wp_send_json_success(['message' => 'Order placed successfully']);
}
```

---

## Form Validation Rules

```javascript
const validationRules = {
  name: { required: true, minLength: 2 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  telephone: { required: true, minLength: 5 },
  city: { required: true, minLength: 2 },
  address: { required: true, minLength: 5 },
  additional_notes: { required: false }
};

function validateField(fieldName, value) {
  const rules = validationRules[fieldName];
  if (!rules) return { valid: true };

  if (rules.required && !value) {
    return { valid: false, message: `${fieldName} is required` };
  }

  if (rules.minLength && value.length < rules.minLength) {
    return { valid: false, message: `${fieldName} must be at least ${rules.minLength} characters` };
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return { valid: false, message: `${fieldName} is invalid` };
  }

  return { valid: true };
}
```

---

## Email Notification Template

```php
$email_body = "
<h2>New Order from {$data['customer_info']['name']}</h2>

<h3>Customer Information</h3>
<p><strong>Name:</strong> {$data['customer_info']['name']}</p>
<p><strong>Email:</strong> {$data['customer_info']['email']}</p>
<p><strong>Phone:</strong> {$data['customer_info']['telephone']}</p>
<p><strong>City:</strong> {$data['customer_info']['city']}</p>
<p><strong>Address:</strong> {$data['customer_info']['address']}</p>
<p><strong>Notes:</strong> {$data['customer_info']['additional_notes']}</p>

<h3>Order Items</h3>
<table>
    <thead>
        <tr>
            <th>Product Type</th>
            <th>Details</th>
        </tr>
    </thead>
    <tbody>
";

foreach ($data['products'] as $product) {
    $email_body .= "<tr><td>{$product['type']}</td><td>";
    foreach ($product['details'] as $key => $value) {
        if ($key !== 'id') {
            $email_body .= "<strong>{$key}:</strong> {$value}<br>";
        }
    }
    $email_body .= "</td></tr>";
}

$email_body .= "</tbody></table>";
```

---

## Development Checklist

- [ ] Create plugin structure
- [ ] Register Elementor widget
- [ ] Build Step 1 form fields
- [ ] Build Step 2 accordion structure
- [ ] Implement all 9 product categories
- [ ] Add dynamic add/remove functionality
- [ ] Implement conditional field display
- [ ] Create order summary component
- [ ] Add form validation
- [ ] Implement AJAX submission
- [ ] Create data storage system
- [ ] Build email notification system
- [ ] Add CSS styling
- [ ] Test all functionality
- [ ] Add admin settings page
- [ ] Create documentation

---

## Resources

**Source Code Reference:**
- Main form: `src/components/scheda-clienti-form.tsx`
- Customer info: `src/components/customer-onboarding.tsx`
- Product selection: `src/components/product-selection.tsx`
- Product sections: `src/components/product-sections/`
- UI components: `src/components/ui/`
- Styling: `tailwind.config.js`, `src/index.css`

**Key Technologies to Replace:**
- React Hook Form → Vanilla JS or jQuery
- Radix UI components → Custom implementations
- Tailwind CSS → Standard CSS or CDN
- Zod validation → Native JS validation

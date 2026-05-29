# Component Reference - Scheda Clienti Form

Complete reference documentation for all components in the furniture ordering form.

## Table of Contents

1. [Form Components](#form-components)
2. [Product Sections](#product-sections)
3. [UI Components](#ui-components)
4. [Data Structures](#data-structures)
5. [State Management](#state-management)

---

## Form Components

### SchedaClientiForm

**Location:** `src/components/scheda-clienti-form.tsx`

**Purpose:** Main form container managing two-step workflow

**State:**
```typescript
const [step, setStep] = useState(1); // Current step (1 or 2)
```

**Form Schema (Zod):**
```typescript
{
  name: string (min 2 chars)
  email: string (email format)
  telephone: string (min 5 chars)
  city: string (min 2 chars)
  address: string (min 5 chars)
  additionalNotes: string (optional)
  products: Array<{ type: string, details: Record<string, any> }> (optional)
}
```

**Functions:**
- `onSubmit(data)` - Handles form submission
  - Step 1: Advances to step 2
  - Step 2: Logs data, shows toast, resets form

**UI Structure:**
```
┌─────────────────────────────────────┐
│  Title: "Scheda Clienti"            │
│  Subtitle                           │
├─────────────────────────────────────┤
│  Progress: Step X of 2              │
│  [████████████░░░░] 50%            │
├─────────────────────────────────────┤
│  Step 1: CustomerOnboarding        │
│  OR                                  │
│  Step 2: ProductSelection           │
├─────────────────────────────────────┤
│  [Next: Select Your Products]       │
│  OR                                  │
│  [Place Your Order]                 │
└─────────────────────────────────────┘
```

---

### CustomerOnboarding

**Location:** `src/components/customer-onboarding.tsx`

**Purpose:** Step 1 - Collect customer information

**Props:**
```typescript
interface CustomerOnboardingProps {
  form: UseFormReturn<FormValues>;
}
```

**Fields Rendered:**
1. Name (Input)
2. Email (Input, type="email")
3. Telephone (Input)
4. City (Input)
5. Address (Textarea)
6. Additional Notes (Textarea, optional)

**Layout:** Grid (2 columns on sm+ screens)

**Validation:**
- All fields except additionalNotes are required
- Real-time validation errors shown below fields

---

### ProductSelection

**Location:** `src/components/product-selection.tsx`

**Purpose:** Step 2 - Product category accordion and order summary

**Props:**
```typescript
interface ProductSelectionProps {
  form: UseFormReturn<FormValues>;
}
```

**State:**
```typescript
const [expandedSections, setExpandedSections] = useState<string[]>([]);
```

**Sections:**
1. Flooring (Package)
2. Interior Doors
3. Armored Door
4. Bathroom Furniture
5. Fixtures
6. Mattresses
7. Ceramics
8. Sofas
9. Children's Bedrooms

**Functions:**
- `toggleSection(value)` - Expand/collapse accordion section
- `OrderSummary({ form })` - Internal component displaying grouped products

**UI Structure:**
```
┌─────────────────────────────────────┐
│  [Back] Choose Your Products        │
├─────────────────────────────────────┤
│  ▼ Flooring (Package)               │
│  ┌───────────────────────────────┐  │
│  │ Flooring Items...            │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  ▼ Interior Doors (2)              │
│  ┌───────────────────────────────┐  │
│  │ Door Items...                 │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  ▶ Armored Door                     │
├─────────────────────────────────────┤
│  Order Summary                      │
│  ┌───────────────────────────────┐  │
│  │ Flooring (2)                  │  │
│  │ ┌─────────────────────────┐  │  │
│  │ │ Item 1                  │  │  │
│  │ │ Item 2                  │  │  │
│  │ └─────────────────────────┘  │  │
│  │ Interior Doors (1)            │  │
│  │ ┌─────────────────────────┐  │  │
│  │ │ Item 1                  │  │  │
│  │ └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## Product Sections

### Common Pattern

All product sections follow this structure:

```typescript
interface ProductItem {
  id: string;                    // Unique ID (e.g., "flooring-1")
  // ... product-specific fields
}

export default function ProductSection({ form }: Props) {
  // State management
  const [items, setItems] = useState<ProductItem[]>([defaultItem]);

  // CRUD operations
  const addItem = () => { /* Add new item with unique ID */ };
  const removeItem = (id) => { /* Remove item (keep at least 1) */ };
  const updateItem = (id, field, value) => {
    // Update local state
    // Sync with form data
  };

  return (
    <div>
      {/* Header with item count */}
      {/* List of item cards */}
      {/* Add button */}
    </div>
  );
}
```

---

### FlooringSection

**Location:** `src/components/product-sections/flooring-section.tsx`

**Item Interface:**
```typescript
interface FlooringItem {
  id: string;
  type: string;           // "Solid" | "Pre-finished" | "Laminate" | "SPC" | "Outdoor Flooring"
  installationType: string; // "Floating" | "Glue"
}
```

**Fields:**
- Type (Select): Solid, Pre-finished, Laminate, SPC, Outdoor Flooring
- Installation Type (Radio): Floating, Glue

**Layout:** 2-column grid

---

### InteriorDoorsSection

**Location:** `src/components/product-sections/interior-doors-section.tsx`

**Item Interface:**
```typescript
interface DoorItem {
  id: string;
  senseOfOpening: string;    // "Holy" | "Right"
  length: string;            // "60" | "70" | "80" | "90" | "Out of Measure"
  customLength: string;      // (conditional)
  numberOfDoors: string;     // number input
  dimensions: string;        // textarea
  height: string;            // "210" | "Out of Measure"
  customHeight: string;      // (conditional)
  handle: string;            // "Yes" | "No"
  handleName: string;        // (conditional)
  pose: string;              // "Yes" | "No"
  installationType: string;  // "Floating" | "Glue"
}
```

**Conditional Fields:**
- `customLength` shows when `length === "Out of Measure"`
- `customHeight` shows when `height === "Out of Measure"`
- `handleName` shows when `handle === "Yes"`

**Fields:**
1. Sense of Opening (Radio): Holy, Right
2. Length (Select): 60, 70, 80, 90, Out of Measure
   → Custom Length (Input) [conditional]
3. Number of Doors (Input, type="number", min=1)
4. Dimensions (Textarea)
5. Height (Select): 210, Out of Measure
   → Custom Height (Input) [conditional]
6. Handle (Radio): Yes, No
   → Handle Name (Input) [conditional]
7. Pose (Radio): Yes, No
8. Installation Type (Radio): Floating, Glue

**Layout:** Mixed (2-column grid for some fields, full width for others)

---

### ArmoredDoorSection

**Location:** `src/components/product-sections/armored-door-section.tsx`

**Structure:** Identical to InteriorDoorsSection

**Item Interface:** Same as DoorItem

**Difference:** Product type is "Armored Door" instead of "Interior Door"

---

### BathroomFurnitureSection

**Location:** `src/components/product-sections/bathroom-furniture-section.tsx`

**Item Interface:**
```typescript
interface BathroomFurnitureItem {
  id: string;
  name: string;
  productCode: string;
  productLink: string;
  transport: string;        // "Yes" | "No"
}
```

**Fields:**
1. Name (Input)
2. Product Code (Input)
3. Product Link (Input)
4. Transport (Radio): Yes, No

**Layout:** Vertical stack (full width fields)

---

### FixturesSection

**Location:** `src/components/product-sections/fixtures-section.tsx`

**Structure:** Similar to BathroomFurnitureSection

---

### MattressesSection

**Location:** `src/components/product-sections/mattresses-section.tsx`

**Fields:** Product-specific (verify from source)

---

### CeramicsSection

**Location:** `src/components/product-sections/ceramics-section.tsx`

**Fields:** Product-specific (verify from source)

---

### SofasSection

**Location:** `src/components/product-sections/sofas-section.tsx`

**Fields:** Product-specific (verify from source)

---

### ChildrenBedroomsSection

**Location:** `src/components/product-sections/children-bedrooms-section.tsx`

**Fields:** Product-specific (verify from source)

---

## UI Components

### Button

**Location:** `src/components/ui/button.tsx`

**Variants:**
- `default` - Primary button style
- `destructive` - Red/danger button (remove actions)
- `outline` - Bordered button (secondary actions)
- `secondary` - Gray button
- `ghost` - Transparent with hover
- `link` - Text link style

**Sizes:**
- `default` - h-10 px-4 py-2
- `sm` - h-9 rounded-md px-3
- `lg` - h-11 rounded-md px-8
- `icon` - h-10 w-10

**Usage Examples:**
```tsx
<Button variant="default" size="lg">Submit</Button>
<Button variant="outline" size="sm">Add Item</Button>
<Button variant="destructive" size="sm">Remove</Button>
```

---

### Input

**Location:** `src/components/ui/input.tsx`

**Props:** Standard HTML input props

**Usage:**
```tsx
<Input placeholder="Enter text" {...field} />
```

---

### Textarea

**Location:** `src/components/ui/textarea.tsx`

**Props:** Standard HTML textarea props

**Usage:**
```tsx
<Textarea placeholder="Enter details" {...field} />
```

---

### Select

**Location:** `src/components/ui/select.tsx`

**Components:**
- `Select` - Container
- `SelectTrigger` - Button that opens dropdown
- `SelectValue` - Displayed value
- `SelectContent` - Dropdown content
- `SelectItem` - Individual option

**Usage:**
```tsx
<Select value={value} onValueChange={onChange}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

### RadioGroup

**Location:** `src/components/ui/radio-group.tsx`

**Components:**
- `RadioGroup` - Container
- `RadioGroupItem` - Individual radio button
- `Label` - Text label (paired with RadioGroupItem)

**Usage:**
```tsx
<RadioGroup value={value} onValueChange={onChange}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="yes" id="yes" />
    <Label htmlFor="yes">Yes</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="no" id="no" />
    <Label htmlFor="no">No</Label>
  </div>
</RadioGroup>
```

---

### Label

**Location:** `src/components/ui/label.tsx`

**Usage:** Form field labels, pairs with inputs via `htmlFor`

---

### Card

**Location:** `src/components/ui/card.tsx`

**Components:**
- `Card` - Container
- `CardContent` - Content area (with padding)

**Usage:**
```tsx
<Card>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

---

### Accordion

**Location:** `src/components/ui/accordion.tsx`

**Components:**
- `Accordion` - Container
- `AccordionItem` - Individual accordion section
- `AccordionTrigger` - Clickable header
- `AccordionContent` - Expandable content

**Usage:**
```tsx
<Accordion type="multiple" value={expandedSections}>
  <AccordionItem value="section1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>
      {/* Content */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### Form Components

**Location:** `src/components/ui/form.tsx`

**Components:**
- `Form` - Provider wrapper
- `FormField` - Individual form field
- `FormItem` - Field container
- `FormLabel` - Field label
- `FormControl` - Input wrapper
- `FormDescription` - Helper text
- `FormMessage` - Error message

**Usage:**
```tsx
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormDescription>Helper text</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Data Structures

### FormValues

```typescript
type FormValues = {
  // Customer Information
  name: string;
  email: string;
  telephone: string;
  city: string;
  address: string;
  additionalNotes: string;

  // Product Selection
  products?: Array<{
    type: string;
    details: {
      id: string;
      [key: string]: any;
    };
  }>;
};
```

### Product Data Examples

```typescript
// Flooring
{
  type: "Flooring",
  details: {
    id: "flooring-1",
    type: "Solid",
    installationType: "Floating"
  }
}

// Interior Door
{
  type: "Interior Door",
  details: {
    id: "door-1",
    senseOfOpening: "Holy",
    length: "80",
    customLength: "",
    numberOfDoors: "2",
    dimensions: "Standard size",
    height: "210",
    customHeight: "",
    handle: "Yes",
    handleName: "Modern Handle",
    pose: "No",
    installationType: "Floating"
  }
}

// Bathroom Furniture
{
  type: "Bathroom Furniture",
  details: {
    id: "bathroom-1",
    name: "Modern Vanity",
    productCode: "BV-123",
    productLink: "https://example.com/product",
    transport: "Yes"
  }
}
```

---

## State Management

### Form State

Managed by `react-hook-form`:

```typescript
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: "",
    email: "",
    telephone: "",
    city: "",
    address: "",
    additionalNotes: "",
    products: [],
  },
});
```

### Product Section State

Each product section manages its own items:

```typescript
const [items, setItems] = useState<ProductItem[]>([defaultItem]);
```

### Syncing Section State with Form

When an item is updated:

```typescript
const updateItem = (id: string, field: keyof ProductItem, value: string) => {
  // 1. Update local state
  setItems(prev =>
    prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
  );

  // 2. Get current products from form
  const products = form.getValues("products") || [];
  const updatedProducts = [...products];

  // 3. Find or create product entry
  const existingIndex = products.findIndex(
    p => p.type === "Product Type" && p.details.id === id
  );

  // 4. Update product entry
  if (existingIndex >= 0) {
    updatedProducts[existingIndex] = {
      type: "Product Type",
      details: { ...item, [field]: value }
    };
  } else {
    updatedProducts.push({
      type: "Product Type",
      details: { ...item, [field]: value }
    });
  }

  // 5. Sync with form
  form.setValue("products", updatedProducts);
};
```

---

## Styling Classes Reference

### Container Classes
- `min-h-screen bg-white p-4 md:p-8` - Main container
- `mx-auto max-w-5xl` - Content wrapper
- `space-y-8` - Vertical spacing

### Card Classes
- `border border-muted` - Card border
- `relative overflow-hidden` - For corner badge positioning
- `pt-8` - Content padding (makes room for badge)

### Typography
- `text-3xl font-bold tracking-tight` - Main heading
- `text-2xl font-bold` - Section headings
- `text-lg font-medium` - Subsection headings
- `text-muted-foreground` - Secondary text

### Buttons
- `bg-teal-600 hover:bg-teal-700` - Primary button
- `bg-muted/50 hover:bg-muted` - Secondary button
- `w-full mt-8 py-6 text-lg font-medium` - Submit button styling

### Progress Bar
- `h-2 w-full overflow-hidden rounded-full bg-muted` - Bar container
- `h-full bg-teal-500 transition-all duration-300 ease-in-out` - Fill animation

### Responsive Grid
- `grid gap-6 sm:grid-cols-2` - 2 columns on sm+ screens

---

## Utilities

### cn() function

**Location:** `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Purpose:** Merge Tailwind classes intelligently, handling conflicts

**Usage:**
```tsx
className={cn("base-class", isActive && "active-class", customClassName)}
```

---

This reference provides complete information for recreating the form in any framework or CMS.

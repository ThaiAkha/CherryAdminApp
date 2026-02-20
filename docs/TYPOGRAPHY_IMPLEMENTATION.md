# Typography System - Implementation Guide

## Overview

The Typography System provides a centralized, consistent way to handle all text styling throughout the Cherry Admin App. All components support **light and dark modes** automatically.

---

## Components

### 1. **Heading** - Headings (H1-H6)

Use for titles and headings at various hierarchy levels.

```tsx
import { Heading } from '@/components/typography';

// Default H1
<Heading>Welcome to Dashboard</Heading>

// Specific heading level
<Heading level="h2">Section Title</Heading>
<Heading level="h3">Subsection</Heading>
<Heading level="h4">Card Title</Heading>

// With custom className
<Heading level="h1" className="text-brand-500">
  Custom Heading
</Heading>
```

**Available Levels:**
- `h1` - Page titles (2.5rem, font-bold)
- `h2` - Section titles (2rem, font-bold)
- `h3` - Subsection titles (1.5rem, font-bold)
- `h4` - Card titles (1.125rem, font-bold)
- `h5` - Modal titles (1rem, font-semibold)
- `h6` - Sub-modal titles (0.875rem, font-semibold)

---

### 2. **Paragraph** - Body Text

Use for regular content paragraphs and body text.

```tsx
import { Paragraph } from '@/components/typography';

// Default (size="base", color="primary")
<Paragraph>Standard paragraph text</Paragraph>

// Different sizes
<Paragraph size="lg">Large paragraph for introductions</Paragraph>
<Paragraph size="base">Standard body text</Paragraph>
<Paragraph size="sm">Small paragraph text</Paragraph>
<Paragraph size="xs">Extra small text</Paragraph>

// Different colors
<Paragraph color="primary">Main content</Paragraph>
<Paragraph color="secondary">Secondary description</Paragraph>
<Paragraph color="muted">Muted helper text</Paragraph>

// Combined
<Paragraph size="sm" color="muted">
  Small muted text
</Paragraph>
```

**Size Variants:**
- `lg` - 1.125rem, leading-loose (introductions)
- `base` - 1rem, leading-relaxed (standard)
- `sm` - 0.875rem, leading-relaxed (secondary)
- `xs` - 0.75rem, leading-relaxed (captions)

**Color Variants:**
- `primary` - Main text (gray-700 light / gray-200 dark)
- `secondary` - Secondary text (gray-600 light / gray-300 dark)
- `muted` - Muted text (gray-500 light / gray-400 dark)

---

### 3. **Label** - Form Labels

Use for form field labels, always paired with form inputs.

```tsx
import { Label } from '@/components/typography';

// Basic label
<Label htmlFor="hotel-name">Hotel Name</Label>

// Required field (adds red asterisk)
<Label htmlFor="email" required>
  Email Address
</Label>

// With input
<>
  <Label htmlFor="name" required>
    Full Name
  </Label>
  <input id="name" type="text" />
</>
```

**Props:**
- `htmlFor` - Connects to input ID
- `required` - Shows red asterisk
- `className` - Custom styling

---

### 4. **Caption** - Small Text & Meta

Use for captions, timestamps, helper text, and micro-content.

```tsx
import { Caption } from '@/components/typography';

// Default caption
<Caption>Updated 2 hours ago</Caption>

// Muted caption (lighter color)
<Caption muted>ID: #12345 • By Admin</Caption>

// Use cases
<Caption>Meta information and timestamps</Caption>
<Caption muted>Helper text and explanations</Caption>
```

**Props:**
- `muted` - Lighter/grayed appearance
- `className` - Custom styling

---

### 5. **Badge** - Tags & Status Indicators

Use for status badges, tags, and small labels.

```tsx
import { Badge } from '@/components/typography';

// Default badge
<Badge>New</Badge>

// Status variants
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Rejected</Badge>
<Badge variant="info">Updated</Badge>

// List of badges
<div className="flex gap-2">
  <Badge variant="success">Confirmed</Badge>
  <Badge variant="warning">Pending</Badge>
</div>
```

**Variants:**
- `default` - Gray (neutral)
- `success` - Green (positive)
- `warning` - Yellow (caution)
- `error` - Red (negative)
- `info` - Blue (informational)

---

## Migration Guide

### Before (Inline Classes)

```tsx
// ❌ Not recommended - classes scattered everywhere
<h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
  Admin Dashboard
</h1>

<p className="text-md text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
  Welcome back to the dashboard
</p>

<label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
  Hotel Name *
</label>

<p className="text-xs text-gray-400">Updated 2 hours ago</p>
```

### After (Using Typography Components)

```tsx
// ✅ Recommended - consistent, maintainable
import { Heading, Paragraph, Label, Caption } from '@/components/typography';

<Heading level="h1">Admin Dashboard</Heading>

<Paragraph size="lg">Welcome back to the dashboard</Paragraph>

<Label htmlFor="hotel" required>Hotel Name</Label>

<Caption muted>Updated 2 hours ago</Caption>
```

---

## Benefits

✅ **Consistency** - Single source of truth for all typography
✅ **Dark Mode** - Automatic light/dark mode support
✅ **Maintainability** - Change styles globally without touching components
✅ **Reusability** - Use same components everywhere
✅ **Code Reduction** - Remove repetitive className patterns
✅ **Responsive** - Built-in responsive support through Tailwind

---

## Tailwind Config Reference

The system uses these Tailwind utilities (no custom config needed):

```
Font Sizes:   text-xs, text-sm, text-base, text-lg, text-2xl, text-3xl, text-4xl
Font Weights: font-normal, font-medium, font-semibold, font-bold, font-black
Line Heights: leading-relaxed, leading-loose, leading-normal, leading-snug, leading-tight
Colors:       Gray scale (gray-400 to gray-900) + Brand colors
```

---

## Example: Complete Form

```tsx
import {
  Heading,
  Paragraph,
  Label,
  Caption,
  Badge,
} from '@/components/typography';

export function HotelForm() {
  return (
    <div className="p-6">
      <Heading level="h2">Add New Hotel</Heading>
      <Paragraph size="sm" color="muted">
        Fill in the details below to add a new hotel to the system
      </Paragraph>

      <div className="mt-6 space-y-4">
        {/* Name Field */}
        <div>
          <Label htmlFor="name" required>
            Hotel Name
          </Label>
          <input
            id="name"
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Email Field */}
        <div>
          <Label htmlFor="email">Contact Email</Label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Status */}
        <div>
          <Paragraph size="sm" className="font-medium mb-2">
            Status
          </Paragraph>
          <Badge variant="success">Active</Badge>
        </div>

        {/* Helper Text */}
        <Caption muted>Changes will be reflected within 5 minutes</Caption>
      </div>
    </div>
  );
}
```

---

## Dark Mode Support

All components automatically adjust for dark mode. No additional props needed:

```tsx
// Light Mode
<Heading>Dark mode ready!</Heading>
{/* text-gray-900 */}

// Dark Mode (automatic)
<Heading>Dark mode ready!</Heading>
{/* dark:text-white */}
```

---

## Accessibility

All components maintain semantic HTML:

- `Heading` renders proper `<h1>-<h6>` tags
- `Label` connects to inputs via `htmlFor`
- `Paragraph` is semantic `<p>` tag
- Contrast ratios meet WCAG AA standards

---

## Documentation

Visual type scale and all variants available in:
```
docs/TYPOGRAPHY.html
```

Open in browser to see live examples of all components and styles.

---

## Next Steps

1. ✅ Review `docs/TYPOGRAPHY.html` in browser
2. ✅ Import components in your files
3. ✅ Replace inline className text patterns
4. ✅ Enjoy consistent, maintainable typography!


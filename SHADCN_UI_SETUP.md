# shadcn/ui Setup Guide

This project has been configured with [shadcn/ui](https://ui.shadcn.com/docs), a collection of beautifully designed, accessible components built with Radix UI and Tailwind CSS.

## What's Installed

### Dependencies
- `class-variance-authority` - For component variants
- `clsx` - For conditional class names
- `tailwind-merge` - For merging Tailwind classes
- `lucide-react` - Icon library (optional, for future use)
- `tailwindcss-animate` - Animation utilities for Tailwind

### Components Created
The following shadcn/ui components have been set up in `components/ui/`:

1. **Button** (`button.js`) - Versatile button component with multiple variants
2. **Card** (`card.js`) - Container component with header, content, and footer
3. **Dialog** (`dialog.js`) - Modal dialog component
4. **Input** (`input.js`) - Form input component
5. **Select** (`select.js`) - Dropdown select component
6. **Label** (`label.js`) - Form label component
7. **Badge** (`badge.js`) - Badge/tag component

## Configuration Files

### `components.json`
Configuration file for shadcn/ui CLI (if you want to add more components later).

### `lib/utils.js`
Utility function `cn()` for merging Tailwind classes.

### `tailwind.config.js`
Updated with shadcn/ui theme variables and color system.

### `app/globals.css`
Updated with CSS variables for theming (light/dark mode support).

## Usage Examples

### Button
```jsx
import { Button } from '@/components/ui/button'

<Button variant="default" size="lg">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
```

### Card
```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

### Dialog
```jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Input & Label
```jsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div>
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Enter email" />
</div>
```

### Badge
```jsx
import { Badge } from '@/components/ui/badge'

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

## Adding More Components

To add more shadcn/ui components, you can:

1. Visit [shadcn/ui components](https://ui.shadcn.com/docs/components)
2. Copy the component code (JavaScript version)
3. Place it in `components/ui/`
4. Import and use it in your pages

Or use the CLI (if you set up TypeScript):
```bash
npx shadcn@latest add [component-name]
```

## Example Implementation

The Administrative Units Management page (`pages/admin/administrative-units.js`) has been updated to use shadcn/ui components as a reference implementation.

## Benefits

- **Consistent Design**: All components follow the same design system
- **Accessible**: Built on Radix UI primitives for accessibility
- **Customizable**: Full control over component code
- **Type-safe**: Easy to extend and modify
- **Modern**: Uses latest React patterns and Tailwind CSS

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Component Examples](https://ui.shadcn.com/docs/components)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)


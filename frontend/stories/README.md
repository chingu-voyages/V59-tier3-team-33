# JoyRoute Component Library

## Overview

Welcome to the JoyRoute Frontend component library built with Next.js, TypeScript, and Tailwind CSS.

## 🎯 Available Components

### Layout Components

#### Navigation
A responsive navigation bar with:
- Mobile hamburger menu
- Cart integration with badge counter
- User authentication state
- Sticky positioning
- Active link highlighting

**Usage:**
```tsx
<Navigation
  cartCount={3}
  userName="John Doe"
/>
```

#### Footer
A multi-column footer with:
- Responsive grid layout
- Social media links with icons
- Optional app download section
- Copyright and legal links

**Usage:**
```tsx
<Footer
  showAppDownload={true}
/>
```

### UI Components

#### Button
Versatile button component with:
- Primary, secondary, clear variants
- Small, medium, large sizes
- Icon support
- Round variant
- Disabled state

**Usage:**
```tsx
<Button variant="primary" size="medium">
  Click Me
</Button>
```

#### Logo
Brand logo component with:
- Configurable sizes (large/small)
- Logo-only variant
- Clickable navigation link

**Usage:**
```tsx
<Logo large logoOnly />
```

## 🎨 Design System

### Colors
The color system is defined in `tailwind.config.ts`:
- **Primary**: Dark color for main actions
- **Secondary**: Light accent color
- **Accent**: Blue highlight color
- **Gray Scale**: 50-950 range

### Typography
- Headings: `heading-1` through `heading-4`
- Body: `body`, `body-sm`, `body-xs`
- Font: Inter

### Spacing
Semantic spacing system:
- `xxs`, `xs`, `s`, `m`, `l`, `xl`, `xxl`

## 📱 Responsive Breakpoints

- `xs`: 480px
- `sm`: 640px
- `md`: 768px (Navigation switches to mobile)
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🚀 Getting Started

### View Components
Navigate through the sidebar to explore all components and their variants.

### Integration
All components are already integrated into the app layout:
- Navigation appears at the top
- Footer appears at the bottom
- Components can be imported from `@/components`

### Customization
Each component accepts props for customization. Check individual component stories for available props and examples.

## 🎨 Updating Colors

Colors in this library are placeholders. To update with your Figma design:

1. Open `tailwind.config.ts`
2. Replace color values with your Figma colors
3. Restart Storybook or dev server

See `FIGMA_COLORS.md` for detailed instructions.

## 📚 Resources

- [Component Structure Guide](../COMPONENT_STRUCTURE.md)
- [Figma Color Integration](../FIGMA_COLORS.md)
- [Setup Documentation](../SETUP_COMPLETE.md)

## 🔧 Tech Stack

- **Framework**: Next.js 16.1.6
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4.1.7
- **Language**: TypeScript
- **Icons**: React Icons
- **Utilities**: tailwind-merge

---

**Tip**: Use the Controls addon to interact with component props in real-time!

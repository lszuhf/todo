# Theming and Component Conventions

## Overview

This application uses a custom theming system built on Tailwind CSS with dark mode support. The design is inspired by Memos, featuring a clean, modern aesthetic with smooth transitions and responsive layouts.

## Color System

### Primary Colors

The application uses a sky-blue primary color palette that provides good contrast in both light and dark modes:

- Primary: `#0ea5e9` (sky-500) with variants from 50-900
- Accent color for interactive elements, buttons, and highlights

### Gray Scale

A carefully calibrated gray scale provides excellent readability:

- Light mode: Uses lighter grays (50-400) for backgrounds and surfaces
- Dark mode: Uses darker grays (700-900) for backgrounds and surfaces

### Usage Guidelines

- **Primary colors**: Use for CTAs, links, active states, and brand elements
- **Gray scale**: Use for text, borders, backgrounds, and neutral UI elements
- **Semantic colors**: Red for errors/danger, green for success (to be added as needed)

## Dark Mode Implementation

### Strategy

Dark mode is implemented using Tailwind's `class` strategy, allowing programmatic control via the `useTheme` hook.

### Theme Toggle

The theme preference is:

1. Stored in `localStorage` under the key `theme-preference`
2. Applied to the `<html>` element via the `dark` class
3. Respects system preference on first load
4. Persists across browser sessions

### Using Dark Mode in Components

Always provide both light and dark variants:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Content</div>
```

## Typography

### Font Family

- **Primary**: Inter (Google Fonts)
- **Fallbacks**: System fonts for optimal performance

### Font Weights

- Light: 300 (minimal use)
- Regular: 400 (body text)
- Medium: 500 (emphasis)
- Semibold: 600 (headings, buttons)
- Bold: 700 (strong emphasis)

### Usage

- Use `font-medium` or `font-semibold` for headings
- Use `font-normal` for body text
- Maintain consistent line-height for readability

## Component Conventions

### File Organization

```
src/
├── components/
│   ├── ui/           # Reusable UI primitives
│   └── layout/       # Layout components
├── pages/            # Page components
├── hooks/            # Custom React hooks
└── utils/            # Utility functions
```

### Component Structure

#### UI Components

Located in `components/ui/`, these are primitive, reusable building blocks:

- **Button**: Various variants (primary, secondary, ghost, danger) and sizes
- **Input**: Form inputs with label, error, and helper text support
- **Card**: Container with optional header, title, and content sections
- **Modal**: Accessible dialog with backdrop, close handling, and footer

#### Layout Components

Located in `components/layout/`:

- **Header**: Top navigation with logo and theme toggle
- **Navigation**: Tab-based navigation for main sections
- **MainLayout**: Main page wrapper with header, navigation, and content area

### Component Props

#### Variant-based Styling

Use TypeScript unions for variant props:

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
```

#### Size Options

Provide consistent sizing across components:

```tsx
type Size = 'sm' | 'md' | 'lg';
```

#### Common Patterns

1. **Extend native HTML props** for flexibility:

   ```tsx
   interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: ButtonVariant;
   }
   ```

2. **Use forwardRef** for components that may need refs:

   ```tsx
   export const Button = forwardRef<HTMLButtonElement, ButtonProps>(...);
   ```

3. **Provide sensible defaults**:
   ```tsx
   variant = 'primary',
   size = 'md',
   ```

### Styling Conventions

#### Tailwind Classes

1. **Order**: Layout → Spacing → Typography → Colors → Effects

   ```tsx
   'flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg';
   ```

2. **Dark mode**: Always pair light and dark variants

   ```tsx
   'bg-white dark:bg-gray-800';
   ```

3. **Hover/focus states**: Use transition utilities
   ```tsx
   'transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500';
   ```

#### CSS Custom Properties

Avoid when possible; prefer Tailwind utilities for consistency.

### Accessibility

#### Focus States

All interactive elements must have visible focus states:

```tsx
'focus:outline-none focus:ring-2 focus:ring-primary-500';
```

#### ARIA Labels

Provide labels for icon-only buttons:

```tsx
<button aria-label="Close modal">
  <CloseIcon />
</button>
```

#### Keyboard Navigation

- Modal closes on Escape key
- Tab navigation works correctly
- NavLink handles keyboard activation

## Responsive Design

### Breakpoints

Follow Tailwind's default breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Container

Use a max-width container for content:

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
```

### Mobile-First Approach

Start with mobile styles, then add larger breakpoint variants:

```tsx
'text-sm md:text-base lg:text-lg';
```

## State Management

### Local State

Use React's `useState` for component-local state.

### Theme State

Managed by the `useTheme` hook:

```tsx
const { theme, setTheme, toggleTheme } = useTheme();
```

### Future State Management

For global state (todos, tags, etc.), consider:

- Context API for simple state
- Zustand or Jotai for more complex state

## Animation and Transitions

### Transition Utilities

Use consistent transition durations:

- `duration-150`: Very fast (hover effects)
- `duration-200`: Fast (default for most transitions)
- `duration-300`: Medium (page transitions)

### Common Patterns

```tsx
'transition-colors duration-200'; // Color transitions
'transition-all duration-200'; // Multiple properties
'hover:shadow-md'; // Subtle elevation changes
```

## Best Practices

### Performance

1. Avoid unnecessary re-renders
2. Use React.memo for expensive components
3. Debounce search/filter inputs

### Code Quality

1. Use TypeScript for type safety
2. Follow naming conventions: PascalCase for components, camelCase for functions
3. Keep components focused and single-responsibility
4. Extract complex logic into custom hooks

### Testing

While not yet implemented, structure components for testability:

- Separate logic from presentation
- Use data-testid for test selectors
- Mock external dependencies

## Future Enhancements

### Planned Features

- Toast notifications component
- Loading states and skeletons
- Empty states component
- Dropdown/Select component
- Textarea component
- Checkbox and Radio components

### Theming Enhancements

- Multiple theme options (not just light/dark)
- Accent color customization
- Font size preferences
- Custom color schemes

## Examples

### Creating a New Page

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';

export function NewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page Title</h2>
        <p className="text-gray-600 dark:text-gray-400">Page description</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Title</CardTitle>
        </CardHeader>
        <CardContent>Content goes here</CardContent>
      </Card>
    </div>
  );
}
```

### Using the Modal

```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title" size="md">
  <p>Modal content</p>
  <ModalFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button onClick={handleSubmit}>Confirm</Button>
  </ModalFooter>
</Modal>;
```

### Custom Button Variant

```tsx
<Button variant="primary" size="lg" fullWidth onClick={handleClick}>
  Click Me
</Button>
```

# Web Application

A Memos-inspired React application built with Vite, TypeScript, and Tailwind CSS.

## Features

### Current Implementation

- ✅ **Dark Mode**: Full dark mode support with localStorage persistence and system preference detection
- ✅ **Responsive Layout**: Mobile-first design with a clean, modern interface
- ✅ **Navigation**: Tab-based navigation between Todos, Tags, and Settings
- ✅ **UI Components**: Reusable component library including Button, Input, Card, and Modal
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Routing**: React Router for client-side navigation

### Coming Soon

- 🔄 Todo management functionality
- 🔄 Tag organization system
- 🔄 Data export capabilities
- 🔄 User preferences and settings

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# From the repository root
pnpm install
```

### Development

```bash
# Run the development server
pnpm --filter web dev

# The app will be available at http://localhost:3000
```

### Building

```bash
# Build for production
pnpm --filter web build

# Preview the production build
pnpm --filter web preview
```

### Type Checking

```bash
pnpm --filter web typecheck
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ThemeToggle.tsx
│   └── layout/          # Layout components
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── MainLayout.tsx
├── hooks/
│   └── useTheme.ts      # Theme management hook
├── pages/               # Page components
│   ├── TodosPage.tsx
│   ├── TagsPage.tsx
│   └── SettingsPage.tsx
├── utils/               # Utility functions
├── App.tsx              # Main app component with routing
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Theming

The application uses a comprehensive theming system with dark mode support. See [THEMING.md](./THEMING.md) for detailed documentation on:

- Color system and usage guidelines
- Dark mode implementation
- Typography standards
- Component conventions
- Best practices

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Deployment**: Cloudflare Pages (configured)

## Component Library

### UI Components

#### Button

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

Variants: `primary`, `secondary`, `ghost`, `danger`
Sizes: `sm`, `md`, `lg`

#### Input

```tsx
<Input label="Email" type="email" placeholder="Enter your email" error={errors.email} fullWidth />
```

#### Card

```tsx
<Card hoverable>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
</Card>
```

#### Modal

```tsx
<Modal isOpen={isOpen} onClose={closeModal} title="Modal Title">
  <p>Modal content</p>
  <ModalFooter>
    <Button variant="secondary" onClick={closeModal}>
      Cancel
    </Button>
    <Button onClick={handleSubmit}>Confirm</Button>
  </ModalFooter>
</Modal>
```

### Layout Components

#### Header

Application header with logo and theme toggle.

#### Navigation

Tab-based navigation for switching between main sections.

#### MainLayout

Main layout wrapper that includes header, navigation, and content area.

## Hooks

### useTheme

Manages theme state with localStorage persistence:

```tsx
const { theme, setTheme, toggleTheme } = useTheme();
```

## Contributing

When adding new components or features:

1. Follow the conventions outlined in [THEMING.md](./THEMING.md)
2. Ensure dark mode support for all UI elements
3. Use TypeScript for type safety
4. Provide both light and dark theme styles
5. Make components accessible (ARIA labels, keyboard navigation, focus states)
6. Keep components focused and reusable

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Lint code (run from root)
- `pnpm format` - Format code (run from root)

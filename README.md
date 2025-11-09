# Cloudflare Monorepo

A modern monorepo setup for building full-stack applications with Cloudflare Pages (frontend) and Cloudflare Workers (backend).

## 📁 Project Structure

```
.
├── apps/
│   ├── web/              # Cloudflare Pages React frontend
│   │   ├── src/          # React application source
│   │   ├── index.html    # HTML entry point
│   │   ├── vite.config.ts # Vite configuration
│   │   └── package.json  # Web app dependencies
│   │
│   └── worker/           # Cloudflare Worker backend
│       ├── src/          # Worker source code
│       ├── wrangler.toml # Wrangler configuration
│       └── package.json  # Worker dependencies
│
├── .vscode/              # VSCode workspace settings
├── .husky/               # Git hooks
├── tsconfig.base.json    # Shared TypeScript config
├── .eslintrc.cjs         # ESLint configuration
├── .prettierrc.json      # Prettier configuration
├── .editorconfig         # EditorConfig settings
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── package.json          # Root package with shared tooling
```

## 🛠️ Tech Stack

### Frontend (apps/web)

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Target**: Cloudflare Pages

### Backend (apps/worker)

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Language**: TypeScript
- **Validation**: Zod
- **Development**: Wrangler

### Shared Tooling

- **Package Manager**: pnpm (workspaces)
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install all dependencies
pnpm install
```

## 📦 Available Commands

### Root Commands

```bash
# Install dependencies for all workspaces
pnpm install

# Run dev servers for all apps in parallel
pnpm dev

# Build all apps
pnpm build

# Run type checking for all apps
pnpm typecheck

# Lint all code
pnpm lint

# Fix lint issues
pnpm lint:fix

# Format all code
pnpm format

# Check code formatting
pnpm format:check
```

### Web App Commands

```bash
# Start development server (http://localhost:3000)
pnpm --filter web dev

# Build for production
pnpm --filter web build

# Preview production build
pnpm --filter web preview

# Run type checking
pnpm --filter web typecheck
```

### Worker Commands

```bash
# Start development server with Wrangler
pnpm --filter worker dev

# Deploy to Cloudflare
pnpm --filter worker deploy

# Build TypeScript
pnpm --filter worker build

# Run type checking
pnpm --filter worker typecheck
```

## 🔧 Development Workflow

### Running Apps Locally

To run both the frontend and backend together:

```bash
pnpm dev
```

Or run them separately in different terminals:

```bash
# Terminal 1 - Frontend
pnpm --filter web dev

# Terminal 2 - Backend
pnpm --filter worker dev
```

### Code Quality

This project uses automated code quality tools:

- **ESLint**: Catches code issues and enforces best practices
- **Prettier**: Ensures consistent code formatting
- **TypeScript**: Provides type safety
- **Git Hooks**: Automatically formats and lints code before commits

Code is automatically formatted and linted on commit via Husky and lint-staged.

### VSCode Setup

For the best development experience:

1. Install recommended extensions (VSCode will prompt you)
2. Settings are pre-configured for:
   - Format on save
   - ESLint auto-fix on save
   - Consistent line endings

## 📝 Adding New Workspaces

To add a new workspace package:

1. Create a new directory under `apps/` or `packages/`
2. Add a `package.json` with a unique `name` field
3. The workspace will be automatically recognized by pnpm
4. Install dependencies from the root: `pnpm install`

## 🚢 Deployment

### Frontend (Cloudflare Pages)

The frontend can be deployed to Cloudflare Pages:

```bash
# Build the app
pnpm --filter web build

# Deploy the dist/ directory to Cloudflare Pages
# (Configure via Cloudflare dashboard or wrangler)
```

### Backend (Cloudflare Worker)

Deploy the worker to Cloudflare:

```bash
pnpm --filter worker deploy
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all checks pass (`pnpm lint`, `pnpm typecheck`, `pnpm build`)
4. Commit your changes (hooks will auto-format)
5. Create a pull request

## 📄 License

MIT

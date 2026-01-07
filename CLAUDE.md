# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Beam is a smart budget tracker application with full Hebrew/RTL support. It uses a distributed architecture with separate frontend (React), backend (Node.js/TypeScript/Express), and database (PostgreSQL) services for multi-user family use hosted on a private homelab.

## Project Structure

This is a monorepo organized as follows:

```
beam/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components organized by feature
│   │   │   ├── layout/    # Layout components (Layout.tsx)
│   │   │   └── insights/  # Insight components (GeminiInsights.tsx)
│   │   ├── pages/         # Page components (Dashboard, Login, etc.)
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   ├── constants/     # App constants (icons, defaults)
│   │   ├── styles/        # Global styles
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── public/            # Static assets
│   └── config files       # vite.config.ts, tsconfig.json, etc.
├── backend/               # Express API server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── db/            # Database connection and migrations
│   └── config files
├── docs/                  # Project documentation
└── Root config files      # docker-compose.yml, .env, etc.
```

## Universal Base Guidelines

All code must adhere to these principles:

- **DRY (Don't Repeat Yourself)**: Eliminate duplication; extract reusable functions and classes
- **KISS (Keep It Simple, Stupid)**: Favor simplicity over complexity
- **YAGNI (You Aren't Gonna Need It)**: Don't implement until actually required
- **Conciseness**: Write minimal, efficient code
- **Comments Policy**: Avoid comments unless explaining complex logic; code should be self-documenting
- **Self-Explanatory Naming**: Use clear, descriptive names for variables, functions, and classes
- **No Emojis**: Maintain professional code
- **TDD**: Ensure adequate test coverage with Jest for frontend, Jest/Supertest for backend
- **Security**: Validate inputs; avoid SQL injection, XSS, and other vulnerabilities

## Pre-commit Hooks

This project uses pre-commit hooks for code quality and security:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files
```

**Security checks:**
- Gitleaks (secret detection)
- Detect private keys
- Check for .env files in commits

**Code quality:**
- ESLint for TypeScript/JavaScript
- Trailing whitespace removal
- YAML/JSON/TOML validation
- Backend tests on backend changes

See `.github/PRE_COMMIT_SETUP.md` for details.

## Commands

### Docker Compose (Primary Development Method)
```bash
# Start all services (frontend, backend, database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Run database migrations
docker-compose exec backend npm run migrate
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start dev server on port 3000
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
cd backend

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture

### State Management
The app uses **App.tsx** as the single source of truth, managing all state at the top level:
- User authentication state
- Categories, transactions, budgets, and savings arrays
- All state synced to backend API via frontend/src/services/api.ts

State is passed down through React Router's route props to individual pages. No global state library is used.

### API Integration
All data persists to PostgreSQL via REST API:
- JWT authentication with token stored in localStorage
- API client in `frontend/src/services/api.ts`
- Automatic Authorization header injection
- Error handling with ApiError class

### Routing Structure
Uses HashRouter for static hosting compatibility:
- `/login` - Login page (public route)
- `/dashboard` - Main overview with charts and stats
- `/categories` - Manage spending categories
- `/budget` - Set monthly budget limits per category
- `/transactions` - Record and view expenses
- `/savings` - Track savings accounts

Layout component (frontend/src/components/layout/Layout.tsx) provides navigation sidebar and wraps all authenticated routes.

### Type System
**frontend/src/types/index.ts** defines all data interfaces. Key types:
- `User` - User credentials
- `Category` - Spending categories (id, name, icon, color, isActive)
- `Transaction` - Individual expenses (id, categoryId, amount, date, description)
- `BudgetPlan` - Monthly spending limits (id, categoryId, month, year, plannedAmount)
- `SavingsAccount` - Savings tracking (id, name, type, balance, currency)

Categories use `isActive` flag instead of deletion to preserve transaction history.

### Icons and Defaults
**frontend/src/constants/index.tsx** contains:
- `AVAILABLE_ICONS` - 20 Lucide icons available for categories with Hebrew labels
- `DEFAULT_CATEGORIES` - 8 pre-configured categories loaded on first run
- `getIcon(name, size)` - Utility to render icon components by name string

### Month Navigation Pattern
Dashboard and other pages implement month/year navigation:
```typescript
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
```
Filter data by comparing transaction dates to selected month/year.

### UI Patterns
- **Tailwind CSS** for all styling (no CSS modules or styled-components)
- **Hebrew text** throughout with RTL layout support
- **Recharts** for data visualization (bar charts, pie charts)
- **Lucide React** for icons
- Rounded corners with `rounded-3xl` for cards, `rounded-xl` for buttons
- Color scheme: Indigo primary, Slate backgrounds, category-specific accent colors
- Mobile-responsive with sidebar that collapses to hamburger menu

### Data Flow Example
Adding a transaction:
1. User inputs in frontend/src/pages/Transactions.tsx form
2. API call via `api.transactions.create()` in frontend/src/services/api.ts
3. Backend validates and stores in PostgreSQL
4. Response updates local state via `setTransactions()`
5. Dashboard.tsx automatically shows updated spending (props update triggers re-render)

## Special Considerations

- **Never delete categories** - use `isActive: false` to preserve transaction history integrity
- **Negative budgets are valid** - `availableToSpend` can go negative to show overspending
- **Month is 1-indexed** - JavaScript Date.getMonth() returns 0-11, but we store 1-12 in budgets/transactions
- **API authentication** - All requests require JWT token except /auth/login and /auth/register
- **Environment variables** - API_URL configurable via VITE_API_URL in frontend/.env.local

## File Locations

Key files you may need to reference:
- Main app: `frontend/src/App.tsx`
- API client: `frontend/src/services/api.ts`
- Types: `frontend/src/types/index.ts`
- Constants: `frontend/src/constants/index.tsx`
- Layout: `frontend/src/components/layout/Layout.tsx`
- Pages: `frontend/src/pages/`
- Backend API: `backend/src/`
- Documentation: `docs/`

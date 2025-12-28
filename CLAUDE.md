# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Beam is a smart budget tracker application with full Hebrew/RTL support. Originally a client-side app with localStorage, it is being migrated to a distributed architecture with separate frontend (React), backend (Node.js/TypeScript/Express), and database (PostgreSQL) services for multi-user family use hosted on a private homelab.

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

### Frontend Development (Legacy - being migrated)
```bash
# Install dependencies (requires legacy-peer-deps flag)
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
- All state synced automatically to localStorage via useEffect hooks

State is passed down through React Router's route props to individual pages. No global state library is used.

### Data Storage (localStorage)
All data persists to browser localStorage with these keys:
- `bt_user` - User login info (name, email)
- `bt_categories` - Category definitions with icons/colors
- `bt_transactions` - All expense transactions
- `bt_budgets` - Monthly budget plans per category
- `bt_savings` - Savings account balances

**Safe Storage Wrapper**: App.tsx:14-55 implements a robust `safeStorage` utility that handles SecurityErrors and quota exceeded errors gracefully. Always use this pattern when adding new localStorage interactions.

### Routing Structure
Uses HashRouter (not BrowserRouter) for static hosting compatibility:
- `/login` - Login page (public route)
- `/dashboard` - Main overview with charts and stats
- `/categories` - Manage spending categories
- `/budget` - Set monthly budget limits per category
- `/transactions` - Record and view expenses
- `/savings` - Track savings accounts

Layout component (components/Layout.tsx) provides navigation sidebar and wraps all authenticated routes.

### Type System
**types.ts** defines all data interfaces. Key types:
- `User` - Login credentials
- `Category` - Spending categories (id, name, icon, color, isActive)
- `Transaction` - Individual expenses (id, categoryId, amount, date, description)
- `BudgetPlan` - Monthly spending limits (id, categoryId, month, year, plannedAmount)
- `SavingsAccount` - Savings tracking (id, name, type, balance, currency)

Categories use `isActive` flag instead of deletion to preserve transaction history.

### Icons and Defaults
**constants.tsx** contains:
- `AVAILABLE_ICONS` - 20 Lucide icons available for categories with Hebrew labels
- `DEFAULT_CATEGORIES` - 8 pre-configured categories loaded on first run
- `getIcon(name, size)` - Utility to render icon components by name string

### Month Navigation Pattern
Dashboard and other pages implement month/year navigation:
```typescript
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
```
Filter data by comparing transaction dates to selected month/year. See Dashboard.tsx:69-83 for the pattern.

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
1. User inputs in Transactions.tsx form
2. `setTransactions()` updates state in App.tsx
3. useEffect in App.tsx:104-118 syncs to localStorage
4. Dashboard.tsx automatically shows updated spending (props update triggers re-render)

## Special Considerations

- **Never delete categories** - use `isActive: false` to preserve transaction history integrity
- **Negative budgets are valid** - `availableToSpend` can go negative to show overspending (Dashboard.tsx:79)
- **Month is 1-indexed** - JavaScript Date.getMonth() returns 0-11, but we store 1-12 in budgets/transactions
- **No API calls** - This is a fully offline app; any features requiring external data would need localStorage-based mocks
- **Environment variables** - GEMINI_API_KEY in .env.local is exposed via vite.config.ts for potential AI insights feature (components/GeminiInsights.tsx)

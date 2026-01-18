# Architecture Documentation

## System Overview

Beam is a distributed budget tracking application designed for multi-user family use with full Hebrew/RTL support. The system follows a three-tier architecture with containerized services.

```
┌─────────────────┐
│   React SPA     │  Port 3000 (Nginx in production)
│   (Frontend)    │  Vite dev server / Static build
└────────┬────────┘
         │ HTTP/REST + JWT
         │
┌────────▼────────┐
│  Express API    │  Port 4000
│   (Backend)     │  Node.js/TypeScript
└────────┬────────┘
         │ SQL (node-postgres)
         │
┌────────▼────────┐
│  PostgreSQL 16  │  Port 5432
│   (Database)    │  Persistent volume
└─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router v6 (HashRouter for static hosting)
- **Styling**: Tailwind CSS
- **Charts**: Recharts 2.12
- **Icons**: Lucide React
- **AI Integration**: Google Gemini AI (@google/genai)
- **HTTP Client**: Fetch API with custom wrapper
- **Testing**: Jest 30 + React Testing Library

### Backend
- **Runtime**: Node.js with TypeScript 5.3
- **Framework**: Express.js 4
- **Authentication**: JWT (jsonwebtoken)
- **Database Client**: node-postgres (pg)
- **Validation**: Express-validator
- **Password Hashing**: bcrypt
- **Testing**: Jest 29 + Supertest
- **Development**: Nodemon + ts-node

### Database
- **RDBMS**: PostgreSQL 16-alpine
- **Migration Strategy**: SQL scripts in backend/src/database/schema.sql
- **Schema Features**:
  - Foreign key constraints with CASCADE/RESTRICT policies
  - Automatic timestamp triggers
  - Check constraints for data validation
  - Composite unique constraints
  - Performance indexes

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Frontend Server**: Nginx (production)
- **Development**: Hot reload for both frontend and backend
- **Network**: Bridge network for inter-service communication
- **Security**: Pre-commit hooks (gitleaks, secret detection)

## Core Architectural Patterns

### 1. State Management - Top-Level Single Source of Truth

**Pattern**: Centralized state in App.tsx without global state library

```
App.tsx (State Owner)
  ├─ user: User | null
  ├─ categories: Category[]
  ├─ transactions: Transaction[]
  ├─ budgets: BudgetPlan[]
  └─ savings: SavingsAccount[]
       │
       ├─ Props passed to Route components
       │
       └─ Callbacks for state mutation (setCategories, setTransactions, etc.)
```

**Key Characteristics**:
- All application state lives in `frontend/src/App.tsx`
- State synchronized with backend via REST API on mount
- Props passed down through React Router route elements
- No Redux, Context API, or other state management libraries
- State updates trigger automatic re-renders in child components
- Loading state managed during initial data fetch

**Rationale**: Simplicity for small-to-medium application scope; eliminates boilerplate of global state libraries.

### 2. API Communication Layer

**Pattern**: Service layer abstraction with JWT authentication

**Location**: `frontend/src/services/api.ts`

**Structure**:
```typescript
api.auth.login()
api.auth.register()
api.auth.logout()
api.categories.getAll()
api.categories.getTree()
api.categories.getSubcategories(parentId)
api.categories.create()
api.categories.update()
api.transactions.getAll()
api.transactions.create()
api.transactions.update()
api.transactions.delete()
api.budgets.getAll()
api.budgets.create()
api.budgets.delete()
api.savings.getAll()
api.savings.create()
api.savings.update()
api.savings.delete()
```

**Features**:
- Automatic Authorization header injection from localStorage
- Centralized error handling with ApiError class
- Type-safe request/response interfaces
- Base URL configuration via environment variables (VITE_API_URL)
- Token management utilities (getAuthToken, setAuthToken, clearAuthToken)
- Generic request wrapper with automatic JSON parsing

### 3. Routing Architecture

**Pattern**: HashRouter with Layout wrapper and protected routes

**Route Structure**:
```
/ (HashRouter)
├─ /login (public)
└─ /* (authenticated, wrapped in Layout)
    ├─ /dashboard
    ├─ /categories
    ├─ /budget
    ├─ /transactions
    └─ /savings
```

**Layout Component**: `frontend/src/components/layout/Layout.tsx`
- Provides navigation sidebar with icons
- Handles RTL layout
- Mobile-responsive hamburger menu
- User info display and logout button
- Outlet for nested routes

**Route Guards**:
- Authenticated users redirect from /login to /dashboard
- Unauthenticated users redirect all routes to /login
- Wildcard routes redirect to appropriate default

**Rationale**: HashRouter enables static hosting without server-side routing configuration.

### 4. Hierarchical Category System

**Pattern**: Parent-child category relationships with soft deletion

**Database Schema**:
- `parent_category_id` self-referencing foreign key
- `is_active` flag for soft deletion
- `is_default` flag for system-provided categories
- Self-parent constraint to prevent circular references

**Frontend Utilities** (`frontend/src/constants/index.tsx`):
- `buildCategoryTree()` - Transforms flat array into hierarchical structure
- `getCategoryDropdownOptions()` - Formats for UI dropdowns with indentation

**API Endpoints**:
- `GET /api/categories` - Returns flat list
- `GET /api/categories/tree` - Returns hierarchical tree (CategoryTree[])
- `GET /api/categories/:id/subcategories` - Returns children of specific parent

**Budget and Transaction Aggregation**:
- Parent category budgets/spending include all subcategories
- Transactions can be assigned to either parent or subcategory
- Dashboard and reports aggregate by parent category

### 5. Type System

**Pattern**: Duplicated TypeScript interfaces in frontend and backend

**Frontend Location**: `frontend/src/types/index.ts`
**Backend Location**: `backend/src/types/index.ts`

**Core Types**:
- `User` - Authentication and user data
- `Category` - Spending categories with hierarchy support
- `CategoryTree` - Extended Category with subcategories array
- `Transaction` - Individual expenses
- `BudgetPlan` - Monthly spending limits per category
- `SavingsAccount` - Savings tracking
- `DashboardSummary` - Aggregated financial metrics (frontend only)
- `JWTPayload` - Token payload structure (backend only)

**Backend-Specific Fields**:
- `userId` - Foreign key for multi-user support
- `createdAt`, `updatedAt` - Automatic timestamps
- `passwordHash` - Bcrypt hashed password (User type)

**Rationale**: Duplication avoids complex monorepo shared package configuration. Acceptable for small codebase.

### 6. Backend MVC Pattern

**Pattern**: Controller-Model separation with middleware

**Structure**:
```
backend/src/
├─ index.ts              # Express app setup
├─ config/               # Environment configuration
├─ routes/               # Route definitions with Express Router
│   ├─ auth.ts
│   ├─ categories.ts
│   ├─ transactions.ts
│   ├─ budgets.ts
│   └─ savings.ts
├─ controllers/          # Request handling and validation
│   ├─ authController.ts
│   ├─ categoryController.ts
│   ├─ transactionController.ts
│   ├─ budgetController.ts
│   └─ savingsController.ts
├─ models/               # Database interaction layer
│   ├─ User.ts
│   ├─ Category.ts
│   ├─ CategorySeeder.ts
│   ├─ Transaction.ts
│   ├─ BudgetPlan.ts
│   └─ SavingsAccount.ts
├─ middleware/           # Auth, error handling
│   ├─ auth.ts           # JWT verification
│   └─ errorHandler.ts   # Centralized error handling
├─ database/             # Schema and connection
│   ├─ schema.sql
│   └─ index.ts
└─ types/                # Type definitions
```

**Controllers**: Validate requests, call model methods, format responses
**Models**: Direct database queries using node-postgres
**Middleware**:
- `authenticateToken` - JWT verification for protected routes
- `errorHandler` - Centralized error formatting
- Express-validator for input validation

### 7. Authentication Flow

**Registration/Login**:
1. Client sends credentials to POST /api/auth/register or /api/auth/login
2. Backend validates input with express-validator
3. Password hashed with bcrypt (registration) or compared (login)
4. JWT token generated with userId and email payload
5. Token returned to client with user object
6. Client stores token in localStorage via setAuthToken()

**Protected Routes**:
1. Client includes Authorization: Bearer <token> header
2. `authenticateToken` middleware validates token
3. Decoded payload attached to req.user
4. Controller accesses req.user.userId for database queries
5. Invalid/expired tokens return 403 Forbidden

**Logout**:
- Client-side only: removes token from localStorage
- No backend endpoint (stateless JWT)

### 8. Icon System

**Pattern**: String-based icon identifiers mapped to React components

**Location**: `frontend/src/constants/index.tsx`

**Available Icons**: 20 Lucide icons with Hebrew labels
- Food: Utensils, Pizza, Coffee
- Shopping: ShoppingBag, Shirt
- Home: Home
- Transportation: Car, Fuel, Plane
- Health/Fitness: HeartPulse, Dumbbell
- Entertainment: Gamepad2, Film
- Technology: Wifi, Smartphone
- Other: GraduationCap, Gift, Baby, Dog, Briefcase

**Usage**:
```typescript
getIcon('Utensils', 20) // Returns <Utensils size={20} />
```

**Storage**: Category table stores icon name as string, not component

### 9. AI Insights Integration

**Pattern**: Google Gemini AI for financial recommendations

**Component**: `frontend/src/components/insights/GeminiInsights.tsx`

**Features**:
- On-demand insight generation (click to analyze)
- Uses Gemini 3 Flash Preview model
- Analyzes budget vs spending across categories
- Returns Hebrew financial advice
- Loading states with skeleton UI
- Error handling with user-friendly messages

**Data Flow**:
1. Component receives categories, transactions, budgets as props
2. User clicks Sparkles button to generate insight
3. Aggregates spending by category and compares to budgets
4. Sends JSON summary to Gemini with system instruction
5. Displays markdown-formatted response

**Configuration**: API key from process.env.API_KEY (Vite environment variable)

## Data Flow

### Example: Creating a Transaction

```
1. User fills form in Transactions.tsx
         │
         ▼
2. Component calls api.transactions.create(categoryId, amount, date, description)
         │
         ▼
3. API service sends POST /api/transactions with JWT in Authorization header
         │
         ▼
4. Backend auth middleware validates token, extracts userId
         │
         ▼
5. transactionController validates input data
         │
         ▼
6. Transaction model inserts to PostgreSQL with userId
         │
         ▼
7. Database returns created transaction with generated id
         │
         ▼
8. Response returns transaction object to frontend
         │
         ▼
9. Frontend updates local state via setTransactions([...transactions, newTransaction])
         │
         ▼
10. React re-renders Dashboard with updated spending data
```

### State Synchronization Strategy

- **On Mount**: App.tsx fetches all data from API in parallel (Promise.all)
- **On Create**: Pessimistic update - wait for API response, then update state
- **On Update**: Pessimistic update - wait for API response, then update state
- **On Delete**: Pessimistic update - wait for API response, then filter state
- **On Error**: Show error message, do not modify state
- **No Polling**: Data freshness depends on user navigation/refresh
- **Token Expiry**: Redirects to login, clears all state

### Category Tree Data Flow

**Backend**:
1. `getAllCategories(userId)` returns flat array from database
2. `getCategoryTree(userId)` builds hierarchy server-side
3. `getSubcategories(userId, parentId)` filters by parent

**Frontend**:
1. App.tsx fetches flat array and stores in state
2. Pages use `buildCategoryTree()` to construct hierarchy as needed
3. CategorySelector component displays indented dropdown
4. Dashboard aggregates parent + subcategory transactions

## Key Architectural Constraints

### 1. Category Deletion Policy
**Never hard-delete categories**. Use `isActive: false` to preserve referential integrity with historical transactions. Database foreign key uses ON DELETE RESTRICT.

### 2. Month Indexing Convention
- JavaScript Date.getMonth() returns 0-11
- Database and state store months as 1-12
- Always convert at API boundary
- Month navigation components use 1-based indexing

### 3. Negative Budget Support
`availableToSpend` can be negative to indicate overspending. This is intentional, not a bug. UI should display negative values in red.

### 4. Authentication Requirements
All API endpoints except `/api/auth/login` and `/api/auth/register` require valid JWT token. Health check endpoint `/health` is public.

### 5. Icon System Constraints
Categories can only use 20 predefined icons from AVAILABLE_ICONS. Custom icon upload not supported. Icon name must exactly match Lucide component name.

### 6. RTL/Hebrew First
All UI text is Hebrew. Layout uses RTL direction (`dir="rtl"` in CSS). English translations not supported. Component names and code comments in English.

### 7. Multi-User Isolation
All database queries filter by `userId` from JWT token. Users cannot access each other's data. No admin/superuser concept.

### 8. Single Currency
All amounts stored as DECIMAL(10, 2). Savings accounts support currency field but application assumes ILS (Israeli Shekel). No currency conversion.

## Database Schema Design

### Tables
1. **users** - Authentication and user profiles
2. **categories** - Spending categories with hierarchy
3. **transactions** - Individual expenses
4. **budget_plans** - Monthly budget allocations
5. **savings_accounts** - Savings tracking

### Key Relationships
- All tables reference users(id) with ON DELETE CASCADE
- transactions/budget_plans reference categories(id) with ON DELETE RESTRICT
- categories self-reference via parent_category_id with ON DELETE CASCADE

### Constraints
- `UNIQUE(user_id, category_id, month, year)` on budget_plans (one budget per category per month)
- `CHECK(month >= 1 AND month <= 12)` on budget_plans
- `CHECK(year >= 2000)` on budget_plans
- `CHECK(parent_category_id != id)` on categories (no self-parent)

### Indexes for Performance
- user_id indexes on all tables
- parent_category_id index for category hierarchy
- category_id index on transactions
- date index on transactions
- composite (month, year) index on budget_plans

### Automatic Timestamps
All tables have `created_at` and `updated_at` columns with triggers to auto-update on modification.

## Deployment Architecture

### Development Mode (docker-compose up -d)
```
database:
  - PostgreSQL 16-alpine
  - Port 5432 exposed
  - Persistent volume: postgres-data
  - Health check: pg_isready

backend:
  - ts-node-dev with auto-restart
  - Port 4000 exposed
  - Depends on database health check
  - Environment variables from .env

frontend:
  - Vite dev server with HMR
  - Port 3000 -> 80 (Nginx)
  - Depends on backend
  - Proxies /api to backend
```

### Production Mode
- Frontend: Static build (npm run build) served by Nginx
- Backend: Compiled TypeScript (npm run build) running on Node.js
- Database: Same PostgreSQL container with persistent volume
- Environment variables in `.env` file (not committed)
- Restart policy: unless-stopped

### Container Communication
- All services on `beam-network` bridge network
- Frontend proxies `/api/*` to backend via Nginx config
- Backend connects to database via service name `database`
- Inter-container DNS resolution

### Environment Variables
**Frontend** (.env.local):
- `VITE_API_URL` - Backend API base URL (default: http://localhost:4000/api)
- `API_KEY` - Google Gemini AI API key

**Backend** (.env):
- `PORT` - Server port (default: 4000)
- `JWT_SECRET` - Secret for JWT signing
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `DB_HOST` - PostgreSQL host (default: database)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name (default: beam)
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `NODE_ENV` - Environment (production/development/test)

## Testing Strategy

### Frontend Tests
**Location**: `frontend/src/__tests__/`

**Coverage**:
- Component tests for all pages (Dashboard, Categories, BudgetPlanning, Transactions, Savings, Login)
- Component tests for Layout, GeminiInsights, CategorySelector
- Utility function tests (constants/index.tsx)
- API service tests (mocked fetch)

**Tools**:
- Jest 30 with jsdom environment
- React Testing Library
- User Event for interaction testing
- Mock service worker for API mocking

**Run**: `npm test` or `npm run test:watch`

### Backend Tests
**Location**: `backend/src/__tests__/`

**Coverage**:
- Controller tests for all endpoints
- Middleware tests (auth, errorHandler)
- Integration tests with Supertest
- Test utilities for database setup/teardown

**Tools**:
- Jest 29 with ts-jest
- Supertest for HTTP assertions
- In-memory or test database

**Run**: `npm test` or `npm run test:watch`

### Pre-commit Hooks
- Gitleaks for secret detection
- Detect private keys
- Check for .env files in commits
- Trailing whitespace removal
- YAML/JSON/TOML validation
- Check for merge conflicts
- Check for large files (>1MB)

## Design Decisions Rationale

### Why no global state library?
App scope is limited to budget tracking with 5 main entities. Prop drilling depth is 2-3 levels maximum. Avoids Redux boilerplate and learning curve. Easy to understand for new developers.

### Why HashRouter instead of BrowserRouter?
Enables static hosting on any server without URL rewrite configuration. Can deploy to GitHub Pages, Netlify, or any static host. Trade-off: less clean URLs with # prefix.

### Why monorepo without shared packages?
Frontend and backend types duplicated to avoid complex build configuration and workspace setup. Small codebase makes duplication acceptable. Faster development iteration.

### Why REST over GraphQL?
CRUD operations map cleanly to REST verbs. No complex query requirements that would justify GraphQL overhead. Simpler authentication (header vs context). Smaller bundle size.

### Why JWT in localStorage?
Simplicity over XSS concerns in trusted family environment. Alternative httpOnly cookies would require CORS configuration and same-origin deployment. 7-day expiration limits exposure.

### Why PostgreSQL over MongoDB?
Budget tracking requires strong relational integrity (foreign keys). Transactions need ACID guarantees. SQL joins more efficient for category hierarchy and aggregations.

### Why Vite over Create React App?
Faster dev server startup (ESBuild). Hot module replacement more reliable. Smaller production bundles. Better TypeScript support. CRA is deprecated.

### Why node-postgres over Prisma/TypeORM?
Direct SQL control for performance-critical queries. No ORM overhead. Smaller dependency footprint. Schema defined in pure SQL for transparency. Migration strategy simple (single schema.sql).

### Why category hierarchy over tags?
Single-parent hierarchy simpler to display in UI (tree vs tag cloud). Easier to aggregate budgets and spending. Tags would require many-to-many junction table. Hebrew UI better suited to tree navigation.

### Why Gemini over OpenAI?
Google Gemini API free tier more generous. Flash model faster for simple insights. Native Hebrew support. No credit card required for API key.

## Component Architecture Highlights

### Reusable Components
1. **CategorySelector** - Dropdown with hierarchical category tree display
2. **GeminiInsights** - AI-powered financial recommendations card
3. **Layout** - Navigation sidebar wrapper for authenticated routes

### Page Components (Feature-Based Organization)
1. **Dashboard** - Financial overview with charts and month navigation
2. **Categories** - Manage categories with parent/child relationships
3. **BudgetPlanning** - Set monthly budgets per category
4. **Transactions** - Record and view expenses with filtering
5. **Savings** - Track savings accounts and balances
6. **Login** - Authentication with register/login toggle

### Shared UI Patterns
- **Month Navigation**: Previous/Next/Current month buttons (Dashboard, BudgetPlanning, Transactions)
- **Category Icons**: Colored circles with Lucide icons
- **Rounded Corners**: `rounded-3xl` for cards, `rounded-xl` for buttons
- **Color Scheme**: Indigo primary, Slate backgrounds, category-specific accents
- **Loading States**: Skeleton screens and spinner animations
- **Forms**: Consistent padding, border radius, focus rings

## Future Architectural Considerations

### Scalability
- **Caching Layer**: Redis for frequently accessed categories and budgets
- **Database Pooling**: Connection pooling for concurrent users
- **API Rate Limiting**: Prevent abuse of AI insights endpoint
- **Pagination**: For transactions list with many entries

### Real-time Features
- **WebSocket**: For multi-user concurrent editing notifications
- **Optimistic Updates**: Faster UI feedback before API response
- **Background Sync**: Service worker for offline transaction creation

### Code Organization
- **Shared Types Package**: Workspace package for type sharing as codebase grows
- **UI Component Library**: Extract reusable components to separate package
- **API Versioning**: `/api/v1/` prefix for backward compatibility

### Database Improvements
- **Formal Migrations**: Knex, Prisma, or TypeORM migrations instead of single schema.sql
- **Audit Logging**: Track changes to budgets and categories
- **Soft Delete Transactions**: Archive instead of hard delete

### Internationalization
- **i18n Support**: Extract Hebrew strings to translation files
- **Multiple Currencies**: Currency conversion for savings accounts
- **Locale Formatting**: Number and date formatting per user preference

### Enhanced Features
- **Recurring Transactions**: Scheduled automatic transaction creation
- **Budget Templates**: Reusable budget plans across months
- **Category Icons Upload**: Custom icon upload to cloud storage
- **Export/Import**: CSV/Excel export for transactions and budgets
- **Mobile App**: React Native app sharing backend API

## File Structure Reference

```
beam/
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # State owner, routing
│   │   ├── main.tsx                   # Entry point
│   │   ├── config/
│   │   │   └── env.ts                 # Environment variable helper
│   │   ├── services/
│   │   │   ├── api.ts                 # API client with JWT
│   │   │   └── __mocks__/             # Service mocks for testing
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript type definitions
│   │   ├── constants/
│   │   │   └── index.tsx              # Icons, defaults, utility functions
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Layout.tsx         # Navigation sidebar wrapper
│   │   │   ├── insights/
│   │   │   │   └── GeminiInsights.tsx # AI-powered financial insights
│   │   │   └── shared/
│   │   │       └── CategorySelector.tsx # Hierarchical category dropdown
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Financial overview with charts
│   │   │   ├── Categories.tsx         # Category management
│   │   │   ├── BudgetPlanning.tsx     # Monthly budget allocation
│   │   │   ├── Transactions.tsx       # Expense tracking
│   │   │   ├── Savings.tsx            # Savings account management
│   │   │   └── Login.tsx              # Authentication
│   │   ├── __tests__/                 # Jest + React Testing Library tests
│   │   └── styles/                    # Global CSS (Tailwind)
│   ├── public/                        # Static assets
│   ├── Dockerfile                     # Production build (Nginx)
│   ├── nginx.conf                     # Nginx configuration
│   ├── vite.config.ts                 # Vite build configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   └── package.json                   # Dependencies and scripts
├── backend/
│   ├── src/
│   │   ├── index.ts                   # Express app initialization
│   │   ├── config/
│   │   │   └── index.ts               # Environment configuration
│   │   ├── routes/                    # Express routers
│   │   │   ├── auth.ts                # Authentication endpoints
│   │   │   ├── categories.ts          # Category CRUD
│   │   │   ├── transactions.ts        # Transaction CRUD
│   │   │   ├── budgets.ts             # Budget CRUD
│   │   │   └── savings.ts             # Savings CRUD
│   │   ├── controllers/               # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── transactionController.ts
│   │   │   ├── budgetController.ts
│   │   │   └── savingsController.ts
│   │   ├── models/                    # Database interaction
│   │   │   ├── User.ts
│   │   │   ├── Category.ts
│   │   │   ├── CategorySeeder.ts      # Default category creation
│   │   │   ├── Transaction.ts
│   │   │   ├── BudgetPlan.ts
│   │   │   └── SavingsAccount.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT verification
│   │   │   └── errorHandler.ts        # Centralized error handling
│   │   ├── database/
│   │   │   ├── index.ts               # PostgreSQL connection pool
│   │   │   └── schema.sql             # Database schema definition
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript type definitions
│   │   ├── utils/                     # Helper functions
│   │   └── __tests__/                 # Jest + Supertest tests
│   ├── Dockerfile                     # Production build (Node.js)
│   ├── tsconfig.json                  # TypeScript configuration
│   └── package.json                   # Dependencies and scripts
├── docker-compose.yml                 # Service orchestration
├── setup.sh                           # Initial setup script
├── .env.example                       # Environment variable template
├── .env                               # Environment variables (gitignored)
├── .pre-commit-config.yaml            # Pre-commit hook configuration
├── .gitleaks.toml                     # Secret detection rules
├── ARCHITECTURE.md                    # This file
├── CLAUDE.md                          # AI assistant instructions
├── FEATURES.md                        # Feature documentation
└── README.md                          # Project overview
```

## API Endpoint Reference

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and receive JWT token

### Categories
- `GET /api/categories` - List all categories (flat array)
- `GET /api/categories/tree` - List categories as hierarchical tree
- `GET /api/categories/:id/subcategories` - List subcategories of parent
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category (including soft delete)

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - List all budget plans
- `POST /api/budgets` - Create budget plan for category/month/year
- `DELETE /api/budgets/:id` - Delete budget plan

### Savings
- `GET /api/savings` - List all savings accounts
- `POST /api/savings` - Create new savings account
- `PUT /api/savings/:id` - Update savings account
- `DELETE /api/savings/:id` - Delete savings account

### Health Check
- `GET /health` - Server health status (public, no auth)

All endpoints except `/health`, `/api/auth/register`, and `/api/auth/login` require `Authorization: Bearer <token>` header.

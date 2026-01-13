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
│  Express API    │  Port 5001
│   (Backend)     │  Node.js/TypeScript
└────────┬────────┘
         │ SQL
         │
┌────────▼────────┐
│  PostgreSQL     │  Port 5432
│   (Database)    │  Persistent volume
└─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6 (HashRouter for static hosting)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Fetch API with custom wrapper

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **Database Client**: node-postgres (pg)
- **Validation**: Express middleware

### Database
- **RDBMS**: PostgreSQL 15
- **Migration Strategy**: SQL scripts in backend/src/database/

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Frontend Server**: Nginx (production)
- **Development**: Hot reload for both frontend and backend

## Core Architectural Patterns

### 1. State Management - Top-Level Single Source of Truth

**Pattern**: Centralized state in App.tsx without global state library

```
App.tsx (State Owner)
  ├─ users: User[]
  ├─ categories: Category[]
  ├─ transactions: Transaction[]
  ├─ budgets: BudgetPlan[]
  └─ savings: SavingsAccount[]
       │
       ├─ Props passed to Route components
       │
       └─ Callbacks for state mutation
```

**Key Characteristics**:
- All application state lives in `frontend/src/App.tsx`
- State synchronized with backend via REST API
- Props passed down through React Router route elements
- No Redux, Context API, or other state management libraries
- State updates trigger automatic re-renders in child components

**Rationale**: Simplicity for small-to-medium application scope; eliminates boilerplate of global state libraries.

### 2. API Communication Layer

**Pattern**: Service layer abstraction with JWT authentication

**Location**: `frontend/src/services/api.ts`

**Structure**:
```typescript
api.auth.login()
api.auth.register()
api.categories.getAll()
api.categories.create()
api.transactions.create()
// ... etc
```

**Features**:
- Automatic Authorization header injection from localStorage
- Centralized error handling with ApiError class
- Type-safe request/response interfaces
- Base URL configuration via environment variables

### 3. Routing Architecture

**Pattern**: HashRouter with Layout wrapper

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
- Provides navigation sidebar
- Handles RTL layout
- Mobile-responsive hamburger menu

**Rationale**: HashRouter enables static hosting without server-side routing configuration.

### 4. Type System

**Pattern**: Shared TypeScript interfaces

**Location**: `frontend/src/types/index.ts`

**Core Types**:
- `User` - Authentication and user data
- `Category` - Spending categories (soft-delete with isActive flag)
- `Transaction` - Individual expenses
- `BudgetPlan` - Monthly spending limits
- `SavingsAccount` - Savings tracking

**Backend**: Mirrors frontend types in backend/src/ (no shared package)

### 5. Backend REST API Design

**Pattern**: Controller-based routing with middleware

**Structure**:
```
backend/src/
├─ routes/        # Route definitions
├─ controllers/   # Business logic
└─ middleware/    # Auth, validation, error handling
```

**Authentication Flow**:
1. POST /api/auth/login returns JWT token
2. Client stores token in localStorage
3. Subsequent requests include Authorization: Bearer <token>
4. Middleware validates token on protected routes

**Endpoints Follow RESTful Conventions**:
- GET /api/categories - List all
- POST /api/categories - Create new
- PUT /api/categories/:id - Update existing
- etc.

## Data Flow

### Example: Creating a Transaction

```
1. User fills form in Transactions.tsx
         │
         ▼
2. Component calls api.transactions.create()
         │
         ▼
3. API service sends POST /api/transactions with JWT
         │
         ▼
4. Backend auth middleware validates token
         │
         ▼
5. Controller validates data and inserts to PostgreSQL
         │
         ▼
6. Response returns created transaction
         │
         ▼
7. Frontend updates local state via setTransactions()
         │
         ▼
8. React re-renders Dashboard with new spending data
```

### State Synchronization Strategy

- **On Mount**: Pages fetch initial data from API
- **On Create/Update**: Optimistic or pessimistic updates to local state
- **On Error**: Rollback local state or show error message
- **No Polling**: Data freshness depends on user navigation/refresh

## Key Architectural Constraints

### 1. Category Deletion Policy
**Never hard-delete categories**. Use `isActive: false` to preserve referential integrity with historical transactions.

### 2. Month Indexing Convention
- JavaScript Date.getMonth() returns 0-11
- Database and state store months as 1-12
- Always convert at API boundary

### 3. Negative Budget Support
`availableToSpend` can be negative to indicate overspending. This is intentional, not a bug.

### 4. Authentication Requirements
All API endpoints except `/auth/login` and `/auth/register` require valid JWT token.

### 5. Icon System
Categories use string-based icon identifiers that map to Lucide React components via `getIcon()` utility in `frontend/src/constants/index.tsx`. Only 20 predefined icons available.

### 6. RTL/Hebrew First
All UI text is Hebrew. Layout uses RTL direction. English translations not supported.

## Deployment Architecture

### Development Mode
```bash
docker-compose up -d
```
- Frontend: Vite dev server with HMR (port 3000)
- Backend: ts-node-dev with auto-restart (port 5001)
- Database: PostgreSQL with persistent volume

### Production Mode
- Frontend: Static build served by Nginx
- Backend: Compiled TypeScript (Node.js)
- Database: Same PostgreSQL container
- Environment variables in `.env` file (not committed)

### Container Communication
- Frontend container proxies `/api/*` to backend container
- Backend connects to database via service name `db`
- All services on same Docker network

## Design Decisions Rationale

### Why no global state library?
App scope is limited; prop drilling depth is manageable. Avoids Redux boilerplate and learning curve.

### Why HashRouter instead of BrowserRouter?
Enables static hosting on any server without URL rewrite configuration. Trade-off: less clean URLs.

### Why monorepo without shared packages?
Frontend and backend types duplicated to avoid complex build configuration. Small codebase makes duplication acceptable.

### Why REST over GraphQL?
CRUD operations map cleanly to REST verbs. No complex query requirements that would justify GraphQL overhead.

### Why JWT in localStorage?
Simplicity over XSS concerns in trusted family environment. Alternative: httpOnly cookies would require CORS configuration.

## Future Architectural Considerations

- **Caching Layer**: Redis for frequently accessed data (categories, budgets)
- **Real-time Updates**: WebSocket for multi-user concurrent editing
- **Shared Types Package**: Workspace package for type sharing as codebase grows
- **API Versioning**: `/api/v1/` prefix for backward compatibility
- **Database Migrations**: Formal migration tool (e.g., Knex, Prisma) instead of manual SQL scripts

## File Structure Reference

```
beam/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # State owner
│   │   ├── main.tsx             # Entry point
│   │   ├── services/api.ts      # API client
│   │   ├── types/index.ts       # Type definitions
│   │   ├── constants/index.tsx  # Icons, defaults
│   │   ├── components/
│   │   │   └── layout/Layout.tsx
│   │   └── pages/               # Route components
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── database/
│   └── Dockerfile
├── docker-compose.yml           # Orchestration
└── setup.sh                     # Initial setup script
```

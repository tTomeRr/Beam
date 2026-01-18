# Beam Features

## Frontend

### Dashboard
- Financial summary cards (budgeted, spent, available, savings)
- Month navigation with Hebrew month names
- Spending by category bar chart with budget comparison
- Category distribution pie chart
- AI-powered financial insights via Google Gemini

### Categories
- Hierarchical two-level system (parent/subcategory)
- 20 predefined Lucide icons with Hebrew labels
- Custom colors per category
- Soft delete to preserve transaction history
- 8 default categories created on registration

### Budget Planning
- Monthly budget allocation per category
- Budget vs spending comparison with progress bars
- Parent category aggregation (includes subcategories)
- Visual indicators (green/yellow/red) for budget status

### Transactions
- CRUD operations with category, amount, date, description
- Hierarchical category selector (CategorySelector component)
- Month-based filtering
- Table view sorted by date

### Savings
- Multiple savings accounts per user
- Account name, type, balance, currency fields
- Card-based display layout
- Total savings shown on dashboard

### UI/UX
- Full Hebrew/RTL support
- Responsive design (mobile hamburger menu, collapsible sidebar)
- Tailwind CSS styling (Indigo primary, rounded-3xl cards)
- Recharts for data visualization
- Loading states and error handling in Hebrew

## Backend

### Authentication
- JWT-based auth with 7-day expiration
- bcrypt password hashing
- Login/register endpoints (public)
- All other routes protected via auth middleware

### API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET/POST /api/categories` - List/create categories
- `PUT/DELETE /api/categories/:id` - Update/delete category
- `GET/POST /api/transactions` - List/create transactions
- `PUT/DELETE /api/transactions/:id` - Update/delete transaction
- `GET/POST /api/budgets` - List/create budgets
- `DELETE /api/budgets/:id` - Delete budget
- `GET/POST /api/savings` - List/create savings accounts
- `PUT/DELETE /api/savings/:id` - Update/delete savings
- `POST /api/insights/generate` - Generate AI insights
- `GET /health` - Health check

### Validation
- express-validator for input validation
- Parameterized queries (SQL injection prevention)
- Multi-user data isolation via JWT userId

### Services
- CategorySeeder - Creates 8 default categories on registration
- Gemini AI integration for financial insights

## Database

### Schema
- **users** - id, name, email, passwordHash, timestamps
- **categories** - id, userId, name, icon, color, parentId (nullable), isActive, isDefault, timestamps
- **transactions** - id, userId, categoryId, amount, date, description, timestamps
- **budgets** - id, userId, categoryId, month, year, plannedAmount, timestamps (unique: userId+categoryId+month+year)
- **savings** - id, userId, name, type, balance, currency, timestamps

### Constraints
- Foreign keys with CASCADE on user deletion
- RESTRICT on category deletion (preserves transaction integrity)
- Self-referencing parentId for category hierarchy
- Unique constraints on email, budget month/category

## Infrastructure

### Docker Services
- **frontend** - Nginx serving static React build (port 3000)
- **backend** - Node.js Express API (port 4000)
- **db** - PostgreSQL 16-alpine with persistent volume

### Development
- Vite dev server with HMR
- ts-node-dev for backend auto-restart
- Jest + React Testing Library (frontend)
- Jest + Supertest (backend)

### Security
- Pre-commit hooks (Gitleaks, secret detection)
- Environment variables in .env (not committed)
- CORS configuration

## Known Limitations
- Hebrew only (no i18n)
- Single currency (ILS)
- No recurring transactions
- No transaction search
- No data export
- No password reset
- No offline support
- 20 icon limit

## Future Roadmap
- Recurring transactions
- CSV/PDF export
- Email notifications
- Password reset
- PWA support
- Multi-currency
- Dark mode
- Bank API integration
- AI transaction categorization

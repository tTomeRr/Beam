# Beam Backend API

Node.js/TypeScript/Express backend for Beam Budget Tracker.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run database migrations (ensure PostgreSQL is running)
npm run migrate

# Start development server
npm run dev

# Run tests
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get all budget plans
- `POST /api/budgets` - Create budget plan
- `DELETE /api/budgets/:id` - Delete budget plan

### Savings
- `GET /api/savings` - Get all savings accounts
- `POST /api/savings` - Create savings account
- `PUT /api/savings/:id` - Update savings account
- `DELETE /api/savings/:id` - Delete savings account

All endpoints except `/api/auth/*` require Bearer token authentication.

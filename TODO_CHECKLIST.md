# Migration Checklist

Complete these steps to finish the migration to distributed architecture.

## Backend is Ready ✅
The backend is fully implemented and ready to use.

## Frontend Needs Updates

### 1. Replace App.tsx
- [ ] Backup current App.tsx: `mv App.tsx App.old.tsx`
- [ ] Use new version: `mv App.new.tsx App.tsx`

### 2. Update Login Page (pages/Login.tsx)

Current implementation likely just stores user data locally. Update to:

```typescript
import { api } from '../services/api';

const handleLogin = async (email: string, password: string) => {
  try {
    const user = await api.auth.login(email, password);
    onLogin(user);
  } catch (error) {
    // Show error message
    console.error('Login failed:', error);
  }
};

const handleRegister = async (name: string, email: string, password: string) => {
  try {
    const user = await api.auth.register(name, email, password);
    onLogin(user);
  } catch (error) {
    // Show error message
    console.error('Registration failed:', error);
  }
};
```

### 3. Update Categories Page (pages/Categories.tsx)

Add API calls when creating/updating categories:

```typescript
import { api } from '../services/api';

// When creating a category
const handleCreateCategory = async (name: string, icon: string, color: string) => {
  try {
    const newCategory = await api.categories.create(name, icon, color);
    setCategories([...categories, newCategory]);
  } catch (error) {
    console.error('Failed to create category:', error);
  }
};

// When updating a category
const handleUpdateCategory = async (id: number, updates: Partial<Category>) => {
  try {
    const updated = await api.categories.update(id, updates);
    setCategories(categories.map(c => c.id === id ? updated : c));
  } catch (error) {
    console.error('Failed to update category:', error);
  }
};
```

### 4. Update Transactions Page (pages/Transactions.tsx)

Add API calls for CRUD operations:

```typescript
import { api } from '../services/api';

// Create
const handleCreate = async (data) => {
  const newTransaction = await api.transactions.create(
    data.categoryId,
    data.amount,
    data.date,
    data.description
  );
  setTransactions([...transactions, newTransaction]);
};

// Update
const handleUpdate = async (id: number, updates) => {
  const updated = await api.transactions.update(id, updates);
  setTransactions(transactions.map(t => t.id === id ? updated : t));
};

// Delete
const handleDelete = async (id: number) => {
  await api.transactions.delete(id);
  setTransactions(transactions.filter(t => t.id !== id));
};
```

### 5. Update Budget Planning Page (pages/BudgetPlanning.tsx)

```typescript
import { api } from '../services/api';

// Create/Update budget
const handleSaveBudget = async (categoryId, month, year, amount) => {
  const budget = await api.budgets.create(categoryId, month, year, amount);
  // Update state
};

// Delete budget
const handleDeleteBudget = async (id: number) => {
  await api.budgets.delete(id);
  // Update state
};
```

### 6. Update Savings Page (pages/Savings.tsx)

```typescript
import { api } from '../services/api';

// Create
const handleCreate = async (data) => {
  const account = await api.savings.create(
    data.name,
    data.type,
    data.balance,
    data.currency
  );
  setSavings([...savings, account]);
};

// Update
const handleUpdate = async (id: number, updates) => {
  const updated = await api.savings.update(id, updates);
  setSavings(savings.map(s => s.id === id ? updated : s));
};

// Delete
const handleDelete = async (id: number) => {
  await api.savings.delete(id);
  setSavings(savings.filter(s => s.id !== id));
};
```

## Testing

### 7. Test the Application
- [ ] Run setup: `./setup.sh`
- [ ] Start services: `docker-compose up -d`
- [ ] Check backend health: `curl http://localhost:4000/health`
- [ ] Open frontend: http://localhost:3000
- [ ] Register a new user
- [ ] Test creating categories
- [ ] Test creating transactions
- [ ] Test creating budgets
- [ ] Test creating savings accounts
- [ ] Test updating/deleting items
- [ ] Test logout and login again
- [ ] Verify data persists after refresh

## Deployment

### 8. Deploy to Homelab
- [ ] Update `.env` with homelab API URL
- [ ] Copy project to homelab server
- [ ] Run `./setup.sh` on homelab
- [ ] Start services: `docker-compose up -d`
- [ ] Configure reverse proxy (if needed)
- [ ] Set up SSL/TLS (optional but recommended)
- [ ] Configure database backups

## Optional Improvements

### 9. Add Loading States
- [ ] Add loading spinners during API calls
- [ ] Disable buttons while requests are in progress
- [ ] Show success/error toasts

### 10. Error Handling
- [ ] Display user-friendly error messages
- [ ] Handle network errors gracefully
- [ ] Add retry logic for failed requests

### 11. Optimizations
- [ ] Add optimistic UI updates
- [ ] Implement data caching
- [ ] Add pagination for large datasets

## Notes

- Keep App.old.tsx as backup until migration is complete
- Test thoroughly before deploying to homelab
- Consider data migration from old localStorage if needed
- All API calls are async - use try/catch or .catch()
- JWT token is automatically included in requests by api.ts

## Need Help?

- Check SETUP.md for deployment issues
- Check MIGRATION_GUIDE.md for migration details
- Check backend/README.md for API documentation
- Check IMPLEMENTATION_SUMMARY.md for architecture overview

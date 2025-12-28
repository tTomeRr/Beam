# Migration Guide: localStorage to Distributed Architecture

## What Changed

Beam has been migrated from a client-side localStorage app to a full-stack distributed application with:

1. **Backend API** (Node.js/TypeScript/Express) in `backend/`
2. **PostgreSQL Database** for multi-user data persistence
3. **JWT Authentication** for secure user sessions
4. **Docker Compose** for easy deployment
5. **REST API** replacing localStorage operations

## Breaking Changes

### Frontend

**Old App.tsx** (localStorage-based)
- Data stored in browser localStorage
- No authentication
- Single-user only

**New App.tsx** (API-based)
- Data fetched from backend API
- JWT token authentication
- Multi-user support
- Loading states

### Required Changes

1. **Replace App.tsx**
   ```bash
   mv App.tsx App.old.tsx
   mv App.new.tsx App.tsx
   ```

2. **Update Login Page**
   The Login.tsx page needs to be updated to call `api.auth.login()` or `api.auth.register()` instead of just storing user data locally.

3. **Update Page Components**
   Each page component (Categories, Transactions, BudgetPlanning, Savings) needs to:
   - Call API methods when creating/updating/deleting data
   - Handle loading and error states
   - Refresh parent component state after mutations

## Data Migration

Since the app now uses a backend database, existing localStorage data will NOT be automatically migrated. To preserve data:

### Option 1: Manual Migration
1. Export localStorage data before migration
2. Create user account in new system
3. Manually re-enter important transactions/budgets

### Option 2: Write Migration Script
Create a script that:
1. Reads old localStorage data
2. Calls new API endpoints to recreate data
3. Associates data with new user account

Example:
```typescript
// migration-script.ts
const oldCategories = JSON.parse(localStorage.getItem('bt_categories') || '[]');
for (const cat of oldCategories) {
  await api.categories.create(cat.name, cat.icon, cat.color);
}
```

## Testing the Migration

1. Start the services:
   ```bash
   ./setup.sh
   docker-compose up -d
   ```

2. Check health:
   ```bash
   curl http://localhost:4000/health
   # Should return: {"status":"ok"}
   ```

3. Register a new user via the UI

4. Verify data is persisted in database:
   ```bash
   docker-compose exec database psql -U beam_user -d beam
   \dt  # List tables
   SELECT * FROM users;
   ```

## Rollback Plan

If issues occur, rollback to the old version:

```bash
# Stop new services
docker-compose down

# Restore old App.tsx
mv App.old.tsx App.tsx

# Start old dev server
npm run dev
```

## Next Steps

1. Replace App.tsx with App.new.tsx
2. Update Login.tsx to use API authentication
3. Update page components to use API calls
4. Test all functionality
5. Deploy to homelab

See SETUP.md for deployment instructions.

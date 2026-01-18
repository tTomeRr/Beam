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

## Pending Improvements

### 1. Delete Custom Categories
**Status:** Pending
**Priority:** High
**Description:** Enable users to permanently delete custom categories they created, while protecting default system categories from deletion.

**Requirements:**
- Users can delete custom categories (where `isDefault = false`)
- Default categories (where `isDefault = true`) cannot be deleted
- Deletion is only allowed if the category has no associated transactions
- Visual distinction: Show delete button (Trash icon) only for custom categories
- Confirmation dialog before deletion to prevent accidental removal
- Error handling if category has transactions (suggest disabling instead)

#### Frontend
1. Add delete button to Categories page
   a. Display Trash2 icon button only for categories where `isDefault === false`
   b. Position next to the disable/enable toggle button
   c. Add hover state with red color (`hover:text-red-600`)
   d. Implement for both parent categories and subcategories
2. Create confirmation dialog component
   a. Modal dialog with warning message in Hebrew
   b. Show category name being deleted
   c. Two buttons: "מחק" (Delete - red) and "ביטול" (Cancel - gray)
   d. Prevent accidental clicks with explicit confirmation
3. Handle delete errors gracefully
   a. Check backend response for constraint violations
   b. If category has transactions, show error message: "לא ניתן למחוק קטגוריה עם הוצאות קיימות. השבת את הקטגוריה במקום"
   c. Display error in AlertCircle component
4. Update local state after successful deletion
   a. Remove category from `categories` array
   b. Trigger re-render to update UI

#### Backend
1. Add DELETE endpoint `/api/categories/:id`
   a. Create `deleteCategory` controller in `categoryController.ts`
   b. Validate user owns the category (userId check)
   c. Check `isDefault` flag - reject if true with 403 Forbidden
   d. Check for associated transactions - reject if exists with 409 Conflict
   e. Return appropriate error messages
2. Add `deleteCategory` function in Category model
   a. Query to check transaction count: `SELECT COUNT(*) FROM transactions WHERE categoryId = $1 AND userId = $2`
   b. Query to check isDefault: `SELECT isDefault FROM categories WHERE id = $1 AND userId = $2`
   c. Validate constraints before deletion
   d. Execute: `DELETE FROM categories WHERE id = $1 AND userId = $2 AND isDefault = false`
3. Add route definition in `routes/categories.ts`
   a. Add: `router.delete('/:id', deleteCategory);`

---

### 2. Optional Description Field for Transactions
**Status:** Pending
**Priority:** High
**Description:** Make the description/name field optional when adding transactions, as category + subcategory selection often provides sufficient context.

**Requirements:**
- Description field becomes optional (currently required)
- Validation only requires `amount` and `categoryId`
- Transaction can be saved with empty description
- Display "(ללא תיאור)" placeholder in transaction table when description is empty
- Budget planning already doesn't require description (no change needed)

#### Frontend
1. Update transaction validation in Transactions.tsx
   a. Change line 27 from `if (!newTx.amount || !newTx.description)` to `if (!newTx.amount)`
   b. Remove description from required validation
2. Update placeholder text in description input
   a. Change placeholder to "תיאור (אופציונלי)" to indicate it's optional
   b. Add light gray helper text below: "אם לא תזין תיאור, יוצג רק שם הקטגוריה"
3. Handle empty descriptions in transaction display
   a. In transaction table (lines 187-225), check if description is empty
   b. If empty, display: `<span className="text-slate-400 italic">(ללא תיאור)</span>`
   c. Show only category badge if description is missing
4. Update API call
   a. Allow empty string for description in `api.transactions.create()`
   b. Backend already accepts description as string (no validation changes needed)

#### Backend
No changes required - backend already accepts description as a string without validation.

---

### 3. Expand Categories on Row Click
**Status:** Pending
**Priority:** Medium
**Description:** Allow users to click anywhere on the category row to expand/collapse subcategories, not just the chevron button.

**Requirements:**
- Entire category card/row is clickable to toggle expansion
- Chevron button remains functional (no breaking change)
- Hover state indicates the entire row is clickable
- Button clicks (add subcategory, disable, chevron) don't trigger row expansion
- Smooth transition animation maintained

#### Frontend
1. Make category row clickable in Categories.tsx
   a. Wrap category row (lines 233-256) in clickable div/button
   b. Add `onClick={() => toggleExpanded(parent.id)}` to parent row container
   c. Prevent event propagation on action buttons (add, disable, chevron)
2. Update row styling for better UX
   a. Add `cursor-pointer` class to parent category row
   b. Enhance hover state: `hover:bg-indigo-50/30` to indicate interactivity
   c. Add transition effect: `transition-all duration-200`
3. Prevent button click propagation
   a. Add `onClick={(e) => { e.stopPropagation(); startAddingSubcategory(...); }}` to Plus button
   b. Add `onClick={(e) => { e.stopPropagation(); toggleActive(parent.id); }}` to X/Check button
   c. Add `onClick={(e) => { e.stopPropagation(); toggleExpanded(parent.id); }}` to chevron button
4. Add visual feedback
   a. Change cursor to pointer on hover over parent row
   b. Subtle scale animation on row hover: `hover:scale-[1.01]`

#### Backend
No changes required.

---

### 4. Clearer Disable Category Button
**Status:** Pending
**Priority:** Medium
**Description:** Improve the visual clarity of the category disable/enable button to make its function immediately obvious.

**Requirements:**
- Replace generic X icon with more descriptive icons
- Add tooltip explaining the action
- Visual distinction between enabled and disabled states
- Consistent behavior for parent and subcategories
- Hebrew tooltip text

#### Frontend
1. Replace icons with more semantic options
   a. Active category: Use `EyeOff` icon instead of `X` (suggests hiding/disabling)
   b. Inactive category: Use `Eye` icon instead of `Check` (suggests showing/enabling)
   c. Import from 'lucide-react': `import { Eye, EyeOff } from 'lucide-react';`
2. Add tooltip component or title attribute
   a. For active categories: `title="השבת קטגוריה (הסתר מרשימות)"`
   b. For inactive categories: `title="הפעל קטגוריה (הצג ברשימות)"`
   c. Consider using a proper tooltip library for better UX (react-tooltip or Radix UI)
3. Enhance visual styling
   a. Active state button: `text-slate-400 hover:text-orange-600` (orange suggests caution)
   b. Inactive state button: `text-slate-300 hover:text-green-600` (green suggests activation)
   c. Add background on hover: `hover:bg-orange-50` for disable, `hover:bg-green-50` for enable
4. Update both parent category and subcategory buttons
   a. Parent categories: lines 266-272
   b. Subcategories: lines 308-314
   c. Ensure consistent icon usage and behavior

#### Backend
No changes required.

---

### 5. Two-Step Category Selection for Transactions
**Status:** Pending
**Priority:** High
**Description:** Replace the single overwhelming dropdown with a two-step selection: first choose parent category, then filter subcategories.

**Requirements:**
- First dropdown: Select parent category
- Second dropdown: Shows only subcategories for selected parent (or disabled if parent has no subcategories)
- Parent categories can be selected directly (for general expenses)
- Cleaner, more intuitive UX
- Maintains current CategorySelector for budget planning (which only uses parent categories)
- New component: TwoStepCategorySelector

#### Frontend
1. Create new TwoStepCategorySelector component
   a. File: `frontend/src/components/shared/TwoStepCategorySelector.tsx`
   b. Props: `categories: Category[]`, `value: number`, `onChange: (id: number) => void`
   c. State: `selectedParentId: number | null`, `selectedSubcategoryId: number | null`
   d. Split categories into parents and children using `buildCategoryTree`
2. Implement first dropdown (parent selection)
   a. Dropdown shows only parent categories (`parentCategoryId === null`)
   b. Display icon, color, and name
   c. On selection: update `selectedParentId`, reset `selectedSubcategoryId`
   d. If selected parent has no subcategories, automatically set as final value
3. Implement second dropdown (subcategory selection)
   a. Only enabled when parent is selected AND parent has subcategories
   b. Filter: `categories.filter(c => c.parentCategoryId === selectedParentId)`
   c. Show "(כללי)" option to select parent category directly
   d. Display subcategory icon and name
   e. On selection: call `onChange(subcategoryId)`
4. Update Transactions.tsx to use new component
   a. Import TwoStepCategorySelector
   b. Replace CategorySelector with TwoStepCategorySelector on line 116-120
   c. Adjust grid layout if needed for two dropdowns
   d. Keep CategorySelector for other uses (budget planning)
5. Styling and UX
   a. Use same rounded-2xl border style as current inputs
   b. Second dropdown grayed out when disabled
   c. Clear visual hierarchy between parent and subcategory
   d. Hebrew labels: "קטגוריה ראשית" and "תת-קטגוריה"

#### Backend
No changes required.

---

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

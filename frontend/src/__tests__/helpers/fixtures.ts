import { User, Category, Transaction, BudgetPlan, SavingsAccount } from '../../types';

export const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
};

export const mockCategories: Category[] = [
  { id: 1, name: 'מזון', icon: 'Utensils', color: '#FF6B6B', isActive: true, parentCategoryId: null, isDefault: false },
  { id: 2, name: 'בריאות', icon: 'HeartPulse', color: '#4ECDC4', isActive: true, parentCategoryId: null, isDefault: false },
  { id: 3, name: 'רכב', icon: 'Car', color: '#45B7D1', isActive: true, parentCategoryId: null, isDefault: false },
  { id: 4, name: 'לא פעיל', icon: 'Briefcase', color: '#B2BEC3', isActive: false, parentCategoryId: null, isDefault: false },
];

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    categoryId: 1,
    amount: 150,
    date: '2024-01-15',
    description: 'קניות בסופר',
  },
  {
    id: 2,
    categoryId: 2,
    amount: 200,
    date: '2024-01-20',
    description: 'ביקור רופא',
  },
  {
    id: 3,
    categoryId: 1,
    amount: 80,
    date: '2024-01-25',
    description: 'מסעדה',
  },
];

export const mockBudgets: BudgetPlan[] = [
  { id: 1, categoryId: 1, month: 1, year: 2024, plannedAmount: 1000 },
  { id: 2, categoryId: 2, month: 1, year: 2024, plannedAmount: 500 },
  { id: 3, categoryId: 3, month: 1, year: 2024, plannedAmount: 800 },
];

export const mockSavings: SavingsAccount[] = [
  {
    id: 1,
    name: 'חיסכון ראשי',
    type: 'savings',
    balance: 10000,
    currency: 'ILS',
  },
  {
    id: 2,
    name: 'קרן חירום',
    type: 'emergency',
    balance: 5000,
    currency: 'ILS',
  },
];

export const createMockTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: 1,
  categoryId: 1,
  amount: 100,
  date: new Date().toISOString().split('T')[0],
  description: 'Test transaction',
  ...overrides,
});

export const createMockCategory = (overrides?: Partial<Category>): Category => ({
  id: 1,
  name: 'Test Category',
  icon: 'Briefcase',
  color: '#FF6B6B',
  isActive: true,
  parentCategoryId: null,
  isDefault: false,
  ...overrides,
});

export const createMockBudget = (overrides?: Partial<BudgetPlan>): BudgetPlan => ({
  id: 1,
  categoryId: 1,
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  plannedAmount: 1000,
  ...overrides,
});

export const createMockSavingsAccount = (overrides?: Partial<SavingsAccount>): SavingsAccount => ({
  id: 1,
  name: 'Test Savings',
  type: 'savings',
  balance: 1000,
  currency: 'ILS',
  ...overrides,
});

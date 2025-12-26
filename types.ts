
export interface User {
  id: string | number;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
}

export interface Transaction {
  id: number;
  categoryId: number;
  amount: number;
  date: string;
  description: string;
}

export interface BudgetPlan {
  id: number;
  categoryId: number;
  month: number;
  year: number;
  plannedAmount: number;
}

export interface SavingsAccount {
  id: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface DashboardSummary {
  totalBudgeted: number;
  totalSpent: number;
  availableToSpend: number;
  totalSavings: number;
  percentSpent: number;
}

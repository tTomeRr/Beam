export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: number;
  userId: number;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Transaction {
  id: number;
  userId: number;
  categoryId: number;
  amount: number;
  date: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BudgetPlan {
  id: number;
  userId: number;
  categoryId: number;
  month: number;
  year: number;
  plannedAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SavingsAccount {
  id: number;
  userId: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JWTPayload {
  userId: number;
  email: string;
}

import { User, Category, Transaction, BudgetPlan, SavingsAccount } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

const clearAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

export const api = {
  auth: {
    register: async (name: string, email: string, password: string) => {
      const response = await request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setAuthToken(response.token);
      return response.user;
    },

    login: async (email: string, password: string) => {
      const response = await request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(response.token);
      return response.user;
    },

    logout: () => {
      clearAuthToken();
    },
  },

  categories: {
    getAll: () => request<Category[]>('/categories'),
    create: (name: string, icon: string, color: string) =>
      request<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify({ name, icon, color }),
      }),
    update: (id: number, updates: Partial<Category>) =>
      request<Category>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  },

  transactions: {
    getAll: () => request<Transaction[]>('/transactions'),
    create: (categoryId: number, amount: number, date: string, description: string) =>
      request<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify({ categoryId, amount, date, description }),
      }),
    update: (id: number, updates: Partial<Transaction>) =>
      request<Transaction>(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: number) =>
      request<void>(`/transactions/${id}`, {
        method: 'DELETE',
      }),
  },

  budgets: {
    getAll: () => request<BudgetPlan[]>('/budgets'),
    create: (categoryId: number, month: number, year: number, plannedAmount: number) =>
      request<BudgetPlan>('/budgets', {
        method: 'POST',
        body: JSON.stringify({ categoryId, month, year, plannedAmount }),
      }),
    delete: (id: number) =>
      request<void>(`/budgets/${id}`, {
        method: 'DELETE',
      }),
  },

  savings: {
    getAll: () => request<SavingsAccount[]>('/savings'),
    create: (name: string, type: string, balance: number, currency: string) =>
      request<SavingsAccount>('/savings', {
        method: 'POST',
        body: JSON.stringify({ name, type, balance, currency }),
      }),
    update: (id: number, updates: Partial<SavingsAccount>) =>
      request<SavingsAccount>(`/savings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: number) =>
      request<void>(`/savings/${id}`, {
        method: 'DELETE',
      }),
  },
};

export { ApiError, getAuthToken };

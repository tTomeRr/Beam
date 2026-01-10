jest.mock('../../config/env');

import { api, ApiError, getAuthToken } from '../../services/api';
import { mockFetch, mockFetchError, mockLocalStorage } from '../helpers/test-utils';

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage(),
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Auth API', () => {
    describe('register', () => {
      it('should register a new user successfully', async () => {
        const mockResponse = {
          user: { id: 1, name: 'Test User', email: 'test@example.com' },
          token: 'mock-token-123',
        };
        mockFetch(mockResponse);

        const user = await api.auth.register('Test User', 'test@example.com', 'password123');

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/register'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123' }),
          })
        );
        expect(user).toEqual(mockResponse.user);
        expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-token-123');
      });

      it('should trim whitespace from inputs', async () => {
        const mockResponse = {
          user: { id: 1, name: 'Test User', email: 'test@example.com' },
          token: 'mock-token-123',
        };
        mockFetch(mockResponse);

        await api.auth.register('  Test User  ', '  test@example.com  ', 'password123');

        expect(fetch).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            body: JSON.stringify({ name: '  Test User  ', email: '  test@example.com  ', password: 'password123' }),
          })
        );
      });

      it('should handle registration errors', async () => {
        mockFetchError(400, 'Email already exists');

        await expect(api.auth.register('Test', 'test@example.com', 'pass')).rejects.toThrow('Email already exists');
      });

      it('should handle network errors', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

        await expect(api.auth.register('Test', 'test@example.com', 'pass')).rejects.toThrow('Network error');
      });
    });

    describe('login', () => {
      it('should login successfully', async () => {
        const mockResponse = {
          user: { id: 1, name: 'Test User', email: 'test@example.com' },
          token: 'mock-token-456',
        };
        mockFetch(mockResponse);

        const user = await api.auth.login('test@example.com', 'password123');

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
          })
        );
        expect(user).toEqual(mockResponse.user);
        expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-token-456');
      });

      it('should handle invalid credentials', async () => {
        mockFetchError(401, 'Invalid credentials');

        await expect(api.auth.login('wrong@example.com', 'wrongpass')).rejects.toThrow('Invalid credentials');
      });

      it('should handle empty email or password', async () => {
        mockFetchError(400, 'Email and password are required');

        await expect(api.auth.login('', '')).rejects.toThrow();
      });
    });

    describe('logout', () => {
      it('should clear auth token', () => {
        localStorage.setItem('auth_token', 'test-token');

        api.auth.logout();

        expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      });
    });
  });

  describe('Categories API', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'test-token');
    });

    describe('getAll', () => {
      it('should fetch all categories with auth token', async () => {
        const mockCategories = [
          { id: 1, name: 'Food', icon: 'Utensils', color: '#FF6B6B', isActive: true },
          { id: 2, name: 'Health', icon: 'HeartPulse', color: '#4ECDC4', isActive: true },
        ];
        mockFetch(mockCategories);

        const categories = await api.categories.getAll();

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/categories'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );
        expect(categories).toEqual(mockCategories);
      });

      it('should handle unauthorized access', async () => {
        mockFetchError(401, 'Unauthorized');

        await expect(api.categories.getAll()).rejects.toThrow('Unauthorized');
      });
    });

    describe('create', () => {
      it('should create a new category', async () => {
        const newCategory = { id: 3, name: 'Transport', icon: 'Car', color: '#45B7D1', isActive: true };
        mockFetch(newCategory);

        const category = await api.categories.create('Transport', 'Car', '#45B7D1');

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/categories'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ name: 'Transport', icon: 'Car', color: '#45B7D1' }),
          })
        );
        expect(category).toEqual(newCategory);
      });

      it('should handle validation errors', async () => {
        mockFetchError(400, 'Invalid category data');

        await expect(api.categories.create('', '', '')).rejects.toThrow('Invalid category data');
      });
    });

    describe('update', () => {
      it('should update a category', async () => {
        const updatedCategory = { id: 1, name: 'Updated Food', icon: 'Pizza', color: '#FF6B6B', isActive: true };
        mockFetch(updatedCategory);

        const category = await api.categories.update(1, { name: 'Updated Food', icon: 'Pizza' });

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/categories/1'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ name: 'Updated Food', icon: 'Pizza' }),
          })
        );
        expect(category).toEqual(updatedCategory);
      });

      it('should handle category not found', async () => {
        mockFetchError(404, 'Category not found');

        await expect(api.categories.update(999, { name: 'Test' })).rejects.toThrow('Category not found');
      });

      it('should allow deactivating categories', async () => {
        const deactivatedCategory = { id: 1, name: 'Food', icon: 'Utensils', color: '#FF6B6B', isActive: false };
        mockFetch(deactivatedCategory);

        const category = await api.categories.update(1, { isActive: false });

        expect(category.isActive).toBe(false);
      });
    });
  });

  describe('Transactions API', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'test-token');
    });

    describe('getAll', () => {
      it('should fetch all transactions', async () => {
        const mockTransactions = [
          { id: 1, categoryId: 1, amount: 150, date: '2024-01-15', description: 'Groceries' },
          { id: 2, categoryId: 2, amount: 200, date: '2024-01-20', description: 'Doctor visit' },
        ];
        mockFetch(mockTransactions);

        const transactions = await api.transactions.getAll();

        expect(transactions).toEqual(mockTransactions);
      });
    });

    describe('create', () => {
      it('should create a new transaction', async () => {
        const newTransaction = { id: 3, categoryId: 1, amount: 50, date: '2024-01-25', description: 'Coffee' };
        mockFetch(newTransaction);

        const transaction = await api.transactions.create(1, 50, '2024-01-25', 'Coffee');

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ categoryId: 1, amount: 50, date: '2024-01-25', description: 'Coffee' }),
          })
        );
        expect(transaction).toEqual(newTransaction);
      });

      it('should handle invalid transaction data', async () => {
        mockFetchError(400, 'Invalid amount');

        await expect(api.transactions.create(1, -50, '2024-01-25', 'Test')).rejects.toThrow('Invalid amount');
      });
    });

    describe('update', () => {
      it('should update a transaction', async () => {
        const updatedTransaction = { id: 1, categoryId: 1, amount: 200, date: '2024-01-15', description: 'Updated' };
        mockFetch(updatedTransaction);

        const transaction = await api.transactions.update(1, { amount: 200, description: 'Updated' });

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions/1'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ amount: 200, description: 'Updated' }),
          })
        );
        expect(transaction).toEqual(updatedTransaction);
      });
    });

    describe('delete', () => {
      it('should delete a transaction', async () => {
        global.fetch = jest.fn(() =>
          Promise.resolve({
            ok: true,
            status: 204,
          } as Response)
        );

        await api.transactions.delete(1);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions/1'),
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });

      it('should handle delete errors', async () => {
        mockFetchError(404, 'Transaction not found');

        await expect(api.transactions.delete(999)).rejects.toThrow('Transaction not found');
      });
    });
  });

  describe('Budgets API', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'test-token');
    });

    describe('getAll', () => {
      it('should fetch all budgets', async () => {
        const mockBudgets = [
          { id: 1, categoryId: 1, month: 1, year: 2024, plannedAmount: 1000 },
          { id: 2, categoryId: 2, month: 1, year: 2024, plannedAmount: 500 },
        ];
        mockFetch(mockBudgets);

        const budgets = await api.budgets.getAll();

        expect(budgets).toEqual(mockBudgets);
      });
    });

    describe('create', () => {
      it('should create a new budget plan', async () => {
        const newBudget = { id: 3, categoryId: 3, month: 2, year: 2024, plannedAmount: 800 };
        mockFetch(newBudget);

        const budget = await api.budgets.create(3, 2, 2024, 800);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/budgets'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ categoryId: 3, month: 2, year: 2024, plannedAmount: 800 }),
          })
        );
        expect(budget).toEqual(newBudget);
      });

      it('should handle invalid month', async () => {
        mockFetchError(400, 'Invalid month');

        await expect(api.budgets.create(1, 13, 2024, 1000)).rejects.toThrow('Invalid month');
      });

      it('should handle negative amounts', async () => {
        mockFetchError(400, 'Amount must be positive');

        await expect(api.budgets.create(1, 1, 2024, -100)).rejects.toThrow('Amount must be positive');
      });
    });

    describe('delete', () => {
      it('should delete a budget plan', async () => {
        global.fetch = jest.fn(() =>
          Promise.resolve({
            ok: true,
            status: 204,
          } as Response)
        );

        await api.budgets.delete(1);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/budgets/1'),
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });
    });
  });

  describe('Savings API', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'test-token');
    });

    describe('getAll', () => {
      it('should fetch all savings accounts', async () => {
        const mockSavings = [
          { id: 1, name: 'Main Savings', type: 'savings', balance: 10000, currency: 'ILS' },
          { id: 2, name: 'Emergency Fund', type: 'emergency', balance: 5000, currency: 'ILS' },
        ];
        mockFetch(mockSavings);

        const savings = await api.savings.getAll();

        expect(savings).toEqual(mockSavings);
      });
    });

    describe('create', () => {
      it('should create a new savings account', async () => {
        const newSavings = { id: 3, name: 'Vacation Fund', type: 'goal', balance: 2000, currency: 'ILS' };
        mockFetch(newSavings);

        const savings = await api.savings.create('Vacation Fund', 'goal', 2000, 'ILS');

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/savings'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ name: 'Vacation Fund', type: 'goal', balance: 2000, currency: 'ILS' }),
          })
        );
        expect(savings).toEqual(newSavings);
      });
    });

    describe('update', () => {
      it('should update a savings account', async () => {
        const updatedSavings = { id: 1, name: 'Main Savings', type: 'savings', balance: 12000, currency: 'ILS' };
        mockFetch(updatedSavings);

        const savings = await api.savings.update(1, { balance: 12000 });

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/savings/1'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ balance: 12000 }),
          })
        );
        expect(savings).toEqual(updatedSavings);
      });
    });

    describe('delete', () => {
      it('should delete a savings account', async () => {
        global.fetch = jest.fn(() =>
          Promise.resolve({
            ok: true,
            status: 204,
          } as Response)
        );

        await api.savings.delete(1);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/savings/1'),
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });
    });
  });

  describe('ApiError', () => {
    it('should create ApiError with status and message', () => {
      const error = new ApiError(404, 'Not found');

      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.name).toBe('ApiError');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('getAuthToken', () => {
    it('should return auth token from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token');

      const token = getAuthToken();

      expect(token).toBe('test-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('should return null when no token exists', () => {
      const token = getAuthToken();

      expect(token).toBeNull();
    });
  });

  describe('Request function', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'test-token');
    });

    it('should include Authorization header when token exists', async () => {
      mockFetch([]);

      await api.categories.getAll();

      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should not include Authorization header when no token exists', async () => {
      localStorage.removeItem('auth_token');
      mockFetch({ user: {}, token: 'new-token' });

      await api.auth.login('test@example.com', 'password');

      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      );
    });

    it('should handle 204 No Content response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 204,
        } as Response)
      );

      const result = await api.transactions.delete(1);

      expect(result).toBeUndefined();
    });

    it('should handle JSON parse errors in error responses', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.reject(new Error('Invalid JSON')),
        } as Response)
      );

      await expect(api.categories.getAll()).rejects.toThrow('Request failed');
    });
  });
});

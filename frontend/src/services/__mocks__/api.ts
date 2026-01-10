export const api = {
  auth: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
  categories: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  transactions: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  budgets: {
    getAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  savings: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const getAuthToken = jest.fn();

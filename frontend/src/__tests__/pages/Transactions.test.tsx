import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Transactions from '../../pages/Transactions';
import { api } from '../../services/api';
import { mockCategories, mockTransactions } from '../helpers/fixtures';

jest.mock('../../services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('Transactions Page', () => {
  const setTransactions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = (
    categories = mockCategories,
    transactions = mockTransactions
  ) => {
    return render(
      <Transactions
        categories={categories}
        transactions={transactions}
        setTransactions={setTransactions}
      />
    );
  };

  describe('Rendering', () => {
    it('should render page title', () => {
      renderPage();

      expect(screen.getByText('הוצאות')).toBeInTheDocument();
      expect(screen.getByText('עקבו אחר כל רכישה שביצעתם')).toBeInTheDocument();
    });

    it('should render add transaction button', () => {
      renderPage();

      expect(screen.getByRole('button', { name: /הוצאה חדשה/i })).toBeInTheDocument();
    });

    it('should render search input', () => {
      renderPage();

      expect(screen.getByPlaceholderText(/חיפוש לפי תיאור.../i)).toBeInTheDocument();
    });

    it('should display all transactions', () => {
      renderPage();

      mockTransactions.forEach(tx => {
        expect(screen.getByText(tx.description)).toBeInTheDocument();
      });
    });
  });

  describe('Add Transaction', () => {
    it('should show add form when button is clicked', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      expect(screen.getByText('הוספת תנועה')).toBeInTheDocument();
    });

    it('should add transaction successfully', async () => {
      const newTx = {
        id: 4,
        categoryId: 1,
        amount: 100,
        date: '2024-01-30',
        description: 'Test transaction',
      };
      mockApi.transactions.create.mockResolvedValue(newTx);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      fireEvent.change(screen.getByPlaceholderText('למשל: סופר פארם'), {
        target: { value: 'Test transaction' },
      });
      fireEvent.change(screen.getByPlaceholderText('₪ 0.00'), {
        target: { value: '100' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה לרשימה/i }));

      await waitFor(() => {
        expect(mockApi.transactions.create).toHaveBeenCalled();
        expect(setTransactions).toHaveBeenCalled();
      });
    });

    it('should not add transaction with empty fields', async () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      fireEvent.click(screen.getByRole('button', { name: /הוספה לרשימה/i }));

      expect(mockApi.transactions.create).not.toHaveBeenCalled();
    });

    it('should handle add error', async () => {
      mockApi.transactions.create.mockRejectedValue(new Error('Failed'));

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      fireEvent.change(screen.getByPlaceholderText('למשל: סופר פארם'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('₪ 0.00'), {
        target: { value: '100' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה לרשימה/i }));

      await waitFor(() => {
        expect(screen.getByText('שגיאה בהוספת הוצאה')).toBeInTheDocument();
      });
    });

    it('should reset form after successful add', async () => {
      const newTx = {
        id: 4,
        categoryId: 1,
        amount: 100,
        date: '2024-01-30',
        description: 'Test',
      };
      mockApi.transactions.create.mockResolvedValue(newTx);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      fireEvent.change(screen.getByPlaceholderText('למשל: סופר פארם'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('₪ 0.00'), {
        target: { value: '100' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה לרשימה/i }));

      await waitFor(() => {
        expect(screen.queryByText('הוספת תנועה')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete Transaction', () => {
    it('should delete transaction successfully', async () => {
      mockApi.transactions.delete.mockResolvedValue();

      renderPage();

      const deleteButtons = document.querySelectorAll('button[class*="hover:text-red"]');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockApi.transactions.delete).toHaveBeenCalledWith(mockTransactions[0].id);
        expect(setTransactions).toHaveBeenCalled();
      });
    });

    it('should handle delete error', async () => {
      mockApi.transactions.delete.mockRejectedValue(new Error('Failed'));

      renderPage();

      const deleteButtons = document.querySelectorAll('button[class*="hover:text-red"]');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('שגיאה במחיקת הוצאה')).toBeInTheDocument();
      });
    });
  });

  describe('Search/Filter', () => {
    it('should filter transactions by description', () => {
      renderPage();

      const searchInput = screen.getByPlaceholderText(/חיפוש לפי תיאור.../i);
      fireEvent.change(searchInput, { target: { value: 'קניות' } });

      const matchingTx = mockTransactions.find(tx =>
        tx.description.includes('קניות')
      );
      const nonMatchingTx = mockTransactions.find(
        tx => !tx.description.includes('קניות')
      );

      if (matchingTx) {
        expect(screen.getByText(matchingTx.description)).toBeInTheDocument();
      }
      if (nonMatchingTx) {
        expect(screen.queryByText(nonMatchingTx.description)).not.toBeInTheDocument();
      }
    });

    it('should be case insensitive', () => {
      renderPage();

      const searchInput = screen.getByPlaceholderText(/חיפוש לפי תיאור.../i);
      fireEvent.change(searchInput, { target: { value: 'קניות' } });

      const matchingTx = mockTransactions.find(tx =>
        tx.description.toLowerCase().includes('קניות'.toLowerCase())
      );

      if (matchingTx) {
        expect(screen.getByText(matchingTx.description)).toBeInTheDocument();
      }
    });

    it('should show all transactions when search is empty', () => {
      renderPage();

      const searchInput = screen.getByPlaceholderText(/חיפוש לפי תיאור.../i);
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.change(searchInput, { target: { value: '' } });

      mockTransactions.forEach(tx => {
        expect(screen.getByText(tx.description)).toBeInTheDocument();
      });
    });
  });

  describe('Transaction Display', () => {
    it('should display transaction amount', () => {
      renderPage();

      mockTransactions.forEach(tx => {
        expect(screen.getByText(`₪${tx.amount}`)).toBeInTheDocument();
      });
    });

    it('should display transaction date', () => {
      renderPage();

      mockTransactions.forEach(tx => {
        expect(screen.getByText(tx.date)).toBeInTheDocument();
      });
    });

    it('should display category for each transaction', () => {
      renderPage();

      mockTransactions.forEach(tx => {
        const category = mockCategories.find(c => c.id === tx.categoryId);
        if (category) {
          expect(screen.getAllByText(category.name).length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Category Selection', () => {
    it('should show category dropdown in add form', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      const categorySelect = screen.getByRole('combobox');
      expect(categorySelect).toBeInTheDocument();
    });

    it('should default to first category', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      const categorySelect = screen.getByRole('combobox') as HTMLSelectElement;
      expect(categorySelect.value).toBe(mockCategories[0].id.toString());
    });
  });

  describe('Date Selection', () => {
    it('should default to today', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      const today = new Date().toISOString().split('T')[0];
      expect(dateInput.value).toBe(today);
    });

    it('should allow changing date', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

      expect((dateInput as HTMLInputElement).value).toBe('2024-01-15');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty categories', () => {
      renderPage([], mockTransactions);

      expect(screen.getByText('הוצאות')).toBeInTheDocument();
    });

    it('should handle empty transactions', () => {
      renderPage(mockCategories, []);

      expect(screen.getByText('הוצאות')).toBeInTheDocument();
    });

    it('should handle large amounts', async () => {
      const newTx = {
        id: 4,
        categoryId: 1,
        amount: 999999,
        date: '2024-01-30',
        description: 'Large',
      };
      mockApi.transactions.create.mockResolvedValue(newTx);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      fireEvent.change(screen.getByPlaceholderText('למשל: סופר פארם'), {
        target: { value: 'Large' },
      });
      fireEvent.change(screen.getByPlaceholderText('₪ 0.00'), {
        target: { value: '999999' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה לרשימה/i }));

      await waitFor(() => {
        expect(mockApi.transactions.create).toHaveBeenCalledWith(
          expect.any(Number),
          999999,
          expect.any(String),
          'Large'
        );
      });
    });

    it('should handle decimal amounts', async () => {
      const newTx = {
        id: 4,
        categoryId: 1,
        amount: 99.99,
        date: '2024-01-30',
        description: 'Decimal',
      };
      mockApi.transactions.create.mockResolvedValue(newTx);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      fireEvent.change(screen.getByPlaceholderText('למשל: סופר פארם'), {
        target: { value: 'Decimal' },
      });
      fireEvent.change(screen.getByPlaceholderText('₪ 0.00'), {
        target: { value: '99.99' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה לרשימה/i }));

      await waitFor(() => {
        expect(mockApi.transactions.create).toHaveBeenCalledWith(
          expect.any(Number),
          99.99,
          expect.any(String),
          'Decimal'
        );
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading during add', async () => {
      mockApi.transactions.create.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          id: 4,
          categoryId: 1,
          amount: 100,
          date: '2024-01-30',
          description: 'Test',
        }), 100))
      );

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /הוצאה חדשה/i }));

      fireEvent.change(screen.getByPlaceholderText('למשל: סופר פארם'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('₪ 0.00'), {
        target: { value: '100' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה לרשימה/i }));

      const saveButton = screen.getByRole('button', { name: /הוספה לרשימה/i });
      expect(saveButton).toBeDisabled();

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });
});

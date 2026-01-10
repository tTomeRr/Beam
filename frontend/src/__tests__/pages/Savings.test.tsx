import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Savings from '../../pages/Savings';
import { api } from '../../services/api';
import { mockSavings } from '../helpers/fixtures';

jest.mock('../../services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('Savings Page', () => {
  const setSavings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = (savings = mockSavings) => {
    return render(<Savings savings={savings} setSavings={setSavings} />);
  };

  describe('Rendering', () => {
    it('should render page title', () => {
      renderPage();

      expect(screen.getByText('חיסכונות')).toBeInTheDocument();
      expect(screen.getByText('עקבו אחר הנכסים והחסכונות שלכם')).toBeInTheDocument();
    });

    it('should render add account button', () => {
      renderPage();

      expect(screen.getByRole('button', { name: /חשבון חדש/i })).toBeInTheDocument();
    });

    it('should display total savings', () => {
      renderPage();

      const total = mockSavings.reduce((acc, s) => acc + s.balance, 0);
      expect(screen.getByText(`₪${total.toLocaleString()}`)).toBeInTheDocument();
    });

    it('should display all savings accounts', () => {
      renderPage();

      mockSavings.forEach(saving => {
        expect(screen.getByText(saving.name)).toBeInTheDocument();
      });
    });

    it('should display account balances', () => {
      renderPage();

      mockSavings.forEach(saving => {
        expect(screen.getByText(`₪${saving.balance.toLocaleString()}`)).toBeInTheDocument();
      });
    });
  });

  describe('Add Savings Account', () => {
    it('should show add form when button is clicked', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חשבון חדש/i }));

      expect(screen.getByText('פרטי חשבון חדש')).toBeInTheDocument();
    });

    it('should add account successfully', async () => {
      const newAccount = {
        id: 3,
        name: 'חשבון חדש',
        type: 'חיסכון',
        balance: 1000,
        currency: 'ILS',
      };
      mockApi.savings.create.mockResolvedValue(newAccount);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חשבון חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('שם החשבון (למשל: קרן השתלמות)'), {
        target: { value: 'חשבון חדש' },
      });
      fireEvent.change(screen.getByPlaceholderText('יתרה נוכחית'), {
        target: { value: '1000' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה/i }));

      await waitFor(() => {
        expect(mockApi.savings.create).toHaveBeenCalledWith('חשבון חדש', 'חיסכון', 1000, 'ILS');
        expect(setSavings).toHaveBeenCalledWith([...mockSavings, newAccount]);
      });
    });

    it('should not add account with empty fields', async () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חשבון חדש/i }));

      fireEvent.click(screen.getByRole('button', { name: /הוספה/i }));

      expect(mockApi.savings.create).not.toHaveBeenCalled();
    });

    it('should handle add error', async () => {
      mockApi.savings.create.mockRejectedValue(new Error('Failed'));

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חשבון חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('שם החשבון (למשל: קרן השתלמות)'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('יתרה נוכחית'), {
        target: { value: '1000' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה/i }));

      await waitFor(() => {
        expect(screen.getByText('שגיאה בהוספת חשבון')).toBeInTheDocument();
      });
    });

    it('should reset form after successful add', async () => {
      const newAccount = {
        id: 3,
        name: 'Test',
        type: 'חיסכון',
        balance: 1000,
        currency: 'ILS',
      };
      mockApi.savings.create.mockResolvedValue(newAccount);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חשבון חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('שם החשבון (למשל: קרן השתלמות)'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('יתרה נוכחית'), {
        target: { value: '1000' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה/i }));

      await waitFor(() => {
        expect(screen.queryByText('פרטי חשבון חדש')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete Savings Account', () => {
    it('should delete account successfully', async () => {
      mockApi.savings.delete.mockResolvedValue();

      renderPage();

      const deleteButtons = document.querySelectorAll('button[class*="hover:text-red"]');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockApi.savings.delete).toHaveBeenCalledWith(mockSavings[0].id);
        expect(setSavings).toHaveBeenCalled();
      });
    });

    it('should handle delete error', async () => {
      mockApi.savings.delete.mockRejectedValue(new Error('Failed'));

      renderPage();

      const deleteButtons = document.querySelectorAll('button[class*="hover:text-red"]');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('שגיאה במחיקת חשבון')).toBeInTheDocument();
      });
    });
  });

  describe('Total Calculation', () => {
    it('should calculate total correctly', () => {
      renderPage();

      const total = mockSavings.reduce((acc, s) => acc + s.balance, 0);
      expect(screen.getByText(`₪${total.toLocaleString()}`)).toBeInTheDocument();
    });

    it('should update total when accounts change', () => {
      renderPage([]);

      expect(screen.getByText('₪0')).toBeInTheDocument();
    });

    it('should handle large balances', () => {
      const largeSavings = [
        { id: 1, name: 'Large', type: 'savings', balance: 1000000, currency: 'ILS' },
      ];

      renderPage(largeSavings);

      expect(screen.getByText('₪1,000,000')).toBeInTheDocument();
    });
  });

  describe('Account Types', () => {
    it('should display account type', () => {
      renderPage();

      mockSavings.forEach(saving => {
        expect(screen.getByText(saving.type)).toBeInTheDocument();
      });
    });

    it('should allow selecting account type', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חשבון חדש/i }));

      const typeSelect = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(typeSelect, { target: { value: 'emergency' } });

      expect(typeSelect.value).toBe('emergency');
    });
  });

  describe('Loading States', () => {
    it('should show loading during add', async () => {
      mockApi.savings.create.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          id: 3,
          name: 'Test',
          type: 'חיסכון',
          balance: 1000,
          currency: 'ILS',
        }), 100))
      );

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חשבון חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('שם החשבון (למשל: קרן השתלמות)'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('יתרה נוכחית'), {
        target: { value: '1000' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה/i }));

      const saveButton = screen.getByRole('button', { name: /הוספה/i });
      expect(saveButton).toBeDisabled();

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty savings', () => {
      renderPage([]);

      expect(screen.getByText('חיסכונות')).toBeInTheDocument();
      expect(screen.getByText('₪0')).toBeInTheDocument();
    });

    it('should handle zero balance accounts', () => {
      const zeroSavings = [
        { id: 1, name: 'Empty', type: 'savings', balance: 0, currency: 'ILS' },
      ];

      renderPage(zeroSavings);

      expect(screen.getByText('₪0')).toBeInTheDocument();
    });

    it('should handle decimal balances', async () => {
      const newAccount = {
        id: 3,
        name: 'Decimal',
        type: 'חיסכון',
        balance: 1000.50,
        currency: 'ILS',
      };
      mockApi.savings.create.mockResolvedValue(newAccount);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חשבון חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('שם החשבון (למשל: קרן השתלמות)'), {
        target: { value: 'Decimal' },
      });
      fireEvent.change(screen.getByPlaceholderText('יתרה נוכחית'), {
        target: { value: '1000.50' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה/i }));

      await waitFor(() => {
        expect(mockApi.savings.create).toHaveBeenCalledWith('Decimal', 'חיסכון', 1000.50, 'ILS');
      });
    });

    it('should handle very long account names', async () => {
      const longName = 'א'.repeat(100);
      const newAccount = {
        id: 3,
        name: longName,
        type: 'חיסכון',
        balance: 1000,
        currency: 'ILS',
      };
      mockApi.savings.create.mockResolvedValue(newAccount);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חשבון חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('שם החשבון (למשל: קרן השתלמות)'), {
        target: { value: longName },
      });
      fireEvent.change(screen.getByPlaceholderText('יתרה נוכחית'), {
        target: { value: '1000' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה/i }));

      await waitFor(() => {
        expect(mockApi.savings.create).toHaveBeenCalledWith(longName, 'חיסכון', 1000, 'ILS');
      });
    });
  });

  describe('Currency Display', () => {
    it('should always use ILS currency', async () => {
      const newAccount = {
        id: 3,
        name: 'Test',
        type: 'חיסכון',
        balance: 1000,
        currency: 'ILS',
      };
      mockApi.savings.create.mockResolvedValue(newAccount);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חשבון חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('שם החשבון (למשל: קרן השתלמות)'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('יתרה נוכחית'), {
        target: { value: '1000' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הוספה/i }));

      await waitFor(() => {
        expect(mockApi.savings.create).toHaveBeenCalledWith('Test', 'חיסכון', 1000, 'ILS');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חשבון חדש/i }));

      expect(screen.getByPlaceholderText('שם החשבון (למשל: קרן השתלמות)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('יתרה נוכחית')).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      renderPage();

      expect(screen.getByRole('button', { name: /חשבון חדש/i })).toBeInTheDocument();
    });
  });
});

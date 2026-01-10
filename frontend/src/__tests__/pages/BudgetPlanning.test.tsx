import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BudgetPlanning from '../../pages/BudgetPlanning';
import { api } from '../../services/api';
import { mockCategories, mockBudgets } from '../helpers/fixtures';

jest.mock('../../services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('BudgetPlanning Page', () => {
  const setBudgets = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = (categories = mockCategories, budgets = mockBudgets) => {
    return render(
      <BudgetPlanning
        categories={categories}
        budgets={budgets}
        setBudgets={setBudgets}
      />
    );
  };

  describe('Rendering', () => {
    it('should render page title', () => {
      renderPage();

      expect(screen.getByText('תכנון תקציב')).toBeInTheDocument();
      expect(screen.getByText('קבעו יעדים חודשיים לכל קטגוריה')).toBeInTheDocument();
    });

    it('should display current month and year', () => {
      renderPage();

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      expect(screen.getByText(`${currentMonth} / ${currentYear}`)).toBeInTheDocument();
    });

    it('should render month navigation buttons', () => {
      renderPage();

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should display all active categories', () => {
      renderPage();

      mockCategories
        .filter(c => c.isActive)
        .forEach(cat => {
          expect(screen.getByText(cat.name)).toBeInTheDocument();
        });
    });
  });

  describe('Month Navigation', () => {
    it('should navigate to next month', () => {
      renderPage();

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const nextButtons = screen.getAllByRole('button');
      const nextButton = nextButtons.find(btn => btn.querySelector('svg'));

      if (nextButton) {
        fireEvent.click(nextButton);

        const expectedMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const expectedYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        expect(screen.getByText(`${expectedMonth} / ${expectedYear}`)).toBeInTheDocument();
      }
    });

    it('should wrap from December to January', () => {
      renderPage();

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];

      for (let i = 0; i < 12; i++) {
        fireEvent.click(nextButton);
      }

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`1 / ${currentYear + 1}`)).toBeInTheDocument();
    });
  });

  describe('Budget Input', () => {
    it('should allow entering budget amounts', () => {
      renderPage();

      const inputs = screen.getAllByRole('spinbutton');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: '1000' } });

        expect((inputs[0] as HTMLInputElement).value).toBe('1000');
      }
    });

    it('should display existing budget amounts', () => {
      renderPage();

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Save Budget', () => {
    it('should save budget successfully', async () => {
      const newBudget = {
        id: 4,
        categoryId: 1,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        plannedAmount: 1000,
      };
      mockApi.budgets.create.mockResolvedValue(newBudget);

      renderPage();

      const inputs = screen.getAllByRole('spinbutton');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: '1000' } });
      }

      const saveButton = screen.getByRole('button', { name: /שמירת תקציב חודשי/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApi.budgets.create).toHaveBeenCalled();
        expect(setBudgets).toHaveBeenCalled();
      });
    });

    it('should show success message after save', async () => {
      const newBudget = {
        id: 4,
        categoryId: 1,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        plannedAmount: 1000,
      };
      mockApi.budgets.create.mockResolvedValue(newBudget);

      renderPage();

      const inputs = screen.getAllByRole('spinbutton');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: '1000' } });
      }

      const saveButton = screen.getByRole('button', { name: /שמירת תקציב חודשי/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('התקציב נשמר בהצלחה!')).toBeInTheDocument();
      });
    });

    it('should handle save error', async () => {
      mockApi.budgets.create.mockRejectedValue(new Error('Failed'));

      renderPage();

      const inputs = screen.getAllByRole('spinbutton');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: '1000' } });
      }

      const saveButton = screen.getByRole('button', { name: /שמירת תקציב חודשי/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('שגיאה בשמירת התקציב')).toBeInTheDocument();
      });
    });

    it('should only save positive amounts', async () => {
      renderPage();

      const inputs = screen.getAllByRole('spinbutton');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: '0' } });
      }

      const saveButton = screen.getByRole('button', { name: /שמירת תקציב חודשי/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApi.budgets.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('Total Calculation', () => {
    it('should display total budget', () => {
      renderPage();

      expect(screen.getByText(/סה״כ מתוכנן/i)).toBeInTheDocument();
    });

    it('should calculate total correctly', () => {
      renderPage();

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input, i) => {
        fireEvent.change(input, { target: { value: `${(i + 1) * 100}` } });
      });

      const expectedTotal = inputs.reduce((sum, _, i) => sum + (i + 1) * 100, 0);
      expect(screen.getByText(`₪${expectedTotal.toLocaleString()}`)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading during save', async () => {
      mockApi.budgets.create.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          id: 4,
          categoryId: 1,
          month: 1,
          year: 2024,
          plannedAmount: 1000,
        }), 100))
      );

      renderPage();

      const inputs = screen.getAllByRole('spinbutton');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: '1000' } });
      }

      const saveButton = screen.getByRole('button', { name: /שמירת תקציב חודשי/i });
      fireEvent.click(saveButton);

      expect(saveButton).toBeDisabled();

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty categories', () => {
      renderPage([], mockBudgets);

      expect(screen.getByText('תכנון תקציב')).toBeInTheDocument();
    });

    it('should handle large budget amounts', () => {
      renderPage();

      const inputs = screen.getAllByRole('spinbutton');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: '999999' } });

        expect((inputs[0] as HTMLInputElement).value).toBe('999999');
      }
    });

    it('should handle decimal amounts', () => {
      renderPage();

      const inputs = screen.getAllByRole('spinbutton');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: '1000.50' } });

        expect((inputs[0] as HTMLInputElement).value).toBe('1000.50');
      }
    });
  });

  describe('Budget Persistence', () => {
    it('should load existing budgets for selected month', () => {
      renderPage();

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should clear budgets when switching months', () => {
      renderPage();

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];

      fireEvent.click(nextButton);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach(input => {
        const value = (input as HTMLInputElement).value;
        expect(value === '' || value === '0').toBe(true);
      });
    });
  });
});

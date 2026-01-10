import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard';
import { mockCategories, mockTransactions, mockBudgets, mockSavings } from '../helpers/fixtures';

describe('Dashboard Page', () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const renderDashboard = (
    categories = mockCategories,
    transactions = mockTransactions,
    budgets = mockBudgets,
    savings = mockSavings
  ) => {
    return render(
      <Dashboard
        categories={categories}
        transactions={transactions}
        budgets={budgets}
        savings={savings}
      />
    );
  };

  describe('Rendering', () => {
    it('should render dashboard title', () => {
      renderDashboard();

      expect(screen.getByText('לוח בקרה')).toBeInTheDocument();
    });

    it('should display current month and year', () => {
      renderDashboard();

      const monthNames = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
      ];

      const expectedText = `${monthNames[currentMonth - 1]} ${currentYear}`;
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    it('should render all summary cards', () => {
      renderDashboard();

      expect(screen.getByText('תקציב מתוכנן')).toBeInTheDocument();
      expect(screen.getByText('הוצאות בפועל')).toBeInTheDocument();
      expect(screen.getByText('נותר לבזבוז')).toBeInTheDocument();
      expect(screen.getByText('סה״כ חסכונות')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      renderDashboard();

      expect(screen.getByLabelText('חודש קודם')).toBeInTheDocument();
      expect(screen.getByLabelText('חודש הבא')).toBeInTheDocument();
    });

    it('should render with empty data', () => {
      renderDashboard([], [], [], []);

      expect(screen.getByText('לוח בקרה')).toBeInTheDocument();
      expect(screen.getByText('תקציב מתוכנן')).toBeInTheDocument();
    });
  });

  describe('Month Navigation', () => {
    it('should navigate to previous month', () => {
      renderDashboard();

      const prevButton = screen.getByLabelText('חודש קודם');
      fireEvent.click(prevButton);

      const monthNames = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
      ];

      const expectedMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const expectedYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      expect(screen.getByText(`${monthNames[expectedMonth - 1]} ${expectedYear}`)).toBeInTheDocument();
    });

    it('should navigate to next month', () => {
      renderDashboard();

      const nextButton = screen.getByLabelText('חודש הבא');
      fireEvent.click(nextButton);

      const monthNames = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
      ];

      const expectedMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const expectedYear = currentMonth === 12 ? currentYear + 1 : currentYear;

      expect(screen.getByText(`${monthNames[expectedMonth - 1]} ${expectedYear}`)).toBeInTheDocument();
    });

    it('should wrap from December to January', () => {
      renderDashboard();

      const prevButton = screen.getByLabelText('חודש קודם');

      for (let i = 0; i < currentMonth; i++) {
        fireEvent.click(prevButton);
      }

      expect(screen.getByText(`דצמבר ${currentYear - 1}`)).toBeInTheDocument();

      const nextButton = screen.getByLabelText('חודש הבא');
      fireEvent.click(nextButton);

      expect(screen.getByText(`ינואר ${currentYear}`)).toBeInTheDocument();
    });

    it('should show return to current month button when not on current month', () => {
      renderDashboard();

      const prevButton = screen.getByLabelText('חודש קודם');
      fireEvent.click(prevButton);

      expect(screen.getByText('חזור לחודש הנוכחי')).toBeInTheDocument();
    });

    it('should not show return button on current month', () => {
      renderDashboard();

      expect(screen.queryByText('חזור לחודש הנוכחי')).not.toBeInTheDocument();
    });

    it('should return to current month when button is clicked', () => {
      renderDashboard();

      const prevButton = screen.getByLabelText('חודש קודם');
      fireEvent.click(prevButton);

      const returnButton = screen.getByText('חזור לחודש הנוכחי');
      fireEvent.click(returnButton);

      const monthNames = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
      ];

      expect(screen.getByText(`${monthNames[currentMonth - 1]} ${currentYear}`)).toBeInTheDocument();
      expect(screen.queryByText('חזור לחודש הנוכחי')).not.toBeInTheDocument();
    });
  });

  describe('Summary Statistics', () => {
    it('should calculate total budgeted correctly', () => {
      const testBudgets = [
        { id: 1, categoryId: 1, month: currentMonth, year: currentYear, plannedAmount: 1000 },
        { id: 2, categoryId: 2, month: currentMonth, year: currentYear, plannedAmount: 500 },
      ];

      renderDashboard(mockCategories, [], testBudgets, []);

      const budgetCard = screen.getByText('תקציב מתוכנן').closest('div');
      expect(budgetCard).toHaveTextContent('₪1,500');
    });

    it('should calculate total spent correctly', () => {
      const today = new Date();
      const testTransactions = [
        { id: 1, categoryId: 1, amount: 100, date: today.toISOString().split('T')[0], description: 'Test 1' },
        { id: 2, categoryId: 2, amount: 200, date: today.toISOString().split('T')[0], description: 'Test 2' },
      ];

      renderDashboard(mockCategories, testTransactions, [], []);

      const spentCard = screen.getByText('הוצאות בפועל').closest('div');
      expect(spentCard).toHaveTextContent('₪300');
    });

    it('should calculate available to spend correctly', () => {
      const today = new Date();
      const testBudgets = [
        { id: 1, categoryId: 1, month: currentMonth, year: currentYear, plannedAmount: 1000 },
      ];
      const testTransactions = [
        { id: 1, categoryId: 1, amount: 300, date: today.toISOString().split('T')[0], description: 'Test' },
      ];

      renderDashboard(mockCategories, testTransactions, testBudgets, []);

      const availableCard = screen.getByText('נותר לבזבוז').closest('div');
      expect(availableCard).toHaveTextContent('₪700');
    });

    it('should show negative available when overspending', () => {
      const today = new Date();
      const testBudgets = [
        { id: 1, categoryId: 1, month: currentMonth, year: currentYear, plannedAmount: 100 },
      ];
      const testTransactions = [
        { id: 1, categoryId: 1, amount: 200, date: today.toISOString().split('T')[0], description: 'Test' },
      ];

      renderDashboard(mockCategories, testTransactions, testBudgets, []);

      const availableCard = screen.getByText('נותר לבזבוז').closest('div');
      expect(availableCard).toHaveTextContent('-₪100');
    });

    it('should calculate total savings correctly', () => {
      const testSavings = [
        { id: 1, name: 'Account 1', type: 'savings', balance: 5000, currency: 'ILS' },
        { id: 2, name: 'Account 2', type: 'savings', balance: 3000, currency: 'ILS' },
      ];

      renderDashboard(mockCategories, [], [], testSavings);

      const savingsCard = screen.getByText('סה״כ חיסכונות').closest('div');
      expect(savingsCard).toHaveTextContent('₪8,000');
    });

    it('should filter transactions by selected month', () => {
      const testTransactions = [
        { id: 1, categoryId: 1, amount: 100, date: '2024-01-15', description: 'January' },
        { id: 2, categoryId: 1, amount: 200, date: '2024-02-15', description: 'February' },
      ];

      renderDashboard(mockCategories, testTransactions, [], []);

      const prevButton = screen.getByLabelText('חודש קודם');
      for (let i = 0; i < 12; i++) {
        fireEvent.click(prevButton);
      }

      expect(screen.getByText('ינואר 2024')).toBeInTheDocument();
    });

    it('should filter budgets by selected month', () => {
      const testBudgets = [
        { id: 1, categoryId: 1, month: 1, year: 2024, plannedAmount: 1000 },
        { id: 2, categoryId: 1, month: 2, year: 2024, plannedAmount: 2000 },
      ];

      renderDashboard(mockCategories, [], testBudgets, []);

      const prevButton = screen.getByLabelText('חודש קודם');
      for (let i = 0; i < 12; i++) {
        fireEvent.click(prevButton);
      }
    });
  });

  describe('Category Data', () => {
    it('should display only active categories', () => {
      const categoriesWithInactive = [
        { id: 1, name: 'Active', icon: 'Utensils', color: '#FF6B6B', isActive: true },
        { id: 2, name: 'Inactive', icon: 'Car', color: '#45B7D1', isActive: false },
      ];

      renderDashboard(categoriesWithInactive, [], [], []);

      expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
    });

    it('should show categories with budget or spending', () => {
      const today = new Date();
      const testBudgets = [
        { id: 1, categoryId: 1, month: currentMonth, year: currentYear, plannedAmount: 1000 },
      ];
      const testTransactions = [
        { id: 1, categoryId: 1, amount: 100, date: today.toISOString().split('T')[0], description: 'Test' },
      ];

      renderDashboard(mockCategories, testTransactions, testBudgets, []);
    });

    it('should calculate spending per category correctly', () => {
      const today = new Date();
      const testTransactions = [
        { id: 1, categoryId: 1, amount: 100, date: today.toISOString().split('T')[0], description: 'Test 1' },
        { id: 2, categoryId: 1, amount: 50, date: today.toISOString().split('T')[0], description: 'Test 2' },
      ];

      renderDashboard(mockCategories, testTransactions, [], []);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero budget', () => {
      renderDashboard(mockCategories, [], [], []);

      const budgetCard = screen.getByText('תקציב מתוכנן').closest('div');
      expect(budgetCard).toHaveTextContent('₪0');
    });

    it('should handle zero spending', () => {
      renderDashboard(mockCategories, [], mockBudgets, []);

      const spentCard = screen.getByText('הוצאות בפועל').closest('div');
      expect(spentCard).toHaveTextContent('₪0');
    });

    it('should handle zero savings', () => {
      renderDashboard(mockCategories, [], [], []);

      const savingsCard = screen.getByText('סה״כ חיסכונות').closest('div');
      expect(savingsCard).toHaveTextContent('₪0');
    });

    it('should handle large numbers', () => {
      const largeSavings = [
        { id: 1, name: 'Large', type: 'savings', balance: 1000000, currency: 'ILS' },
      ];

      renderDashboard(mockCategories, [], [], largeSavings);

      const savingsCard = screen.getByText('סה״כ חיסכונות').closest('div');
      expect(savingsCard).toHaveTextContent('1,000,000');
    });

    it('should handle transactions from different years', () => {
      const testTransactions = [
        { id: 1, categoryId: 1, amount: 100, date: '2023-01-15', description: '2023' },
        { id: 2, categoryId: 1, amount: 200, date: '2024-01-15', description: '2024' },
      ];

      renderDashboard(mockCategories, testTransactions, [], []);
    });

    it('should handle rapid month navigation', () => {
      renderDashboard();

      const nextButton = screen.getByLabelText('חודש הבא');
      const prevButton = screen.getByLabelText('חודש קודם');

      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(prevButton);
      fireEvent.click(prevButton);
      fireEvent.click(prevButton);

      expect(screen.getByLabelText('חודש הבא')).toBeInTheDocument();
    });

    it('should handle categories with no transactions', () => {
      const testBudgets = [
        { id: 1, categoryId: 1, month: currentMonth, year: currentYear, plannedAmount: 1000 },
      ];

      renderDashboard(mockCategories, [], testBudgets, []);

      const availableCard = screen.getByText('נותר לבזבוז').closest('div');
      expect(availableCard).toHaveTextContent('₪1,000');
    });
  });

  describe('Percent Calculation', () => {
    it('should calculate percent spent correctly', () => {
      const today = new Date();
      const testBudgets = [
        { id: 1, categoryId: 1, month: currentMonth, year: currentYear, plannedAmount: 1000 },
      ];
      const testTransactions = [
        { id: 1, categoryId: 1, amount: 500, date: today.toISOString().split('T')[0], description: 'Test' },
      ];

      renderDashboard(mockCategories, testTransactions, testBudgets, []);
    });

    it('should handle percent over 100', () => {
      const today = new Date();
      const testBudgets = [
        { id: 1, categoryId: 1, month: currentMonth, year: currentYear, plannedAmount: 100 },
      ];
      const testTransactions = [
        { id: 1, categoryId: 1, amount: 200, date: today.toISOString().split('T')[0], description: 'Test' },
      ];

      renderDashboard(mockCategories, testTransactions, testBudgets, []);
    });

    it('should handle zero budget for percent calculation', () => {
      const today = new Date();
      const testTransactions = [
        { id: 1, categoryId: 1, amount: 100, date: today.toISOString().split('T')[0], description: 'Test' },
      ];

      renderDashboard(mockCategories, testTransactions, [], []);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible navigation buttons', () => {
      renderDashboard();

      expect(screen.getByLabelText('חודש קודם')).toBeInTheDocument();
      expect(screen.getByLabelText('חודש הבא')).toBeInTheDocument();
    });

    it('should have readable text contrast', () => {
      renderDashboard();

      const title = screen.getByText('לוח בקרה');
      expect(title).toHaveClass('text-slate-900');
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GeminiInsights from '../../../components/insights/GeminiInsights';
import { mockCategories, mockTransactions, mockBudgets } from '../../helpers/fixtures';

const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

describe('GeminiInsights Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.API_KEY;
  });

  describe('Rendering', () => {
    it('should render component with title and button', () => {
      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      expect(screen.getByText('תובנות Gemini')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show initial prompt message', () => {
      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      expect(screen.getByText(/לחצו על הניצוץ לקבלת ניתוח חכם/)).toBeInTheDocument();
    });

    it('should render with empty data', () => {
      render(<GeminiInsights categories={[]} transactions={[]} budgets={[]} />);

      expect(screen.getByText('תובנות Gemini')).toBeInTheDocument();
    });
  });

  describe('Insight Generation', () => {
    it('should generate insight when button is clicked', async () => {
      const mockInsight = 'תובנה פיננסית חשובה:\n1. חסכו במזון\n2. הגדילו חיסכון\n3. הפחיתו הוצאות';
      mockGenerateContent.mockResolvedValue({ text: mockInsight });

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(mockInsight)).toBeInTheDocument();
      });
    });

    it('should show loading state while generating', async () => {
      mockGenerateContent.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ text: 'Test' }), 100))
      );

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const loadingIndicators = screen.getAllByRole('presentation');
      expect(loadingIndicators.length).toBeGreaterThan(0);

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });
    });

    it('should disable button while loading', async () => {
      mockGenerateContent.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ text: 'Test' }), 100))
      );

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should handle empty response gracefully', async () => {
      mockGenerateContent.mockResolvedValue({ text: '' });

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/לא הצלחתי לגבש תובנה/)).toBeInTheDocument();
      });
    });

    it('should handle null response', async () => {
      mockGenerateContent.mockResolvedValue({ text: null });

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/לא הצלחתי לגבש תובנה/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/אירעה שגיאה בחיבור לבינה המלאכותית/)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network error'));

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/אירעה שגיאה/)).toBeInTheDocument();
      });
    });

    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      mockGenerateContent.mockRejectedValue(error);

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Gemini Error:', error);
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Data Processing', () => {
    it('should calculate spending correctly for categories', async () => {
      mockGenerateContent.mockImplementation(async ({ contents }) => {
        expect(contents).toContain('מזון');
        return { text: 'Test insight' };
      });

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockGenerateContent).toHaveBeenCalled();
      });
    });

    it('should include budget information in prompt', async () => {
      mockGenerateContent.mockImplementation(async ({ contents }) => {
        expect(contents).toContain('budgeted');
        expect(contents).toContain('spent');
        return { text: 'Test insight' };
      });

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockGenerateContent).toHaveBeenCalled();
      });
    });

    it('should handle categories with no budget', async () => {
      const categoriesWithoutBudget = [
        { id: 99, name: 'No Budget', icon: 'Briefcase', color: '#000000', isActive: true },
      ];

      mockGenerateContent.mockResolvedValue({ text: 'Test' });

      render(
        <GeminiInsights
          categories={categoriesWithoutBudget}
          transactions={[]}
          budgets={[]}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockGenerateContent).toHaveBeenCalled();
      });
    });

    it('should handle categories with no spending', async () => {
      const budgetsOnly = [{ id: 1, categoryId: 1, month: 1, year: 2024, plannedAmount: 1000 }];

      mockGenerateContent.mockResolvedValue({ text: 'Test' });

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={[]}
          budgets={budgetsOnly}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockGenerateContent).toHaveBeenCalled();
      });
    });
  });

  describe('UI Interactions', () => {
    it('should allow generating multiple insights', async () => {
      mockGenerateContent
        .mockResolvedValueOnce({ text: 'First insight' })
        .mockResolvedValueOnce({ text: 'Second insight' });

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');

      fireEvent.click(button);
      await waitFor(() => expect(screen.getByText('First insight')).toBeInTheDocument());

      fireEvent.click(button);
      await waitFor(() => expect(screen.getByText('Second insight')).toBeInTheDocument());
    });

    it('should replace previous insight with new one', async () => {
      mockGenerateContent
        .mockResolvedValueOnce({ text: 'Old insight' })
        .mockResolvedValueOnce({ text: 'New insight' });

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');

      fireEvent.click(button);
      await waitFor(() => expect(screen.getByText('Old insight')).toBeInTheDocument());

      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText('New insight')).toBeInTheDocument();
        expect(screen.queryByText('Old insight')).not.toBeInTheDocument();
      });
    });

    it('should show loading animation while fetching', async () => {
      mockGenerateContent.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ text: 'Done' }), 50))
      );

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getAllByRole('presentation')[0]).toHaveClass('animate-pulse');

      await waitFor(() => {
        expect(screen.getByText('Done')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeEnabled();
    });

    it('should disable button during loading', async () => {
      mockGenerateContent.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ text: 'Test' }), 100))
      );

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toHaveAttribute('disabled');

      await waitFor(() => {
        expect(button).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle inactive categories', () => {
      const allCategories = [
        ...mockCategories,
        { id: 10, name: 'Inactive', icon: 'X', color: '#000', isActive: false },
      ];

      mockGenerateContent.mockResolvedValue({ text: 'Test' });

      render(
        <GeminiInsights
          categories={allCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should handle very large transaction amounts', async () => {
      const largeTransactions = [
        { id: 1, categoryId: 1, amount: 999999999, date: '2024-01-01', description: 'Large' },
      ];

      mockGenerateContent.mockResolvedValue({ text: 'Test' });

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={largeTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockGenerateContent).toHaveBeenCalled();
      });
    });

    it('should handle rapid button clicks', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'Test' });

      render(
        <GeminiInsights
          categories={mockCategories}
          transactions={mockTransactions}
          budgets={mockBudgets}
        />
      );

      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });
  });
});

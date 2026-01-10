import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoriesPage from '../../pages/Categories';
import { api } from '../../services/api';
import { mockCategories } from '../helpers/fixtures';

jest.mock('../../services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('Categories Page', () => {
  const setCategories = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = (categories = mockCategories) => {
    return render(<CategoriesPage categories={categories} setCategories={setCategories} />);
  };

  describe('Rendering', () => {
    it('should render page title and description', () => {
      renderPage();

      expect(screen.getByText('קטגוריות')).toBeInTheDocument();
      expect(screen.getByText('נהלו את סוגי ההוצאות שלכם')).toBeInTheDocument();
    });

    it('should render add new button', () => {
      renderPage();

      expect(screen.getByRole('button', { name: /חדש/i })).toBeInTheDocument();
    });

    it('should render all categories', () => {
      renderPage();

      mockCategories.forEach(cat => {
        if (cat.name !== 'לא פעיל') {
          expect(screen.getByText(cat.name)).toBeInTheDocument();
        }
      });
    });

    it('should show category status', () => {
      renderPage();

      expect(screen.getAllByText('פעיל').length).toBeGreaterThan(0);
    });

    it('should render with empty categories', () => {
      renderPage([]);

      expect(screen.getByText('קטגוריות')).toBeInTheDocument();
    });
  });

  describe('Add Category', () => {
    it('should show add form when button is clicked', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      expect(screen.getByText('הוספת קטגוריה חדשה')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('לדוגמה: מנויים')).toBeInTheDocument();
      expect(screen.getByText('בחר אייקון')).toBeInTheDocument();
      expect(screen.getByDisplayValue('#6366f1')).toBeInTheDocument();
    });

    it('should add new category successfully', async () => {
      const newCategory = { id: 5, name: 'תחבורה', icon: 'Car', color: '#FF5733', isActive: true };
      mockApi.categories.create.mockResolvedValue(newCategory);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('לדוגמה: מנויים'), {
        target: { value: 'תחבורה' },
      });

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      await waitFor(() => {
        expect(mockApi.categories.create).toHaveBeenCalledWith('תחבורה', 'Briefcase', '#6366f1');
        expect(setCategories).toHaveBeenCalledWith([...mockCategories, newCategory]);
      });
    });

    it('should trim whitespace from category name', async () => {
      const newCategory = { id: 5, name: 'תחבורה', icon: 'Car', color: '#FF5733', isActive: true };
      mockApi.categories.create.mockResolvedValue(newCategory);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('לדוגמה: מנויים'), {
        target: { value: '  תחבורה  ' },
      });

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      await waitFor(() => {
        expect(mockApi.categories.create).toHaveBeenCalledWith('תחבורה', 'Briefcase', '#6366f1');
      });
    });

    it('should not add category with empty name', async () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      expect(mockApi.categories.create).not.toHaveBeenCalled();
    });

    it('should not add category with whitespace-only name', async () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('לדוגמה: מנויים'), {
        target: { value: '   ' },
      });

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      expect(mockApi.categories.create).not.toHaveBeenCalled();
    });

    it('should show loading state while adding', async () => {
      mockApi.categories.create.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ id: 5, name: 'Test', icon: 'Car', color: '#FF5733', isActive: true }), 100))
      );

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('לדוגמה: מנויים'), {
        target: { value: 'Test' },
      });

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      const saveButton = screen.getByRole('button', { name: /שמירה/i });
      expect(saveButton).toBeDisabled();

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('should handle add error', async () => {
      mockApi.categories.create.mockRejectedValue(new Error('Failed to create'));

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('לדוגמה: מנויים'), {
        target: { value: 'Test' },
      });

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      await waitFor(() => {
        expect(screen.getByText('שגיאה בהוספת קטגוריה')).toBeInTheDocument();
      });
    });

    it('should close form when cancel is clicked', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));
      expect(screen.getByText('הוספת קטגוריה חדשה')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /ביטול/i }));
      expect(screen.queryByText('הוספת קטגוריה חדשה')).not.toBeInTheDocument();
    });

    it('should reset form after successful add', async () => {
      const newCategory = { id: 5, name: 'תחבורה', icon: 'Car', color: '#FF5733', isActive: true };
      mockApi.categories.create.mockResolvedValue(newCategory);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('לדוגמה: מנויים'), {
        target: { value: 'תחבורה' },
      });

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      await waitFor(() => {
        expect(screen.queryByText('הוספת קטגוריה חדשה')).not.toBeInTheDocument();
      });
    });
  });

  describe('Icon Picker', () => {
    it('should show icon picker when icon button is clicked', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      const iconButton = screen.getByText('בחר אייקון').closest('button');
      if (iconButton) {
        fireEvent.click(iconButton);
      }

      expect(screen.getByRole('button', { name: /כלי אוכל/i })).toBeInTheDocument();
    });

    it('should select icon from picker', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      const iconButton = screen.getByText('בחר אייקון').closest('button');
      if (iconButton) {
        fireEvent.click(iconButton);
      }

      fireEvent.click(screen.getByRole('button', { name: /קפה/i }));

      expect(screen.getByText('קפה')).toBeInTheDocument();
    });

    it('should close icon picker after selection', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      const iconButton = screen.getByText('בחר אייקון').closest('button');
      if (iconButton) {
        fireEvent.click(iconButton);
      }

      fireEvent.click(screen.getByRole('button', { name: /קפה/i }));

      expect(screen.queryByRole('button', { name: /פיצה/i })).not.toBeInTheDocument();
    });

    it('should toggle icon picker', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      const iconButton = screen.getByText('בחר אייקון').closest('button');
      if (iconButton) {
        fireEvent.click(iconButton);
        expect(screen.getByRole('button', { name: /כלי אוכל/i })).toBeInTheDocument();

        fireEvent.click(iconButton);
        expect(screen.queryByRole('button', { name: /כלי אוכל/i })).not.toBeInTheDocument();
      }
    });
  });

  describe('Color Picker', () => {
    it('should change category color', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      const colorInput = screen.getByDisplayValue('#6366f1') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#FF0000' } });

      expect(colorInput.value).toBe('#FF0000');
    });

    it('should display color hex value', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      expect(screen.getByText('#6366f1')).toBeInTheDocument();
    });
  });

  describe('Toggle Category Active', () => {
    it('should toggle category active status', async () => {
      const updatedCategory = { ...mockCategories[0], isActive: false };
      mockApi.categories.update.mockResolvedValue(updatedCategory);

      renderPage();

      const categoryCard = screen.getByText(mockCategories[0].name).closest('div');
      if (categoryCard) {
        const toggleButton = categoryCard.querySelector('button[title="השבת"]');
        if (toggleButton) {
          fireEvent.click(toggleButton);

          await waitFor(() => {
            expect(mockApi.categories.update).toHaveBeenCalledWith(mockCategories[0].id, { isActive: false });
          });
        }
      }
    });

    it('should update categories list after toggle', async () => {
      const updatedCategory = { ...mockCategories[0], isActive: false };
      mockApi.categories.update.mockResolvedValue(updatedCategory);

      renderPage();

      const categoryCard = screen.getByText(mockCategories[0].name).closest('div');
      if (categoryCard) {
        const toggleButton = categoryCard.querySelector('button[title="השבת"]');
        if (toggleButton) {
          fireEvent.click(toggleButton);

          await waitFor(() => {
            expect(setCategories).toHaveBeenCalled();
          });
        }
      }
    });

    it('should handle toggle error', async () => {
      mockApi.categories.update.mockRejectedValue(new Error('Update failed'));

      renderPage();

      const categoryCard = screen.getByText(mockCategories[0].name).closest('div');
      if (categoryCard) {
        const toggleButton = categoryCard.querySelector('button[title="השבת"]');
        if (toggleButton) {
          fireEvent.click(toggleButton);

          await waitFor(() => {
            expect(screen.getByText('שגיאה בעדכון קטגוריה')).toBeInTheDocument();
          });
        }
      }
    });
  });

  describe('Category Display', () => {
    it('should show active status for active categories', () => {
      renderPage();

      const activeCategory = mockCategories.find(c => c.isActive);
      if (activeCategory) {
        const categoryCard = screen.getByText(activeCategory.name).closest('div');
        expect(categoryCard).toHaveTextContent('פעיל');
      }
    });

    it('should show inactive status for inactive categories', () => {
      renderPage();

      const inactiveCategory = mockCategories.find(c => !c.isActive);
      if (inactiveCategory) {
        const categoryCard = screen.getByText(inactiveCategory.name).closest('div');
        expect(categoryCard).toHaveTextContent('לא פעיל');
      }
    });

    it('should display category icon with correct color', () => {
      renderPage();

      mockCategories.forEach(cat => {
        const categoryCard = screen.getByText(cat.name).closest('div');
        if (categoryCard) {
          const iconContainer = categoryCard.querySelector('[style*="background-color"]');
          expect(iconContainer).toBeInTheDocument();
        }
      });
    });
  });

  describe('Error Display', () => {
    it('should clear error when cancel is clicked', async () => {
      mockApi.categories.create.mockRejectedValue(new Error('Failed'));

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('לדוגמה: מנויים'), {
        target: { value: 'Test' },
      });

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      await waitFor(() => {
        expect(screen.getByText('שגיאה בהוספת קטגוריה')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /ביטול/i }));

      expect(screen.queryByText('שגיאה בהוספת קטגוריה')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long category names', async () => {
      const longName = 'א'.repeat(100);
      const newCategory = { id: 5, name: longName, icon: 'Car', color: '#FF5733', isActive: true };
      mockApi.categories.create.mockResolvedValue(newCategory);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('לדוגמה: מנויים'), {
        target: { value: longName },
      });

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      await waitFor(() => {
        expect(mockApi.categories.create).toHaveBeenCalledWith(longName, 'Briefcase', '#6366f1');
      });
    });

    it('should handle special characters in name', async () => {
      const specialName = 'קטגוריה @#$%';
      const newCategory = { id: 5, name: specialName, icon: 'Car', color: '#FF5733', isActive: true };
      mockApi.categories.create.mockResolvedValue(newCategory);

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('לדוגמה: מנויים'), {
        target: { value: specialName },
      });

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      await waitFor(() => {
        expect(mockApi.categories.create).toHaveBeenCalledWith(specialName, 'Briefcase', '#6366f1');
      });
    });

    it('should disable buttons during loading', async () => {
      mockApi.categories.create.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ id: 5, name: 'Test', icon: 'Car', color: '#FF5733', isActive: true }), 100))
      );

      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      fireEvent.change(screen.getByPlaceholderText('לדוגמה: מנויים'), {
        target: { value: 'Test' },
      });

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      const cancelButton = screen.getByRole('button', { name: /ביטול/i });
      expect(cancelButton).toBeDisabled();

      await waitFor(() => {
        expect(cancelButton).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: /חדש/i }));

      expect(screen.getByPlaceholderText('לדוגמה: מנויים')).toBeInTheDocument();
      expect(screen.getByText('בחר אייקון')).toBeInTheDocument();
      expect(screen.getByDisplayValue('#6366f1')).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      renderPage();

      expect(screen.getByRole('button', { name: /חדש/i })).toBeInTheDocument();
    });
  });
});

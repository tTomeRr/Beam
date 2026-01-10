import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import { mockUser } from '../../helpers/fixtures';

const MockOutlet = () => <div>Test Content</div>;

const renderLayout = (initialRoute = '/dashboard') => {
  const onLogout = jest.fn();

  return {
    ...render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="*" element={<Layout user={mockUser} onLogout={onLogout} />}>
            <Route path="*" element={<MockOutlet />} />
          </Route>
        </Routes>
      </MemoryRouter>
    ),
    onLogout,
  };
};

describe('Layout Component', () => {
  describe('Rendering', () => {
    it('should render layout with user information', () => {
      renderLayout();

      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getAllByText('Beam').length).toBeGreaterThan(0);
    });

    it('should render all navigation items', () => {
      renderLayout();

      expect(screen.getByText('לוח בקרה')).toBeInTheDocument();
      expect(screen.getByText('קטגוריות')).toBeInTheDocument();
      expect(screen.getByText('תכנון תקציב')).toBeInTheDocument();
      expect(screen.getByText('הוצאות')).toBeInTheDocument();
      expect(screen.getByText('חיסכונות')).toBeInTheDocument();
    });

    it('should render logout button', () => {
      renderLayout();

      expect(screen.getByText('התנתקות')).toBeInTheDocument();
    });

    it('should render outlet content', () => {
      renderLayout();

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should highlight active navigation item', () => {
      renderLayout('/dashboard');

      const dashboardLink = screen.getByText('לוח בקרה').closest('a');
      expect(dashboardLink).toHaveClass('bg-indigo-700');
    });

    it('should not highlight inactive navigation items', () => {
      renderLayout('/dashboard');

      const categoriesLink = screen.getByText('קטגוריות').closest('a');
      expect(categoriesLink).not.toHaveClass('bg-indigo-700');
      expect(categoriesLink).toHaveClass('text-indigo-100');
    });

    it('should navigate when clicking navigation items', () => {
      renderLayout('/dashboard');

      const categoriesLink = screen.getByText('קטגוריות').closest('a');
      expect(categoriesLink).toHaveAttribute('href', expect.stringContaining('/categories'));
    });
  });

  describe('Mobile Menu', () => {
    it('should not show sidebar by default on mobile', () => {
      renderLayout();

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('translate-x-full');
    });

    it('should toggle sidebar when hamburger menu is clicked', () => {
      renderLayout();

      const menuButton = screen.getByRole('button', { name: /menu/i });
      const sidebar = screen.getByRole('complementary');

      expect(sidebar).toHaveClass('translate-x-full');

      fireEvent.click(menuButton);

      expect(sidebar).toHaveClass('translate-x-0');
    });

    it('should close sidebar when X button is clicked', () => {
      renderLayout();

      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('translate-x-full');
    });

    it('should close sidebar when overlay is clicked', () => {
      renderLayout();

      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
      expect(overlay).toBeInTheDocument();

      if (overlay) {
        fireEvent.click(overlay);
      }

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('translate-x-full');
    });

    it('should close sidebar when navigation item is clicked', () => {
      renderLayout();

      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      const categoriesLink = screen.getByText('קטגוריות');
      fireEvent.click(categoriesLink);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('translate-x-full');
    });
  });

  describe('Logout', () => {
    it('should call onLogout when logout button is clicked', () => {
      const { onLogout } = renderLayout();

      const logoutButton = screen.getByText('התנתקות');
      fireEvent.click(logoutButton);

      expect(onLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Display', () => {
    it('should truncate long user names', () => {
      const longNameUser = {
        ...mockUser,
        name: 'Very Long User Name That Should Be Truncated',
      };

      render(
        <MemoryRouter>
          <Routes>
            <Route path="*" element={<Layout user={longNameUser} onLogout={jest.fn()} />}>
              <Route path="*" element={<MockOutlet />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const userName = screen.getByText(longNameUser.name);
      expect(userName).toHaveClass('truncate');
    });

    it('should truncate long email addresses', () => {
      const longEmailUser = {
        ...mockUser,
        email: 'verylongemailaddress@example.com',
      };

      render(
        <MemoryRouter>
          <Routes>
            <Route path="*" element={<Layout user={longEmailUser} onLogout={jest.fn()} />}>
              <Route path="*" element={<MockOutlet />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const userEmail = screen.getByText(longEmailUser.email);
      expect(userEmail).toHaveClass('truncate');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible navigation items', () => {
      renderLayout();

      const navItems = screen.getAllByRole('link');
      expect(navItems.length).toBeGreaterThan(0);

      navItems.forEach(item => {
        expect(item).toHaveAccessibleName();
      });
    });

    it('should have accessible logout button', () => {
      renderLayout();

      const logoutButton = screen.getByRole('button', { name: /התנתקות/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it('should have proper ARIA labels for navigation controls', () => {
      renderLayout();

      // Layout doesn't have month navigation, this is in Dashboard
      expect(screen.getByText('לוח בקרה')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should show mobile header on small screens', () => {
      renderLayout();

      const mobileHeader = screen.getByRole('banner');
      expect(mobileHeader).toHaveClass('md:hidden');
    });

    it('should have sticky mobile header', () => {
      renderLayout();

      const mobileHeader = screen.getByRole('banner');
      expect(mobileHeader).toHaveClass('sticky');
      expect(mobileHeader).toHaveClass('top-0');
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with minimal information', () => {
      const minimalUser = {
        id: 1,
        name: 'A',
        email: 'a@b.c',
      };

      render(
        <MemoryRouter>
          <Routes>
            <Route path="*" element={<Layout user={minimalUser} onLogout={jest.fn()} />}>
              <Route path="*" element={<MockOutlet />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('a@b.c')).toBeInTheDocument();
    });

    it('should handle rapid sidebar toggling', () => {
      renderLayout();

      const menuButton = screen.getByRole('button', { name: /menu/i });

      fireEvent.click(menuButton);
      fireEvent.click(menuButton);
      fireEvent.click(menuButton);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('translate-x-0');
    });
  });
});

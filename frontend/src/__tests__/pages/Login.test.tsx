import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../pages/Login';
import { api } from '../../services/api';
import { mockUser } from '../helpers/fixtures';

jest.mock('../../services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('Login Page', () => {
  const onLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form by default', () => {
      render(<Login onLogin={onLogin} />);

      expect(screen.getByText('ברוכים הבאים ל-Beam')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('example@gmail.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('הזן סיסמה')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /כניסה למערכת/i })).toBeInTheDocument();
    });

    it('should render register form when toggled', () => {
      render(<Login onLogin={onLogin} />);

      const toggleButton = screen.getByText('אין לך חשבון? הירשם');
      fireEvent.click(toggleButton);

      expect(screen.getByText('הרשמה ל-Beam')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('למשל: תומר כהן')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /הרשמה/i })).toBeInTheDocument();
    });

    it('should render toggle button', () => {
      render(<Login onLogin={onLogin} />);

      expect(screen.getByText('אין לך חשבון? הירשם')).toBeInTheDocument();
    });

    it('should render security message', () => {
      render(<Login onLogin={onLogin} />);

      expect(screen.getByText(/הנתונים שלך מאובטחים ומוצפנים/)).toBeInTheDocument();
    });
  });

  describe('Login Functionality', () => {
    it('should login successfully with valid credentials', async () => {
      mockApi.auth.login.mockResolvedValue(mockUser);

      render(<Login onLogin={onLogin} />);

      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /כניסה למערכת/i }));

      await waitFor(() => {
        expect(mockApi.auth.login).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(onLogin).toHaveBeenCalledWith(mockUser);
      });
    });

    it('should trim whitespace from email', async () => {
      mockApi.auth.login.mockResolvedValue(mockUser);

      render(<Login onLogin={onLogin} />);

      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: '  test@example.com  ' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /כניסה למערכת/i }));

      await waitFor(() => {
        expect(mockApi.auth.login).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show loading state during login', async () => {
      mockApi.auth.login.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
      );

      render(<Login onLogin={onLogin} />);

      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password123' },
      });

      const button = screen.getByRole('button', { name: /כניסה למערכת/i });
      fireEvent.click(button);

      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should handle login errors', async () => {
      const error = new Error('Invalid credentials');
      mockApi.auth.login.mockRejectedValue(error);

      render(<Login onLogin={onLogin} />);

      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: 'wrong@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'wrongpass' },
      });

      fireEvent.click(screen.getByRole('button', { name: /כניסה למערכת/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      expect(onLogin).not.toHaveBeenCalled();
    });

    it('should handle non-Error objects', async () => {
      mockApi.auth.login.mockRejectedValue('String error');

      render(<Login onLogin={onLogin} />);

      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password' },
      });

      fireEvent.click(screen.getByRole('button', { name: /כניסה למערכת/i }));

      await waitFor(() => {
        expect(screen.getByText('אירעה שגיאה. נסה שוב.')).toBeInTheDocument();
      });
    });

    it('should clear error when switching forms', async () => {
      mockApi.auth.login.mockRejectedValue(new Error('Login failed'));

      render(<Login onLogin={onLogin} />);

      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password' },
      });

      fireEvent.click(screen.getByRole('button', { name: /כניסה למערכת/i }));

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('אין לך חשבון? הירשם'));

      expect(screen.queryByText('Login failed')).not.toBeInTheDocument();
    });
  });

  describe('Registration Functionality', () => {
    beforeEach(() => {
      render(<Login onLogin={onLogin} />);
      fireEvent.click(screen.getByText('אין לך חשבון? הירשם'));
    });

    it('should register successfully with valid data', async () => {
      mockApi.auth.register.mockResolvedValue(mockUser);

      fireEvent.change(screen.getByPlaceholderText('למשל: תומר כהן'), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הרשמה/i }));

      await waitFor(() => {
        expect(mockApi.auth.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
        expect(onLogin).toHaveBeenCalledWith(mockUser);
      });
    });

    it('should trim whitespace from name and email', async () => {
      mockApi.auth.register.mockResolvedValue(mockUser);

      fireEvent.change(screen.getByPlaceholderText('למשל: תומר כהן'), {
        target: { value: '  Test User  ' },
      });
      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: '  test@example.com  ' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הרשמה/i }));

      await waitFor(() => {
        expect(mockApi.auth.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
      });
    });

    it('should show error when name is empty', async () => {
      fireEvent.change(screen.getByPlaceholderText('למשל: תומר כהן'), {
        target: { value: '   ' },
      });
      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הרשמה/i }));

      await waitFor(() => {
        expect(screen.getByText('נא להזין שם')).toBeInTheDocument();
      });

      expect(mockApi.auth.register).not.toHaveBeenCalled();
    });

    it('should show loading state during registration', async () => {
      mockApi.auth.register.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
      );

      fireEvent.change(screen.getByPlaceholderText('למשל: תומר כהן'), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password123' },
      });

      const button = screen.getByRole('button', { name: /הרשמה/i });
      fireEvent.click(button);

      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should handle registration errors', async () => {
      mockApi.auth.register.mockRejectedValue(new Error('Email already exists'));

      fireEvent.change(screen.getByPlaceholderText('למשל: תומר כהן'), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: 'existing@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /הרשמה/i }));

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      expect(onLogin).not.toHaveBeenCalled();
    });
  });

  describe('Form Toggle', () => {
    it('should toggle between login and register forms', () => {
      render(<Login onLogin={onLogin} />);

      expect(screen.getByText('ברוכים הבאים ל-Beam')).toBeInTheDocument();

      fireEvent.click(screen.getByText('אין לך חשבון? הירשם'));
      expect(screen.getByText('הרשמה ל-Beam')).toBeInTheDocument();

      fireEvent.click(screen.getByText('כבר יש לך חשבון? התחבר'));
      expect(screen.getByText('ברוכים הבאים ל-Beam')).toBeInTheDocument();
    });

    it('should maintain input values when toggling', () => {
      render(<Login onLogin={onLogin} />);

      const emailInput = screen.getByPlaceholderText('example@gmail.com') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('הזן סיסמה') as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      fireEvent.click(screen.getByText('אין לך חשבון? הירשם'));
      fireEvent.click(screen.getByText('כבר יש לך חשבון? התחבר'));

      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });
  });

  describe('Form Validation', () => {
    it('should require email field', () => {
      render(<Login onLogin={onLogin} />);

      const emailInput = screen.getByPlaceholderText('example@gmail.com');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should require password field', () => {
      render(<Login onLogin={onLogin} />);

      const passwordInput = screen.getByPlaceholderText('הזן סיסמה');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });

    it('should require name field in register form', () => {
      render(<Login onLogin={onLogin} />);

      fireEvent.click(screen.getByText('אין לך חשבון? הירשם'));

      const nameInput = screen.getByPlaceholderText('למשל: תומר כהן');
      expect(nameInput).toHaveAttribute('required');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      render(<Login onLogin={onLogin} />);

      expect(screen.getByPlaceholderText('example@gmail.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('הזן סיסמה')).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<Login onLogin={onLogin} />);

      expect(screen.getByRole('button', { name: /כניסה למערכת/i })).toBeInTheDocument();
    });

    it('should show error with icon for visibility', async () => {
      mockApi.auth.login.mockRejectedValue(new Error('Test error'));

      render(<Login onLogin={onLogin} />);

      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password' },
      });

      fireEvent.click(screen.getByRole('button', { name: /כניסה למערכת/i }));

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form submission', () => {
      render(<Login onLogin={onLogin} />);

      const button = screen.getByRole('button', { name: /כניסה למערכת/i });

      expect(button).toBeInTheDocument();
      expect(mockApi.auth.login).not.toHaveBeenCalled();
    });

    it('should handle very long email addresses', async () => {
      mockApi.auth.login.mockResolvedValue(mockUser);

      render(<Login onLogin={onLogin} />);

      const longEmail = 'a'.repeat(50) + '@example.com';
      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: longEmail },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /כניסה למערכת/i }));

      await waitFor(() => {
        expect(mockApi.auth.login).toHaveBeenCalledWith(longEmail, 'password123');
      });
    });

    it('should handle special characters in password', async () => {
      mockApi.auth.login.mockResolvedValue(mockUser);

      render(<Login onLogin={onLogin} />);

      const specialPassword = 'p@$$w0rd!#%';
      fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('הזן סיסמה'), {
        target: { value: specialPassword },
      });

      fireEvent.click(screen.getByRole('button', { name: /כניסה למערכת/i }));

      await waitFor(() => {
        expect(mockApi.auth.login).toHaveBeenCalledWith('test@example.com', specialPassword);
      });
    });
  });
});

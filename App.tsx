
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CategoriesPage from './pages/Categories';
import BudgetPlanning from './pages/BudgetPlanning';
import Transactions from './pages/Transactions';
import Savings from './pages/Savings';
import Login from './pages/Login';
import { Category, Transaction, BudgetPlan, SavingsAccount, User } from './types';
import { DEFAULT_CATEGORIES } from './constants';

// Highly robust utility for safe localStorage access to prevent SecurityError
const getLocalStorage = () => {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null) {
      // Some browsers throw when just trying to access the property, 
      // some throw when calling methods. We check both.
      const testKey = '__bt_storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch (e) {
    console.warn("Storage access denied by security policy");
  }
  return null;
};

const storage = getLocalStorage();

const safeStorage = {
  getItem: (key: string) => {
    try {
      return storage ? storage.getItem(key) : null;
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (storage) storage.setItem(key, value);
    } catch (e) {
      // Silently fail (quota exceeded or blocked)
    }
  },
  removeItem: (key: string) => {
    try {
      if (storage) storage.removeItem(key);
    } catch (e) {
      // Silently fail
    }
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = safeStorage.getItem('bt_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = safeStorage.getItem('bt_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = safeStorage.getItem('bt_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [budgets, setBudgets] = useState<BudgetPlan[]>(() => {
    try {
      const saved = safeStorage.getItem('bt_budgets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savings, setSavings] = useState<SavingsAccount[]>(() => {
    try {
      const saved = safeStorage.getItem('bt_savings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with localStorage safely
  useEffect(() => {
    try {
      safeStorage.setItem('bt_categories', JSON.stringify(categories));
      safeStorage.setItem('bt_transactions', JSON.stringify(transactions));
      safeStorage.setItem('bt_budgets', JSON.stringify(budgets));
      safeStorage.setItem('bt_savings', JSON.stringify(savings));
      if (user) {
        safeStorage.setItem('bt_user', JSON.stringify(user));
      } else {
        safeStorage.removeItem('bt_user');
      }
    } catch (e) {
      console.error("Failed to sync state to storage:", e);
    }
  }, [categories, transactions, budgets, savings, user]);

  const handleLogin = (userData: User) => setUser(userData);
  const handleLogout = () => setUser(null);

  return (
    <HashRouter>
      <Routes>
        {user ? (
          <>
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route element={<Layout user={user} onLogout={handleLogout} />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={<Dashboard categories={categories} transactions={transactions} budgets={budgets} savings={savings} />}
              />
              <Route
                path="/categories"
                element={<CategoriesPage categories={categories} setCategories={setCategories} />}
              />
              <Route
                path="/budget"
                element={<BudgetPlanning categories={categories} budgets={budgets} setBudgets={setBudgets} />}
              />
              <Route
                path="/transactions"
                element={<Transactions categories={categories} transactions={transactions} setTransactions={setTransactions} />}
              />
              <Route
                path="/savings"
                element={<Savings savings={savings} setSavings={setSavings} />}
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </>
        ) : (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </HashRouter>
  );
};

export default App;

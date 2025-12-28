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
import { api, getAuthToken } from './services/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetPlan[]>([]);
  const [savings, setSavings] = useState<SavingsAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const [categoriesData, transactionsData, budgetsData, savingsData] = await Promise.all([
          api.categories.getAll(),
          api.transactions.getAll(),
          api.budgets.getAll(),
          api.savings.getAll(),
        ]);

        setCategories(categoriesData);
        setTransactions(transactionsData);
        setBudgets(budgetsData);
        setSavings(savingsData);
        setUser({ id: 0, name: '', email: '' });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        api.auth.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setCategories([]);
    setTransactions([]);
    setBudgets([]);
    setSavings([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

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

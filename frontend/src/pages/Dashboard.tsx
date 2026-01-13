
import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Category, Transaction, BudgetPlan, SavingsAccount } from '../types';

interface DashboardProps {
  categories: Category[];
  transactions: Transaction[];
  budgets: BudgetPlan[];
  savings: SavingsAccount[];
}

const Dashboard: React.FC<DashboardProps> = ({ categories, transactions, budgets, savings }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentMonth = selectedMonth;
  const currentYear = selectedYear;

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
  };

  const isCurrentMonth = selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear();

  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const stats = useMemo(() => {
    const activeBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);
    const activeTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
    });

    const totalBudgeted = activeBudgets.reduce((acc, b) => acc + b.plannedAmount, 0);
    const totalSpent = activeTransactions.reduce((acc, t) => acc + t.amount, 0);
    const totalSavings = savings.reduce((acc, s) => acc + s.balance, 0);
    const availableToSpend = totalBudgeted - totalSpent; // Can be negative
    const percentSpent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return { totalBudgeted, totalSpent, availableToSpend, totalSavings, percentSpent };
  }, [budgets, transactions, savings, currentMonth, currentYear]);

  const categoryData = useMemo(() => {
    const parentCategories = categories.filter(c => c.isActive && c.parentCategoryId === null);

    return parentCategories.map(cat => {
      const budgeted = budgets.find(
        b => b.categoryId === cat.id &&
             b.month === currentMonth &&
             b.year === currentYear
      )?.plannedAmount || 0;

      const subcategoryIds = categories
        .filter(c => c.parentCategoryId === cat.id)
        .map(c => c.id);

      const categoryIds = [cat.id, ...subcategoryIds];
      const spent = transactions
        .filter(t => {
          const d = new Date(t.date);
          return categoryIds.includes(t.categoryId) &&
                 (d.getMonth() + 1) === currentMonth &&
                 d.getFullYear() === currentYear;
        })
        .reduce((acc, t) => acc + t.amount, 0);

      return {
        name: cat.name,
        budgeted,
        spent,
        color: cat.color
      };
    })
    .filter(item => item.budgeted > 0 || item.spent > 0);
  }, [categories, budgets, transactions, currentMonth, currentYear]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">לוח בקרה</h2>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="חודש קודם"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
            <div className="text-center min-w-[180px]">
              <p className="text-lg font-bold text-slate-700">
                {monthNames[currentMonth - 1]} {currentYear}
              </p>
              {!isCurrentMonth && (
                <button
                  onClick={goToCurrentMonth}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  חזור לחודש הנוכחי
                </button>
              )}
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="חודש הבא"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="תקציב מתוכנן"
          amount={stats.totalBudgeted}
          icon={<DollarSign className="text-blue-600" />}
          color="blue"
        />
        <SummaryCard
          title="הוצאות בפועל"
          amount={stats.totalSpent}
          icon={<TrendingDown className="text-rose-600" />}
          color="rose"
          subtitle={`${stats.percentSpent.toFixed(1)}% מהתקציב`}
        />
        <SummaryCard
          title="נותר לבזבוז"
          amount={stats.availableToSpend}
          icon={<TrendingUp className="text-emerald-600" />}
          color="emerald"
          subtitle="ללא חריגה"
        />
        <SummaryCard
          title="סה״כ חסכונות"
          amount={stats.totalSavings}
          icon={<ShieldCheck className="text-amber-600" />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Charts Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold mb-6">הוצאות לעומת תקציב לפי קטגוריה</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="budgeted" name="מתוכנן" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} />
                  <Bar dataKey="spent" name="בפועל" radius={[0, 4, 4, 0]} barSize={20}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.spent > entry.budgeted ? '#f43f5e' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold mb-6">הוצאות אחרונות</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 font-semibold text-slate-500">תיאור</th>
                    <th className="pb-3 font-semibold text-slate-500">קטגוריה</th>
                    <th className="pb-3 font-semibold text-slate-500">תאריך</th>
                    <th className="pb-3 font-semibold text-slate-500">סכום</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.slice(-5).reverse().map(t => {
                    const cat = categories.find(c => c.id === t.categoryId);
                    const parentCat = cat?.parentCategoryId
                      ? categories.find(c => c.id === cat.parentCategoryId)
                      : null;
                    const categoryDisplay = parentCat ? `${parentCat.name} > ${cat?.name}` : cat?.name;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 font-medium">{t.description}</td>
                        <td className="py-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-100" style={{ color: cat?.color }}>
                            {categoryDisplay}
                          </span>
                        </td>
                        <td className="py-4 text-slate-400 text-sm">{t.date}</td>
                        <td className="py-4 font-bold text-slate-900">₪{t.amount.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: 'blue' | 'rose' | 'emerald' | 'amber';
  subtitle?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100',
    rose: 'bg-rose-50 border-rose-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    amber: 'bg-amber-50 border-amber-100',
  };

  return (
    <div className={`p-5 rounded-3xl border ${colorClasses[color]} flex items-start gap-4 transition-transform hover:scale-[1.02]`}>
      <div className="bg-white p-3 rounded-2xl shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-black text-slate-900 leading-tight">₪{amount.toLocaleString()}</p>
        {subtitle && <p className="text-[10px] mt-1 font-bold text-slate-400 uppercase tracking-wider">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Dashboard;

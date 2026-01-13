
import React, { useState } from 'react';
import { Save, History, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { Category, BudgetPlan } from '../types';
import { getIcon } from '../constants';
import { api } from '../services/api';

interface BudgetPlanningProps {
  categories: Category[];
  budgets: BudgetPlan[];
  setBudgets: React.Dispatch<React.SetStateAction<BudgetPlan[]>>;
}

const BudgetPlanning: React.FC<BudgetPlanningProps> = ({ categories, budgets, setBudgets }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [localAmounts, setLocalAmounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parentCategories = categories.filter(c => c.isActive && c.parentCategoryId === null);

  React.useEffect(() => {
    const existing = budgets.filter(b => b.month === month && b.year === year);
    const amounts: Record<number, number> = {};
    existing.forEach(b => {
      amounts[b.categoryId] = b.plannedAmount;
    });
    setLocalAmounts(amounts);
  }, [month, year, budgets]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedBudgets: BudgetPlan[] = [];

      for (const [catId, amount] of Object.entries(localAmounts)) {
        if ((amount as number) > 0) {
          const budget = await api.budgets.create(
            parseInt(catId),
            month,
            year,
            amount as number
          );
          updatedBudgets.push(budget);
        }
      }

      const newBudgets = [
        ...budgets.filter(b => !(b.month === month && b.year === year)),
        ...updatedBudgets
      ];
      setBudgets(newBudgets);
      setSuccess('התקציב נשמר בהצלחה!');
    } catch (err) {
      setError('שגיאה בשמירת התקציב');
      console.error('Failed to save budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fix: Explicitly cast Object.values to number[] to resolve 'unknown' addition error in reduce (Line 45)
  const total = (Object.values(localAmounts) as number[]).reduce((acc, val) => acc + val, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">תכנון תקציב</h2>
          <p className="text-slate-500">קבעו יעדים חודשיים לכל קטגוריה</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200">
          <button onClick={() => setMonth(m => m === 1 ? 12 : m - 1)} className="p-2 hover:bg-slate-100 rounded-xl">
            <ChevronRight size={20} />
          </button>
          <span className="font-bold min-w-[100px] text-center">{month} / {year}</span>
          <button onClick={() => setMonth(m => m === 12 ? 1 : m + 1)} className="p-2 hover:bg-slate-100 rounded-xl">
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2 text-green-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-700">פירוט תקציב</h3>
          <div className="text-left">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">סה״כ מתוכנן</p>
            <p className="text-2xl font-black text-indigo-600">₪{total.toLocaleString()}</p>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {parentCategories.map(cat => (
            <div key={cat.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/30 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  {getIcon(cat.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">{cat.name}</h4>
                    {categories.filter(c => c.parentCategoryId === cat.id).length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold">
                        +{categories.filter(c => c.parentCategoryId === cat.id).length} תתי קטגוריות
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">הגדירו תקציב ליעד זה</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-bold">₪</span>
                <input
                  type="number"
                  value={localAmounts[cat.id] || ''}
                  onChange={(e) => setLocalAmounts({...localAmounts, [cat.id]: parseFloat(e.target.value) || 0})}
                  className="w-32 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save size={20} /> שמירת תקציב חודשי
              </>
            )}
          </button>
          <button
            disabled={loading}
            className="px-6 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <History size={20} /> שכפול מחודש קודם
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanning;

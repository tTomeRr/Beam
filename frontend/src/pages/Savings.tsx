
import React, { useState } from 'react';
import { PiggyBank, Plus, TrendingUp, ShieldCheck, Trash2, Edit, AlertCircle } from 'lucide-react';
import { SavingsAccount } from '../types';
import { api } from '../services/api';

interface SavingsProps {
  savings: SavingsAccount[];
  setSavings: React.Dispatch<React.SetStateAction<SavingsAccount[]>>;
}

const Savings: React.FC<SavingsProps> = ({ savings, setSavings }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', balance: '', type: 'חיסכון' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addAccount = async () => {
    if (!newAcc.name || !newAcc.balance) return;

    setLoading(true);
    setError('');

    try {
      const acc = await api.savings.create(
        newAcc.name,
        newAcc.type,
        parseFloat(newAcc.balance),
        'ILS'
      );
      setSavings([...savings, acc]);
      setNewAcc({ name: '', balance: '', type: 'חיסכון' });
      setIsAdding(false);
    } catch (err) {
      setError('שגיאה בהוספת חשבון');
      console.error('Failed to add savings account:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAcc = async (id: number) => {
    try {
      await api.savings.delete(id);
      setSavings(savings.filter(s => s.id !== id));
    } catch (err) {
      setError('שגיאה במחיקת חשבון');
      console.error('Failed to delete savings account:', err);
    }
  };

  const total = savings.reduce((acc, s) => acc + s.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">חיסכונות</h2>
          <p className="text-slate-500">עקבו אחר הנכסים והחסכונות שלכם</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100"
        >
          <Plus size={20} /> חשבון חדש
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-indigo-300 text-sm font-bold uppercase tracking-widest mb-2">סה״כ הון אישי</p>
              <h3 className="text-5xl font-black mb-6">₪{total.toLocaleString()}</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-sm">צמיחה של 2.4% מהחודש שעבר</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-sm">כל החשבונות מאובטחים</span>
                </div>
              </div>
            </div>
            <div className="absolute -left-20 -top-20 bg-indigo-800 w-64 h-64 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isAdding && (
            <div className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-lg animate-in zoom-in-95 duration-200">
              <h4 className="font-black text-slate-900 mb-6">פרטי חשבון חדש</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="שם החשבון (למשל: קרן השתלמות)"
                  value={newAcc.name}
                  onChange={(e) => setNewAcc({...newAcc, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="יתרה נוכחית"
                  value={newAcc.balance}
                  onChange={(e) => setNewAcc({...newAcc, balance: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
                <select
                  value={newAcc.type}
                  onChange={(e) => setNewAcc({...newAcc, type: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>חיסכון</option>
                  <option>פנסיה</option>
                  <option>פיקדון</option>
                  <option>מזומן</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addAccount}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'הוספה'
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setError('');
                  }}
                  disabled={loading}
                  className="px-6 py-3 border border-slate-200 rounded-2xl text-slate-500 font-bold disabled:opacity-50"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savings.map(acc => (
              <div key={acc.id} className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-md transition-all group relative">
                <div className="flex items-start justify-between">
                  <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                    <PiggyBank size={24} />
                  </div>
                  <button
                    onClick={() => deleteAcc(acc.id)}
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="mt-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{acc.type}</p>
                  <h5 className="text-xl font-black text-slate-900 mt-1">{acc.name}</h5>
                  <p className="text-2xl font-black text-indigo-600 mt-4">₪{acc.balance.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Savings;

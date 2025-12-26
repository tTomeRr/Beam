
import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Trash2, Calendar, FileText, CreditCard } from 'lucide-react';
import { Category, Transaction } from '../types';

interface TransactionsProps {
  categories: Category[];
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const Transactions: React.FC<TransactionsProps> = ({ categories, transactions, setTransactions }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [newTx, setNewTx] = useState({ 
    categoryId: categories[0]?.id || 0, 
    amount: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0] 
  });

  const addTransaction = () => {
    if (!newTx.amount || !newTx.description) return;
    const tx: Transaction = {
      id: Date.now(),
      categoryId: newTx.categoryId,
      amount: parseFloat(newTx.amount),
      description: newTx.description,
      date: newTx.date
    };
    setTransactions([...transactions, tx]);
    setNewTx({ ...newTx, amount: '', description: '' });
    setIsAdding(false);
  };

  const deleteTx = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const filtered = useMemo(() => {
    return transactions
      .filter(t => t.description.toLowerCase().includes(filterText.toLowerCase()))
      .reverse();
  }, [transactions, filterText]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">הוצאות</h2>
          <p className="text-slate-500">עקבו אחר כל רכישה שביצעתם</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} /> הוצאה חדשה
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="text-indigo-600" /> הוספת תנועה
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase">תיאור</label>
              <input 
                type="text" 
                value={newTx.description}
                onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                placeholder="למשל: סופר פארם"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase">סכום</label>
              <input 
                type="number" 
                value={newTx.amount}
                onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                placeholder="₪ 0.00"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase">קטגוריה</label>
              <select 
                value={newTx.categoryId}
                onChange={(e) => setNewTx({...newTx, categoryId: parseInt(e.target.value)})}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase">תאריך</label>
              <input 
                type="date" 
                value={newTx.date}
                onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={addTransaction} className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-black">הוספה לרשימה</button>
            <button onClick={() => setIsAdding(false)} className="px-8 py-3.5 border border-slate-200 rounded-2xl font-bold text-slate-500">ביטול</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="חיפוש לפי תיאור..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pr-12 pl-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={18} /> פילטרים
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">הוצאה</th>
                <th className="px-6 py-4">קטגוריה</th>
                <th className="px-6 py-4">תאריך</th>
                <th className="px-6 py-4">סכום</th>
                <th className="px-6 py-4 text-left">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(tx => {
                const cat = categories.find(c => c.id === tx.categoryId);
                return (
                  <tr key={tx.id} className="group hover:bg-indigo-50/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                          <FileText size={18} />
                        </div>
                        <span className="font-bold text-slate-700">{tx.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs px-3 py-1 rounded-full font-bold border" style={{ borderColor: cat?.color + '40', backgroundColor: cat?.color + '10', color: cat?.color }}>
                        {cat?.name}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar size={14} /> {tx.date}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-black text-slate-900">₪{tx.amount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-left">
                      <button 
                        onClick={() => deleteTx(tx.id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-medium">
                    לא נמצאו הוצאות התואמות את החיפוש
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;

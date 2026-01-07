
import React, { useState } from 'react';
import { Plus, Check, X, AlertCircle } from 'lucide-react';
import { Category } from '../types';
import { getIcon, AVAILABLE_ICONS } from '../constants';
import { api } from '../services/api';

interface CategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoriesPage: React.FC<CategoriesProps> = ({ categories, setCategories }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', color: '#6366f1', icon: 'Briefcase' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addCategory = async () => {
    if (!newCat.name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const category = await api.categories.create(
        newCat.name.trim(),
        newCat.icon,
        newCat.color
      );
      setCategories([...categories, category]);
      setNewCat({ name: '', color: '#6366f1', icon: 'Briefcase' });
      setIsAdding(false);
      setShowIconPicker(false);
    } catch (err) {
      setError('שגיאה בהוספת קטגוריה');
      console.error('Failed to add category:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: number) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    try {
      const updated = await api.categories.update(id, { isActive: !category.isActive });
      setCategories(categories.map(c => c.id === id ? updated : c));
    } catch (err) {
      setError('שגיאה בעדכון קטגוריה');
      console.error('Failed to update category:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">קטגוריות</h2>
          <p className="text-slate-500">נהלו את סוגי ההוצאות שלכם</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} />
          חדש
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold mb-4">הוספת קטגוריה חדשה</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">שם הקטגוריה</label>
              <input
                type="text"
                value={newCat.name}
                onChange={(e) => setNewCat({...newCat, name: e.target.value})}
                placeholder="לדוגמה: מנויים"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">בחר אייקון</label>
              <div className="relative">
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: newCat.color }}
                  >
                    {getIcon(newCat.icon, 20)}
                  </div>
                  <span className="text-slate-600">
                    {AVAILABLE_ICONS.find(i => i.name === newCat.icon)?.label || 'בחר אייקון'}
                  </span>
                </button>

                {showIconPicker && (
                  <div className="absolute z-10 mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-4 gap-2">
                      {AVAILABLE_ICONS.map((icon) => (
                        <button
                          key={icon.name}
                          onClick={() => {
                            setNewCat({...newCat, icon: icon.name});
                            setShowIconPicker(false);
                          }}
                          className={`p-3 rounded-xl hover:bg-indigo-50 transition-all flex flex-col items-center gap-1 ${
                            newCat.icon === icon.name ? 'bg-indigo-100 ring-2 ring-indigo-500' : ''
                          }`}
                          title={icon.label}
                        >
                          <div className="text-slate-700">
                            {getIcon(icon.name, 24)}
                          </div>
                          <span className="text-[9px] text-slate-500">{icon.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">צבע</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newCat.color}
                  onChange={(e) => setNewCat({...newCat, color: e.target.value})}
                  className="h-12 w-12 rounded-xl cursor-pointer border-none"
                />
                <span className="text-xs text-slate-400 font-mono">{newCat.color}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={addCategory}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Check size={20} /> שמירה
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setShowIconPicker(false);
                setError('');
              }}
              disabled={loading}
              className="px-6 py-3 border border-slate-200 rounded-2xl font-bold text-slate-500 disabled:opacity-50"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: cat.color }}
              >
                {getIcon(cat.icon)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{cat.name}</h4>
                <p className={`text-[10px] font-bold ${cat.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {cat.isActive ? 'פעיל' : 'לא פעיל'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => toggleActive(cat.id)}
                className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl"
                title={cat.isActive ? "השבת" : "הפעל"}
              >
                {cat.isActive ? <X size={18} /> : <Check size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;

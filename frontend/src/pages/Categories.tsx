
import React, { useState } from 'react';
import { Plus, Check, X, AlertCircle, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Category } from '../types';
import { getIcon, AVAILABLE_ICONS, buildCategoryTree } from '../constants';
import { api } from '../services/api';

interface CategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoriesPage: React.FC<CategoriesProps> = ({ categories, setCategories }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [addingSubcategoryFor, setAddingSubcategoryFor] = useState<number | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', color: '#6366f1', icon: 'Briefcase', parentCategoryId: null as number | null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const addCategory = async () => {
    if (!newCat.name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const category = await api.categories.create(
        newCat.name.trim(),
        newCat.icon,
        newCat.color,
        newCat.parentCategoryId || undefined
      );
      setCategories([...categories, category]);
      setNewCat({ name: '', color: '#6366f1', icon: 'Briefcase', parentCategoryId: null });
      setIsAdding(false);
      setAddingSubcategoryFor(null);
      setShowIconPicker(false);
    } catch (err) {
      setError('שגיאה בהוספת קטגוריה');
      console.error('Failed to add category:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const startAddingSubcategory = (parentId: number, parentColor: string, parentIcon: string) => {
    setAddingSubcategoryFor(parentId);
    setNewCat({ name: '', color: parentColor, icon: parentIcon, parentCategoryId: parentId });
    setIsAdding(true);
    setExpandedCategories(new Set([...expandedCategories, parentId]));
  };

  const updateCategory = async (id: number, updates: Partial<Category>) => {
    try {
      const updated = await api.categories.update(id, updates);
      setCategories(categories.map(c => c.id === id ? updated : c));
    } catch (err) {
      setError('שגיאה בעדכון קטגוריה');
      console.error('Failed to update category:', err);
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

  const tree = buildCategoryTree(categories);
  const parentCategories = categories.filter(c => c.parentCategoryId === null && c.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">קטגוריות</h2>
          <p className="text-slate-500">נהלו את סוגי ההוצאות שלכם</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setAddingSubcategoryFor(null);
            setNewCat({ name: '', color: '#6366f1', icon: 'Briefcase', parentCategoryId: null });
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} />
          קטגוריה חדשה
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
          <h3 className="text-xl font-bold mb-4">
            {addingSubcategoryFor ? 'הוספת תת-קטגוריה' : 'הוספת קטגוריה חדשה'}
          </h3>
          {addingSubcategoryFor && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
              <span className="text-sm text-indigo-700 font-medium">
                תחת: {categories.find(c => c.id === addingSubcategoryFor)?.name}
              </span>
            </div>
          )}
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
                setAddingSubcategoryFor(null);
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

      <div className="space-y-4">
        {tree.map(parent => (
          <div key={parent.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: parent.color }}
                >
                  {getIcon(parent.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">{parent.name}</h4>
                    {parent.isDefault && (
                      <Lock size={14} className="text-slate-400" title="קטגוריה ברירת מחדל" />
                    )}
                    {parent.subcategories.length > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                        {parent.subcategories.length}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] font-bold ${parent.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {parent.isActive ? 'פעיל' : 'לא פעיל'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startAddingSubcategory(parent.id, parent.color, parent.icon)}
                  className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl"
                  title="הוסף תת-קטגוריה"
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => toggleActive(parent.id)}
                  className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl"
                  title={parent.isActive ? "השבת" : "הפעל"}
                >
                  {parent.isActive ? <X size={18} /> : <Check size={18} />}
                </button>
                {parent.subcategories.length > 0 && (
                  <button
                    onClick={() => toggleExpanded(parent.id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl"
                    title={expandedCategories.has(parent.id) ? "סגור" : "פתח"}
                  >
                    {expandedCategories.has(parent.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                )}
              </div>
            </div>

            {expandedCategories.has(parent.id) && parent.subcategories.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/30">
                {parent.subcategories.map(sub => (
                  <div key={sub.id} className="p-4 pr-16 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: sub.color }}
                      >
                        {getIcon(sub.icon, 16)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-slate-700">{sub.name}</h5>
                          {sub.isDefault && (
                            <Lock size={12} className="text-slate-400" title="קטגוריה ברירת מחדל" />
                          )}
                        </div>
                        <p className={`text-[9px] font-bold ${sub.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {sub.isActive ? 'פעיל' : 'לא פעיל'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleActive(sub.id)}
                      className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl"
                      title={sub.isActive ? "השבת" : "הפעל"}
                    >
                      {sub.isActive ? <X size={16} /> : <Check size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;

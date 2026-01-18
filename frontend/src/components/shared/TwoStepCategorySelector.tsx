
import React, { useState, useEffect, useMemo } from 'react';
import { Category } from '../../types';
import { getIcon, buildCategoryTree } from '../../constants';

interface TwoStepCategorySelectorProps {
  categories: Category[];
  value: number;
  onChange: (id: number) => void;
  showInactive?: boolean;
}

const TwoStepCategorySelector: React.FC<TwoStepCategorySelectorProps> = ({
  categories,
  value,
  onChange,
  showInactive = false,
}) => {
  const filteredCategories = showInactive
    ? categories
    : categories.filter(c => c.isActive);

  const tree = useMemo(() => buildCategoryTree(filteredCategories), [filteredCategories]);

  const selectedCategory = categories.find(c => c.id === value);
  const initialParentId = selectedCategory?.parentCategoryId || selectedCategory?.id || (tree[0]?.id ?? 0);

  const [selectedParentId, setSelectedParentId] = useState<number>(initialParentId);

  const selectedParent = tree.find(p => p.id === selectedParentId);
  const subcategories = selectedParent?.subcategories || [];

  useEffect(() => {
    if (selectedCategory) {
      const parentId = selectedCategory.parentCategoryId || selectedCategory.id;
      setSelectedParentId(parentId);
    }
  }, [selectedCategory]);

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParentId = parseInt(e.target.value, 10);
    setSelectedParentId(newParentId);

    const newParent = tree.find(p => p.id === newParentId);
    if (!newParent || newParent.subcategories.length === 0) {
      onChange(newParentId);
    } else {
      const activeSubs = newParent.subcategories.filter(s => s.isActive || showInactive);
      if (activeSubs.length > 0) {
        onChange(activeSubs[0].id);
      } else {
        onChange(newParentId);
      }
    }
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = parseInt(e.target.value, 10);
    onChange(subId);
  };

  const parentColor = selectedParent?.color || '#6366f1';

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <div className="relative">
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-white pointer-events-none"
            style={{ backgroundColor: parentColor }}
          >
            {selectedParent && getIcon(selectedParent.icon, 14)}
          </div>
          <select
            value={selectedParentId}
            onChange={handleParentChange}
            className="w-full pr-12 pl-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-700 appearance-none cursor-pointer"
          >
            {tree.map(parent => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1">
        <select
          value={subcategories.length > 0 ? value : ''}
          onChange={handleSubcategoryChange}
          disabled={subcategories.length === 0}
          className={`w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium appearance-none cursor-pointer ${
            subcategories.length === 0 ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-slate-700'
          }`}
        >
          {subcategories.length === 0 ? (
            <option value="">ללא תת-קטגוריה</option>
          ) : (
            subcategories.map(sub => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};

export default TwoStepCategorySelector;


import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Category } from '../../types';
import { getIcon, buildCategoryTree } from '../../constants';

interface CategorySelectorProps {
  categories: Category[];
  value: number;
  onChange: (id: number) => void;
  showInactive?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  value,
  onChange,
  showInactive = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCategories = showInactive
    ? categories
    : categories.filter(c => c.isActive);

  const tree = buildCategoryTree(filteredCategories);

  const selectedCategory = categories.find(c => c.id === value);
  const parentCategory = selectedCategory?.parentCategoryId
    ? categories.find(c => c.id === selectedCategory.parentCategoryId)
    : null;

  const displayText = parentCategory
    ? `${parentCategory.name} > ${selectedCategory?.name}`
    : selectedCategory?.name || 'בחר קטגוריה';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: number) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white flex items-center justify-between"
      >
        <span className="font-medium text-slate-700">{displayText}</span>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-xl max-h-80 overflow-y-auto">
          <div className="py-2">
            {tree.map(parent => (
              <div key={parent.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(parent.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-indigo-50 transition-colors ${
                    value === parent.id ? 'bg-indigo-100' : ''
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: parent.color }}
                  >
                    {getIcon(parent.icon, 16)}
                  </div>
                  <span className="font-bold text-slate-900">{parent.name}</span>
                </button>

                {parent.subcategories.map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSelect(sub.id)}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50 transition-colors pr-12 ${
                      value === sub.id ? 'bg-indigo-100' : ''
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: sub.color }}
                    >
                      {getIcon(sub.icon, 14)}
                    </div>
                    <span className="text-sm text-slate-700">{sub.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;

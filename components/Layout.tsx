
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Tags, 
  Wallet, 
  ArrowLeftRight, 
  PiggyBank, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'לוח בקרה', path: '/dashboard', icon: LayoutDashboard },
    { name: 'קטגוריות', path: '/categories', icon: Tags },
    { name: 'תכנון תקציב', path: '/budget', icon: Wallet },
    { name: 'הוצאות', path: '/transactions', icon: ArrowLeftRight },
    { name: 'חיסכונות', path: '/savings', icon: PiggyBank },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold text-indigo-600">Beam</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-black tracking-tight mb-1">Beam</h1>
            <p className="text-indigo-300 text-xs">Smart Budget Tracker</p>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                    ${isActive ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-800'}
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-indigo-800">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="bg-indigo-700 p-2 rounded-full">
                <UserIcon size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-[10px] text-indigo-300 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-indigo-100 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">התנתקות</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

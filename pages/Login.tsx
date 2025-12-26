
import React, { useState } from 'react';
import { LogIn, User as UserIcon, Mail } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      return;
    }

    onLogin({
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900 px-4">
      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-8 mx-auto shadow-xl shadow-indigo-100 rotate-12">
            <LogIn size={40} />
          </div>
          
          <h1 className="text-4xl font-black text-center text-slate-900 mb-2">ברוכים הבאים ל-Beam</h1>
          <p className="text-slate-500 text-center mb-10 font-medium">ניהול תקציב חכם ופשוט</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">
                שם מלא
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: תומר כהן"
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-right"
                  required
                />
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">
                כתובת אימייל
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-right"
                  required
                  dir="ltr"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <LogIn size={22} />
              כניסה למערכת
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-xs px-6">
            הפרטים שלך נשמרים רק במחשב שלך ולא נשלחים לשום שרת
          </p>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-50 rounded-full -ml-12 -mb-12 -z-10"></div>
      </div>
    </div>
  );
};

export default Login;

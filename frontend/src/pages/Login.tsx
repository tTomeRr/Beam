import React, { useState } from 'react';
import { LogIn, User as UserIcon, Mail, Lock, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User;

      if (isRegister) {
        if (!name.trim()) {
          setError('נא להזין שם');
          setLoading(false);
          return;
        }
        user = await api.auth.register(name.trim(), email.trim(), password);
      } else {
        user = await api.auth.login(email.trim(), password);
      }

      onLogin(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'אירעה שגיאה. נסה שוב.');
      } else {
        setError('אירעה שגיאה. נסה שוב.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900 px-4">
      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-8 mx-auto shadow-xl shadow-indigo-100 rotate-12">
            <LogIn size={40} />
          </div>

          <h1 className="text-4xl font-black text-center text-slate-900 mb-2">
            {isRegister ? 'הרשמה ל-Beam' : 'ברוכים הבאים ל-Beam'}
          </h1>
          <p className="text-slate-500 text-center mb-10 font-medium">ניהול תקציב חכם ופשוט</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
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
            )}

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

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">
                סיסמה
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הזן סיסמה"
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-right"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn size={22} />
                  {isRegister ? 'הרשמה' : 'כניסה למערכת'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              {isRegister ? 'כבר יש לך חשבון? התחבר' : 'אין לך חשבון? הירשם'}
            </button>
          </div>

          <p className="mt-8 text-center text-slate-400 text-xs px-6">
            הנתונים שלך מאובטחים ומוצפנים
          </p>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-50 rounded-full -ml-12 -mb-12 -z-10"></div>
      </div>
    </div>
  );
};

export default Login;

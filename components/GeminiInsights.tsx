
import React, { useState } from 'react';
import { Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Category, Transaction, BudgetPlan } from '../types';

interface GeminiInsightsProps {
  categories: Category[];
  transactions: Transaction[];
  budgets: BudgetPlan[];
}

const GeminiInsights: React.FC<GeminiInsightsProps> = ({ categories, transactions, budgets }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      // Fix: Follow @google/genai coding guidelines - use process.env.API_KEY directly
      // Always create a new instance before making a call to ensure the key is fresh.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const summary = {
        categories: categories.map(c => ({
          name: c.name,
          budgeted: budgets.find(b => b.categoryId === c.id)?.plannedAmount || 0,
          spent: transactions.filter(t => t.categoryId === c.id).reduce((acc, t) => acc + t.amount, 0)
        }))
      };

      const prompt = `
        Analyze the following budget data for a couple and provide 3 short, actionable financial tips in Hebrew.
        Identify categories where they are overspending and suggest ways to save.
        Return ONLY the tips as a concise list.
        Data: ${JSON.stringify(summary)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: 'You are a professional financial advisor specializing in household budgets. You are encouraging but honest. Speak in Hebrew.',
          temperature: 0.7,
        }
      });

      // Correctly access .text property as per guidelines
      setInsight(response.text || 'לא הצלחתי לגבש תובנה כרגע. נסה שוב מאוחר יותר.');
    } catch (error) {
      console.error('Gemini Error:', error);
      setInsight('אירעה שגיאה בחיבור לבינה המלאכותית.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-indigo-600" size={24} />
          <h3 className="text-xl font-bold">תובנות Gemini</h3>
        </div>
        <button 
          onClick={generateInsight}
          disabled={loading}
          className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
        </button>
      </div>

      <div className="min-h-[100px] relative">
        {!insight && !loading && (
          <div className="text-center py-6">
            <p className="text-slate-400 text-sm">לחצו על הניצוץ לקבלת ניתוח חכם של התקציב שלכם</p>
          </div>
        )}
        
        {loading && (
          <div className="space-y-2 py-4">
            <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
            <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-slate-100 rounded-full w-2/3 animate-pulse"></div>
          </div>
        )}

        {insight && !loading && (
          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {insight}
          </div>
        )}
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 -z-10"></div>
    </div>
  );
};

export default GeminiInsights;

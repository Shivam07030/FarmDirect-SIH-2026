import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, clearToast } = useApp();

  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  };

  const bgMap = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    info: 'bg-sky-50 border-sky-200 text-sky-950',
    warning: 'bg-amber-50 border-amber-200 text-amber-950',
    error: 'bg-rose-50 border-rose-200 text-rose-950',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-200 px-4">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgMap[toast.type]}`}>
        {iconMap[toast.type]}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
          <p className="text-xs mt-0.5 opacity-90 leading-relaxed break-words">{toast.message}</p>
        </div>
        <button
          onClick={clearToast}
          className="p-1 hover:bg-black/5 rounded-lg transition-colors text-slate-500 hover:text-slate-800"
          title="Dismiss"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

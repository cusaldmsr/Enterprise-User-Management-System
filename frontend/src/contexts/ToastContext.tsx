import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; type: ToastType; title: string; message?: string; }
interface ToastCtx { toast: { success(t: string, m?: string): void; error(t: string, m?: string): void; info(t: string, m?: string): void; }; }

const Ctx = createContext<ToastCtx | null>(null);

const configs = {
  success: { icon: CheckCircle, color: 'text-emerald-500', border: 'border-emerald-500/40', bg: 'bg-emerald-500/8 dark:bg-emerald-500/10' },
  error:   { icon: XCircle,     color: 'text-destructive',  border: 'border-destructive/40',  bg: 'bg-destructive/5' },
  info:    { icon: Info,        color: 'text-primary',      border: 'border-primary/40',      bg: 'bg-primary/5' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(p => [...p, { id, type, title, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  }, []);

  const dismiss = (id: string) => setToasts(p => p.filter(t => t.id !== id));

  const toast = {
    success: (t: string, m?: string) => add('success', t, m),
    error:   (t: string, m?: string) => add('error',   t, m),
    info:    (t: string, m?: string) => add('info',    t, m),
  };

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const cfg = configs[t.type];
          const Icon = cfg.icon;
          return (
            <div
              key={t.id}
              className={cn(
                'flex items-start gap-3 px-4 py-3.5 rounded-xl min-w-[300px] max-w-[380px]',
                'bg-card border shadow-2xl shadow-black/20',
                cfg.border, cfg.bg,
                'pointer-events-auto animate-slide-up'
              )}
            >
              <Icon size={17} className={cn(cfg.color, 'flex-shrink-0 mt-0.5')} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                {t.message && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.message}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
};

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Severity = 'success' | 'info' | 'warning' | 'error';
type SnackbarCtx = { notify: (message: string, severity?: Severity) => void };
const Ctx = createContext<SnackbarCtx | undefined>(undefined);

const severityStyles: Record<Severity, string> = {
  success: 'bg-done-soft text-done border-done/20',
  info: 'bg-info-soft text-info border-info/20',
  warning: 'bg-accent-soft text-[#815224] border-accent/20',
  error: 'bg-danger-soft text-danger border-danger/20',
};

export function SnackbarProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('info');

  const notify = useCallback((msg: string, sev?: Severity) => {
    setMessage(msg);
    setSeverity(sev || 'info');
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setOpen(false), 3000);
    return () => clearTimeout(timer);
  }, [open]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {open && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-[slideUp_200ms_ease-out]">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-[var(--radius-sm)] border backdrop-blur-sm shadow-lg min-w-[280px] max-w-[480px] ${severityStyles[severity]}`}
          >
            <span className="text-sm font-semibold flex-1">{message}</span>
            <button
              onClick={() => setOpen(false)}
              className="opacity-60 hover:opacity-100 transition-opacity text-current"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </Ctx.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

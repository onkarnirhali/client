import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

type SnackbarCtx = { notify: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void };
const Ctx = createContext<SnackbarCtx | undefined>(undefined);

export function SnackbarProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  const notify = useCallback((msg: string, sev: SnackbarCtx extends infer _ ? any : never) => {
    setMessage(msg);
    setSeverity((sev as any) || 'info');
    setOpen(true);
  }, []);
  const value = useMemo(() => ({ notify }), [notify]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
        <Alert severity={severity} onClose={() => setOpen(false)} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Ctx.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}


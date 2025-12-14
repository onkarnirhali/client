import { PropsWithChildren, useMemo } from 'react';
import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#1e3fae' },
          background: { default: '#f6f6f8', paper: '#ffffff' },
          text: { primary: '#0f111a', secondary: '#5f6571' },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: 'Inter, "Segoe UI", -apple-system, system-ui, sans-serif',
          h1: { fontWeight: 700 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 700 },
          h4: { fontWeight: 700 },
          h5: { fontWeight: 700 },
          button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: 10 },
              containedPrimary: { boxShadow: '0 10px 30px rgba(30,63,174,0.15)' },
            },
          },
          MuiPaper: {
            styleOverrides: {
              rounded: { borderRadius: 12 },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { borderRadius: 999 },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: { borderRadius: 10 },
              input: { padding: '12px' },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: { borderRadius: 16, padding: 0 },
            },
          },
        },
      }),
    []
  );
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

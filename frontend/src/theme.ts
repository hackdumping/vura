import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode: 'light' | 'dark') => ({
  palette: {
    mode,
    primary: {
      main: '#4F46E5',
      light: '#6366F1',
      dark: '#3730A3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#06B6D4',
      light: '#22D3EE',
      dark: '#0891B2',
      contrastText: '#ffffff',
    },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    background: {
      default: mode === 'light' ? '#FAFAFA' : '#050615',
      paper: mode === 'light' ? '#FFFFFF' : '#0D0F1F',
    },
    text: {
      primary: mode === 'light' ? '#0F0F1A' : '#F0F0FF',
      secondary: mode === 'light' ? '#6B7280' : '#8B8FA8',
    },
    divider: mode === 'light' ? '#E8EAF0' : 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, '@media (max-width:600px)': { fontSize: '2.25rem' } },
    h2: { fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, '@media (max-width:600px)': { fontSize: '1.75rem' } },
    h3: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, '@media (max-width:600px)': { fontSize: '1.5rem' } },
    h4: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em', '@media (max-width:600px)': { fontSize: '1.25rem' } },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    button: { textTransform: 'none' as const, fontWeight: 600, letterSpacing: '-0.01em' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 600,
          borderRadius: 10,
          fontSize: '0.9rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          ...(mode === 'dark' ? {
            background: '#0D0F1F',
            border: '1px solid rgba(255,255,255,0.08)',
          } : {
            background: '#FFFFFF',
            border: '1px solid #E8EAF0',
          }),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: mode === 'dark'
            ? 'rgba(5, 6, 21, 0.8)'
            : 'rgba(250, 250, 250, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E8EAF0'}`,
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            ...(mode === 'dark' ? {
              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(79,70,229,0.5)' },
              '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
              background: 'rgba(255,255,255,0.03)',
            } : {}),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, fontSize: '0.75rem' },
      },
    },
  },
});

export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));

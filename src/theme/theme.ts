/**
 * SONORA VoiceForge - Material UI Theme
 * 
 * Precision audio workstation dark theme:
 * - Charcoal / near-black canvas (#0A0C10)
 * - Elevated rack surfaces (#12151D, #181D27)
 * - Warm amber accents (#F59E0B)
 * - Silver / light-grey typography (#E6E9EE, #94A3B8)
 * - Clean hardware-inspired faders, buttons, and panels
 */

import { createTheme } from '@mui/material/styles';

export const sonoraTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F59E0B', // Studio Amber
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#0A0C10',
    },
    secondary: {
      main: '#38BDF8', // Signal Cyan for secondary indicators
      light: '#7DD3FC',
      dark: '#0284C7',
    },
    background: {
      default: '#0A0C10',
      paper: '#121620',
    },
    text: {
      primary: '#E6E9EE',
      secondary: '#94A3B8',
      disabled: '#475569',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#38BDF8',
    },
    success: {
      main: '#10B981',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#E6E9EE',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
      color: '#E6E9EE',
    },
    h3: {
      fontSize: '1.2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#E6E9EE',
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '-0.005em',
      color: '#E6E9EE',
    },
    body1: {
      fontSize: '0.925rem',
      lineHeight: 1.6,
      color: '#E6E9EE',
    },
    body2: {
      fontSize: '0.825rem',
      lineHeight: 1.5,
      color: '#94A3B8',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0A0C10',
          color: '#E6E9EE',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 18px',
          transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
        },
        contained: {
          backgroundColor: '#F59E0B',
          color: '#0A0C10',
          fontWeight: 700,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          '&:hover': {
            backgroundColor: '#D97706',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.14)',
          color: '#E6E9EE',
          '&:hover': {
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#F59E0B',
          height: 5,
          padding: '13px 0',
        },
        thumb: {
          height: 16,
          width: 16,
          backgroundColor: '#E6E9EE',
          border: '2px solid #F59E0B',
          boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '0 0 0 8px rgba(245, 158, 11, 0.16)',
          },
        },
        track: {
          height: 5,
          borderRadius: 3,
          backgroundColor: '#F59E0B',
        },
        rail: {
          height: 5,
          borderRadius: 3,
          backgroundColor: '#252B38',
          opacity: 1,
        },
        valueLabel: {
          backgroundColor: '#1E2430',
          color: '#E6E9EE',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.75rem',
          borderRadius: 4,
          padding: '2px 6px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#121620',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E2432',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#E6E9EE',
          fontSize: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        },
      },
    },
  },
});

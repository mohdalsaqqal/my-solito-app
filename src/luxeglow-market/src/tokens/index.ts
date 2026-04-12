export const tokens = {
  colors: {
    primary: '#000000', // Sephora-like Black for main branding
    secondary: '#de2127', // New Red for sales/accents
    accent: '#000000', // Black for strong accents
    background: '#FFFFFF', // Clean white background
    surface: '#F9F9F9', // Very light gray for sections
    text: {
      primary: '#000000',
      secondary: '#555555',
      inverted: '#FFFFFF',
    },
    success: '#00C853',
    warning: '#FFAB00',
    error: '#D50000', // Deep red for errors/urgent stock
    sale: '#D50000', // Sephora red for sales
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0px', // Sharper corners (Sephora style)
    md: '4px',
    lg: '8px',
    full: '9999px',
  },
  typography: {
    fontFamily: {
      sans: 'Inter, sans-serif',
      display: 'Space Grotesk, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      bold: '700',
      black: '900',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

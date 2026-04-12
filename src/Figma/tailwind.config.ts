import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-soft': 'rgb(var(--color-surface-soft) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        'brand-strong': 'rgb(var(--color-brand-strong) / <alpha-value>)',
        'brand-contrast': 'rgb(var(--color-brand-contrast) / <alpha-value>)',
        mint: 'rgb(var(--color-mint) / <alpha-value>)',
        'mint-strong': 'rgb(var(--color-mint-strong) / <alpha-value>)',
        sun: 'rgb(var(--color-sun) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--color-ink-soft) / <alpha-value>)',
        sky: 'rgb(var(--color-sky) / <alpha-value>)',
        stroke: 'rgb(var(--color-stroke) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        'payment-amex': 'rgb(var(--color-payment-amex) / <alpha-value>)',
        'payment-mastercard': 'rgb(var(--color-payment-mastercard) / <alpha-value>)',
        'payment-visa': 'rgb(var(--color-payment-visa) / <alpha-value>)',
        'payment-visa-deep': 'rgb(var(--color-payment-visa-deep) / <alpha-value>)',
        'line-top': 'rgb(var(--color-line-top) / <alpha-value>)',
        'line-right': 'rgb(var(--color-line-right) / <alpha-value>)',
        'line-bottom': 'rgb(var(--color-line-bottom) / <alpha-value>)',
        'line-left': 'rgb(var(--color-line-left) / <alpha-value>)',
        'button-bg': 'rgb(var(--color-button-bg) / <alpha-value>)',
        'button-fg': 'rgb(var(--color-button-fg) / <alpha-value>)',
        'button-border': 'rgb(var(--color-button-border) / <alpha-value>)',
        'button-hover-bg': 'rgb(var(--color-button-hover-bg) / <alpha-value>)',
        'button-hover-fg': 'rgb(var(--color-button-hover-fg) / <alpha-value>)',
        'button-hover-border': 'rgb(var(--color-button-hover-border) / <alpha-value>)'
      },
      boxShadow: {
        'elevation-00': 'var(--shadow-elevation-00)',
        'elevation-01': 'var(--shadow-elevation-01)',
        'elevation-02': 'var(--shadow-elevation-02)',
        'elevation-03': 'var(--shadow-elevation-03)',
        'elevation-04': 'var(--shadow-elevation-04)',
        'elevation-06': 'var(--shadow-elevation-06)',
        'elevation-08': 'var(--shadow-elevation-08)',
        'elevation-12': 'var(--shadow-elevation-12)',
        'elevation-16': 'var(--shadow-elevation-16)',
        'elevation-24': 'var(--shadow-elevation-24)',
        surface: 'var(--shadow-surface)',
        raised: 'var(--shadow-raised)',
        floating: 'var(--shadow-floating)',
        overlay: 'var(--shadow-overlay)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)'
      },
      zIndex: {
        'layer-base': 'var(--z-layer-base)',
        'layer-raised': 'var(--z-layer-raised)',
        'layer-floating': 'var(--z-layer-floating)',
        'layer-overlay': 'var(--z-layer-overlay)'
      },
      letterSpacing: {
        luxe: '0.08em'
      }
    }
  },
  plugins: []
};

export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        // Toque, em qualquer largura: alvos maiores sem mudar a densidade para quem usa mouse.
        coarse: { raw: '(pointer: coarse)' },
      },
      colors: {
        background: 'var(--paper)',
        foreground: 'var(--ink)',
        paper: {
          DEFAULT: 'var(--paper)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          sunken: 'var(--surface-sunken)',
        },
        rule: {
          DEFAULT: 'var(--rule)',
        },
        border: 'var(--rule)',
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
        },
        muted: {
          DEFAULT: 'var(--surface-sunken)',
          foreground: 'var(--ink-2)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
        },
        success: {
          DEFAULT: 'var(--success)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          soft: 'var(--danger-soft)',
        },
        destructive: {
          DEFAULT: 'var(--danger)',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '5px',
        sm: '3px',
        md: '5px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // PostureScan brand palette — deep slate + emerald green.
        slate: {
          950: '#0B1219',  // page background
          900: '#0F1A22',  // card background
          850: '#111F18',  // input background
        },
        emerald: {
          DEFAULT: '#10B981',
          50:  '#F0FDF4',
          100: '#D1FAE5',
          200: '#A7F3D0',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          900: '#1E3A2A',
        },
        border: {
          subtle: '#1A3022',
          muted:  '#1E3A2A',
        },
      },
      fontFamily: {
        // Editorial pairing: Playfair Display (display, headings, serif accents)
        // and Raleway (body, UI). Loaded via index.html <link>.
        display: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Raleway"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px #10B98133, 0 8px 32px -8px #10B98140',
      },
      animation: {
        'fade-in': 'fade-in 400ms ease-out both',
        'rise': 'rise 500ms cubic-bezier(0.22,1,0.36,1) both',
        'pulse-emerald': 'pulse-emerald 1.4s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        'rise': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        'pulse-emerald': {
          '0%, 100%': { boxShadow: '0 0 0 0 #10B98155' },
          '50%':      { boxShadow: '0 0 0 6px #10B98100' },
        },
      },
    },
  },
  plugins: [],
}

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B2545',
          50: '#E8EEF6',
          100: '#C5D2E5',
          500: '#1E4178',
          700: '#0F2F58',
          900: '#071730',
          950: '#040E1F'
        },
        ember: {
          DEFAULT: '#F77F00',
          50: '#FFF2E1',
          100: '#FFD9B0',
          500: '#FF8C1A',
          600: '#E16E00',
          700: '#B25700'
        },
        sand: {
          DEFAULT: '#F5EFE6',
          dark: '#E8DFCD'
        },
        ink: '#0A0A0A',
        whatsapp: '#25D366'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        brutal: '6px 6px 0 0 rgba(11, 37, 69, 1)',
        'brutal-sm': '3px 3px 0 0 rgba(11, 37, 69, 1)',
        'brutal-ember': '6px 6px 0 0 rgba(247, 127, 0, 1)'
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: []
};

export default config;

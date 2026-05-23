import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — ámbar industrial (diferenciado de MELI puro)
        brand: {
          50:  '#FFF9E6',
          100: '#FFF0B8',
          200: '#FFE680',
          300: '#FFD84D',
          400: '#FFC826',
          500: '#FFB800', // primary
          600: '#E0A300',
          700: '#B88600',
          800: '#876200',
          900: '#5C4200'
        },
        // Confianza azul profundo
        ink: {
          50:  '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#486581',
          600: '#334E68',
          700: '#1F3A52',
          800: '#0F2A44',
          900: '#003566' // azul confianza principal
        },
        // Grises funcionales (estilo e-commerce)
        bg: {
          page:   '#EBEBEB', // fondo página
          card:   '#FFFFFF', // cards
          sub:    '#F5F5F5', // sub-bg
          hover:  '#FAFAFA'
        },
        text: {
          primary:   '#262626',
          secondary: '#737373',
          tertiary:  '#A6A6A6',
          link:      '#3483FA' // azul link tipo MELI
        },
        // Acentos semánticos
        success: '#00A650',  // verde "ahorro/oferta"
        warning: '#FF8800',
        danger:  '#F23D4F',
        // WhatsApp
        wa: '#25D366'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif']
      },
      fontSize: {
        '2xs': ['0.6875rem', '0.875rem'] // 11px / 14px
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.10)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
        nav: '0 2px 4px rgba(0,0,0,0.08)'
      },
      borderRadius: {
        'card': '6px'
      }
    }
  },
  plugins: []
};

export default config;

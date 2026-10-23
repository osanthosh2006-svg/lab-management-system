/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14232D',
        paper: '#F1F3F2',
        surface: '#FFFFFF',
        teal: {
          DEFAULT: '#1B7A72',
          dark: '#145A54',
          light: '#E4F0EE'
        },
        amber: {
          DEFAULT: '#C97A2B',
          light: '#FBEEE0'
        },
        rust: {
          DEFAULT: '#B3432E',
          light: '#F7E7E3'
        },
        line: '#DBE1DC',
        muted: '#5B6B6A'
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        sm: '4px'
      }
    }
  },
  plugins: []
};

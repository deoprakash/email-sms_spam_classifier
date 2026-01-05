/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        navy: '#070812',
        slate: '#0b1021',
        ink: '#12172b',
        cloud: '#e5e7eb',
        cyan: '#7c3aed',
        blue: '#a855f7',
        gold: '#fbbf24',
        punch: '#f472b6',
      },
      boxShadow: {
        glow: '0 18px 48px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at 18% 22%, rgba(168,85,247,0.30), transparent 34%), radial-gradient(circle at 82% 6%, rgba(124,58,237,0.28), transparent 28%), linear-gradient(135deg, #070812 0%, #0b1021 55%, #0a0c18 100%)',
      },
    },
  },
  plugins: [],
};

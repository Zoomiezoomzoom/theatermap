import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      colors: {
        // Notion-style colors
        'notion-bg': 'var(--notion-bg)',
        'notion-text': 'var(--notion-text)',
        'notion-text-light': 'var(--notion-text-light)',
        'notion-border': 'var(--notion-border)',
        'notion-hover-bg': 'var(--notion-hover-bg)',
        'notion-accent': 'var(--notion-accent)',
        'notion-accent-hover': 'var(--notion-accent-hover)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;

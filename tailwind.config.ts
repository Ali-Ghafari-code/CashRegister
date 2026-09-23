import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-vazir)", "Tahoma", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#bcdfff",
          300: "#8ecbff",
          400: "#59adff",
          500: "#3390ff",
          600: "#1c73f5",
          700: "#155ce1",
          800: "#184bb6",
          900: "#1a428f",
          950: "#142a58",
        },
        surface: {
          DEFAULT: "#f6f8fb",
          card: "#ffffff",
          muted: "#eef1f6",
          border: "#e2e6ee",
          dark: "#0f172a",
        },
      },
      boxShadow: {
        soft: "0 4px 20px -6px rgba(15, 23, 42, 0.08)",
        pop: "0 12px 40px -8px rgba(28, 115, 245, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;

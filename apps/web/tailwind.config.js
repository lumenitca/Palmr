import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
          DEFAULT: "#22c55e",
        },
        focus: {
          DEFAULT: "#22c55e",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      addCommonColors: true,
      defaultTheme: "light",
      defaultExtendTheme: "light",
      layout: {
        spacingUnit: 4,
        disableBaseline: true,
      },
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#22c55e",
              foreground: "#FFFFFF",
            },
            danger: {
              DEFAULT: "#dc2626",
              foreground: "#FFFFFF",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#22c55e",
              foreground: "#171717",
            },
            danger: {
              DEFAULT: "#dc2626",
              foreground: "#FFFFFF",
            },
          },
        },
      },
    }),
  ],
};

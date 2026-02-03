import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./stories/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Figma Design System Colors
        primary: {
          DEFAULT: "#2BB0A6", // Teal - main brand color
          50: "#D4EFED",
          100: "#AADFDB",
          200: "#7FCFC9",
          300: "#55BFB7",
          400: "#2BB0A6",
          500: "#228C84",
          600: "#196963",
          700: "#114642",
          800: "#082321",
          900: "#020408",
        },
        secondary: {
          DEFAULT: "#F59E0B", // Amber/Orange
          50: "#FDEBCE",
          100: "#FBD89D",
          200: "#F9C46C",
          300: "#F7B13B",
          400: "#F59E0B",
          500: "#C47E08",
          600: "#935E06",
          700: "#613F04",
          800: "#301F02",
          900: "#020408",
        },
        neutral: {
          50: "#FDFEFE",
          100: "#FCFDFD",
          200: "#FAFCFD",
          300: "#F9FBFC",
          400: "#F8FAFC",
          500: "#CFD0D4",
          600: "#9FA2A9",
          700: "#6F737F",
          800: "#3F4554",
          900: "#0F172A",
          950: "#0C1221",
        },
        // Semantic colors mapped from Figma
        background: {
          DEFAULT: "#FDFEFE",
          secondary: "#F8FAFC",
          tertiary: "#F9FBFC",
          dark: "#0F172A",
        },
        foreground: {
          DEFAULT: "#0F172A",
          light: "#6F737F",
          lighter: "#9FA2A9",
          dark: "#FDFEFE",
        },
        border: {
          DEFAULT: "#CFD0D4",
          light: "#F8FAFC",
          dark: "#3F4554",
        },
        muted: {
          DEFAULT: "#C6C8C9",
          foreground: "#636364",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "heading-1": ["2.74rem", { lineHeight: "1.2", fontWeight: "700" }],
        "heading-2": ["2.19rem", { lineHeight: "1.3", fontWeight: "700" }],
        "heading-3": ["1.75rem", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-4": ["1.4rem", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-xs": ["0.9rem", { lineHeight: "1.5", fontWeight: "400" }],
      },
      spacing: {
        xxs: "0.25rem",
        xs: "0.5rem",
        s: "1rem",
        m: "1.25rem",
        l: "2rem",
        xl: "3.25rem",
        xxl: "5.25rem",
      },
      borderRadius: {
        xs: "4px",
        s: "8px",
        m: "16px",
        l: "24px",
        xl: "32px",
        xxl: "40px",
      },
      boxShadow: {
        card: "0px 14px 26px 0px rgba(0, 0, 0, 0.08)",
        inner: "inset 0 3px 0 0 rgba(0, 0, 0, 0.05)",
        "outer-border": "0 0 0 1px #9FC7CD, 0 0 0 4px #D8EEF2",
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;

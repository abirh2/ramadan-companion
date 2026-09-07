import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: {
          DEFAULT: "var(--surface-primary)",
          grouped: "var(--surface-grouped)",
          elevated: "var(--surface-elevated)",
          feature: "var(--surface-feature)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        teal: {
          DEFAULT: "var(--teal)",
          hover: "var(--teal-hover)",
          pressed: "var(--teal-pressed)",
          muted: "var(--teal-muted)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          muted: "var(--gold-muted)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        sm: "var(--radius-control-sm)",
        md: "var(--radius-control)",
        lg: "var(--radius-grouped)",
        xl: "var(--radius-surface)",
        "2xl": "var(--radius-feature)",
        control: "var(--radius-control)",
        grouped: "var(--radius-grouped)",
        surface: "var(--radius-surface)",
        feature: "var(--radius-feature)",
      },
      boxShadow: {
        hairline: "var(--shadow-hairline)",
        low: "var(--shadow-low)",
        feature: "var(--shadow-feature)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)"],
        arabic: ["var(--font-noto-naskh-arabic)", "Noto Naskh Arabic", "Arabic Typesetting", "serif"],
      },
    },
  },
  plugins: [],
}
export default config

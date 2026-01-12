import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Terminal-specific colors
        terminal: {
          green: "#20ff4d",
          "green-dim": "#0d7a24",
          amber: "#ffb020",
          "amber-dim": "#7a5610",
          red: "#ff3333",
          cyan: "#00ffff",
          bg: "#0d1117",
          "bg-light": "#161b22",
        },
        // Keep brand for backwards compatibility but map to terminal green
        brand: {
          50: "#e6ffec",
          100: "#b3ffc6",
          200: "#80ffa0",
          300: "#4dff7a",
          400: "#20ff4d",
          500: "#20ff4d",
          600: "#1acc3e",
          700: "#14992e",
          800: "#0d7a24",
          900: "#075c1a",
          950: "#033d10",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius))",
        sm: "calc(var(--radius))",
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "SF Mono",
          "Monaco",
          "Inconsolata",
          "Roboto Mono",
          "monospace",
        ],
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        typing: "typing 2s steps(30, end)",
        flicker: "flicker 4s infinite",
        boot: "boot 0.3s ease-out forwards",
        scanline: "scanline 8s linear infinite",
      },
      keyframes: {
        blink: {
          "50%": { opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": {
            textShadow: "0 0 5px hsl(120 100% 55% / 0.5)",
          },
          "50%": {
            textShadow: "0 0 20px hsl(120 100% 55% / 0.8)",
          },
        },
        typing: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.8" },
          "94%": { opacity: "1" },
          "95%": { opacity: "0.9" },
          "96%": { opacity: "1" },
        },
        boot: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      boxShadow: {
        glow: "0 0 10px hsl(120 100% 55% / 0.3)",
        "glow-lg": "0 0 20px hsl(120 100% 55% / 0.5)",
        "glow-amber": "0 0 10px hsl(45 100% 55% / 0.3)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;

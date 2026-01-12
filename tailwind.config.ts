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
        // Core semantic colors from CSS variables
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
          muted: "hsl(var(--accent-muted))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          elevated: "hsl(var(--card-elevated))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },

        // Brand colors for backwards compatibility
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#ff6b4a", // Electric Coral
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
      },

      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 2px)",
      },

      fontFamily: {
        sans: ["Satoshi", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },

      fontSize: {
        "display-lg": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-sm": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      },

      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-in": "slideIn 0.3s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
        "pulse-accent": "pulse-accent 2s ease-in-out infinite",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-accent": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--accent) / 0.4)" },
          "50%": { boxShadow: "0 0 0 8px hsl(var(--accent) / 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      boxShadow: {
        glow: "0 0 20px hsl(var(--accent) / 0.3)",
        "glow-lg": "0 0 40px hsl(var(--accent) / 0.4)",
        embossed:
          "inset 0 1px 0 0 hsl(var(--foreground) / 0.03), 0 1px 3px 0 hsl(0 0% 0% / 0.3), 0 4px 12px 0 hsl(0 0% 0% / 0.2)",
        card: "0 1px 2px hsl(0 0% 0% / 0.2), 0 4px 16px hsl(0 0% 0% / 0.15)",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh":
          "radial-gradient(at 40% 20%, hsl(var(--accent) / 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, hsl(var(--secondary) / 0.06) 0px, transparent 50%)",
        noise:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;

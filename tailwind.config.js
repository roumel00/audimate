/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        // Main background - dark navy
        // background: {
        //   DEFAULT: "hsl(0 0% 100%)",
        //   dark: "hsl(220 33% 9%)",
        // },
        // // Foreground text - white in dark mode
        // foreground: {
        //   DEFAULT: "hsl(224 71% 4%)",
        //   dark: "hsl(213 31% 91%)",
        // },
        // // Card/surface backgrounds - slightly lighter than main background
        // card: {
        //   DEFAULT: "hsl(0 0% 100%)",
        //   dark: "hsl(222 30% 12%)",
        // },
        // // Card foreground text
        // "card-foreground": {
        //   DEFAULT: "hsl(224 71% 4%)",
        //   dark: "hsl(213 31% 91%)",
        // },
        // // Popover backgrounds
        // popover: {
        //   DEFAULT: "hsl(0 0% 100%)",
        //   dark: "hsl(222 30% 12%)",
        // },
        // // Popover foreground text
        // "popover-foreground": {
        //   DEFAULT: "hsl(224 71% 4%)",
        //   dark: "hsl(213 31% 91%)",
        // },
        // // Primary action color - bright teal
        // primary: {
        //   DEFAULT: "hsl(184 100% 40%)",
        //   dark: "hsl(184 100% 50%)",
        // },
        // // Primary foreground text
        // "primary-foreground": {
        //   DEFAULT: "hsl(210 40% 98%)",
        //   dark: "hsl(222 30% 12%)",
        // },
        // // Secondary color - slightly muted surfaces
        // secondary: {
        //   DEFAULT: "hsl(210 40% 96.1%)",
        //   dark: "hsl(222 25% 16%)",
        // },
        // // Secondary foreground text
        // "secondary-foreground": {
        //   DEFAULT: "hsl(222.2 47.4% 11.2%)",
        //   dark: "hsl(213 31% 91%)",
        // },
        // // Muted backgrounds
        // muted: {
        //   DEFAULT: "hsl(210 40% 96.1%)",
        //   dark: "hsl(222 25% 16%)",
        // },
        // // Muted foreground text - soft gray for secondary information
        // "muted-foreground": {
        //   DEFAULT: "hsl(215.4 16.3% 46.9%)",
        //   dark: "hsl(215 20% 65%)",
        // },
        // // Accent color - vibrant lime green for energy and growth
        // accent: {
        //   DEFAULT: "hsl(150 100% 50%)",
        //   dark: "hsl(150 100% 45%)",
        // },
        // // Accent foreground text
        // "accent-foreground": {
        //   DEFAULT: "hsl(222.2 47.4% 11.2%)",
        //   dark: "hsl(222 30% 12%)",
        // },
        // // Destructive action color
        // destructive: {
        //   DEFAULT: "hsl(0 100% 50%)",
        //   dark: "hsl(0 63% 60%)",
        // },
        // // Destructive foreground text
        // "destructive-foreground": {
        //   DEFAULT: "hsl(210 40% 98%)",
        //   dark: "hsl(210 40% 98%)",
        // },
        // // Border color
        // border: {
        //   DEFAULT: "hsl(214.3 31.8% 91.4%)",
        //   dark: "hsl(222 30% 18%)",
        // },
        // // Input field color
        // input: {
        //   DEFAULT: "hsl(214.3 31.8% 91.4%)",
        //   dark: "hsl(222 30% 18%)",
        // },
        // // Focus ring color
        // ring: {
        //   DEFAULT: "hsl(184 100% 40%)",
        //   dark: "hsl(184 100% 50%)",
        // },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

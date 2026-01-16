import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(214.3 31.8% 91.4%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222.2 84% 4.9%)",
        muted: "hsl(210 40% 96.1%)",
        mutedForeground: "hsl(215.4 16.3% 46.9%)",
        primary: "hsl(222.2 47.4% 11.2%)",
        primaryForeground: "hsl(210 40% 98%)",
        danger: "hsl(0 84.2% 60.2%)",
        dangerForeground: "hsl(210 40% 98%)"
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem"
      }
    }
  },
  plugins: []
} satisfies Config;


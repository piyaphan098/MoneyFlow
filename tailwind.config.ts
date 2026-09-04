import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mf: {
          bg: "#F7F6FB",
          card: "#FFFFFF",
          primary: "#5B4FE0",
          primaryDeep: "#2E2860",
          primarySoft: "#EFECFC",
          income: "#1F9D55",
          incomeSoft: "#E7F7ED",
          expense: "#E0483E",
          expenseSoft: "#FCEAE9",
          warn: "#D9A404",
          warnSoft: "#FBF3DC",
          text: "#1C1A2E",
          sub: "#77748F",
          line: "#EAE8F4",
        },
      },
      fontFamily: {
        sans: ["var(--font-sarabun)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;

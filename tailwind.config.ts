import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        canvas: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--fg)",
        muted: "var(--muted)",
        borderline: "var(--border)",
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px var(--brutal-shadow)",
        "brutal-sm": "2px 2px 0px 0px var(--brutal-shadow)",
        "brutal-lg": "6px 6px 0px 0px var(--brutal-shadow)",
      },
    },
  },
  plugins: [],
};

export default config;

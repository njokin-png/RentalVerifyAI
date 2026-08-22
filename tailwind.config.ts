import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#102a43",
        teal: "#087f7b",
        mist: "#f4f8f8",
        amber: "#d97706",
      },
      boxShadow: { card: "0 12px 36px rgba(16,42,67,.08)" },
    },
  },
  plugins: [],
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        mint: "#1e9f82",
        coral: "#ef6b5b",
        amber: "#f2b84b",
        cloud: "#f6f8f7"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(23, 33, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

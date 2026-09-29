// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B00",
        secondary: "#0D9488",
        tertiary: "#2563EB",
        surface: {
          canvas: "#F7F7F4",
          card: "#FFFFFF",
          subtle: "#F0EFEA",
        },
        border: {
          subtle: "#E5E4DE",
          strong: "#CDCBC2",
        },
      },
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      // spacing, radius, shadows, etc.
    },
  },
  plugins: [],
};

export default config;
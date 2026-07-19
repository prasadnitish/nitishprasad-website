/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D0D0C",
        ivory: "#F5F5F7",
        graphite: "#86868B"
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "sans-serif"
        ],
        mono: [
          "SFMono-Regular",
          "ui-monospace",
          "Cascadia Code",
          "Menlo",
          "monospace"
        ]
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.2, 0.8, 0.2, 1)"
      }
    }
  },
  plugins: []
};

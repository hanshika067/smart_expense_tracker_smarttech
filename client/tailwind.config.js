/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0B0F1A",
        surface: "#111827",
        neon: {
          purple: "#A855F7",
          blue: "#38BDF8",
          cyan: "#22D3EE",
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.45)",
        glow: "0 0 40px rgba(56, 189, 248, 0.15)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(11,15,26,0.2), #0B0F1A), radial-gradient(circle at 20% 20%, rgba(168,85,247,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.12), transparent 35%)",
      },
    },
  },
  plugins: [],
};

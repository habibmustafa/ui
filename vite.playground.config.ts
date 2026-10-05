import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Builds the playground as a deployable static site (ui.habibmustafa.me), separate
// from vite.config.ts which is always a library build. Shares the react/tailwind/
// react-compiler plugins so the deployed playground behaves like `npm run dev`;
// skips the dts plugin and the lib-only rollup options (external, preserveModules).
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  build: {
    outDir: "playground-dist",
  },
});

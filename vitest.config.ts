import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Separate from vite.config.ts: golden tests only need JSX transform + jsdom,
// not the Tailwind/dts/lib-build plugins used for the real build. The React Compiler
// stays on, though: the published build is compiled, and memoisation bugs (a hook
// reading react-hook-form's formState proxy, say) only show up with it.
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    css: false,
  },
});

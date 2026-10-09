import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    // Warm the application shell while the development server starts.
    warmup: { clientFiles: ["./playground/main.tsx"] },
  },
  plugins: [
    react(),
    // Keep compiler optimization in production; compiling every library module
    // on demand adds seconds to cold dev navigation and provides no HMR benefit.
    ...(command === 'build' ? [babel({ presets: [reactCompilerPreset()] })] : []),
    tailwindcss(),
    dts({ include: ["src"], bundleTypes: true, tsconfigPath: "./tsconfig.app.json" }),
  ],
  build: {
    // The playground's public/ assets (favicon, logo) have nothing to do with the
    // library build and shouldn't leak into the published dist/ output.
    copyPublicDir: false,
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
      cssFileName: "styles",
    },
    rollupOptions: {
      // Everything in dependencies + peerDependencies stays external so consumers
      // resolve a single copy of Radix, React and the class utilities. Matched by
      // prefix, not exact string, so deep imports (react/compiler-runtime,
      // react-syntax-highlighter/dist/esm/languages/*, dayjs/plugin/*) stay external
      // too instead of getting bundled into dist/node_modules.
      external: (id) =>
        [
          "react",
          "react-dom",
          "class-variance-authority",
          "clsx",
          "cmdk",
          "dayjs",
          "framer-motion",
          "highlightjs-curl",
          "input-otp",
          "lucide-react",
          "radix-ui",
          "react-day-picker",
          "react-hook-form",
          "react-resizable-panels",
          "react-syntax-highlighter",
          "recharts",
          "sonner",
          "tailwind-merge",
          "vaul",
        ].some((pkg) => id === pkg || id.startsWith(`${pkg}/`)),
      // One output file per source module instead of one merged bundle. Without this
      // the whole library collapses into a single chunk and consumers can't shake it:
      // importing just `Button` pulled ~367KB of a ~415KB bundle, because rollup has
      // already erased the module boundaries a consumer's bundler would drop at.
      output: [
        {
          format: "es",
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: "[name].js",
        },
        {
          format: "cjs",
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: "[name].cjs",
          exports: "named",
        },
      ],
    },
  },
}));

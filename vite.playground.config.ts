import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Builds the playground as a deployable static site (ui.habibmustafa.me), separate
// from vite.config.ts which is always a library build. Shares the react/tailwind/
// react-compiler plugins so the deployed playground behaves like `npm run dev`;
// skips the dts plugin and the lib-only rollup options (external, preserveModules).
//
// `--ssr playground/entry-server.tsx` builds the server entry the prerender step
// (scripts/prerender.mjs) renders every route with; it goes to playground-ssr/ and
// leaves the static assets alone.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  // Its ESM entry uses extensionless internal imports that Node cannot resolve
  // directly. Bundle those imports when rendering the first code-block example.
  ssr: { noExternal: ['react-syntax-highlighter'] },
  build: {
    manifest: !isSsrBuild,
    ...(!isSsrBuild && { rolldownOptions: { input: ['index.html', 'playground/block-frame.html'] } }),
    outDir: isSsrBuild ? "playground-ssr" : "playground-dist",
    copyPublicDir: !isSsrBuild,
  },
}));

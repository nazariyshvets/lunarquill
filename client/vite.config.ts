import react from "@vitejs/plugin-react";
import path from "node:path";
import { createRequire } from "node:module";
import { defineConfig, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const require = createRequire(import.meta.url);
const cMapsDir = normalizePath(
  path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "cmaps"),
);
const standardFontsDir = normalizePath(
  path.join(
    path.dirname(require.resolve("pdfjs-dist/package.json")),
    "standard_fonts",
  ),
);

export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: cMapsDir,
          dest: "",
        },
        {
          src: standardFontsDir,
          dest: "",
        },
        {
          src: "src/audio/*",
          dest: "assets/audio",
        },
        {
          src: "node_modules/agora-extension-ai-denoiser/external/*",
          dest: "assets/aiDenoiserAssets",
        },
      ],
    }),
  ],
  server: {
    host: "127.0.0.1",
    port: 3000,
  },
  preview: {
    host: "127.0.0.1",
    port: 3001,
  },
});

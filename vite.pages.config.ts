import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dir = import.meta.dirname;

export default defineConfig({
  root: path.resolve(dir, "pages"),
  base: "/leadly-insight-desk/",
  envDir: dir,
  publicDir: path.resolve(dir, "public"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(dir, "src"),
    },
  },
  build: {
    outDir: path.resolve(dir, "dist-pages"),
    emptyOutDir: true,
  },
});

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tanstackRouter(),
    react(),
    tsconfigPaths(),
  ],
});
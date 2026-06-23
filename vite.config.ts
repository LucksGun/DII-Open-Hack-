import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";

// Plugin ordering matters: router must come before JSX transform (React).
export default defineConfig({
  plugins: [
    tanstackRouter(),
    // Register TanStack Start before the transform so it can configure environments.
    tanstackStart(),
    // React plugin provides React Refresh in dev; keep it after router.
    react(),
    tsconfigPaths(),
  ],
});

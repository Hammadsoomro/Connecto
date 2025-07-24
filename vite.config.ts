import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createExpressApp } from "./server";
import { config } from "dotenv";

// Load environment variables in development
config();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      // Initialize database connection before creating app
      const { db } = await import("./server/database");
      await db.connect();

      const app = createExpressApp();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}

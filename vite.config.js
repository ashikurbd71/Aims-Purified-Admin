import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Export Vite config
export default defineConfig({
  plugins: [
    react(),
    // mkcert(), // ❌ HTTPS Plugin সরানো হয়েছে
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    sourcemap: true,
  },

  server: {
    https: false, // ✅ Force HTTP
    port: 5173,   // Optional: default port, আপনি চাইলে পরিবর্তন করতে পারেন
    open: true,   // Optional: browser auto open
  },
});

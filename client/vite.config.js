import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        secure: false,
      },
    },
  },
  plugins: [react()],

  build: {
    // No need to externalize Firebase modules
    rollupOptions: {
      // leave empty unless you have other specific external modules
    },
  },
});

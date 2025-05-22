import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/truthcard_ai" // Add this line to set the base path correctly
  build: {
    rollupOptions: {
      external: [
        /@react-router\/dev\/routes/
      ]
    }
  }
});

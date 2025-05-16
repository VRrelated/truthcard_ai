import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/truthcard_ai/",
  build: {
    rollupOptions: {
      external: [
        /@react-router\/dev\/routes/
      ]
    }
  }
});

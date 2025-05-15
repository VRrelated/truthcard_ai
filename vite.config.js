export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['html2canvas', 'jspdf'],
          components: ['./src/components/Heatmap']
        }
      },
      chunkSizeWarningLimit: 1000 // in KB
    }
  }
})
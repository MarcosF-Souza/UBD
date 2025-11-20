import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate D3 into its own chunk (~80 kB)
          'd3': ['d3'],
          // Vendor chunk for React and React Router
          'vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // Use esbuild for minification (faster and already included)
    minify: 'esbuild',
  },
});

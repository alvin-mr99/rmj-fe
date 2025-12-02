import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  assetsInclude: ['**/*.kml', '**/*.xlsx'],
  build: {
    // Enable minification
    minify: 'esbuild',
    
    // Generate source maps for debugging (optional, can be disabled for production)
    sourcemap: false,
    
    // Target modern browsers
    target: 'esnext',
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks for third-party libraries
          'maplibre': ['maplibre-gl'],
          'turf': ['@turf/turf'],
          'draw': ['@mapbox/mapbox-gl-draw'],
          'solid': ['solid-js'],
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
    },
    
    // CSS code splitting
    cssCodeSplit: true,
  },
  
  // Optimize dependencies during development
  optimizeDeps: {
    include: ['solid-js', 'maplibre-gl', '@turf/turf'],
  },
})

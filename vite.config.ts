import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    server: {
      host: '::',
      port: 8080,
    },
    plugins: [
      react(),
      splitVendorChunkPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'es2020',
      minify: 'esbuild',
      sourcemap: false,
      cssCodeSplit: true,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 900,
      // Optional: set to 0 if you want to avoid base64 inlining for assets
      // assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          // Fine-grained chunk splitting (cacheable vendors)
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            if (id.includes('react-router-dom')) return 'router'
            if (id.includes('react')) return 'react'
            if (id.includes('@tanstack')) return 'query'
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('recharts')) return 'charts'
            if (id.includes('date-fns')) return 'date'
            return 'vendor' // all other third-party deps
          },
        },
      },
    },
    // Strip console/debugger only in prod builds
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    },
  }
})

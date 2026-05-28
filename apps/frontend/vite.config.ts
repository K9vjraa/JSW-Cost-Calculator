import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env variables for this mode
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },

    // ── Dev Server ────────────────────────────────────────────────────────────
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        // Proxy /api/* to backend in dev to avoid CORS issues
        '/api': {
          target: (env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', ''),
          changeOrigin: true,
          secure: false
        }
      }
    },

    // ── Production Build ──────────────────────────────────────────────────────
    build: {
      outDir: 'dist',
      // Only generate sourcemaps for staging/review, not production
      sourcemap: !isProd,
      // esbuild is the default and works with rolldown (Vite 8)
      minify: isProd ? 'esbuild' : false,
      // Raise chunk size warning limit (export libs are legitimately large)
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        output: {
          // Function-based manual chunking (required by rolldown/Vite 8)
          manualChunks: (id: string) => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
              return 'vendor-react'
            }
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react') || id.includes('node_modules/sonner')) {
              return 'vendor-ui'
            }
            if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform') || id.includes('node_modules/zod')) {
              return 'vendor-forms'
            }
            if (id.includes('node_modules/zustand') || id.includes('node_modules/@tanstack')) {
              return 'vendor-state'
            }
            if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs')) {
              return 'vendor-charts'
            }
            if (id.includes('node_modules/jspdf') || id.includes('node_modules/xlsx')) {
              return 'vendor-export'
            }
            if (id.includes('node_modules/@radix-ui')) {
              return 'vendor-radix'
            }
          },
          // Hashed filenames for CDN cache busting
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },

    // ── esbuild options for production drops ──────────────────────────────────
    esbuild: {
      // Drop console.* and debugger in production
      drop: isProd ? ['console', 'debugger'] : [],
    },

    // ── Preview Server (after build) ──────────────────────────────────────────
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true
    },

    // ── Compile-time constants ─────────────────────────────────────────────────
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    }
  }
})
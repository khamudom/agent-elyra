import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  base: './', // Use relative paths for extension
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        // Copy manifest.json to the output directory
        const manifestSrc = resolve(__dirname, 'extension/manifest.json')
        const manifestDest = resolve(__dirname, 'extension-dist/manifest.json')
        
        if (existsSync(manifestSrc)) {
          copyFileSync(manifestSrc, manifestDest)
          console.log('✅ Manifest.json copied to extension-dist/')
        } else {
          console.error('❌ Manifest.json not found in extension/ directory')
        }

        // Copy index.html from extension subdirectory to root
        const indexSrc = resolve(__dirname, 'extension-dist/extension/index.html')
        const indexDest = resolve(__dirname, 'extension-dist/index.html')
        
        if (existsSync(indexSrc)) {
          copyFileSync(indexSrc, indexDest)
          console.log('✅ index.html copied to extension-dist/ root')
        } else {
          console.error('❌ index.html not found in extension-dist/extension/ directory')
        }



      }
    }
  ],
  build: {
    outDir: 'extension-dist',
    sourcemap: false, // Disable sourcemaps for production to reduce size
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log statements
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit
          rollupOptions: {
        input: {
          popup: 'extension/index.html',
          background: 'extension/background.ts',
          content: 'extension/content.ts',
          inject: 'extension/inject.ts'
        },
                 output: {
           entryFileNames: '[name].js',
           chunkFileNames: '[name]-[hash].js',
           assetFileNames: (assetInfo) => {
             // Keep index.html in root, put other assets in subdirectories if needed
             if (assetInfo.name === 'index.html') {
               return '[name][extname]';
             }
             return '[name].[ext]';
           },
        manualChunks: (id) => {
          // Split vendor dependencies into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('three')) {
              return 'three-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'three']
  }
}) 
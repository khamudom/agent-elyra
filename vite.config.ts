import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg}"],
      },
      manifest: {
        name: "Agentic Assistant",
        short_name: "Agentic",
        description:
          "An intelligent 3D assistant with React Three Fiber avatar",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait-primary",
        icons: [
          {
            src: "foxicon.jpg",
            sizes: "192x192",
            type: "image/jpeg",
            purpose: "any",
          },
          {
            src: "foxicon.jpg",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "any",
          },
        ],
      },
    }),
  ],
  build: {
    outDir: "dist",
    sourcemap: false, // Disable sourcemaps for production
    minify: "terser", // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log statements for production
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor dependencies into separate chunks
          if (id.includes("node_modules")) {
            if (id.includes("three") || id.includes("@react-three")) {
              return "three-vendor";
            }
            return "vendor";
          }
        },
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
    ],
    force: true, // Force re-optimization
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync } from "fs";
import { resolve } from "path";

// Configuration constants
const EXTENSION_CONFIG = {
  BUILD: {
    OUT_DIR: "extension-dist",
    CHUNK_SIZE_WARNING_LIMIT: 1000,
    SOURCEMAP: false,
    MINIFY: "terser" as const,
  },
  FILES: {
    MANIFEST_SRC: "extension/manifest.json",
    MANIFEST_DEST: "extension-dist/manifest.json",
    INDEX_SRC: "extension-dist/extension/index.html",
    INDEX_DEST: "extension-dist/index.html",
  },
  TERSER: {
    DROP_CONSOLE: true,
    DROP_DEBUGGER: true,
  },
} as const;

export default defineConfig({
  base: "./", // Use relative paths for extension
  plugins: [
    react(),
    {
      name: "copy-extension-files",
      writeBundle() {
        // Copy manifest.json to the output directory
        const manifestSrc = resolve(
          __dirname,
          EXTENSION_CONFIG.FILES.MANIFEST_SRC
        );
        const manifestDest = resolve(
          __dirname,
          EXTENSION_CONFIG.FILES.MANIFEST_DEST
        );

        if (existsSync(manifestSrc)) {
          copyFileSync(manifestSrc, manifestDest);
          console.log("✅ Manifest.json copied to extension-dist/");
        } else {
          console.error("❌ Manifest.json not found in extension/ directory");
        }

        // Copy index.html from extension subdirectory to root
        const indexSrc = resolve(__dirname, EXTENSION_CONFIG.FILES.INDEX_SRC);
        const indexDest = resolve(__dirname, EXTENSION_CONFIG.FILES.INDEX_DEST);

        if (existsSync(indexSrc)) {
          copyFileSync(indexSrc, indexDest);
          console.log("✅ index.html copied to extension-dist/ root");
        } else {
          console.error(
            "❌ index.html not found in extension-dist/extension/ directory"
          );
        }
      },
    },
  ],
  build: {
    outDir: EXTENSION_CONFIG.BUILD.OUT_DIR,
    sourcemap: EXTENSION_CONFIG.BUILD.SOURCEMAP,
    minify: EXTENSION_CONFIG.BUILD.MINIFY,
    terserOptions: {
      compress: {
        drop_console: EXTENSION_CONFIG.TERSER.DROP_CONSOLE,
        drop_debugger: EXTENSION_CONFIG.TERSER.DROP_DEBUGGER,
      },
    },
    chunkSizeWarningLimit: EXTENSION_CONFIG.BUILD.CHUNK_SIZE_WARNING_LIMIT,
    rollupOptions: {
      input: {
        popup: "extension/index.html",
        background: "extension/background.ts",
        content: "extension/content.ts",
        inject: "extension/inject.ts",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          // Keep index.html in root, put other assets in subdirectories if needed
          if (assetInfo.name === "index.html") {
            return "[name][extname]";
          }
          return "[name].[ext]";
        },
        manualChunks: (id) => {
          // Split vendor dependencies into separate chunks
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("three")) {
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
    include: ["react", "react-dom", "three"],
  },
});

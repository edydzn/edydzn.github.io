import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const fallbackAsset = path.resolve(
  __dirname,
  './src/imports/logo_ediliano_designer_branco_e_verde.png',
)

const figmaAssetPlugin = {
  name: 'figma-asset-resolver',
  enforce: 'pre' as const,
  resolveId(source: string) {
    if (source.startsWith('figma:asset/')) {
      return fallbackAsset
    }
    return null
  },
}

// Strip versioned suffixes from bare imports like "sonner@2.0.3" -> "sonner"
// or "@radix-ui/react-slot@1.1.2" -> "@radix-ui/react-slot".
const stripVersionPlugin = {
  name: 'strip-versioned-imports',
  enforce: 'pre' as const,
  async resolveId(source: string, importer: string | undefined, options: any) {
    if (source.startsWith('npm:') || source.startsWith('jsr:')) return null
    if (source.startsWith('.') || source.startsWith('/')) return null
    const match = source.match(/^(@[^/]+\/[^@/]+|[^@/][^/]*)@\d[^/]*(\/.*)?$/)
    if (!match) return null
    const stripped = match[1] + (match[2] || '')
    const resolved = await (this as any).resolve(stripped, importer, {
      ...options,
      skipSelf: true,
    })
    return resolved || stripped
  },
}

export default defineConfig({
  plugins: [
    stripVersionPlugin,
    figmaAssetPlugin,
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      // Supabase Edge Functions run on Deno; exclude them from the frontend bundle.
      external: [/^npm:/, /^jsr:/],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'radix-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['supabase/functions/server'],
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 8000,
  },
})

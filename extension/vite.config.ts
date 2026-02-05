import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const repoRoot = path.resolve(__dirname, '..');
const env = loadEnv('production', repoRoot, '');
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? '';
const geminiKey = env.GEMINI_API_KEY ?? env.VITE_GEMINI_API_KEY ?? '';

const outDir = path.resolve(__dirname, '..', 'dist-extension');

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      shared: path.resolve(__dirname, '..', 'shared'),
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
  },
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'popup.html'),
        background: path.resolve(__dirname, 'scripts/background.ts'),
        content: path.resolve(__dirname, 'scripts/content.ts'),
      },
      output: {
        entryFileNames: (chunk) => (chunk.name === 'background' ? 'background.js' : '[name].js'),
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
    minify: true,
    sourcemap: false,
  },
  publicDir: false,
});

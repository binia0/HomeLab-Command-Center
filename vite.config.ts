import {resolve} from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// First-release preview: keep bundling low-memory for 1 GB Raspberry Pi hosts.
// Minification will be re-enabled once CI has verified a lean production bundle.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions:{input:{main:resolve(__dirname,'index.html'),visual:resolve(__dirname,'visual.html')}},
    minify: false,
    sourcemap: false,
    cssMinify: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1800,
  },
});

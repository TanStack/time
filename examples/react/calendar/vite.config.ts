import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@tanstack/react-time': path.resolve(
        __dirname,
        '../../../packages/react-time/src/index.ts',
      ),
      '@tanstack/time': path.resolve(
        __dirname,
        '../../../packages/time/src/index.ts',
      ),
    },
  },
})

import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
  test: {
    name: packageJson.name,
    dir: './',
    watch: false,
    environment: 'happy-dom',
    globals: true,
  },
})

import { defineConfig, mergeConfig } from 'vitest/config'
import { tanstackViteConfig } from '@tanstack/config/vite'

const config = defineConfig({
  test: {
    name: 'react-time',
    dir: './src',
    watch: false,
    environment: 'jsdom',
    setupFiles: ['./tests/test-setup.ts'],
    coverage: { enabled: true, provider: 'istanbul', include: ['src/**/*'] },
    typecheck: { enabled: true },
  },
})

export default mergeConfig(
  config,
  tanstackViteConfig({
    entry: './src/index.ts',
    srcDir: './src',
  }),
)

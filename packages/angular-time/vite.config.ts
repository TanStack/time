import { defineConfig, mergeConfig } from 'vitest/config'
import { tanstackViteConfig } from '@tanstack/config/vite'

const config = defineConfig({
  test: {
    name: 'angular-time',
    dir: './src',
    watch: false,
    environment: 'jsdom',
    setupFiles: ['src/tests/test-setup.ts'],
    coverage: { enabled: true, provider: 'istanbul', include: ['src/**/*'] },
    typecheck: { enabled: true },
    globals: true,
  },
})

export default mergeConfig(
  config,
  tanstackViteConfig({
    entry: './src/index.ts',
    srcDir: './src',
    exclude: ['./src/tests'],
  }),
)

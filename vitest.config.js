import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

const timeRoot = fileURLToPath(new URL('./packages/time', import.meta.url))

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [tsconfigPaths({ root: timeRoot })],
        test: {
          name: '@tanstack/time',
          include: [
            'packages/time/src/**/*.test.ts',
            'packages/time/src/**/*.spec.ts',
          ],
          environment: 'happy-dom',
          globals: true,
        },
      },
      './packages/react-time/vitest.config.ts',
      './packages/solid-time/vitest.config.ts',
    ],
  },
})

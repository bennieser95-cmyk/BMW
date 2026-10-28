import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) }

export default defineConfig({
  resolve: { alias },
  test: {
    // Pure logic stays in the fast node environment; React components need a DOM.
    projects: [
      {
        resolve: { alias },
        test: { name: 'unit', environment: 'node', include: ['src/**/*.test.ts'] },
      },
      {
        resolve: { alias },
        test: {
          name: 'components',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
          // Role queries plus axe on a cold jsdom are slower than pure unit tests.
          testTimeout: 20_000,
        },
      },
    ],
    coverage: { include: ['src/domain/**/*.ts'], thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 } },
  },
})

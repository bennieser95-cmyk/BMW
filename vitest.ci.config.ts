import { defineConfig, mergeConfig } from 'vitest/config'

import baseConfig from './vitest.config'

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.d.ts', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
        thresholds: {
          lines: 70,
          functions: 70,
          branches: 70,
          statements: 70,
          'src/domain/**/*.ts': {
            lines: 90,
            functions: 90,
            branches: 90,
            statements: 90,
          },
        },
      },
    },
  }),
)

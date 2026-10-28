import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import boundaries from 'eslint-plugin-boundaries'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'

const repositoryRoot = dirname(fileURLToPath(import.meta.url))
const featureRoot = resolve(repositoryRoot, 'src', 'features')

function getFeatureName(filePath) {
  const featurePath = relative(featureRoot, filePath)
  if (featurePath === '..' || featurePath.startsWith(`..${sep}`)) return undefined

  return featurePath.split(sep)[0]
}

function resolveImportedFeature(importPath, importerPath) {
  if (importPath.startsWith('@/features/')) {
    return resolve(featureRoot, importPath.slice('@/features/'.length))
  }
  if (importPath.startsWith('.')) return resolve(dirname(importerPath), importPath)

  return undefined
}

const architecturePlugin = {
  rules: {
    'no-cross-feature-imports': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          crossFeature:
            'Feature modules must not import one another; communicate through domain ports, URLs, or events.',
        },
      },
      create(context) {
        const importerPath = context.filename
        const importerFeature = getFeatureName(importerPath)
        if (importerFeature === undefined) return {}

        function checkImport(node) {
          const importPath = node.source?.value
          if (typeof importPath !== 'string') return

          const importedPath = resolveImportedFeature(importPath, importerPath)
          if (importedPath === undefined) return

          const importedFeature = getFeatureName(importedPath)
          if (importedFeature !== undefined && importedFeature !== importerFeature) {
            context.report({ node, messageId: 'crossFeature' })
          }
        }

        return {
          ExportAllDeclaration: checkImport,
          ExportNamedDeclaration: checkImport,
          ImportDeclaration: checkImport,
          ImportExpression: checkImport,
        }
      },
    },
  },
}

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      architecture: architecturePlugin,
      boundaries,
      import: importPlugin,
    },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'components', pattern: 'src/components/**' },
        { type: 'features', pattern: 'src/features/*/**' },
        { type: 'domain', pattern: 'src/domain/**' },
        { type: 'infrastructure', pattern: 'src/infrastructure/**' },
        { type: 'lib', pattern: 'src/lib/**' },
        { type: 'messages', pattern: 'src/messages/**' },
        { type: 'styles', pattern: 'src/styles/**' },
      ],
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'architecture/no-cross-feature-imports': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              from: { element: { type: 'app' } },
              disallow: { to: { element: { type: 'infrastructure' } } },
            },
            {
              from: { element: { type: 'infrastructure' } },
              disallow: { to: { element: { type: ['app', 'components', 'features'] } } },
            },
          ],
        },
      ],
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Use an `as const` object and a derived union instead of an enum.',
        },
      ],
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['next', 'react', 'react-dom'],
          patterns: ['next/**', 'react/**', 'react-dom/**'],
        },
      ],
    },
  },
  {
    files: ['e2e/**/*.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
]

export default eslintConfig
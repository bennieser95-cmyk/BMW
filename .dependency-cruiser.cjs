module.exports = {
  forbidden: [
    {
      name: 'no-circular-dependencies',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'app-does-not-import-infrastructure',
      comment: 'Routes compose application layers without depending on implementation details.',
      severity: 'error',
      from: { path: '^src/app/' },
      to: { path: '^src/infrastructure/' },
    },
    {
      name: 'domain-is-framework-free',
      comment: 'The domain layer must remain independent of UI and delivery frameworks.',
      severity: 'error',
      from: { path: '^src/domain/' },
      to: {
        path: '(^|/)(next|react|react-dom)(/|$)|^src/(app|components|features|infrastructure)/',
      },
    },
    {
      name: 'infrastructure-implements-domain-ports',
      comment: 'Infrastructure may depend on domain contracts but not on application modules.',
      severity: 'error',
      from: { path: '^src/infrastructure/' },
      to: { path: '^src/(app|components|features)/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    enhancedResolveOptions: { exportsFields: ['exports'] },
    exclude: { path: '(^|/)(\\.next|node_modules)(/|$)' },
    tsConfig: { fileName: 'tsconfig.json' },
  },
}

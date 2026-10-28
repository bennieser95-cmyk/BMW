const baseUrl = process.env.BASE_URL

if (!baseUrl) {
  throw new Error('BASE_URL must point to the protected staging deployment.')
}

module.exports = {
  ci: {
    collect: {
      url: [baseUrl],
      numberOfRuns: 3,
      puppeteerScript: './scripts/ops/lighthouse-auth.cjs',
      settings: {
        formFactor: 'mobile',
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      budgetsFile: './lighthouse-budget.json',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'interaction-to-next-paint': ['error', { maxNumericValue: 200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'server-response-time': ['error', { maxNumericValue: 600 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lhci-results',
    },
  },
}

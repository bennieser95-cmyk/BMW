import 'vitest'

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging requires an interface
  interface Assertion<T = unknown> extends AxeMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging requires an interface
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

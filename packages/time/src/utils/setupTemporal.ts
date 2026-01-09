import { Temporal } from '@js-temporal/polyfill'

// Extend the globalThis type to include Temporal
declare global {
  interface GlobalThis {
    Temporal: typeof Temporal
  }
}

if (!('Temporal' in globalThis)) {
  // Attach Temporal to the global object if it doesn't exist
  ;(globalThis as any).Temporal = Temporal
}

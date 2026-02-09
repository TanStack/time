import * as Devtools from './core'

export const TimeDevtoolsCore =
  process.env.NODE_ENV !== 'development'
    ? Devtools.TimeDevtoolsCoreNoOp
    : Devtools.TimeDevtoolsCore

export type { TimeDevtoolsInit } from './core'

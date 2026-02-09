import { lazy } from 'solid-js'
import { constructCoreClass } from '@tanstack/devtools-utils/solid'

const Component = lazy(() => import('./components/Shell'))

export interface TimeDevtoolsInit {}

const [TimeDevtoolsCore, TimeDevtoolsCoreNoOp] = constructCoreClass(Component)

export { TimeDevtoolsCore, TimeDevtoolsCoreNoOp }

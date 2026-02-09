import { createSolidPanel } from '@tanstack/devtools-utils/solid'
import { TimeDevtoolsCore } from '@tanstack/time-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/solid'

const [TimeDevtoolsPanel, TimeDevtoolsPanelNoOp] =
  createSolidPanel(TimeDevtoolsCore)

export interface TimeDevtoolsSolidInit extends DevtoolsPanelProps {}

export { TimeDevtoolsPanel, TimeDevtoolsPanelNoOp }

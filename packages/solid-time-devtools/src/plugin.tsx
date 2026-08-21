import { createSolidPlugin } from '@tanstack/devtools-utils/solid'
import { TimeDevtoolsPanel } from './TimeDevtools'

const [timeDevtoolsPlugin, timeDevtoolsNoOpPlugin] = createSolidPlugin({
  Component: TimeDevtoolsPanel,
  name: 'TanStack Time',
  id: 'tanstack-time',
  defaultOpen: true,
})

export { timeDevtoolsPlugin, timeDevtoolsNoOpPlugin }

import React, { useEffect, useRef } from 'react'
import { TimeDevtoolsCore } from '@tanstack/time-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/react'

export interface TimeDevtoolsReactInit extends DevtoolsPanelProps {}

function TimeDevtoolsPanel({ theme, devtoolsOpen }: TimeDevtoolsReactInit) {
  const containerRef = useRef<HTMLDivElement>(null)
  const devtoolsRef = useRef<InstanceType<typeof TimeDevtoolsCore> | null>(null)

  useEffect(() => {
    if (containerRef.current && !devtoolsRef.current) {
      const devtools = new TimeDevtoolsCore()
      devtoolsRef.current = devtools
      devtools.mount(containerRef.current, { theme, devtoolsOpen })
    }

    return () => {
      if (devtoolsRef.current) {
        devtoolsRef.current.unmount()
        devtoolsRef.current = null
      }
    }
  }, [theme, devtoolsOpen])

  return <div ref={containerRef} style={{ height: '100%' }} />
}

function TimeDevtoolsPanelNoOp(_props: TimeDevtoolsReactInit) {
  return null
}

export { TimeDevtoolsPanel, TimeDevtoolsPanelNoOp }

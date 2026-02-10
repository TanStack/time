import { createContext, useContext, onMount, onCleanup } from 'solid-js'
import { createStore } from 'solid-js/store'
import type { ParentComponent } from 'solid-js'
import { getTimeClient, type TimeEventMap } from '@tanstack/time'

export interface ActivityLogEntry {
  id: string
  timestamp: number
  type: keyof TimeEventMap
  details: Record<string, unknown>
}

interface TimeStoreState {
  activityLog: Array<ActivityLogEntry>
  isConnected: boolean
}

interface TimeContextValue {
  state: TimeStoreState
  clearLog: () => void
}

const TimeContext = createContext<TimeContextValue>()

export function useTimeStore(): TimeContextValue {
  const context = useContext(TimeContext)
  if (!context) {
    throw new Error('useTimeStore must be used within an TimeProvider')
  }
  return context
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const TimeProvider: ParentComponent = (props) => {
  const [state, setState] = createStore<TimeStoreState>({
    activityLog: [],
    isConnected: false,
  })

  const clearLog = () => {
    setState('activityLog', [])
  }

  onMount(() => {
    const client = getTimeClient()

    // Mark as connected
    setState('isConnected', true)

    // Subscribe to all time events using onAllPluginEvents
    const unsubscribe = client.onAllPluginEvents((event) => {
      const entry: ActivityLogEntry = {
        id: generateId(),
        timestamp: Date.now(),
        type: event.type,
        details: event.payload as unknown as Record<string, unknown>,
      }

      setState('activityLog', (prev) => [entry, ...prev].slice(0, 100))
    })

    onCleanup(() => {
      unsubscribe()
      setState('isConnected', false)
    })
  })

  const contextValue: TimeContextValue = {
    state,
    clearLog,
  }

  return (
    <TimeContext.Provider value={contextValue}>
      {props.children}
    </TimeContext.Provider>
  )
}

import { createContext, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import type { ParentComponent } from 'solid-js'

interface TimeStoreState {}

interface TimeContextValue {
  state: TimeStoreState
}

const TimeContext = createContext<TimeContextValue>()

export function useTimeStore(): TimeContextValue {
  const context = useContext(TimeContext)
  if (!context) {
    throw new Error('useTimeStore must be used within an TimeProvider')
  }
  return context
}

export const TimeProvider: ParentComponent = (props) => {
  const [state, setState] = createStore<TimeStoreState>({
    conversations: {},
    activeConversationId: null,
  })

  const contextValue: TimeContextValue = {
    state,
  }

  return (
    <TimeContext.Provider value={contextValue}>
      {props.children}
    </TimeContext.Provider>
  )
}

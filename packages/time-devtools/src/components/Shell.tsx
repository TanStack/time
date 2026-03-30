import { For, Show, createSignal } from 'solid-js'
import {
  Button,
  Header,
  HeaderLogo,
  MainPanel,
  Section,
  SectionTitle,
  Tag,
} from '@tanstack/devtools-ui'
import { useStyles } from '../styles/use-styles'
import { TimeProvider, useTimeStore } from '../store/time-context'
import type { ActivityLogEntry } from '../store/time-context'

export default function Devtools() {
  return (
    <TimeProvider>
      <DevtoolsContent />
    </TimeProvider>
  )
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const getEventTypeLabel = (
  type: string,
): {
  text: string
  color: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'pink' | 'gray'
} => {
  switch (type) {
    case 'time:events:set':
      return { text: 'Loaded', color: 'green' }
    case 'time:event:added':
      return { text: 'Added', color: 'green' }
    case 'time:event:updated':
      return { text: 'Updated', color: 'blue' }
    case 'time:event:removed':
      return { text: 'Removed', color: 'red' }
    case 'time:event:resized':
      return { text: 'Resized', color: 'yellow' }
    case 'time:event:update:error':
      return { text: 'Update Error', color: 'red' }
    case 'time:calendar:navigate':
      return { text: 'Navigate', color: 'purple' }
    case 'time:calendar:viewMode:changed':
      return { text: 'View Mode', color: 'pink' }
    default:
      return { text: type, color: 'gray' }
  }
}

const getEventDescription = (entry: ActivityLogEntry): string => {
  const { type, details } = entry

  switch (type) {
    case 'time:events:set':
      const evts = details.events as Array<unknown> | undefined
      return `Batched ${evts?.length || 0} events`
    case 'time:event:added':
      return `${details.eventTitle || 'Event'} (ID: ${String(details.eventId).slice(0, 8)}...)`
    case 'time:event:updated':
      return `${details.eventTitle || 'Event'} - ${Object.keys(details.updates || {}).join(', ')}`
    case 'time:event:removed':
      return `${details.eventTitle || 'Event'}`
    case 'time:event:resized':
      return `Resized to ${String(details.start)} - ${String(details.end)}`
    case 'time:event:update:error':
      return `${details.eventTitle || 'Event'} - ${String(details.message)}`
    case 'time:calendar:navigate':
      return `${String(details.direction)} → ${String(details.targetDate)}`
    case 'time:calendar:viewMode:changed':
      const viewMode = details.viewMode as
        | { value?: number; unit?: string }
        | undefined
      return `${viewMode?.value || ''} ${viewMode?.unit || ''}`
    default:
      return ''
  }
}

function DevtoolsContent() {
  const { state, clearLog } = useTimeStore()
  const styles = useStyles()
  const [activeTab, setActiveTab] = createSignal<'log' | 'events'>('log')

  return (
    <MainPanel>
      <Header>
        <HeaderLogo flavor={{ light: '#9dec48', dark: '#9dec48' }}>
          TanStack Time
        </HeaderLogo>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            'margin-left': '1.5rem',
            flex: 1,
          }}
        >
          <Show
            when={activeTab() === 'log'}
            fallback={
              <Button onClick={() => setActiveTab('log')} variant="primary">
                Activity
              </Button>
            }
          >
            <Button variant="secondary">Activity</Button>
          </Show>
          <Show
            when={activeTab() === 'events'}
            fallback={
              <Button onClick={() => setActiveTab('events')} variant="primary">
                Current Events
              </Button>
            }
          >
            <Button variant="secondary">Current Events</Button>
          </Show>
        </div>
        <Show when={state.isConnected}>
          <span class={styles().connectedStatus}>
            <span class={styles().connectedDot} />
            Connected
          </span>
        </Show>
      </Header>

      <Show when={activeTab() === 'log'}>
        <Section>
          <div class={styles().sectionHeader}>
            <SectionTitle>Activity Log</SectionTitle>
            <Button onClick={clearLog} variant="secondary">
              Clear
            </Button>
          </div>

          <Show
            when={state.activityLog.length > 0}
            fallback={
              <div class={styles().emptyState}>
                No activity yet. Start interacting with the calendar!
              </div>
            }
          >
            <div class={styles().activityList}>
              <For each={state.activityLog}>
                {(entry) => {
                  const label = getEventTypeLabel(entry.type)
                  return (
                    <div class={styles().activityEntry}>
                      <span class={styles().timestamp}>
                        {formatTime(entry.timestamp)}
                      </span>
                      <Tag color={label.color} label={label.text} />
                      <span class={styles().description}>
                        {getEventDescription(entry)}
                      </span>
                    </div>
                  )
                }}
              </For>
            </div>
          </Show>
        </Section>
      </Show>

      <Show when={activeTab() === 'events'}>
        <Section>
          <div class={styles().sectionHeader}>
            <SectionTitle>
              Loaded Events ({Object.keys(state.events).length})
            </SectionTitle>
          </div>
          <Show
            when={Object.keys(state.events).length > 0}
            fallback={
              <div class={styles().emptyState}>
                No events currently loaded into the calendar scope.
              </div>
            }
          >
            <div class={styles().activityList}>
              <For each={Object.values(state.events).filter(Boolean)}>
                {(event) => (
                  <div
                    class={styles().activityEntry}
                    style={{
                      'flex-direction': 'column',
                      'align-items': 'flex-start',
                      gap: '0.25rem',
                      padding: '0.75rem',
                    }}
                  >
                    <div style={{ 'font-weight': 600 }}>{event.title}</div>
                    <div
                      style={{
                        'font-size': '0.85em',
                        color: 'var(--tg-gray-500)',
                      }}
                    >
                      {event.start} &rarr; {event.end}
                    </div>
                    <div
                      style={{
                        'font-size': '0.75em',
                        color: 'var(--tg-gray-600)',
                        'font-family': 'monospace',
                      }}
                    >
                      ID: {event.id}
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Section>
      </Show>
    </MainPanel>
  )
}

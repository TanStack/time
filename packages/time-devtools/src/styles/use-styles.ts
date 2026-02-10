import * as goober from 'goober'
import { createEffect, createSignal } from 'solid-js'

const stylesFactory = () => {
  const css = goober.css

  return {
    connectedStatus: css`
      font-size: 12px;
      color: #22c55e;
      display: flex;
      align-items: center;
      gap: 6px;
    `,

    connectedDot: css`
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #22c55e;
    `,

    sectionHeader: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    `,

    emptyState: css`
      text-align: center;
      color: #6b7280;
      padding: 20px;
      font-size: 13px;
    `,

    activityList: css`
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
    `,

    activityEntry: css`
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background-color: #1f2937;
      border-radius: 6px;
      font-size: 12px;
    `,

    timestamp: css`
      font-family: monospace;
      color: #9ca3af;
      font-size: 11px;
      min-width: 70px;
    `,

    description: css`
      color: #e5e7eb;
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,
  }
}

export function useStyles() {
  const [styles, setStyles] = createSignal(stylesFactory())
  createEffect(() => {
    setStyles(stylesFactory())
  })
  return styles
}

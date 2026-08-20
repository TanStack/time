import { useTheme } from "@tanstack/devtools-ui";
import * as goober from "goober";
import { createEffect, createSignal } from "solid-js";
import { tokens } from './tokens'

const stylesFactory = (theme: 'light' | 'dark') => {
  const css = goober.css;
  const t = (light: string, dark: string) => (theme === 'light' ? light : dark)
  const { colors, size } = tokens

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
      /*background-color: #22c55e;*/
    `,

    sectionHeader: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid #374151;
      /*background-color: #111827;*/
    `,

    emptyState: css`
      text-align: center;
      color: #6b7280;
      padding: 20px;
      font-size: 13px;
    `,

    container: css`
      display: flex;
      flex-direction: row;
      height: 100%;
      overflow: hidden;
      flex: 1;
      /*background-color: #0b0f1a;*/
    `,

    shellRoot: css`
      height: var(--tsd-main-panel-height) !important;
      overflow-y: hidden !important;
    `,

    sidebar: css`
      display: flex;
      flex-direction: column;
      width: 320px;
      min-width: 250px;
      border-right: 1px solid #1f2937;
      height: 100%;
      /*background-color: #111827;*/
    `,

    dragHandle: css`
      width: 8px;
      background: ${t(colors.gray[300], colors.darkGray[600])};
      cursor: col-resize;
      position: relative;
      transition: all 0.2s ease;
      user-select: none;
      pointer-events: all;
      margin: 0 ${size[1]};
      border-radius: 2px;

      &:hover {
        background: ${t(colors.blue[600], colors.blue[500])};
        margin: 0 ${size[1]};
      }

      &.dragging {
        background: ${t(colors.blue[700], colors.blue[600])};
        margin: 0 ${size[1]};
      }

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 2px;
        height: 20px;
        background: ${t(colors.gray[400], colors.darkGray[400])};
        border-radius: 1px;
        pointer-events: none;
      }

      &:hover::after,
      &.dragging::after {
        background: ${t(colors.blue[500], colors.blue[300])};
      }
    `,

    details: css`
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      overflow-y: auto;
      /*background-color: #0b0f1a;*/
    `,

    searchArea: css`
      padding: 8px;
      border-bottom: 1px solid #1f2937;
      /*background-color: #111827;*/
    `,

    list: css`
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    `,

    listItem: css`
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid #1f2937;
      cursor: pointer;
      font-size: 12px;
      /*transition: background-color 0.2s;*/
      user-select: none;

      &:hover {
        /*background-color: #1f2937;*/
      }

      &.active {
        /*background-color: #374151;*/
        border-left: 3px solid #9dec48;
      }
    `,

    timestamp: css`
      font-family: monospace;
      color: #9ca3af;
      font-size: 10px;
      white-space: nowrap;
    `,

    description: css`
      color: #e5e7eb;
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,

    detailsHeader: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-bottom: 1px solid #1f2937;
      /*background-color: #111827;*/
    `,

    detailsContent: css`
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      font-size: 12px;
    `,

    jsonTreeContainer: css`
      /*background-color: #111827;*/
      padding: 12px;
      border-radius: 8px;
      margin-top: 12px;
      border: 1px solid #1f2937;
    `,
  };
};

export function useStyles() {
    const { theme } = useTheme()
  const [styles, setStyles] = createSignal(stylesFactory(theme()));
  createEffect(() => {
    setStyles(stylesFactory(theme()));
  });
  return styles;
}

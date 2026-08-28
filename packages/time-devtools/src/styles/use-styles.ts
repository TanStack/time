import * as goober from 'goober'
import { createEffect, createSignal } from 'solid-js'
import { createTheme } from '@tanstack/devtools-ui'
import { timeAccent } from './accent'
import { buildThemeVars } from './theme-vars'
import type { TanStackDevtoolsTheme } from '@tanstack/devtools-ui'

const stylesFactory = (activeTheme: TanStackDevtoolsTheme) => {
  const { declarations, theme, accent } = buildThemeVars(activeTheme, timeAccent)
  const { color, font, space, gap, radius, shadow, type } = theme
  const css = goober.css

  const statusDot = (fill: string) => css`
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: ${fill};
  `

  return {
    mainContainer: css`
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
      padding: ${space[2]};
      font-family: ${font.body};
    `,
    dragHandle: css`
      width: 8px;
      background: ${color.border.decorative};
      cursor: col-resize;
      position: relative;
      transition: background ${theme.motion.strip} ease;
      user-select: none;
      pointer-events: all;
      margin: 0 ${space[1]};
      border-radius: 2px;

      &:hover,
      &.dragging {
        background: ${accent.solid};
      }

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 2px;
        height: 20px;
        background: ${color.text.muted};
        border-radius: 1px;
        pointer-events: none;
      }

      &:hover::after,
      &.dragging::after {
        background: ${accent.onSolid};
      }
    `,
    leftPanel: css`
      background: ${color.surface.subtle};
      border-radius: ${radius.overlay};
      border: 1px solid ${color.border.decorative};
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
      flex-shrink: 0;
    `,
    rightPanel: css`
      background: ${color.surface.subtle};
      border-radius: ${radius.overlay};
      border: 1px solid ${color.border.decorative};
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
      flex: 1;
    `,
    panelHeader: css`
      font-family: ${font.display};
      font-size: ${type.headingCompact.size};
      line-height: ${type.headingCompact.lineHeight};
      font-weight: ${type.headingCompact.weight};
      color: ${accent.text};
      padding: ${space[2]};
      border-bottom: 1px solid ${color.border.decorative};
      background: ${color.surface.subtle};
      flex-shrink: 0;
    `,
    utilList: css`
      flex: 1;
      overflow-y: auto;
      padding: ${space[1]};
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: ${gap.tight};
    `,
    utilGroup: css`
      display: flex;
      flex-direction: column;
      gap: ${gap.tight};
    `,
    utilGroupHeader: css`
      font-size: ${type.labelSm.size};
      line-height: ${type.labelSm.lineHeight};
      font-weight: ${type.labelSm.weight};
      letter-spacing: ${type.labelSm.tracking};
      color: ${color.text.muted};
      text-transform: uppercase;
      padding: ${space[1]} ${space[2]};
      background: ${color.surface.elevated};
      border-radius: ${radius.group};
    `,
    utilRow: css`
      display: flex;
      gap: ${gap.control};
      justify-content: space-between;
      align-items: center;
      padding: ${space[2]};
      background: ${color.surface.elevated};
      border-radius: ${radius.group};
      cursor: pointer;
      transition:
        background ${theme.motion.strip} ease,
        border-color ${theme.motion.strip} ease;
      border: 1px solid transparent;

      &:hover {
        background: ${color.state.hover};
        border-color: ${color.border.decorative};
      }

      &:active {
        background: ${color.state.pressed};
      }
    `,
    utilRowSelected: css`
      background: ${accent.subtleFill};
      border-color: ${accent.solid};
      box-shadow: 0 0 0 1px ${accent.focusRing};
    `,
    utilKey: css`
      font-family: ${font.mono};
      font-size: ${type.bodyXs.size};
      line-height: ${type.bodyXs.lineHeight};
      color: ${color.text.primary};
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,
    utilStatus: css`
      font-size: ${type.labelSm.size};
      line-height: ${type.labelSm.lineHeight};
      letter-spacing: ${type.labelSm.tracking};
      color: ${color.text.muted};
      text-transform: uppercase;
      padding: ${space[1]};
      background: ${color.surface.subtle};
      border-radius: ${radius.control};
      margin-left: ${space[1]};
    `,
    stateDetails: css`
      flex: 1;
      overflow-y: auto;
      padding: ${space[2]};
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: ${gap.section};
    `,
    stateHeader: css`
      display: flex;
      flex-direction: column;
      gap: ${gap.tight};
      padding-bottom: ${space[2]};
      border-bottom: 1px solid ${color.border.decorative};
    `,
    stateTitle: css`
      font-family: ${font.display};
      font-size: ${type.headingCompact.size};
      line-height: ${type.headingCompact.lineHeight};
      font-weight: ${type.headingCompact.weight};
      color: ${accent.text};
    `,
    stateKey: css`
      font-family: ${font.mono};
      font-size: ${type.bodyXs.size};
      line-height: ${type.bodyXs.lineHeight};
      color: ${color.text.muted};
      word-break: break-all;
    `,
    stateContent: css`
      background: ${color.surface.subtle};
      border-radius: ${radius.group};
      padding: ${space[2]};
      border: 1px solid ${color.border.decorative};
    `,
    detailsGrid: css`
      display: grid;
      grid-template-columns: 1fr;
      gap: ${gap.section};
      align-items: start;
    `,
    detailSection: css`
      background: ${color.surface.elevated};
      border: 1px solid ${color.border.decorative};
      border-radius: ${radius.group};
      padding: ${space[2]};
      display: flex;
      flex-direction: column;
      gap: ${gap.tight};
    `,
    detailSectionHeader: css`
      font-size: ${type.labelSm.size};
      line-height: ${type.labelSm.lineHeight};
      font-weight: ${type.labelSm.weight};
      letter-spacing: ${type.labelSm.tracking};
      color: ${color.text.secondary};
      text-transform: uppercase;
    `,
    actionsRow: css`
      display: flex;
      flex-wrap: wrap;
      gap: ${gap.control};
    `,
    actionButton: css`
      display: inline-flex;
      align-items: center;
      gap: ${gap.tight};
      padding: ${theme.padding.controlBlock} ${theme.padding.controlInline};
      border-radius: ${radius.control};
      border: 1px solid ${color.border.control};
      background: ${color.surface.elevated};
      color: ${color.text.primary};
      font-family: ${font.body};
      font-size: ${type.bodyXs.size};
      line-height: ${type.bodyXs.lineHeight};
      cursor: pointer;
      user-select: none;
      transition:
        background ${theme.motion.strip},
        border-color ${theme.motion.strip};

      &:hover {
        background: ${color.state.hover};
        border-color: ${accent.solid};
      }

      &:focus-visible {
        outline: 2px solid ${color.border.focus};
        outline-offset: 2px;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        &:hover {
          background: ${color.surface.elevated};
          border-color: ${color.border.control};
        }
      }
    `,
    actionDotBlue: statusDot(color.status.info.solidFill),
    actionDotGreen: statusDot(color.status.success.solidFill),
    actionDotRed: statusDot(color.status.error.solidFill),
    actionDotYellow: statusDot(color.status.warning.solidFill),
    actionDotOrange: statusDot(color.status.warning.border),
    actionDotPurple: statusDot(color.syntax.number),
    infoGrid: css`
      display: grid;
      grid-template-columns: auto 1fr;
      gap: ${gap.tight};
      align-items: center;
    `,
    infoLabel: css`
      color: ${color.text.muted};
      font-size: ${type.labelSm.size};
      line-height: ${type.labelSm.lineHeight};
      letter-spacing: ${type.labelSm.tracking};
      text-transform: uppercase;
    `,
    infoValueMono: css`
      font-family: ${font.mono};
      font-size: ${type.bodyXs.size};
      line-height: ${type.bodyXs.lineHeight};
      color: ${color.text.primary};
      word-break: break-all;
    `,
    noSelection: css`
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${color.text.muted};
      font-size: ${type.bodySm.size};
      font-style: italic;
      text-align: center;
      padding: ${space[4]};
    `,
    sectionContainer: css`
      display: flex;
      flex-wrap: wrap;
      gap: ${gap.sectionLarge};
    `,
    section: css`
      background: ${color.surface.subtle};
      border-radius: ${radius.overlay};
      box-shadow: ${shadow.sm};
      padding: ${space[4]};
      border: 1px solid ${color.border.decorative};
      min-width: 0;
      max-width: 33%;
      max-height: fit-content;
      display: flex;
      flex-direction: column;
      gap: ${gap.section};
    `,
    sectionHeader: css`
      font-family: ${font.display};
      font-size: ${type.headingPane.size};
      line-height: ${type.headingPane.lineHeight};
      font-weight: ${type.headingPane.weight};
      color: ${accent.text};
      display: flex;
      align-items: center;
      gap: ${gap.control};
    `,
    sectionEmpty: css`
      color: ${color.text.muted};
      font-size: ${type.bodySm.size};
      font-style: italic;
      margin: ${space[2]} 0;
    `,
    instanceList: css`
      display: flex;
      flex-direction: column;
      gap: ${gap.control};
      background: ${color.surface.elevated};
      border: 1px solid ${color.border.decorative};
    `,
    instanceCard: css`
      background: ${color.surface.elevated};
      border-radius: ${radius.group};
      padding: ${space[3]};
      border: 1px solid ${color.border.decorative};
      font-family: ${font.mono};
      font-size: ${type.bodyXs.size};
      line-height: ${type.bodyXs.lineHeight};
      color: ${color.text.primary};
      overflow-x: auto;
    `,
    shellRoot: css`
      ${declarations}
      height: var(--tsd-main-panel-height) !important;
      overflow-y: hidden !important;
    `,
    searchArea: css`
      padding: ${space[2]};
      border-bottom: 1px solid ${color.border.decorative};
    `,
    detailsHeader: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: ${space[3]};
      border-bottom: 1px solid ${color.border.decorative};
    `,
  }
}

export function useStyles() {
  const { theme } = createTheme()
  const [styles, setStyles] = createSignal(stylesFactory(theme()))
  createEffect(() => {
    setStyles(stylesFactory(theme()))
  })
  return styles
}

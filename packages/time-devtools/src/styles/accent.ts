import type { TanStackDevtoolsTheme } from '@tanstack/devtools-ui'

type ThemePair = Record<TanStackDevtoolsTheme, string>

export type DevtoolsAccent = {
  solid: ThemePair
  text: ThemePair
  onSolid: ThemePair
}

export const timeAccent: DevtoolsAccent = {
  solid: { light: '#4a7c15', dark: '#9dec48' },
  text: { light: '#4a7c15', dark: '#9dec48' },
  onSolid: { light: '#ffffff', dark: '#111111' },
}

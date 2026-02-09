import * as goober from 'goober'
import { createEffect, createSignal } from 'solid-js'
import { useTheme } from '@tanstack/devtools-ui'
import { tokens } from './tokens'

const stylesFactory = () => {
  const { font, size } = tokens
  const css = goober.css

  return {
    mainContainer: css`
      display: flex;
      flex: 1;
      min-height: 80%;
      overflow: hidden;
      padding: ${size[2]};
    `,
  }
}

export function useStyles() {
  const { theme } = useTheme()
  const [styles, setStyles] = createSignal(stylesFactory())
  createEffect(() => {
    setStyles(stylesFactory())
  })
  return styles
}

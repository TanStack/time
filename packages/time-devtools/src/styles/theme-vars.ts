import { resolveSemanticTheme } from '@tanstack/devtools-ui/internal'
import type { SemanticTheme } from '@tanstack/devtools-ui/internal'
import type { TanStackDevtoolsTheme } from '@tanstack/devtools-ui'
import type { DevtoolsAccent } from './accent'

const VAR_PREFIX = '--tsd'

type Primitive = string | number | boolean

type VarRefs<TNode> = TNode extends Primitive
  ? string
  : { readonly [Key in keyof TNode]: VarRefs<TNode[Key]> }

const toKebab = (segment: string) => segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const varName = (path: Array<string>) => `${VAR_PREFIX}-${path.map(toKebab).join('-')}`

const isBranch = (node: unknown): node is Record<string, unknown> =>
  typeof node === 'object' && node !== null

const walk = (
  node: unknown,
  path: Array<string>,
  declarations: Array<string>,
): VarRefs<unknown> => {
  if (!isBranch(node)) {
    declarations.push(`${varName(path)}: ${String(node)};`)
    return `var(${varName(path)})` as VarRefs<unknown>
  }

  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [key, walk(value, [...path, key], declarations)]),
  ) as VarRefs<unknown>
}

const accentDeclarations = (accent: DevtoolsAccent, theme: TanStackDevtoolsTheme) => [
  `${VAR_PREFIX}-accent-solid: ${accent.solid[theme]};`,
  `${VAR_PREFIX}-accent-text: ${accent.text[theme]};`,
  `${VAR_PREFIX}-accent-on-solid: ${accent.onSolid[theme]};`,
  `${VAR_PREFIX}-accent-subtle-fill: color-mix(in srgb, ${accent.solid[theme]} 14%, transparent);`,
  `${VAR_PREFIX}-accent-focus-ring: color-mix(in srgb, ${accent.solid[theme]} 40%, transparent);`,
]

const accentRefs = {
  solid: `var(${VAR_PREFIX}-accent-solid)`,
  text: `var(${VAR_PREFIX}-accent-text)`,
  onSolid: `var(${VAR_PREFIX}-accent-on-solid)`,
  subtleFill: `var(${VAR_PREFIX}-accent-subtle-fill)`,
  focusRing: `var(${VAR_PREFIX}-accent-focus-ring)`,
} as const

export type ThemeVars = {
  declarations: string
  theme: VarRefs<SemanticTheme>
  accent: typeof accentRefs
}

export function buildThemeVars(theme: TanStackDevtoolsTheme, accent: DevtoolsAccent): ThemeVars {
  const declarations: Array<string> = []
  const refs = walk(resolveSemanticTheme(theme), [], declarations) as VarRefs<SemanticTheme>

  return {
    declarations: [...declarations, ...accentDeclarations(accent, theme)].join('\n'),
    theme: refs,
    accent: accentRefs,
  }
}

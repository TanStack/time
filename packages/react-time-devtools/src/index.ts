'use client'

import type { createSolidPanel } from '@tanstack/devtools-utils/solid'
import * as Devtools from './TimeDevtools'
import * as plugin from './plugin'

type SolidPanelComponent = ReturnType<typeof createSolidPanel>[0]

export const TimeDevtoolsPanel: SolidPanelComponent =
  process.env.NODE_ENV !== 'development'
    ? Devtools.TimeDevtoolsPanelNoOp
    : Devtools.TimeDevtoolsPanel

export const timeDevtoolsPlugin =
  process.env.NODE_ENV !== 'development'
    ? plugin.timeDevtoolsNoOpPlugin
    : plugin.timeDevtoolsPlugin

export type { TimeDevtoolsReactInit } from './TimeDevtools'

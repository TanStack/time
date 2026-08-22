'use client'

import * as Devtools from './TimeDevtools'
import * as plugin from './plugin'
import type { JSX } from 'react'
import type { TimeDevtoolsReactInit } from './TimeDevtools'

type ReactPanelComponent = (props: TimeDevtoolsReactInit) => JSX.Element | null

export const TimeDevtoolsPanel: ReactPanelComponent =
  process.env.NODE_ENV !== 'development'
    ? Devtools.TimeDevtoolsPanelNoOp
    : Devtools.TimeDevtoolsPanel

export const timeDevtoolsPlugin =
  process.env.NODE_ENV !== 'development' ? plugin.timeDevtoolsNoOpPlugin : plugin.timeDevtoolsPlugin

export type { TimeDevtoolsReactInit } from './TimeDevtools'

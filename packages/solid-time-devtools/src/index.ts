import * as Devtools from "./TimeDevtools";
import * as plugin from "./plugin";

export const TimeDevtools =
  process.env.NODE_ENV !== "development"
    ? Devtools.TimeDevtoolsPanelNoOp
    : Devtools.TimeDevtoolsPanel;

export const timeDevtoolsPlugin =
  process.env.NODE_ENV !== "development"
    ? plugin.timeDevtoolsNoOpPlugin
    : plugin.timeDevtoolsPlugin;

export type { TimeDevtoolsSolidInit } from "./TimeDevtools";

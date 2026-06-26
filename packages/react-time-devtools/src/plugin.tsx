import { createReactPlugin } from "@tanstack/devtools-utils/react";
import { TimeDevtoolsPanel } from "./TimeDevtools";

const [timeDevtoolsPlugin, timeDevtoolsNoOpPlugin] = createReactPlugin({
  Component: TimeDevtoolsPanel,
  name: "TanStack Time",
  id: "tanstack-time",
  defaultOpen: true,
});

export { timeDevtoolsPlugin, timeDevtoolsNoOpPlugin };

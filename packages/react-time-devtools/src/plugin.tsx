import { createReactPlugin } from "@tanstack/devtools-utils/react";
import type { TanStackDevtoolsPluginProps } from "@tanstack/devtools";
import type { JSX } from "react";
import { TimeDevtoolsPanel } from "./TimeDevtools";

type TimeDevtoolsPluginFactory = () => {
  render: (el: HTMLElement, props: TanStackDevtoolsPluginProps) => JSX.Element;
  name: string;
  id?: string;
  defaultOpen?: boolean;
};

const [timeDevtoolsPlugin, timeDevtoolsNoOpPlugin]: readonly [
  TimeDevtoolsPluginFactory,
  TimeDevtoolsPluginFactory,
] = createReactPlugin({
  Component: TimeDevtoolsPanel,
  name: "TanStack Time",
  id: "tanstack-time",
  defaultOpen: true,
});

export { timeDevtoolsPlugin, timeDevtoolsNoOpPlugin };

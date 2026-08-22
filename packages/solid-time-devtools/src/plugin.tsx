import { createSolidPlugin } from "@tanstack/devtools-utils/solid";
import type { TanStackDevtoolsPluginProps } from "@tanstack/devtools";
import type { JSX } from "solid-js";
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
] = createSolidPlugin({
  Component: TimeDevtoolsPanel,
  name: "TanStack Time",
  id: "tanstack-time",
  defaultOpen: true,
});

export { timeDevtoolsPlugin, timeDevtoolsNoOpPlugin };

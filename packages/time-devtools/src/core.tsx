import { constructCoreClass } from "@tanstack/devtools-utils/solid";

const [TimeDevtoolsCore, TimeDevtoolsCoreNoOp] = constructCoreClass(
  () => import("./components/ThemedShell"),
);

export interface TimeDevtoolsInit {}

export { TimeDevtoolsCore, TimeDevtoolsCoreNoOp };

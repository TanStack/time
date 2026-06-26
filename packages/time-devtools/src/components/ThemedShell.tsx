import { ThemeContextProvider } from "@tanstack/devtools-ui";
import type { TanStackDevtoolsPluginProps } from "@tanstack/devtools";
import Shell from "./Shell";

export default function ThemedShell(props: TanStackDevtoolsPluginProps) {
  return (
    <ThemeContextProvider theme={props.theme ?? "dark"}>
      <Shell />
    </ThemeContextProvider>
  );
}

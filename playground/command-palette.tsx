import { useMemo } from "react";

import { Command, type CommandGroupData } from "../src";
import { CATALOG } from "./catalog";
import { useRouter } from "./router";
import { PAGES } from "./site-pages";

const commandItemIcon = "mr-2 h-4 w-4 shrink-0 text-foreground-muted";
// The library's CommandDialog is roomy (h-12 input, py-3 items) to match the generic
// "Type a command…" demo — this header search wants the same compact rows upstream's
// own site-wide search uses, so it swaps the root classes through `classNames.root`.
const commandRootClassName =
  "overflow-hidden rounded-md bg-overlay text-foreground-light **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:font-mono **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:text-foreground-muted [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 **:[[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 **:[[cmdk-input]]:h-10 **:[[cmdk-item]]:rounded-xs **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-1.5 **:[[cmdk-item]]:text-sm [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4";

/**
 * Header search: every page and component, grouped like the sidebar. Loaded lazily
 * by CommandMenu in app.tsx (cmdk and the rows aren't needed until it opens).
 */
export default function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { navigate } = useRouter();

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  const groups: CommandGroupData[] = useMemo(
    () => [
      {
        key: "pages",
        heading: "Pages",
        items: PAGES.map((page) => {
          const Icon = page.icon;
          return {
            key: page.to,
            value: page.search,
            label: page.label,
            icon: <Icon className={commandItemIcon} />,
            onSelect: () => go(page.to),
          };
        }),
      },
      ...CATALOG.map((group) => ({
        key: group.key,
        heading: group.title,
        items: group.entries.map((entry) => {
          const Icon = entry.icon;
          return {
            key: entry.id,
            value: entry.title,
            label: entry.title,
            icon: <Icon className={commandItemIcon} />,
            onSelect: () => go(`/components/${entry.id}`),
          };
        }),
      })),
    ],
    // CATALOG and PAGES are module-level constants — this never actually reruns.
    []
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search components"
      placeholder="Search components…"
      groups={groups}
      /*
       * 63 rows would otherwise stretch the dialog to the viewport height (the
       * shared CommandList defaults to max-h-full, i.e. uncapped) — upstream's own
       * search dialog caps its list the same way (max-h-[300px] in its live DOM).
       */
      classNames={{ root: commandRootClassName, list: "max-h-75" }}
    />
  );
}

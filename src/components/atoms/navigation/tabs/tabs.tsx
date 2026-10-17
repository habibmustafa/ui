import type * as React from "react";

import {
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "./tabs-parts";
import { cn } from "../../../../lib/utils";

const GRID_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
} as const;

export interface TabItem<TValue extends string = string> {
  value: TValue;
  label: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Extra props for this item's trigger (handlers, `data-*`, class). */
  triggerProps?: Omit<
    React.ComponentProps<typeof TabsTrigger>,
    "value" | "children" | "disabled"
  >;
  /** Class for this item's content panel; joins `classNames.content`. */
  contentClassName?: string;
}

export interface TabsClassNames {
  /** The row holding the list and `toolbar`. */
  header?: string;
  list?: string;
  trigger?: string;
  content?: string;
}

type RootProps = React.ComponentProps<typeof TabsRoot>;

type TabsItemsProps<TValue extends string> = Omit<
  RootProps,
  "value" | "defaultValue" | "onValueChange" | "children"
> & {
  items: readonly TabItem<TValue>[];
  value?: TValue;
  defaultValue?: TValue;
  onValueChange?: (value: TValue) => void;
  /** Render the animated underline, as in the upstream demo. @default true */
  indicator?: boolean;
  classNames?: TabsClassNames;
  /**
   * `fill` spreads the triggers across the full width in equal columns; `inline` keeps them
   * at their natural width, left-aligned (set the gap with `classNames.list`).
   * @default 'fill'
   */
  layout?: "fill" | "inline";
  /** Extra controls beside the tab list (a device switcher, an action), in one row with it. */
  toolbar?: React.ReactNode;
  /** Accessible name of the tab list. */
  listLabel?: string;
  children?: never;
};

type TabsCompoundProps = RootProps & { items?: never };

export type TabsProps<TValue extends string = string> =
  TabsItemsProps<TValue> | TabsCompoundProps;

/** Puts the list and the toolbar in one row; without a toolbar the list stands alone. */
function ToolbarRow({
  toolbar,
  className,
  children,
}: {
  toolbar: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  if (toolbar == null) return children;
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      {children}
      {toolbar}
    </div>
  );
}

export function TabsHybrid<TValue extends string = string>(
  props: TabsProps<TValue>,
) {
  if (props.items === undefined) {
    return <TabsRoot {...props} />;
  }

  const {
    items,
    value,
    defaultValue,
    onValueChange,
    indicator = true,
    classNames,
    layout = "fill",
    listLabel,
    toolbar,
    ...rootProps
  } = props;

  const count = items.length;
  const fill = layout === "fill";
  const colsClass = fill
    ? GRID_COLS[count as keyof typeof GRID_COLS]
    : undefined;

  return (
    <TabsRoot
      {...rootProps}
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={
        onValueChange ? (v) => onValueChange(v as TValue) : undefined
      }
    >
      <ToolbarRow toolbar={toolbar} className={classNames?.header}>
        <TabsList
          aria-label={listLabel}
          className={cn(fill && "grid w-full", colsClass, classNames?.list)}
          style={
            fill && !colsClass
              ? { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }
              : undefined
          }
        >
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              {...item.triggerProps}
              className={cn(classNames?.trigger, item.triggerProps?.className)}
            >
              {item.icon}
              {item.label}
            </TabsTrigger>
          ))}
          {indicator && <TabsIndicator />}
        </TabsList>
      </ToolbarRow>

      {items.map((item) => (
        <TabsContent
          key={item.value}
          value={item.value}
          className={cn(classNames?.content, item.contentClassName)}
        >
          {item.content}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}

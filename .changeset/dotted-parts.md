---
'@habibmustafa/ui': minor
---

`Form`, `Sidebar` and `Chart` get dotted parts like the other compound components: `Form.Field`, `Form.Item`, `Form.Label`, `Form.Control`, `Form.Description`, `Form.Message`, `Form.InputGroupInput`, `Form.InputGroupTextArea`; `Sidebar.Provider`, `Sidebar.Header`, `Sidebar.Content`, `Sidebar.Menu`, `Sidebar.MenuItem`, `Sidebar.MenuButton` and the rest; `Chart.Container`, `Chart.Legend`, `Chart.LegendContent`, `Chart.Tooltip`, `Chart.TooltipContent`, `Chart.Style`. The long names (`FormItem`, `SidebarMenu`, `ChartContainer`, …) are still exported. `Form` is now its own component that renders react-hook-form's provider, so the dotted parts are not attached to react-hook-form's export.

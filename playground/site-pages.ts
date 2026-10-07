import { Home, LayoutGrid, Paintbrush, Palette, Rocket, Type as TypeIcon } from "lucide-react";

/** Top-level pages, shared by the sidebar and the search palette. */
export const PAGES = [
  { to: "/", label: "Home", search: "Home overview", icon: Home },
  { to: "/getting-started", label: "Getting started", search: "Getting started install setup", icon: Rocket },
  { to: "/components", label: "Components", search: "Components index", icon: LayoutGrid },
  { to: "/theme", label: "Theme builder", search: "Theme builder colors palette", icon: Paintbrush },
  { to: "/colors", label: "Colors", search: "Colors tokens", icon: Palette },
  { to: "/typography", label: "Typography", search: "Typography type scale", icon: TypeIcon },
];

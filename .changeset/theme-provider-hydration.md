---
'@habibmustafa/ui': patch
---

`ThemeProvider` is safe to hydrate. The stored theme and the system preference are now read
with `useSyncExternalStore`, so server-rendered HTML and the first client render agree (both
start from `defaultTheme` and a light system theme) and the real values apply right after
hydration, before the browser paints. Before, a stored `dark` choice made the first client
render differ from the server's and React reported a hydration mismatch. Client-only apps
behave as before: they read the stored theme on the first render.

---
"@habibmustafa/ui": minor
---

**Breaking:** `sonner` 1 → 2. `SonnerToaster` renders sonner 2's
`<Toaster>`; if your app calls `toast()` from its own `sonner` install, upgrade it to
2.x too so both share one toast store (otherwise toasts are never shown).

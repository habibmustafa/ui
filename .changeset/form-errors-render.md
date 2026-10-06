---
"@habibmustafa/ui": patch
---

Fixed: form validation errors never appeared. `useFormField` read react-hook-form's
`formState` proxy straight from context; in the React Compiler build that read was
memoised away, so `FormMessage`, `FormLabel`'s error colour and `aria-invalid` never
updated. It now subscribes with `useFormState`.

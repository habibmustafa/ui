# Hibrid API — cari texniki qaydalar

Bu sənəd hibrid komponenti dəyişəndə istifadə olunur. Mövcud
`dialog.tsx`/`dialog-parts.tsx` və
`dialog-demo.tsx`/`dialog-props-demo.tsx` cütü işlək istinaddır.

## Uyğunluq və iki rejim

Yalnız Root və bir neçə mənalı public hissəsi olan komponent hibrid olur. Ayırd edici prop
(`items`, `options`, `columns` və s.) əl ilə hissə yığmağı əvəz etməlidir. Tək elementli
komponentə və ya tam sxem generatoru tələb edən sistemə süni ikinci API əlavə etmə.
`Chart`-ın məhdud props API-si ümumi hibrid nümunəsi deyil; Sonner, Calendar, Form və Sidebar
qəsdən hibridləşdirilməyib.

```tsx
<Tabs items={items} />
<Tabs.Root><Tabs.List><Tabs.Trigger value="a">A</Tabs.Trigger></Tabs.List></Tabs.Root>
```

Props rejimi `<Component … />`, compound rejimi `<Component.Root>` və `<Component.Child>`
yazılır. Hər hissənin əvvəlki named export-u (`TabsTrigger` və s.) uyğunluq üçün qalır.

## Struktur və strategiya

`<name>-parts.tsx` compound hissələri, `<name>.tsx` props renderini, `index.ts` isə
`Object.assign(Hybrid, { Root, Child, … })` namespace-ini və named export-ları saxlayır.
Fragmentlərdə də eyni bölgü tətbiq olunur. Props renderi mövcud hissələri və digər atomları
kompozisiya edir; Radix/cmdk/vaul-u ikinci dəfə birbaşa yığıb davranışı təkrarlamır.
Fragment üçün yeni props kompozisiyası yazmazdan əvvəl upstream `packages/ui-patterns`-da
hazır uyğun variantı yoxla.

| Strategiya | Şərt | Rejim seçimi |
|---|---|---|
| A | Compound root-da olmayan ayırd edici prop və ya prop dəsti var | `props.items !== undefined` kimi açıq yoxlama; ayırd edici prop yoxdursa compound root |
| B | `children`, `open` və digər sahələr iki rejimdə də işlənir | `<Component>` props renderi, `<Component.Root>` compound root |

Strategiya A-da `PropsMode | CompoundMode` union-u data prop-un compound rejimə düşməsini
tip səviyyəsində qadağan edir (`items?: never`). `children` props rejimində mənalı deyilsə
`children?: never` əlavə et; Card kimi body qəbul edən rejimdə onu saxla. Strategiya B-də
köhnə root adı `ComponentRoot` named export-u kimi qalır. Rejimi `child.type` və ya JSX
uşağının quruluşuna baxaraq təxmin etmə.
Birdən çox sahə `||` ilə yoxlanırsa (Card, Alert), TypeScript compound branch-ı avtomatik
daraltmaya bilər; həmin branch-da dəqiq compound tipinə cast et.

Namespace hissələri wrapper deyil, mövcud hissələrə birbaşa istinaddır. `Object.assign`-ə
əlavə olunan **hər hissənin prop tipini** `-parts.tsx`-dən export et; əks halda declaration
bundle `TS4023` ilə sına bilər. Birbaşa Radix export-una statik sahə yapışdırma; əvvəl
öz funksiya komponentini qur. Hook-ları rejim branch-ından kənarda, şərtsiz çağır.

## Props rejiminin davranışı

- Default görünüşdə upstream demo və compound nümunənin DOM-u, class-ları, ARIA-sı, focus
  idarəsi, portalı və animasiyası eyni qalır. Variant tiplərini hissənin prop tipindən çıxar;
  paralel union yazma. Yeni data prop üçün sinifləri literal xəritədə saxla, dinamik Tailwind
  class adı qurma. Upstream demo yoxdursa, minimal hissə kompozisiyası seç
  qeyd et.
- `open/defaultOpen/onOpenChange`, `value/defaultValue/onValueChange` kimi adları saxla.
  Lazım olanda `src/lib/use-controllable-state.ts`-dən istifadə et; controlled state-i
  `useEffect` ilə təkrarlama. Tabs/Accordion/Select/RadioGroup dəyər tiplərini mümkün olduqda
  `TValue extends string` ilə generik saxla. `trigger` elementi hissənin Trigger-i ilə `asChild`
  vasitəsilə render olunur.
- Slot mənaları: `undefined` — default görünüş; `null` — hissəni gizlət;
  `ReactNode` — xüsusi məzmun; `(ctx) => ReactNode` — daxili state-ə çıxışlı məzmun.
  Məzmun prop-u yalnız `string` ilə məhdudlaşmır.
- `className` xarici vizual elementə gedir; `classNames` hissə üzrə siniflərdir;
  `slotProps` hissələrin öz prop tiplərindən törəyir. Class birləşmə sırası:
  default → `classNames.x` → `slotProps.x.className`.
- Lazımsız birinci səviyyə boolean prop-ları və paralel variant şkalası artırma;
  `null` slot, `classNames`, `slotProps` və ya compound kompozisiyasını seç. `MenuItem`
  variantı yalnız uyğun compound hissə varsa əlavə olunur. Props renderi üçün yeni token,
  CSS faylı və runtime dependency uydurma.
- `content` və `title` React `HTMLAttributes`-də artıq var. Eyni adlı props sahəsi
  əlavə edəndə root tipindən onları açıq `Omit` et; yalnız `children`-i çıxarmaq kifayət deyil.
- Async `onConfirm` zamanı pending/loading göstər, Cancel və overlay dismiss-i blokla,
  uğurla bitəndə `closeOnConfirm` qaydasına görə bağla (`true` default); Promise rədd edilərsə
  dialoq açıq qalsın və xətanı udma.

## Playground və yoxlama

Hər uyğun hibrid nümunə üçün props və compound faylını
`playground/registry.tsx`-də `codeVariants: [{ id: 'props', ... }, { id: 'compound', ... }]`
ilə cütləşdir. `Preview` props nümunəsini göstərir; compound faylı `.Root`/`.Child` yazır.
Əgər props API eyni davranışı ifadə etmirsə, saxta nümunə düzəltmə
qeyd et. Flat komponentlərdə ikinci rejim yaratma.

Yeni hibrid keçidindən əvvəl compound nümunənin golden baseline-ını yarat. Mövcud golden HTML
dəyişməməlidir. Dəyişiklik qəsdəndirsə, səbəbini testdə
izah et; sadəcə testi keçirmək üçün snapshot yeniləmə. `npm run verify` build, lint,
class/token yoxlamaları və testləri birlikdə işlədir. Qərarı və nəticəni eyni turda
sənədləşdir.

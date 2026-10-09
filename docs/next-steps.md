# Növbəti işlər: D və F

Bu fayl başqa kompüterdən (və ya yeni söhbətdən) davam etmək üçündür: nə hazırdır, nə qalıb,
hər iş nə üçündür və koda haradan girmək lazımdır. Ümumi araşdırma və dizayn planı
[design-research.md](design-research.md)-dədir, bu fayl onun davamıdır.

## Hazırda nə var

Branch: `release/0.4.0`. Bitmiş mərhələlər (hamısı commit olunub):

| Mərhələ | Nəticə |
|---|---|
| A. Düzəlişlər | Mobil daşma, 44 px toxunma hədəfi, `LocaleProvider`, README sayları, mətn düzəlişləri |
| B. Hero | Landing-də canlı tema aləti (rəng, hue, presetlər, ölçülmüş kontrast, real komponentlər) |
| C. Qalereya | `/components` səhifəsində 98 canlı, qeyri-interaktiv kiçik önizləmə |
| E. Blocks | `/blocks`: 40 hazır ekran (Authentication, Application, Data, Commerce, Marketing kateqoriyaları), hər biri Preview və Code ilə |
| Əlavə | Defolt qrafik rəngi aksentə bağlandı, Date/Time ikonları eynilədi, bir neçə kitabxana düzəlişi |

Qalan iki iş **D** və **F**-dir. Biri digərindən asılı deyil. Tövsiyə olunan sıra: D, sonra F.

---

## D. Komponent səhifəsi v2 (props playground)

### Problem

Bir komponentin səhifəsində (məsələn `/components/button`) hər nümunə təxminən 260 px
hündürlüyündə boş bir qutudur, ortasında kiçik bir element durur. Kod ayrı "Code" tabının
arxasındadır. Komponentin seçimlərini (`variant`, `size`…) görmək üçün kodu oxumaq və ya
bir neçə ayrı nümunəyə baxmaq lazımdır.

### Hədəf

1. **Kompakt səhnə.** Nümunə qutusu ~160 px, mərkəzdə, ortada boş yer qalmır.
2. **Props playground.** Səhnənin yanında idarələr: `variant`, `size`, `loading`, `disabled`…
   Birini dəyişəndə komponent canlı dəyişir, aşağıdakı kod da dəyişir və kopyalanır.
3. **Tək "Code" açarı.** Hər nümunədə ayrı tab əvəzinə bir yerdə kod göstərilir.

### Əsas ideya: idarələr əl ilə yazılmır

`playground/generated/api.ts` artıq hər komponentin prop-larını tipləri ilə saxlayır, məsələn
`"primary" | "default" | "secondary" | …`. Union tipli prop = seçim siyahısı (Select və ya
ToggleGroup), `boolean` = Switch, `string` = Input, `number` = NumberInput. Funksiya,
`ReactNode`, `ref` tipli prop-lar idarədən çıxarılır. Komponent əlavə olunanda idarələr
özü gəlir.

### Koda haradan girmək

- `playground/pages/component-page.tsx`: səhifənin quruluşu (`PageContents`, `ComponentPreview`, `ApiReference`).
- `playground/component-preview.tsx`: bir nümunənin göstərilməsi. `getDemo` və `useNearViewport` ixrac olunub.
- `playground/api-reference.tsx` və `playground/generated/api.ts`: prop cədvəlləri və tiplər.
- `playground/registry.tsx`: hər komponentin nümunələri (`previews`).
- `playground/component-thumbnail.tsx`: qalereya üçün yazılmış kiçik önizləmə, nümunəni necə yükləyib göstərməyi orada görmək olar.

### Qərarlar, bunlar təklifdir

- Playground **əlavə bir nümunə** olmalıdır (bir komponentin "Playground" bölməsi), mövcud nümunələri əvəz etməməlidir. Bu, 327 nümunənin və golden snapshot-ların pozulmasının qarşısını alır.
- Playground-un kodu `ReactNode` kimi prop-lar üçün sabit mətn uşaq (`children`) qoyur (düymə üçün "Button" kimi). Hər komponent üçün bu qaydanı registry-də `playground: { children: 'Save changes' }` ilə dəyişmək olar.
- İlk addım **yalnız Button, Badge, Switch, Alert** kimi sadə, prop-ları sadə olan 4-5 komponentdə işləməlidir. Sonra ümumiləşdirilir.
- Kod göstəricisi mövcud `CodeSnippet` komponentindən istifadə etməlidir.

### Qəbul meyarı

- `/components/button`-da `variant` və `size` dəyişəndə düymə canlı dəyişir və kod düzgün yenilənir.
- Boolean prop `false` olanda koda yazılmır, defolt dəyər koda yazılmır.
- Klaviatura ilə hər idarəyə çatmaq olur.
- Mobildə (390 px) üfüqi daşma yoxdur.
- Yeni test: tiplərdən idarə yaradan funksiya üçün və koda çevirmə üçün (union, boolean, defolt, `children`).

### Risklər

- Bəzi komponentlər (məsələn overlay-lər) açıq olmadan görünmür. Onlar üçün playground göstərilmir, mövcud nümunələr qalır.
- Hybrid komponentlərdə iki rejim var (props və compound). Playground yalnız props rejimini göstərir.

---

## F. Theme builder v2

### Problem

`/theme` səhifəsi işləyir (rəng seçilir, bütün səhifə yenilənir, CSS və kod götürülür), amma
"bu tema əlçatandırmı?" sualına cavab vermir və ixrac yalnız CSS və kodla məhdudlaşır.

### Hədəf

1. **Rəng cədvəli.** Generatorun yaratdığı tonlar (`--brand-default` və `200`–`600`), hər biri üçün `oklch` L/C/H rəqəmləri. Açıq və tünd rejim yan-yana.
2. **Kontrast matrisi.** Mətn rəngləri (əsas, ikinci dərəcəli, brend linki, düymə mətni) × fonlar (səhifə, kart, brend fonu) cədvəli, hər xanada nisbət və AA/AAA/uğursuz. Landing-dəki hero artıq bunun 3 xanalıq versiyasını edir (`playground/hero-contrast.ts`).
3. **Önizləmə olaraq Blocks.** İndiki `theme-preview.tsx` əvəzinə `/blocks`-dakı 12 ekrandan birini seçib onda baxmaq.
4. **Tailwind v4 ixracı.** Hazır `@theme { --color-brand-… }` bloku, mövcud "CSS" və "kod" tablarının yanında.
5. **Rəngkorluq simulyasiyası.** Önizləməyə protanopia, deuteranopia, tritanopia filtrləri (SVG `feColorMatrix`), kontrast problemlərini görmək üçün.

### Koda haradan girmək

- `playground/pages/theme-builder.tsx`: səhifə və idarələr. `ColorField` artıq `playground/color-field.tsx`-dədir.
- `playground/pages/theme-preview.tsx`: indiki önizləmə.
- `playground/theme-store.ts`: state, `toConfig`, `fromConfig`, URL ilə paylaşma.
- `src/theme/create-theme.ts`: generator (`createTheme`, `themeToCss`). Çıxışı `{ config, shared, light, dark }`-dir.
- `src/theme/color.ts`: `parseColor`, `contrastRatio`, `toHex`, `toOklchCss`.
- `playground/hero-contrast.ts`: DOM-dan kontrast ölçmək (canvas ilə rəng çevirməsi) və `gradeContrast`.
- `playground/blocks/`: önizləmə üçün hazır ekranlar.

### Qərarlar, bunlar təklifdir

- Kontrast matrisi **token dəyərlərindən yox, DOM-da həqiqətən çəkilmiş elementlərdən** ölçülməlidir (hero kimi), çünki neytral fonlar generatorun çıxışında yoxdur.
- Rəngkorluq filtri yalnız önizləmə sahəsinə tətbiq olunur, səhifənin qalan hissəsinə yox.
- Tailwind ixracı üçün yeni asılılıq lazım deyil: `createTheme` çıxışından mətn kimi yığılır.

### Qəbul meyarı

- Matris açıq və tünd rejimdə doğru rəqəmlər göstərir və rəng dəyişəndə yenilənir.
- Tailwind blokunu yeni Tailwind v4 layihəsinə yapışdıranda tema işləyir (əl ilə bir dəfə yoxlayın).
- Filtr seçiləndə yalnız önizləmə dəyişir, filtri söndürəndə hər şey qayıdır.
- Mobildə daşma yoxdur.
- Testlər: matris hesablaması, Tailwind mətninin formatı.

---

## Dizayn qaydaları (frontend-design)

Hər iki iş üçün [design-research.md](design-research.md)-dəki prinsiplər keçərlidir:

- Bir "yüksək səs", qalanı sakit. Yeni bəzək əlavə etməyin.
- Cümlə hərfi ilə yazın, ALL CAPS etiket və "→" düymələrdə yoxdur.
- Hərəkət yalnız istifadəçinin hərəkətinə cavab olaraq (scroll-da fade-up yoxdur).
- Mətn son istifadəçinin dilində: "Save changes" ("Submit" yox), xəta nə olduğunu və nə etməli olduğunu deyir.
- Mobildə, tünd rejimdə və klaviaturada yoxlayın. Real brauzerdə baxmadan "hazır" demək olmaz.

## Praktik qeydlər (başqa kompüterdə lazım olacaq)

**İşə salmaq:** `npm install`, sonra `npm run dev` (adətən `http://localhost:5173`).

**Hər dəyişiklikdən sonra yoxlama:**

```bash
npx tsc -b
npm run lint
npm run build:lib
npm run check:classes
npx vitest run
```

**Məlum xüsusiyyətlər, bunlar sizin dəyişikliyiniz deyil:**

- **7 golden testi Windows-da düşür** (`admonition-button`, `radio-group-card*`). Səbəb: CRLF sətir sonları. Linux və CI-də keçir.
- `NavigationMenu` testi yük altında bəzən təsadüfən düşür, təkdə keçir.
- `structure` testi Windows-da CRLF üzündən düşə bilər, `playground/registry.tsx`-i LF ilə yoxlayın.
- **`npm run api:generate` Windows-da mövcud komponentlərin bəzi girişlərini fərqli yazır** (məsələn `Collapsible`). Yeni komponent və ya prop əlavə edəndə nəticəni olduğu kimi commit etməyin: yalnız dəyişən komponentlərin girişlərini `playground/generated/api.ts`-ə köçürün. Linux-da yaradılan nəticə düzgündür.
- Golden snapshot-ları yeniləmək: `npx vitest run tests/golden -u -t "<ad>"`. Yalnız nəzərdə tutulan dəyişiklikdən sonra.
- `check:classes` nümunədəki sətirləri sinif sayarsa, onları `scripts/check-classes.mjs`-dəki siyahıya səbəbi ilə əlavə edin.

**Commit qaydası bu layihədə:** dəyişiklikləri məntiqi hissələrə bölün (kitabxana, sayt), hər kitabxana dəyişikliyi üçün `.changeset/*.md` yazın, commit mesajında AI qeydi və `Co-Authored-By` olmasın.

## Yeni söhbətə başlamaq üçün hazır mətn

> `docs/next-steps.md` və `docs/design-research.md` faylını oxu. Layihə: `@habibmustafa/ui`
> (React 19 komponent kitabxanası, `release/0.4.0` branch-i). İndi **D** mərhələsini edək:
> komponent səhifəsi v2 və props playground. Əvvəl 4-5 sadə komponentdə (Button, Badge,
> Switch, Alert) işlət, real brauzerdə yoxla (açıq/tünd, mobil), sonra ümumiləşdir. Qərarların
> hamısı fayldadır, əlavə sual vermə, yalnız real qərar lazım olanda soruş.

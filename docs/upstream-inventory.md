# Upstream-dən törəmə kodun inventarı

Məqsəd: `THIRD-PARTY-NOTICES.md`-dəki Apache 2.0 bildirişini silə bilmək üçün nəyin yenidən
yazılmalı olduğunu bilmək. Bu sənəd **qiymətləndirmədir, hüquqi rəy deyil**. Hər sətrin sərhədini
yalnız orijinal ilə fayl-fayl müqayisə dəqiqləşdirə bilər (bax "Yoxlama qaydası").

## Metod

- Git tarixçəsi: ilkin importda (`8f52b6f`, `396f779`, `2cc9eaa`, 2026-09-22) olan komponent faylları.
  `index.ts` kimi ümumi adlar sayılmadı.
- Mənbə şərhləri: `Adapted from upstream …` başlığı olan fayllar.
- `CHANGELOG.md`: sonradan "new components" kimi əlavə olunanlar.
- Əlavə olaraq upstream-in məlum komponent adlarına əsasən "yoxlanmalı" qrupu (3-cü səviyyə).
  Bu qrup **təxminidir**, kodu müqayisə etməmişəm.

Rəqəmlər sətir sayıdır (`.ts`/`.tsx`, testlər daxil deyil). Kitabxananın komponent kodu cəmi ≈ 23 600 sətirdir.

## 1. Qəti törəmə (yenidən yazılmalıdır)

### 1.1 Token qatı: `src/styles/vendor/theme/` ≈ 2 440 sətir

`animations`, `base`, `charts`, `code-block-variables`, `colors`, `compat`, `design-system-base`,
`global`, `hit-area`, `semantic`, `shimmering-loader`, `theme`, `typography`, `unset-tw-colors`,
`utilities`, `variants`, `themes/dark`, `themes/light`.
Bu qat həm formulları, həm də token **adlarını** (`foreground-light`, `surface-200`, `brand-500`,
`border-strong`…) daşıyır, ona görə komponentlərin class sətirləri də ona bağlıdır.

Bizim yazdıqlarımız (törəmə deyil): `src/styles/motion.css`, `touch.css`, `globals.css`.

### 1.2 Generatorun profilləri: `src/theme/create-theme.ts`

`BRAND`, `ACCENT`, `WARNING`, `DESTRUCTIVE`, `PRIMARY`, `CHART` cədvəlləri orijinal tema fayllarından
**ölçülüb** (faylın öz şərhi belə deyir). Bu törəmə məlumatdır. Yeni dəyərlər öz dizayn qərarımızdan
gəlməlidir. Generatorun özü (alqoritm, API) bizimdir.

### 1.3 Əsas komponentlər: ilkin importdan gələn 32 komponent ≈ 7 600 sətir

button, accordion, avatar, chart, collapsible, table, alert, badge, progress, skeleton, sonner,
calendar, checkbox, form, label, radio-group, select, switch, textarea, aspect-ratio, card,
separator, command, sidebar, tabs, dialog, drawer, dropdown-menu, hover-card, popover, sheet, tooltip.

Bunlara əlavə olaraq `alert-dialog` (549 sətir): mənbə başlığı açıq şəkildə upstream-dən
uyğunlaşdırıldığını deyir. Radio-group (card/stacked) də başlıqla işarələnib.

**Cəmi 1-ci səviyyə:** ≈ 2 440 CSS + ≈ 8 100 komponent sətri + profil cədvəlləri.

## 2. Qarışıq

- `input` (115 sətir): ilkin importdan gəlir, üstünə `prefix`/`suffix` bizim əlavəmizdir.

## 3. Yoxlanmalı (təxmini, upstream-də oxşar komponent ola bilər)

Git tarixçəsinə görə sonradan əlavə olunub, amma adlar upstream-in komponent kitabxanalarındakı
adlarla üst-üstə düşür. Strukturu və class sətirlərini müqayisə edib qərar vermək lazımdır.

breadcrumb (377), context-menu (382), menubar (384), navigation-menu (338), admonition (287),
data-table (361), empty-state (112), error-display (163), form-item-layout (491), glass-panel (156),
info-tooltip (50), metric-card (436), status-code (111), timestamp-info (231), theme-toggle (103),
shimmering-loader (126), data-input (141), code-block (428).

**Cəmi:** ≈ 4 700 sətir. Bunların bir hissəsi törəmə çıxacaq, bir hissəsi yox.

## 4. Bizim (törəmə deyil)

Layout primitivləri (box, container, flex, grid, stack), date-field, date-picker, date-range-picker,
time-picker, carousel, rating, statistic, countdown, gauge, qr-code, marquee, virtual-list, image,
descriptions, banner, result, spinner, circular-progress, scroll-progress, kbd, copy-button, toggle,
toggle-group, combobox, number-input, password-input, input-otp, mentions, multi-select, file-upload,
slider, resizable, scroll-area, floating-plate, pagination, stepper, table-of-contents, text-link,
confirm-popover, row, form-fields (22 fayl), playground, theme builder, generator alqoritmi.

Bunların kodu bizimdir, amma **token adlarından və utility class-lardan** (məsələn `bg-surface-100`,
`text-foreground-light`) istifadə edirlər. Token qatı yenidən yazılanda bunlar yalnız adların
əvəzlənməsindən keçir, məzmunca yenidən yazılmır.

## Yenidən yazma sırası (təklif)

1. **Token qatı (1.1 + 1.2).** Ən böyük tək hissədir. `createTheme` artıq rəngləri istehsal edir,
   statik literalları ondan çıxarıb öz token adlarımızı yazmaq olar. Bu, 4-cü qrupu da yeni adlara köçürür.
2. **Qarışıq və yoxlanmalı qrup (2 + 3).** Əvvəl müqayisə, sonra yalnız törəmə çıxanları yenidən yazmaq.
3. **32 əsas komponent (1.3).** Ən çox iş budur. Ən böyükləri: sidebar (809), radio-group (551),
   alert-dialog (549), table (511), dialog (486), sheet (490).
4. Sonuncu fayl getdikdən sonra bildirişi sil.

## Yoxlama qaydası

Bir faylın artıq törəmə olmadığını göstərmək üçün: orijinalı görməyən biri tərəfindən spesifikasiyadan
yazılıb, struktur və class sətirləri orijinaldan fərqlənir. "Adı dəyişib, rəng dəyişib" kifayət deyil.

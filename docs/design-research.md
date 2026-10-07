# ui: dizayn araşdırması və 0.5 üçün istiqamət

Bu sənəd `frontend-design` yanaşması ilə hazırlanıb: əvvəl məhsulu və auditoriyanı dəqiqləşdirdim,
sonra saytı real brauzerdə (1440 və 390 px, işıqlı və tünd) ölçdüm, yalnız bundan sonra plan
yazdım. Rəqəmlər təxmin deyil, ölçülmüş dəyərlərdir.

## 0. Qısa nəticə

- Kitabxananın özü güclüdür: 98 komponent, hybrid API, OKLCH theme generator, hər komponent üçün
  a11y testi. **Sayt isə onu göstərmir.** Birinci ekran mətn və install komandasıdır, məhsul
  scroll-dan sonra başlayır.
- Saytın ən fərqləndirici imkanı **theme generator-dur** (bir rəngdən bütün sistem). O, ayrıca
  `/theme` səhifəsində gizlənib. Landing səhifənin qəhrəmanı məhz bu olmalıdır.
- Gözəgörünən qüsurlar var və onların çoxu kiçikdir (bölmə 2.2). Ən vacibi mobildə üfüqi daşma
  və kiçik toxunma hədəfləridir.
- Vizual olaraq sayt "sənəd saytı şablonu"dur (bölmə 2.3). Bu pis deyil, amma yadda qalmır.
- Ən böyük qazanc: **Blocks** (hazır səhifə kompozisiyaları), **canlı komponent qalereyası** və
  **props playground**. Üçü də mövcud generated API və registry üzərində qurulur.

## Gedişat (qərarlar və nəticə)

Qərarlar: başlanğıc rəng yaşıl qalır, Archivo yalnız saytın başlıqlarında (komponent önizləmələri
kitabxananın öz Inter-ində qalır ki, dürüst görünsün), **12 block**, sıra A → B → C → E → D → F.

| Axın | Vəziyyət |
|---|---|
| A. Düzəlişlər | Bitdi. Mobil daşma (ana səhifə və `/theme`), 44 px toxunma hədəfi (`touch.css`), README sayları (+ test), jarqonlu təsvirlər, `LocaleProvider`. Açıq qalan: defolt qrafik rəngi (aşağıda) |
| B. Hero | Bitdi. Canlı rəng/hue idarəsi, 7 preset, 6 pilləli cədvəl, DOM-dan ölçülən kontrast, real komponentlərdən nümunə. Bütün səhifə, tünd rejim daxil, yenilənir |
| C. Qalereya | Bitdi. 98 canlı, qeyri-interaktiv kiçik önizləmə, "uzadılmış link" kartları (iç-içə `<a>` yoxdur) |
| E. Blocks | Bitdi. `/blocks`: 12 block (giriş, ayarlar, ödəniş, dashboard, dəvət, onboarding, boş vəziyyətlər, qiymətlər, axtarış, bildirişlər, API açarları, fayl yükləmə), hər biri Preview və Code |
| D. Komponent səhifəsi v2 | Gözləyir |
| F. Theme builder v2 | Gözləyir |

Block-ları qurarkən tapılıb düzəldilən kitabxana qüsurları: `Table` scroll konteyneri `relative`
deyildi (`sr-only` mətn səhifəni genişləndirirdi), `EmptyStatePresentational` yanlış `<aside>`
landmark-ı yaradırdı. `MetricCard` stretch olunan grid-də sparkline-ı itirir, bunun üçün ayrıca
tapşırıq var.

Qərar: defolt qrafikin 2-ci seriyası artıq tema aksentinə (bənövşəyi) bağlıdır. Layihəni hələ heç kim
yükləmədiyi üçün bu görünüş dəyişikliyi risk yaratmır. Dəyərlər generatorun verdiyi rəqəmlərlə üst-üstə düşür
və `tests/chart-defaults.test.ts` onların sapmasının qarşısını alır.

## 1. Məhsul və auditoriya (təsdiq üçün)

| | |
|---|---|
| Məhsul | `@habibmustafa/ui`: React 19, Tailwind v4, Radix üzərində 98 komponent (84 atom + 14 fragment) |
| Auditoriya | Kitabxana seçən frontend developerlər; temalanan sistem axtaran dizaynerlər |
| Saytın işi | 30 saniyədə "bunu quraşdırmağa dəyər" hissi yaratmaq, kodu kopyalatmaq, temanı özünüzə uyğunlaşdırmağa vadar etmək |
| Fərqləndiricilər | Bir rəngdən tam tema, props və compound API, `react-hook-form` ilə bir sətirlik sahələr, hər komponentdə axe yoxlaması |

Bu mənim təklifimdir. Yanlışdırsa, plan dəyişir.

## 2. Audit

### 2.1 Güclü tərəflər (toxunmaq lazım deyil)

- Landing-dəki üç "Live examples" real komponentlərdən qurulub və işləyir. Saytın ən güclü hissəsidir.
- Theme builder bütöv səhifəni canlı yeniləyir, presetlər, export və paylaşma linki var.
- Komponent səhifələrində kod, API cədvəli (TypeScript tiplərindən generasiya olunur) və tənbəl
  yüklənən önizləmələr var. Fokus halqası, reduced-motion və klaviatura hər yerdə düzgündür.
- 1016 test, 327 nümunə, hamısı axe-dən keçir.

### 2.2 Təsdiqlənmiş qüsurlar

| # | Tapıntı | Sübut | Ciddilik |
|---|---|---|---|
| 1 | Mobildə ana səhifə üfüqi daşır | `scrollWidth 594` vs görünən `375`. Səbəb: "One component, two ways" bölməsindəki kod paneli (`min-w-0` yoxdur) | Yüksək |
| 2 | Toxunma hədəfləri kiçikdir | Mobildə 70 interaktiv elementin 33-ü 32 px-dən kiçikdir. `Button` defoltu `tiny`-dir, `src`-də `pointer: coarse` üçün heç nə yoxdur | Yüksək |
| 3 | README sayları köhnədir | README "68 atom + 14 fragment, 82 komponent" yazır, real say 84 + 14 = 98 | Orta |
| 4 | Komponent təsvirlərində daxili jarqon | "Sunk control surface…", "ui-specific: …", "MUI-style segments" (siyahı səhifəsində görünür) | Orta |
| 5 | Theme builder defoltunda aksent ilə qrafik uyğunsuzdur | Aksent `#7b66ff` (bənövşəyi), qrafikin 2-ci seriyası `hsl(206 100% 50%)` (mavi). Preset dəyişəndə generator `--chart-2`-ni düzgün hesablayır, defolt halda isə yox | Aşağı |
| 6 | Yeni komponentlərdəki sətirlər yalnız ingilis dilindədir | "Previous slide", "Go to slide", "Close preview", "Reading progress", "No matches", "Clear", "Pick a date range" kodda sərt yazılıb | Orta (kitabxana boşluğu) |

Yoxlayıb **qüsur olmadığını** təsdiqlədiyim şeylər: Button səhifəsindəki "Floating plate" boş görünürdü,
amma bu tənbəl yükləmədir (scroll-da mount olur).

### 2.3 Şablon izləri

`frontend-design`-ın "defoltlar" siyahısına qarşı cari saytın vəziyyəti:

| Defolt (hər mövzuda çıxan) | Cari saytda |
|---|---|
| `near-black + tək parlaq yaşıl vurğu` | Tünd rejim məhz budur (Supabase mirası) |
| SaaS kart dəsti: eyni `rounded-md` + sərhəd hər yerdə | 8 eyni kataloq kartı, 3 eyni "live example" kartı |
| Hər başlığın üstündə tracked ALL-CAPS etiket | "INVITE A TEAMMATE", "SCHEDULE A MEETING", "SUBSCRIPTION", səhifə bölmə etiketləri |
| Kiçik data etiketləri üçün monospace | Həmin kart etiketləri |
| Versiya həbi (`v0.3.0, changelog →`) birinci ekranda | Var |
| Başlıqda mövzuya xas olmayan təsviri cümlə | "Accessible, ready-made components for React 19" |
| Düymə mətnlərinə `→` | "Get started →", "Open the theme builder →" |

Bunlar səhv deyil, amma seçim də deyil. Ən böyük problem: birinci ekranda **canlı heç nə yoxdur**.

## 3. İmkanlar (təsir × həcm)

Həcm: S yarım gündən az, M 1-2 gün, L 3+ gün.

| Axın | Nə | Təsir | Həcm |
|---|---|---|---|
| **A. Düzəliş keçidi** | 2.2-dəki 1-6 bəndləri | Yüksək | S |
| **B. Hero: canlı alət** | Birinci ekranda bir rəng/şrift/radius idarəsi, yanında real komponentlər və 6 pilləli rəng cədvəli (200 – 600 və fill), bütün səhifə yenilənir | Çox yüksək | M |
| **C. Canlı qalereya** | 98 ikonlu kartı canlı kiçik önizləmələrlə əvəz etmək, qruplama və axtarış | Yüksək | M |
| **D. Komponent səhifəsi v2** | Kompakt səhnə, bir "Code" açarı, props playground (`variant`, `size`… tiplərdən avtomatik) | Yüksək | M-L |
| **E. Blocks** | 10-12 hazır səhifə: giriş, ayarlar, ödəniş, dashboard, onboarding, dəvət, boş vəziyyətlər, qiymətlər. Hər biri tema ilə dəyişir | Çox yüksək | L |
| **F. Theme builder v2** | Rəng cədvəli (L/C/H), kontrast matrisi (AA/AAA), Blocks ilə önizləmə, Tailwind v4 `@theme` ixracı, rəngkor simulyasiyası | Yüksək | M |
| **G. Kitabxana keyfiyyəti** | `LocaleProvider` (2.2-6), `pointer: coarse` ölçüləri, density rejimləri (compact/comfortable), RTL keçidi, motion audit | Yüksək | L (davamlı) |
| **H. Sənəd məzmunu** | Hər komponentdə "nə vaxt istifadə etməli", klaviatura cədvəli, mühit və versiyalar, OG şəkli | Orta | M |

**Bağlılıqlar:** E, F-nin önizləməsini qidalandırır; B və C eyni "canlı tema" mexanizmindən istifadə edir;
D, `generated/api.ts`-dəki union tiplərini istifadə edir (bu artıq mövcuddur).

## 4. Dizayn planı (token sistemi)

### 4.1 Rəng

Sayt demək olar ki, tam neytraldır. **Doymuş rəng yalnız bir yerdə var: canlı tema.** Brend rəngi
səhifəni deyil, nümayiş olunanı rəngləyir.

| Ad | Hex | Rol |
|---|---|---|
| Ink | `#0F1216` | mətn (işıqlı), səhifə (tünd) |
| Graphite | `#48515C` | ikinci dərəcəli mətn |
| Mist | `#F2F4F6` | səhifə fonu (işıqlı) |
| Plate | `#FFFFFF` | səthlər (işıqlı), tünd rejimdə `#151A21` |
| Rule | `#DADFE5` | ayırıcılar (tündə `#262D36`) |
| Live | `#3ECF8E` başlanğıc | ziyarətçinin seçdiyi brend rəngi (generator hesablayır) |

Tünd rejim bu hex-lərdən deyil, **generator-dan** gəlir. Beləliklə "near-black + yaşıl" qalıcı
kimlik olmur, ziyarətçinin seçdiyi rəngin nəticəsi olur.

### 4.2 Tipoqrafiya

Bir ailə: **Archivo** (dəyişən şrift, `wght 400-800`, `wdth 100-125`), kod üçün `Source Code Pro`
(artıq var). Ierarxiya genişlik oxu ilə qurulur: hero cümləsi geniş (`wdth 118`, `wght 700`),
mətn normal enində.

| Pillə | Ölçü / sətir | İstifadə |
|---|---|---|
| Hero | `52 / 1.02`, `wdth 118`, `-0.02em` | yalnız birinci ekran |
| H2 | `33 / 1.1` | bölmə başlığı |
| H3 | `21 / 1.25` | qalereya və blok adları |
| Body | `17 / 1.6`, sətir uzunluğu ≤ 62ch | izahlar |
| UI | `15 / 1.4` | komponent mətnləri |
| Meta | `13 / 1.4` | adi (sentence case) etiketlər |

Qayda: **ALL CAPS yoxdur**. Etiketlər sentence case, hierarxiya çəki və enlə qurulur.
Şrift seçimi `font-display: swap` ilə yüklənir. Əgər Archivo xoşunuza gəlmirsə, eyni
quruluş başqa dəyişən ailə də işləyir (qərar 6.2).

### 4.3 Layout konsepsiyası

Mətn solda (**sola hizalı**, mərkəzlənmiş hero yoxdur), sağda canlı nümunə. Aşağıda qalereya 12 sütunlu
şəbəkədə, hər xana komponentin mürəkkəbliyinə görə 3, 4 və ya 6 sütun tutur (eyni ölçülü kartlar yoxdur).

**Hero**
```
┌ ui   Components   Blocks   Theme            ⌘K   ☾ ┐
│                                                      │
│  One brand colour in.            ┌ canlı nümunə ───┐ │
│  A complete, accessible          │ real forma      │ │
│  theme out.                      │ qrafik          │ │
│                                  │ cədvəl          │ │
│  [ ▮ #3ECF8E ]  hue ───●───      │ (hamısı yenilənir)│
│  ▮▮▮▮▮▮▮▮▮▮▮  6 pillə           └─────────────────┘ │
│  AA 7.1:1   AA 4.9:1   AA 4.6:1                      │
│                                                      │
│  npm i @habibmustafa/ui   [Copy]    Browse components│
└──────────────────────────────────────────────────────┘
```

**Qalereya (C)**
```
┌ Forms ────────────────────────────────────────────────┐
│ [canlı Calendar  ][canlı DateRange   ][Rating   ][Mentions ]
│ [   6 sütun      ][   6 sütun        ][ 3      ][ 3       ]
│ [Input][Select][Combobox][Slider]  ...  hər biri canlı, tıklanır
└───────────────────────────────────────────────────────┘
```

**Komponent səhifəsi v2 (D)**
```
Button                                   [ Preview | Code ]
9 variants, 5 sizes ...
┌─────────────────────────────────────┬────────────────┐
│  kompakt səhnə (≈160 px)            │ variant   ▾    │
│         [ Save changes ]            │ size      ▾    │
│                                     │ loading   ☐    │
├─────────────────────────────────────┴────────────────┤
│ <Button variant="primary">Save changes</Button> Copy │
└──────────────────────────────────────────────────────┘
```

### 4.4 Prinsiplər

1. **Səhifə sübutdur.** Kitabxananın nə etdiyini səhifənin özü göstərir (bütöv səhifə canlı yenilənir).
2. **Token-lar görünür.** Rəng cədvəlləri, `oklch` L/C/H və kontrast nisbətləri bu mövzunun öz
   dilidir. Bəzək kimi yox, məlumat kimi istifadə olunur.
3. **Sakit çərçivə, bir yüksək səs.** Bütün çərçivə neytraldır, yadda qalan yalnız hero-dakı alətdir.
4. **Struktur məlumat daşıyır.** Sərhəd və ayırıcı yalnız qruplaşdırma bildirəndə. Dekorativ etiket yoxdur.
5. **Hərəkət yalnız hərəkətə cavabdır.** Rəng dəyişəndə 250 ms keçid. Scroll-da heç bir fade-up yoxdur.

### 4.5 Mətn (UX writing)

Aktiv səs, sentence case, sistemin yox istifadəçinin dili.

| İndi | Təklif |
|---|---|
| Hero: "Accessible, ready-made components for React 19" | "One brand colour in. A complete, accessible theme out." |
| Alt mətn: "98 components built on Radix and Tailwind CSS v4…" | "Pick a colour and this page, all 98 components and their dark mode are regenerated in OKLCH, with contrast checked." |
| Düymələr: "Get started →", "Components", "GitHub" | "Install", "Browse components" (GitHub nav-da qalır) |
| `Input`: "Sunk field surface with the shared size scale…" | "Single-line text field in three sizes, with an invalid state." |
| `Checkbox`: "Sunk control surface that inverts…" | "Checkbox with an indeterminate state and an optional label." |
| `DateField`: "ui-specific: a single typeable date input with MUI-style segments" | "Type a date by day, month and year, or open the calendar." |
| `ThemeTeaser`: "Open the theme builder" | "Try the theme builder" |

## 5. Plan öz-tənqidi (defoltlara qarşı)

İlk qaralamam bunlardan ibarət idi və baxıb dəyişdim:

| İlk qaralama | Problem | Dəyişiklik |
|---|---|---|
| Hero-da böyük "98 components" rəqəmi və qradiyent | "böyük rəqəm + qradiyent" defolt hero-dur | Rəqəmi atdım, hero-nu canlı alətlə əvəz etdim |
| Qalereyada ikonlu eyni kartlar | SaaS kart dəsti | Canlı kiçik önizləmələr və dəyişən xana ölçüləri |
| Tünd rejimdə `#0B0B0B` + yaşıl | defolt №2 | Tünd rejim generator-dan gəlir, rəng ziyarətçinin seçimidir |
| Bölmə üstündə kiçik caps etiketlər | şablon izi | Çıxarıldı, başlıq özü kifayətdir |
| Getting started üçün 01/02/03 | Nömrələmə yalnız ardıcıllıq olanda | Quraşdırma həqiqətən ardıcıllıqdır, amma "install → import → render" 3 sətir kod olaraq qalır, nömrəsiz |
| Başlıqda bir sözü rənglə vurğulamaq | tipik tell | Edilmədi |

**Qalan risk:** başlanğıc rəng yenə də yaşıldır (kitabxananın defoltu). Bu qəsdən seçilib: hekayə
"buradan başla, dəyiş" şəklindədir. Əgər sayt öz kimliyini bu rəngdən ayırmaq istəyirsə, başlanğıc
presetini dəyişmək olar (qərar 6.1).

## 6. Sizdən qərar lazım olanlar

1. **Başlanğıc brend rəngi:** kitabxananın defolt yaşılı (`#3ECF8E`, Supabase mirası) qalsın,
   yoxsa saytın başqa kimliyi olsun? Bu həm də kitabxananın defolt presetidir, yəni məhsul qərarıdır.
2. **Şrift:** Archivo (təklifim) ilə davam edək, yoxsa Inter qalsın? Archivo saytı fərqləndirir,
   amma komponentlərin defolt şrifti yenə Inter qalır (theme builder-də dəyişir).
3. **Sıralama:** təklifim A → B → C → E → D → F. A sürətli qalibiyyətdir, B və C saytın üzünü
   dəyişir, E ən böyük faydadır.
4. **Blocks-un sayı:** 6 (sürətli) yoxsa 12 (tam)?

## 7. Təxmini plan

| Mərhələ | İçindəkilər | Həcm |
|---|---|---|
| 1 | A (düzəlişlər), README sayları, təsvir mətnləri | S |
| 2 | B (hero) + C (qalereya), ortaq canlı tema mexanizmi | M + M |
| 3 | E (Blocks, ilk 6) | L |
| 4 | D (komponent səhifəsi v2, props playground) | M-L |
| 5 | F (theme builder v2), G (`LocaleProvider`, coarse pointer, density), H | L |

Hər mərhələ ayrıca commit və ya PR olaraq çıxa bilər, bir-birini pozmur.

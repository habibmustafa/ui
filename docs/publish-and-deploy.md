# Publish və deploy rəhbəri

Bu sənəd `@habibmustafa/ui`-ni **npm-ə çıxarmaq** və playground saytını
(`ui.habibmustafa.me`) **Cloudflare-də deploy etmək** üçün bütün prosesi izah edir.
Məqsəd: bir neçə ay sonra geri qayıdıb hər şeyi sıfırdan xatırlamaq.

Bu fayl `docs/` qovluğundadır — npm paketinin içinə girmir (`package.json`-un
`files` siyahısına baxın), yəni sadəcə GitHub repo-da qalır, konsumerlər görmür.

---

## 1. İki ayrı "deploy" var, qarışdırma

| | Nə | Harada | Necə tetiklənir |
|---|---|---|---|
| **npm publish** | `@habibmustafa/ui` kitabxanasının özü | npmjs.com | "Version Packages" PR-ı `main`-ə merge olunanda (Changesets) |
| **Playground deploy** | Demo sayt (bütün komponentləri göstərən) | Cloudflare Workers, `ui.habibmustafa.me` | `main`-ə hər push-da avtomatik |

İkisi tamam ayrı sistemlərdir, ayrı tetiklənir, ayrı fayllardan asılıdır.

---

## 2. npm-ə yeni versiya çıxarmaq (Changesets)

Versiya, CHANGELOG, tag və GitHub Release artıq əl ilə edilmir —
[Changesets](https://github.com/changesets/changesets) edir. Fikir belədir: hər PR öz
dəyişikliyini `.changeset/*.md` faylı kimi qeyd edir, bu fayllar yığılır, sonra bir
"Version Packages" PR-ı hamısını bir versiyaya çevirir.

### Bir dəfəlik qurulmuş şeylər

- **Trusted Publishing (OIDC)** — `NPM_TOKEN` secret-i YOXDUR, lazım da deyil.
  npmjs.com-da paketin **Settings → Trusted Publisher** bölməsində GitHub
  provayderi əlavə edilib: repo `habibmustafa/ui`, workflow faylı
  `.github/workflows/publish.yml`. GitHub Actions hər run-da OIDC vasitəsilə
  öz kimliyini sübut edir, npm bunu həmin qeydlə tutuşdurur.
  - **Workflow faylının adı `publish.yml` qalmalıdır** — npm məhz bu adı yoxlayır.
  - Əgər bunu YENİDƏN qurmaq lazım olsa (məs. repo adı dəyişsə): npmjs.com →
    `npmjs.com/package/@habibmustafa/ui` → Settings → Trusted Publisher →
    GitHub → Repository: `habibmustafa/ui`, Workflow filename: `publish.yml`.
  - `publish.yml`-də `permissions.id-token: write` və `npm install -g npm@latest`
    addımı saxlanmalıdır (OIDC npm CLI ≥11.5.1 tələb edir).
- **GitHub repo ayarı (bir dəfə, əl ilə):** Settings → Actions → General →
  **"Allow GitHub Actions to create and approve pull requests"** aktiv olmalıdır,
  yoxsa workflow "Version Packages" PR-ını aça bilməz.
- **`.changeset/config.json`** — `access: "public"`, `baseBranch: "main"`.
- **`.github/workflows/publish.yml`** — `main`-ə hər push-da `changesets/action` işləyir:
  - `.changeset/`-də gözləyən fayl varsa → "Version Packages" PR-ını açır/yeniləyir
    (`npm run version-packages`: `package.json` versiyası, `CHANGELOG.md`,
    `package-lock.json`, istifadə olunmuş changeset faylları silinir).
  - Gözləyən fayl yoxdursa və `package.json`-dakı versiya npm-də hələ yoxdursa (yəni
    həmin PR indicə merge olunub) → `npm run release`: `npm run verify` +
    `changeset publish` (`npm publish --provenance`), sonra `vX.Y.Z` tag-i və GitHub
    Release yaradılır.

### Hər dəyişiklikdə (PR-da)

Kitabxananı istifadə edənlərin görəcəyi dəyişiklik (fix, yeni komponent, breaking
change) edirsənsə, eyni PR-a changeset əlavə et:

```sh
npx changeset      # paketi seç, bump növünü seç, qısa təsvir yaz
```

Bu `.changeset/<təsadüfi-ad>.md` yaradır — onu da commit et. Əl ilə də yazmaq olar:

```md
---
"@habibmustafa/ui": minor
---

`Pagination` komponenti əlavə olundu.
```

**Bump növü (0.x mərhələsində):** breaking change və yeni komponent/feature → `minor`,
bug fix → `patch`. `major` seçmə — o, paketi 1.0.0-a çıxarır.

Yalnız playground, sənəd, test, CI dəyişiklikləri üçün changeset lazım deyil.

### Versiya çıxarmaq

1. Changeset-li PR-lar `main`-ə merge olunur.
2. Workflow avtomatik **"Version Packages"** PR-ı açır (sonrakı merge-lərdə onu
   yeniləyir). PR-da yeni versiyanı və CHANGELOG-u yoxla.
3. Hazır olanda həmin PR-ı **merge et** — workflow npm-ə publish edir, tag və GitHub
   Release yaradır. Başqa heç nə etmə: versiyanı əl ilə dəyişmə, Release-i əl ilə yaratma.
4. **Yoxla**: `github.com/habibmustafa/ui/actions` → "Publish" yaşıl ✓,
   `npmjs.com/package/@habibmustafa/ui` yeni versiyanı göstərməlidir.

### Publish uğursuz olarsa

Versiya commit-i `main`-də artıq var, amma npm-də yoxdur — workflow-u yenidən
işlətmək kifayətdir (Actions → Publish → **Re-run jobs**): `changeset publish` yalnız
npm-də olmayan versiyanı publish edir, ikinci dəfə cəhd təhlükəsizdir. Səbəb kodda idisə,
düzəlişi `main`-ə push et — həmin push-un run-ı da eyni şəkildə publish edəcək.

## 3. Playground-u Cloudflare-də deploy etmək

### Necə işləyir (bir dəfəlik qurulub)

Cloudflare-də **Workers & Pages → `ui` layihəsi** GitHub repo-ya bağlıdır
("Workers Builds" / Git integration). **Hər `main`-ə push avtomatik yeni
deploy tetikləyir** — əlavə addım lazım deyil.

Konfiqurasiya **dashboard-da deyil**, repo-dakı `wrangler.toml` faylındadır:

```toml
name = "ui"
compatibility_date = "2026-10-05"

[build]
command = "npm run build:playground"

[assets]
directory = "./playground-dist"
not_found_handling = "404-page"
```

- `[build].command` — Cloudflare bunu özü işlədib `playground-dist/` qovluğunu
  yaradır.
- `[assets].directory` — hansı qovluq yüklənsin.
- `not_found_handling = "404-page"` — SPA-nın client-side router-i (`/components/dialog`
  kimi) hard-refresh-də işləsin deyə. **`"single-page-application"` YAZMA** —
  bu konkret layihə üçün Cloudflare-in daxili `_redirects` validatoru onu "sonsuz
  dövr" kimi rədd edir (bax §5, "Bilinən problemlər"). `"404-page"` + `build:playground`
  skriptinin `index.html`-i `404.html`-ə kopyalaması bunun əvəzinədir.

**Domen**: `ui.habibmustafa.me` → Cloudflare Pages/Workers layihəsinin
**Custom domains** bölməsində əlavə edilib. Domen artıq Cloudflare-in öz
nameserver-lərindədir, ona görə DNS/SSL avtomatik qurulur, əl ilə heç nə etmə.

### Yeni deploy üçün nə etməli

**Heç nə.** `main`-ə push elə, Cloudflare özü tutur. Statusu yoxlamaq üçün:
`dash.cloudflare.com` → Workers & Pages → `ui` → **Deployments** tab-ı.

Əl ilə, lokal maşından deploy etmək istəsən (nadir hal):
```sh
npx wrangler deploy          # əsl deploy
npx wrangler deploy --dry-run  # yalnız yoxlama, deploy etmir
```
(`wrangler login` ilə əvvəlcə Cloudflare hesabına autentifikasiya lazımdır.)

---

## 4. GitHub Actions — nə vaxt nə işləyir

| Fayl | Tetiklənmə | Nə edir |
|---|---|---|
| `.github/workflows/ci.yml` | hər `push` (main) və hər PR | `build:lib`, `lint`, `check:classes`, `check:api`, `test`, `build:playground` — hamısı keçməlidir. `check:api` playground-un API cədvəllərinin (`playground/generated/api.ts`) tiplərlə sinxron olduğunu yoxlayır; komponentin props-unu dəyişəndə `npm run api:generate` işlət və nəticəni commit et. `check:tokens` ayrıca job, şəbəkə asılı olduğu üçün uğursuz olsa belə PR-u bloklamır (`continue-on-error: true`). |
| `.github/workflows/publish.yml` | hər `push` (main) | Changesets: gözləyən changeset varsa "Version Packages" PR-ı açır/yeniləyir; yoxdursa və versiya npm-də yoxdursa `npm run verify` + `changeset publish` + tag + GitHub Release. |
| Cloudflare Workers Builds | hər push (main) | `wrangler.toml`-dan oxuyur, playground-u build edib deploy edir. Bu, GitHub Actions-un hissəsi DEYİL — Cloudflare-in öz sistemidir, repo-ya qoşulub. |

**Node versiyası: 22** (həm CI-də, həm `package.json`-un `engines`-ində).
`scripts/check-classes.mjs` `node:fs`-in `globSync`-ini işlədir, bu yalnız
Node 22+-da var — Node 20 yazsan CI sınar.

---

## 5. Bilinən problemlər (bu dəfə həll olunub, gələcəkdə təkrarlanmasın)

Bunlar bu layihənin ilk dəfə tam CI/deploy zənciri qurulanda üzə çıxan, həqiqi
kök-səbəbli problemlər idi. Əgər gələcəkdə oxşar xəta görsən, əvvəlcə burayı yoxla:

1. **`npm run check:classes` CI-də `globSync is not exported` xətası verir**
   → Node versiyası 20-dir, 22 olmalıdır. `ci.yml`/`publish.yml`-də `node-version`
   və `package.json`-da `engines.node`.

2. **Cloudflare deploy "`_redirects` — infinite loop detected (code 100324)" xətası**
   → `wrangler.toml`-da `not_found_handling = "single-page-application"` yazılıbsa,
   bunu dəyişmə — Cloudflare-in öz SPA-fallback generasiyası bu layihə üçün bu
   xətanı yaradır. `"404-page"` işlət (yuxarıda §3).

3. **Golden snapshot testləri (`tests/golden/*.html`) CI-də (Linux) keçmir,
   lokalda (Windows) keçir** — bunun 3 fərqli kökü var idi, hamısı
   `tests/golden/normalize.ts` və ya `tests/setup.ts`-də düzəldilib:
   - **Atribut sırası** (`<rect x="3" rx="2" ...>` vs `<rect rx="2" ... x="3">`):
     `normalize.ts`-dəki köhnə kod `.sort((a,b) => a.localeCompare(b))` işlədirdi.
     **`localeCompare` əlifba sırası DEYİL, locale-collation-dur** —
     `"x".localeCompare("rx")` mənfi qayıdır (!), nəticə host-un ICU locale
     data-sına görə dəyişir. Həll: `(a < b ? -1 : a > b ? 1 : 0)` kimi sadə
     müqayisə. **Heç vaxt `localeCompare`-i sırf-texniki (atribut adı, fayl
     adı və s.) sort üçün işlətmə** — yalnız real, oxunan mətn (istifadəçi adı
     kimi) sıralamaq üçün uyğundur.
   - **Saat fərqi** (`13:30:00` vs `09:30:00`, 4 saat = Bakı UTC+4):
     `TimestampInfo` komponenti brauzerin lokal saat zonasında göstərir (bu,
     düzgün davranışdır, dəyişmə). Test mühiti saat zonasını təyin etmirdi.
     Həll: `tests/setup.ts`-də `process.env.TZ = "UTC"`.
   - **Min ayırıcısı** (`4.724` vs `4,724`): playground nümunələri
     `value.toLocaleString(undefined, {...})` işlədirdi — `undefined` locale
     host-un default-una düşür (Windows-da nöqtə, Linux-da vergül). Həll:
     `toLocaleString('en-US', {...})` — amma YALNIZ `playground/examples/`
     içindəki demo fayllarında, əsl komponent mənbəyində (`chart.tsx`,
     `metric-card-parts.tsx`) YOX, çünki o, real kitabxana davranışıdır,
     test artefaktı deyil.

   **Ümumi dərs**: istənilən kod `toLocaleString`, `localeCompare`,
   `Intl.*`, saat zonası və ya locale-dən asılı nəticə verirsə, lokal maşın
   (Windows) və CI (Linux, UTC, en-US-vari locale) arasında FƏRQLİ nəticə verə
   bilər — hətta eyni `package-lock.json`, eyni Node versiyası olsa belə.
   Test/golden-snapshot kodunda bunları ya tamam sil (atribut sırası kimi mənasız
   yerdə), ya da aydın şəkildə pin et (TZ, locale).

4. **Publish workflow `npm error code ENEEDAUTH` və ya `EOTP` ilə uğursuz olur**
   → Bu, `NPM_TOKEN` secret-dən istifadə edəndə rastlaşdığımız problem idi
   (token tipi "Granular Access Token" idi, 2FA-writes ayarını bypass etmirdi,
   CI-də OTP istəyirdi). Həlli token-i düzəltmək YOX, bütün token sistemindən
   **Trusted Publishing**-ə keçmək oldu (yuxarıda §2-dəki "Bir dəfəlik qurulmuş
   şeylər"). İndi `publish.yml`-də `NODE_AUTH_TOKEN`/`NPM_TOKEN` heç yoxdur —
   bu xətaları YENİDƏN görsən, deməli kimsə workflow-u token-based formaya
   geri qaytarıb, ya da npmjs.com-dakı Trusted Publisher qeydini silib/dəyişib.

---

## 6. Tez-sürətli xülasə ("yeni versiya çıxarmaq istəyirəm, nə edim?")

```sh
# 1. Dəyişikliyi edən PR-da changeset əlavə et
npx changeset          # minor / patch seç, təsvir yaz
git add .changeset && git commit -m "Add changeset"

# 2. PR-ı main-ə merge et
#    -> workflow "Version Packages" PR-ı açır

# 3. "Version Packages" PR-ını yoxla və merge et
#    -> workflow npm-ə publish edir, vX.Y.Z tag-i və GitHub Release yaradır

# 4. Yoxla:
#    github.com/habibmustafa/ui/actions  (Publish workflow yaşıl olmalı)
#    npmjs.com/package/@habibmustafa/ui  (yeni versiya görünməli)

# Playground (ui.habibmustafa.me) - əlavə iş lazım deyil, main-ə hər push onu
# avtomatik deploy edir.
```

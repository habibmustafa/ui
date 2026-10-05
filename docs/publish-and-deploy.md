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
| **npm publish** | `@habibmustafa/ui` kitabxanasının özü | npmjs.com | GitHub Release yaradanda |
| **Playground deploy** | Demo sayt (bütün komponentləri göstərən) | Cloudflare Workers, `ui.habibmustafa.me` | `main`-ə hər push-da avtomatik |

İkisi tamam ayrı sistemlərdir, ayrı tetiklənir, ayrı fayllardan asılıdır.

---

## 2. npm-ə yeni versiya çıxarmaq

### Bir dəfəlik qurulmuş şeylər (artıq hazırdır, təkrar etməyə ehtiyac yoxdur)

- **Trusted Publishing (OIDC)** — `NPM_TOKEN` secret-i YOXDUR, lazım da deyil.
  npmjs.com-da paketin **Settings → Trusted Publisher** bölməsində GitHub
  provayderi əlavə edilib: repo `habibmustafa/ui`, workflow faylı
  `.github/workflows/publish.yml`. GitHub Actions hər run-da OIDC vasitəsilə
  öz kimliyini sübut edir, npm bunu həmin qeydlə tutuşdurur — token saxlamağa,
  rotasiya etməyə, "hansı tip token?" sualına ehtiyac qalmır.
  - Əgər bunu YENİDƏN qurmaq lazım olsa (məs. repo adı dəyişsə): npmjs.com →
    `npmjs.com/package/@habibmustafa/ui` → Settings → Trusted Publisher →
    GitHub → Repository: `habibmustafa/ui`, Workflow filename: `publish.yml`.
  - `publish.yml`-də `permissions.id-token: write` olmalıdır (bu, OIDC üçün
    tələb olunur) və `npm install -g npm@latest` addımı saxlanmalıdır (OIDC
    trusted publishing npm CLI ≥11.5.1 tələb edir, `setup-node`-un
    bağladığı npm adətən köhnədir).
- **`.github/workflows/publish.yml`** — GitHub Release yaradılanda avtomatik işə düşür:
  ```yaml
  on:
    release:
      types: [published]
  ```
  Addımlar: `npm ci` → `npm run verify` (build+lint+check:classes+check:tokens+test)
  → `npm publish --provenance` (NPM_TOKEN ilə).

### Hər dəfə versiya çıxaranda ediləcəklər

1. **Versiyanı artır** — `package.json`-da `"version"` sahəsini əl ilə dəyiş
   (məs. `0.2.0` → `0.3.0`). Semver qaydası: breaking change → major, yeni
   feature → minor, bug fix → patch.
2. **`package-lock.json`-u sinxronlaşdır**:
   ```sh
   npm install --package-lock-only
   ```
3. **`CHANGELOG.md`-ə yeni bölmə əlavə et** — nə dəyişib, qısa bullet-lər.
4. **Commit + push** `main`-ə.
5. **GitHub Release yarat** — bax aşağıda, bu npm publish-i tetikləyən yeganə yoldur:
   - `https://github.com/habibmustafa/ui/releases/new`
   - **Tag**: `v<versiya>` (məs. `v0.3.0`) — **`package.json`-dakı versiya ilə
     HƏRFİ EYNİ olmalıdır**, yoxsa `npm publish` rədd edəcək.
   - Tag seçimi "Create new tag: vX.Y.Z on publish" kimi görünməlidir (yəni yeni
     tag, mövcud `main`-ə bağlanır).
   - Title: versiya nömrəsi, Description: CHANGELOG-dan həmin bölmə.
   - **Publish release** bas.
6. **Yoxla**: `github.com/habibmustafa/ui/actions` → "Publish" workflow-u yaşıl ✓
   olana qədər gözlə (adətən 1-2 dəqiqə). Sonra `npmjs.com/package/@habibmustafa/ui`
   yeni versiyanı göstərməlidir.

### ⚠️ Vacib qayda: tag-i YALNIZ bir dəfə istifadə et

Əgər release/publish uğursuz olub yenidən cəhd etmək lazımdırsa:

- **SƏHV YOL**: GitHub-da yalnız "Release"-i silib eyni tag adı ilə yeni release
  yaratmaq. Bu, köhnə tag-i YENİD�ən İSTİFADƏ EDİR (əgər tag git-də qalıbsa) —
  yəni yeni commit-lərin heç biri daxil olmur, köhnə (xətalı) kod push olunur.
- **DÜZGÜN YOL**: tag-in özünü də sil:
  ```sh
  git push origin :refs/tags/v0.3.0
  ```
  (GitHub UI-dan da olar: `github.com/habibmustafa/ui/tags` → tag → Delete)
  Sonra YENİ release yarat — bu dəfə tag əsl `main`-in son commit-inə bağlanacaq.

  Yoxlama: `git ls-remote --tags origin | grep v0.3.0` — çıxan commit SHA-sı
  `git log -1 --format=%H` (lokal `main`) ilə eyni olmalıdır.

---

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
| `.github/workflows/ci.yml` | hər `push` (main) və hər PR | `build:lib`, `lint`, `check:classes`, `test`, `build:playground` — hamısı keçməlidir. `check:tokens` ayrıca job, şəbəkə asılı olduğu üçün uğursuz olsa belə PR-u bloklamır (`continue-on-error: true`). |
| `.github/workflows/publish.yml` | GitHub Release `published` | `npm run verify` + `npm publish --provenance`. |
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

## 6. Tez-sürətli xülasə ("0.3.0 çıxarmaq istəyirəm, nə edim?")

```sh
# 1. Versiya
#    package.json-da "version": "0.3.0" et
npm install --package-lock-only

# 2. CHANGELOG.md-ə yeni bölmə yaz

# 3. Commit + push
git add -A
git commit -m "Release 0.3.0"
git push origin main

# 4. GitHub-da release yarat (UI-dan):
#    github.com/habibmustafa/ui/releases/new
#    tag: v0.3.0, Publish release

# 5. Yoxla:
#    github.com/habibmustafa/ui/actions  (Publish workflow yaşıl olmalı)
#    npmjs.com/package/@habibmustafa/ui  (yeni versiya görünməli)

# Playground (ui.habibmustafa.me) - əlavə iş lazım deyil, 3-cü addımdakı
# push onu da avtomatik deploy edir.
```

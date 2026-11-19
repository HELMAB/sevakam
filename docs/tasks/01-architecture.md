# Tasks — 1. Architecture

Spec: [`docs/spec/01-architecture.md`](../spec/01-architecture.md)

---

### ARCH-01 · Install local PostgreSQL + PostGIS and switch the API to it
**Milestone:** M0 · **Component:** API · **Depends on:** — · **Refs:** spec 01 §1.4
- [ ] Install PostgreSQL 16 and PostGIS 3 locally; create the `home_service` and `home_service_test` databases
- [ ] Update `api/.env.example` and `api/.env`: `DB_CONNECTION=pgsql`, host, port, database, username, password
- [ ] Add a first migration that runs `CREATE EXTENSION IF NOT EXISTS postgis` and `citext`
- [ ] Configure `phpunit.xml` to use `home_service_test` (remove the SQLite in-memory settings)
- [ ] Delete `api/database/database.sqlite`
- [ ] Document the local setup steps in `api/README.md`

**Acceptance criteria**
- `php artisan migrate:fresh` succeeds on PostgreSQL and `SELECT postgis_version()` works
- `composer test` runs against the test database and passes

---

### ARCH-02 · Redis, queue and scheduler setup
**Milestone:** M0 · **Component:** API · **Depends on:** ARCH-01 · **Refs:** spec 01 §1.2, §1.4
- [ ] Install Redis locally; add `predis/predis` or enable `phpredis`
- [ ] Set `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`
- [ ] Rename the queue table to `queue_jobs` in `config/queue.php` and its migration (avoids the clash with the domain `jobs` table)
- [ ] Add queue worker and `schedule:work` to the `composer dev` script
- [ ] Add a `queue:failed` monitoring note to the README

**Acceptance criteria**
- A test job dispatched to the queue is processed by `php artisan queue:work`
- `php artisan schedule:list` runs without errors

---

### ARCH-03 · Laravel Reverb (WebSockets) setup
**Milestone:** M0 · **Component:** API · **Depends on:** ARCH-02 · **Refs:** spec 01 §1.2, spec 05 §5.1
- [ ] `php artisan install:broadcasting` with Reverb
- [ ] Set `BROADCAST_CONNECTION=reverb`, Reverb app id/key/secret, host and port in `.env.example`
- [ ] Configure `/broadcasting/auth` to authenticate with Sanctum bearer tokens
- [ ] Add `reverb:start` to the `composer dev` script

**Acceptance criteria**
- A test client can connect to Reverb and authorise a private channel with a valid token; an invalid token gets 403

---

### ARCH-04 · File storage (S3-compatible)
**Milestone:** M0 · **Component:** API · **Depends on:** ARCH-01 · **Refs:** spec 01 §1.2
- [ ] Add `league/flysystem-aws-s3-v3`
- [ ] Configure `s3` disk; keep `local` usable in dev via `FILESYSTEM_DISK`
- [ ] Create a `FileStorage` helper: `storePublic()`, `storePrivate()`, `url()`, `temporaryUrl()` (signed URLs for private files; local-disk fallback)
- [ ] Image upload helper: validate mime/size and resize/compress to max 1600px (`intervention/image`) — NFR-33

**Acceptance criteria**
- Public images get a permanent URL; private documents only get URLs that expire
- Uploading a 10 MB photo stores a compressed version

---

### ARCH-05 · API base conventions
**Milestone:** M0 · **Component:** API · **Depends on:** ARCH-01 · **Refs:** spec 01 §1.3, §1.5, spec 04 §4.1
- [ ] Create `routes/api.php` with the `/api/v1` prefix and route groups (`auth`, `public`, `customer`, `technician`, `company`, `admin`, `webhooks`)
- [ ] Create the folder structure: `Enums/`, `Actions/`, `Services/`, `Http/Controllers/Api/V1/*`, `Http/Requests`, `Http/Resources`, `Policies`
- [ ] Global JSON exception rendering: 401/403/404/422/429, and a custom `InvalidTransitionException` → 409 `{ code: "invalid_transition" }`
- [ ] Morph map: `technician` → `TechnicianProfile`, `company` → `Company`, enforced with `Relation::enforceMorphMap`
- [ ] Money cast (decimal string) and a `Money` resource helper that returns `"12.50"` + currency
- [ ] Serialize dates as ISO 8601; app timezone UTC; `config('app.display_timezone') = Asia/Phnom_Penh`
- [ ] Rate limiters: `auth` (5/min per IP+email) and `api` (120/min per user)
- [ ] Set up Pint and add `composer lint`

**Acceptance criteria**
- `GET /api/v1/public/ping` returns JSON; an unknown route returns a JSON 404
- Validation errors and the 409 response follow the format in spec 04 §4.1

---

### ARCH-06 · Third-party credentials and configuration
**Milestone:** M0 · **Component:** API · **Depends on:** ARCH-05 · **Refs:** spec 01 §1.2, spec 10 §10.4 (O3–O5)
- [ ] Create a Firebase project (dev); download the service account; add `kreait/laravel-firebase`; `FIREBASE_CREDENTIALS` env
- [ ] Google Maps API keys (Android, iOS, server) with restrictions
- [ ] ABA PayWay sandbox credentials: `PAYWAY_MERCHANT_ID`, `PAYWAY_API_KEY`, `PAYWAY_BASE_URL` in `config/services.php`
- [ ] Facebook app id/secret and Apple Services ID/key in `config/services.php`
- [ ] Add all keys (empty values) to `.env.example` with comments

**Acceptance criteria**
- `php artisan config:show services` lists all integrations; no secrets are committed

---

### ARCH-07 · Flutter app shell — shared architecture (customer app)
**Milestone:** M0 · **Component:** Customer app · **Depends on:** — · **Refs:** spec 07 §7.1
- [ ] Add packages: flutter_riverpod, riverpod_annotation, riverpod_generator, go_router, dio, freezed, json_serializable, build_runner, flutter_secure_storage, intl, flutter_localizations
- [ ] Create the folder structure `core/{config,network,realtime,push,storage,l10n,widgets}`, `features/`, `router/`
- [ ] Flavors / `--dart-define` config for dev, staging, prod (API base URL, Reverb host and key)
- [ ] dio client: base URL, `Accept: application/json`, bearer-token interceptor, error mapper → `AppException` (validation, unauthorized, invalidTransition, network)
- [ ] Secure token storage + `AuthSession` provider
- [ ] go_router with redirect guards (unauthenticated → `/login`, unverified → `/verify-email`)
- [ ] Theme (colors, typography), l10n ARB setup (en)
- [ ] Shared widgets: `PrimaryButton`, `AppTextField`, `Price` (USD + KHR), `StatusChip`, `EmptyState`, `ErrorView`, loading overlay
- [ ] Replace the default counter app; `flutter analyze` is clean

**Acceptance criteria**
- The app starts at the splash screen and redirects to `/welcome` without a token
- A 401 from the API clears the token and returns to login

---

### ARCH-08 · Flutter app shell — technician app
**Milestone:** M0 · **Component:** Technician app · **Depends on:** ARCH-07 · **Refs:** spec 08
- [ ] Same setup as ARCH-07 (copy the `core/` structure; consider a shared local package `app/packages/core` later)
- [ ] Extra packages: geolocator, flutter_local_notifications, file_picker
- [ ] Router guard for approval state: `pending`/`rejected` → `/pending-approval`
- [ ] Role-based bottom navigation scaffolding (freelancer, employee, owner) driven by `/auth/me`

**Acceptance criteria**
- The app builds on Android and iOS; the role-based navigation renders with a mocked `/auth/me`

---

### ARCH-09 · Admin shell — TypeScript, shadcn-vue, Tailwind, Pinia
**Milestone:** M0 · **Component:** Admin · **Depends on:** — · **Refs:** spec 09 §9.1
- [ ] Migrate `admin/` to TypeScript (`vue-tsc`, `tsconfig`, `main.ts`)
- [ ] Install Tailwind CSS and initialise shadcn-vue (Reka UI, lucide icons)
- [ ] Add Vue Router, Pinia, axios, TanStack Table, vee-validate + zod, laravel-echo + pusher-js
- [ ] Create `lib/api.ts` (axios + bearer + 401 → logout), `lib/format.ts` (money USD/KHR, dates in Asia/Phnom_Penh)
- [ ] Layout: sidebar, top bar, page header, toast notifications
- [ ] `.env` for the API base URL and Reverb key

**Acceptance criteria**
- `npm run build` and `vue-tsc --noEmit` pass; the layout renders with placeholder pages

---

### ARCH-10 · Push notification setup in both apps
**Milestone:** M0 · **Component:** Customer app, Technician app · **Depends on:** ARCH-06, ARCH-07, ARCH-08 · **Refs:** spec 05 §5.2
- [ ] Add `firebase_core` and `firebase_messaging`; run `flutterfire configure` for both apps (dev project)
- [ ] iOS: APNs key, push capability, background modes
- [ ] Android: notification channels (`default`, `incoming_job` with high importance and a custom sound)
- [ ] `PushService`: request permission, get/refresh the token, foreground handler, tap handler routing by `type` (stub routes)

**Acceptance criteria**
- A test push sent from the Firebase console arrives in foreground and background on both platforms

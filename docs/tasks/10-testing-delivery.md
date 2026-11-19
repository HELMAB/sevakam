# Tasks — 10. Testing & delivery

Spec: [`docs/spec/10-testing-delivery.md`](../spec/10-testing-delivery.md)

---

### QA-01 · API test infrastructure
**Milestone:** M0 · **Component:** API · **Depends on:** ARCH-01 · **Refs:** spec 10 §10.1
- [ ] Pest config using the `home_service_test` PostgreSQL database with `RefreshDatabase`
- [ ] Helpers: `actingAsCustomer()`, `actingAsTechnician($type)`, `actingAsOwner()`, `actingAsAdmin()`
- [ ] Factory states for common scenarios (eligible provider near a customer, a job in each status)
- [ ] `Http::fake` fixtures for PayWay and FCM; `Event::fake`/`Notification::fake` conventions
- [ ] Architecture tests (Pest arch): controllers don't use models directly for writes; Actions have a `handle()` method

**Acceptance criteria**
- `composer test` runs green from a clean database

---

### QA-02 · Flutter test setup (both apps)
**Milestone:** M0 · **Component:** Customer app, Technician app · **Depends on:** ARCH-07, ARCH-08
- [ ] Add mocktail; `ProviderContainer` test utilities with overrides
- [ ] Fake repositories for widget tests; golden-test setup is optional
- [ ] Replace the default counter `widget_test.dart`

**Acceptance criteria**
- `flutter test` passes in both apps

---

### QA-03 · Admin test setup
**Milestone:** M0 · **Component:** Admin · **Depends on:** ARCH-09
- [ ] Vitest + Vue Test Utils + jsdom; an axios mock helper

**Acceptance criteria**
- `npm run test` passes, with one sample store test

---

### QA-04 · CI pipeline
**Milestone:** M0 · **Component:** All · **Depends on:** QA-01..QA-03
- [ ] GitHub Actions (or chosen CI): an API job with a PostgreSQL + PostGIS service container (`postgis/postgis`) and Redis: `composer install`, `pint --test`, `pest`
- [ ] Flutter job per app: `flutter analyze`, `flutter test`
- [ ] Admin job: `npm ci`, `vue-tsc --noEmit`, `vitest run`, `vite build`
- [ ] Run on pull requests to `main`

**Acceptance criteria**
- A pull request shows all four checks

---

### QA-05 · End-to-end happy path
**Milestone:** M6 · **Component:** All · **Depends on:** CAPP-14, TAPP-10, ADMN-07
- [ ] Scripted scenario on the seeded staging data: book → offer → accept → on the way (live map) → complete → pay (cash and PayWay sandbox) → rate → admin sees the timeline
- [ ] Automate the API part as a Pest "journey" test; the mobile part as a manual checklist (Flutter `integration_test` later)

**Acceptance criteria**
- The scenario passes on staging for both payment methods

---

### QA-06 · Security review
**Milestone:** M7 · **Component:** API · **Depends on:** most API tasks · **Refs:** NFR-10..15
- [ ] Authorization matrix test: every endpoint × every role (expect 2xx, 403 or 404)
- [ ] Check signed URLs for documents, upload validation, rate limits, PayWay hash/idempotency, no PII leak in technician job lists before assignment
- [ ] `composer audit`, `npm audit`, dependency updates

**Acceptance criteria**
- No high-severity findings remain open

---

### DEL-01 · Hosting & environments
**Milestone:** M7 (staging needed by M4 for PayWay callbacks) · **Component:** Ops · **Refs:** spec 10 §10.4 O3
- [ ] Choose a host; provision PostgreSQL + PostGIS, Redis, S3 bucket, an API server with PHP 8.3, Supervisor (queue, Reverb), cron (`schedule:run`)
- [ ] HTTPS domains for the API, Reverb (WSS) and admin
- [ ] Staging + production `.env`; deployment script (zero-downtime, `migrate --force`, `config:cache`, restart workers)
- [ ] Backups for the database and bucket; error tracking (e.g. Sentry) for the API, apps and admin

**Acceptance criteria**
- Staging is reachable over HTTPS and the PayWay sandbox pushback reaches `/webhooks/payway`

---

### DEL-02 · External accounts & credentials
**Milestone:** M3–M7 · **Component:** Ops · **Refs:** spec 10 §10.4 O4, O5
- [ ] ABA PayWay merchant onboarding (sandbox → production)
- [ ] Firebase projects (staging, prod); APNs key
- [ ] Google Maps keys per environment with restrictions and billing alerts
- [ ] Facebook app review (if required), Apple Developer account, Google Play Console

**Acceptance criteria**
- All production credentials are stored in the server's environment, not in the repo

---

### DEL-03 · Mobile release preparation
**Milestone:** M7 · **Component:** Customer app, Technician app · **Refs:** NFR-40, O1, O6
- [ ] Decide minimum iOS/Android versions (O1)
- [ ] App names, bundle IDs, icons, splash, store screenshots and descriptions
- [ ] Privacy policy + terms URLs (O6); App Store privacy labels; Play data safety form
- [ ] Permission usage strings (location always/when-in-use, camera, photos, notifications)
- [ ] Release signing (Android keystore, iOS certificates); TestFlight and Play internal testing builds

**Acceptance criteria**
- Both apps are installed through TestFlight / Play internal testing and work against staging

---

### DEL-04 · Admin deployment
**Milestone:** M7 · **Component:** Admin · **Depends on:** DEL-01
- [ ] Production build hosted as a static site behind HTTPS; API CORS configured for the admin domain
- [ ] Create the first production admin with `admin:create`

**Acceptance criteria**
- An admin can log in on the production URL and approve a test registration

---

### DEL-05 · Resolve remaining open items
**Milestone:** before M7 · **Component:** Product · **Refs:** spec 10 §10.4
- [ ] O1 minimum OS versions · O2 launch date & MVP scope cut · O3 hosting · O4 PayWay account · O5 Firebase/Maps keys · O6 legal texts · O7 `jobs` vs `bookings` table name (decide **before** DATA-06)

**Acceptance criteria**
- Every open item has a recorded decision in `docs/spec`

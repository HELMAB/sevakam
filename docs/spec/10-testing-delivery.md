# 10. Testing & delivery

## 10.1 Test strategy

| Layer | Tooling | Focus |
| ----- | ------- | ----- |
| API unit | Pest | PricingService, PointsService (FIFO, expiry, holds/returns), RankingService, working-hours and eligibility checks |
| API feature | Pest + PostgreSQL test DB | Every state transition T1–T21 including guards (409 on invalid transitions); role/ownership authorisation per endpoint; booking validation; PayWay webhook (hash verification, idempotency, check-transaction mocked via `Http::fake`); scheduled commands with `travel()` |
| Broadcast / push | `Event::fake`, `Notification::fake` | Correct events/notifications per transition |
| Flutter | `flutter_test`, mocktail | Notifiers & repositories; widget tests for booking flow, job action panel, incoming-job popup |
| Admin | Vitest + Vue Test Utils | Stores, DataTable composables, forms |
| E2E (later) | Flutter integration_test / Playwright | Happy path: book → accept → complete → pay → rate |

CI (to set up): `pint --test`, `pest`, `flutter analyze && flutter test` for both apps, `vue-tsc && vitest` for admin.

## 10.2 Seed data

`DatabaseSeeder` creates: 1 admin, a sample catalog (5 services × 3–5 subservices with prices), 3 customers with Phnom Penh addresses, 3 freelancers, 1 company with an owner and 3 employees (approved, with working hours and offerings), 1 pending freelancer, a few promotions, rewards, reasons and default settings.

## 10.3 Milestones (proposed)

| # | Milestone | Scope |
| - | --------- | ----- |
| M0 | Foundation | PostgreSQL/PostGIS setup, Sanctum auth (email, verification, reset), roles, settings, S3, Flutter app shells (router, dio, Riverpod, theme), admin shell (TS, shadcn, auth) |
| M1 | Catalog & onboarding | Services/subservices admin, technician registration + documents + approval, company + employees, offerings, service area, working hours, customer profile & addresses |
| M2 | Booking core | Provider search (PostGIS), estimate, create job, assignments, owner assignment, accept/propose/reject, customer responses, reassignment, cancel, timeouts, job lists & detail |
| M3 | Realtime & notifications | Reverb channels/events, FCM pushes, incoming-job popup, appointment alerts, online/offline sessions, live location |
| M4 | Payment & points | Cash + ABA PayWay, points ledger (earn/redeem/expiry), ratings, ranking |
| M5 | Promotions & rewards | Promotions (create, approve, apply, notify), reward catalog & redemptions |
| M6 | Admin ops & reports | Jobs/users admin, interventions, settlements, dashboard, exports, rating moderation |
| M7 | Hardening & release | Social login (Facebook/Apple), store assets, performance, security review, staging → production |

The original spreadsheet estimates (~193 technician + ~190 customer, assumed hours) cover only the mobile UI; the API (M0–M6) and admin dashboard need separate estimates.

## 10.4 Remaining open items

| # | Item |
| - | ---- |
| O1 | Minimum iOS/Android versions (NFR-40). |
| O2 | Target launch date and whether to cut scope (e.g. social login, rewards) for an MVP. |
| O3 | Hosting provider for API, Reverb, Redis, PostgreSQL and S3. |
| O4 | ABA PayWay merchant account & sandbox credentials. |
| O5 | Firebase project(s) and Google Maps API keys per environment. |
| O6 | Legal content: terms & conditions, privacy policy (required for app store + Apple sign-in). |
| O7 | Domain table name `jobs` vs `bookings` (see [02 §2.10](02-data-model.md#210-system)). |

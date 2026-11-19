# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A monorepo for a home-service marketplace: customers book services, technicians (freelancers or company employees) do the work, and an admin operates the platform. Four independent projects:

| Directory | Project | Stack |
| --------- | ------- | ----- |
| `api/` | Backend REST API + WebSockets | Laravel 13, PHP 8.3, Pest 4, Pint |
| `admin/` | Admin dashboard SPA | Vue 3 + Vite |
| `app/customer_app/` | Customer mobile app | Flutter |
| `app/technician_app/` | Technician mobile app (freelancer, company owner, employee) | Flutter |

**Current state:** all four are still unmodified framework scaffolds. The design lives in `docs/` and is the source of truth — read the relevant parts before implementing anything:

- `docs/pr/` — project requirements (what). IDs: `JOB-`, `BR-`, `CUS-`, `TEC-`, `ADM-`, `NFR-`.
- `docs/spec/` — technical spec (how): architecture, data model, job state machine, API catalogue, realtime/push, pricing/points/payment/ranking, per-app screens. Also holds the original `Home Service Mobile.xlsx`.
- `docs/tasks/` — 125 implementation tasks grouped by spec file (prefixes `ARCH-`, `DATA-`, `FLOW-`, `API-`, `RT-`, `BIZ-`, `CAPP-`, `TAPP-`, `ADMN-`, `QA-`, `DEL-`). `docs/tasks/README.md` gives the sequential solo working order by milestone M0–M7.

When a decision changes, update `docs/spec` first, then the affected tasks (and `docs/pr` if a requirement changes). Reference requirement/task IDs in commits.

## Commands

### API (`api/`)
```bash
composer setup                       # install, .env, key, migrate, build assets
composer dev                         # local dev server (php artisan dev)
composer test                        # full test suite
php artisan test --compact tests/Feature/SomeTest.php   # single file
php artisan test --compact --filter=testName            # single test
vendor/bin/pint --dirty --format agent                  # format changed PHP files
```
`api/CLAUDE.md` (Laravel Boost guidelines) applies to all work inside `api/` — follow it (Boost MCP tools, `search-docs`, `php artisan make:* --no-interaction`, Pest conventions, Pint).

### Admin (`admin/`)
```bash
npm install && npm run dev           # Vite dev server
npm run build
```

### Mobile apps (`app/customer_app`, `app/technician_app`)
```bash
flutter pub get
flutter run
flutter analyze                      # lints: flutter_lints
flutter test                         # all tests
flutter test test/some_test.dart     # single file
flutter test --plain-name "test name"
```

## Target architecture (from `docs/spec`)

Key cross-cutting decisions that span multiple spec files:

- **Database:** PostgreSQL 16 + PostGIS (local install, no Docker). SQLite is *not* supported once PostGIS lands — tests use a `home_service_test` Postgres DB. `api/.env.example` still has SQLite until task ARCH-01.
- **API shape:** `/api/v1`, Sanctum bearer tokens for all three clients, route groups `auth`/`public`/`customer`/`technician`/`company`/`admin`/`webhooks`. Invalid job state transitions return **409** `{code: "invalid_transition"}`.
- **Domain logic in Actions:** each job transition (T1–T21 in `docs/spec/03-job-state-machine.md`) is one Action class that locks the job row, guards the current status, writes `job_status_histories`, and dispatches broadcast/push events after commit. Controllers stay thin.
- **Accounts:** one `users` table with `role` (customer/technician/admin); one email = one role. Technicians have `technician_profiles.type` freelancer/company_owner/company_employee.
- **Providers are polymorphic:** a "provider" is a freelancer (`technician_profiles`) or a `companies` row (morph map `technician`/`company`). Offerings, service area, working hours, promotions and settlements hang off the provider; company employees inherit the company's.
- **Job flow essentials:** booking a company → owner assigns an employee; booking a technician → goes directly to them. 15-min response timeout, then `needs_reassignment`. A technician's price proposal replaces the promotional price. Customer cancel allowed until 2 h before a confirmed appointment.
- **Money:** USD `decimal(12,2)`, KHR is display-only via `settings.khr_per_usd`. Never use floats.
- **Points:** ledger in `point_transactions` with FIFO lots expiring after 12 months; `users.points_balance` is a cached sum.
- **Realtime/push:** Laravel Reverb (private channels `user.{id}`, `job.{id}`, `company.{id}`, `admin`) + FCM; Redis queues. The domain table `jobs` clashes with Laravel's queue table — the plan renames the queue table to `queue_jobs` (open item O7: or rename domain table to `bookings`).
- **Payments:** cash or ABA PayWay after job completion; webhook verified by hash + check-transaction; no commission, manual settlements.
- **Flutter apps:** feature-first layered structure (`core/`, `features/<f>/{data,application,presentation}`), Riverpod + go_router + dio + freezed.
- **Admin:** to be migrated to TypeScript with shadcn-vue + Tailwind + Pinia + TanStack Table.
- English only in v1, but every user-facing string goes through i18n.

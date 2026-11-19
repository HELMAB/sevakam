# 1. Architecture

## 1.1 Component diagram

```
 ┌────────────────┐   ┌──────────────────┐   ┌──────────────────┐
 │ Customer app   │   │ Technician app   │   │ Admin dashboard  │
 │ Flutter        │   │ Flutter          │   │ Vue 3 SPA        │
 └──────┬─────────┘   └──────┬───────────┘   └──────┬───────────┘
        │ HTTPS REST (Sanctum bearer)  +  WSS (Reverb, Pusher protocol)
        ▼                     ▼                      ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ Laravel API  (api/)                                          │
 │  HTTP: /api/v1/*      WebSocket: Laravel Reverb              │
 │  Queue workers (Redis) · Scheduler (every minute)            │
 └───┬──────────────┬───────────────┬──────────────┬────────────┘
     ▼              ▼               ▼              ▼
 PostgreSQL 16   Redis           S3-compatible   External:
 + PostGIS       (queue, cache,  object storage  FCM · Google Maps
                  broadcasting)                  ABA PayWay · Facebook · Apple
```

## 1.2 Tech stack

| Layer | Choice |
| ----- | ------ |
| API | Laravel 13, PHP 8.3, Sanctum, Reverb, Pest 4, Pint |
| Database | PostgreSQL 16 + PostGIS 3 (`geography(Point,4326)` columns) |
| Queue / cache | Redis (`QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`) |
| Files | S3-compatible (`FILESYSTEM_DISK=s3`); `public` prefix for public images, private prefix + temporary signed URLs for documents |
| Push | Firebase Cloud Messaging HTTP v1 (`kreait/laravel-firebase`) |
| Payments | ABA PayWay (purchase + pushback + check-transaction APIs) |
| Maps | Google Maps SDK (apps), Places Autocomplete & Geocoding (apps); distance via PostGIS on server |
| Social login | `laravel/socialite` token verification (Facebook access token, Apple identity token) |
| Mobile | Flutter (Dart ≥ 3.13), flutter_riverpod, go_router, dio, freezed + json_serializable, firebase_messaging, google_maps_flutter, pusher_channels_flutter / laravel_echo, flutter_secure_storage, image_picker |
| Admin | Vue 3 + TypeScript, Vite, Vue Router, Pinia, shadcn-vue, Tailwind CSS, TanStack Table, axios, laravel-echo + pusher-js |

## 1.3 Repository layout

```
home-service-system/
├── api/                    Laravel API
│   ├── app/
│   │   ├── Enums/          JobStatus, AssignmentStatus, UserRole, TechnicianType, …
│   │   ├── Models/
│   │   ├── Http/Controllers/Api/V1/{Auth,Customer,Technician,Company,Admin,Public,Webhook}/
│   │   ├── Http/Requests/  Form Requests per endpoint
│   │   ├── Http/Resources/ API Resources
│   │   ├── Actions/        Single-purpose domain actions (CreateJob, ProposePrice, …)
│   │   ├── Services/       PricingService, PointsService, RankingService, PayWayClient, ProviderSearch
│   │   ├── Policies/
│   │   ├── Events/ Listeners/ Notifications/ Jobs/
│   │   └── Console/        Scheduled commands
│   ├── database/migrations, factories, seeders
│   ├── routes/api.php, channels.php, console.php
│   └── tests/Feature, tests/Unit
├── admin/                  Vue 3 admin SPA
├── app/customer_app/       Flutter
├── app/technician_app/     Flutter
└── docs/pr, docs/spec
```

Domain logic lives in **Actions** (one public `handle()` each) that are called by controllers, so the state machine stays in one place and is easy to test (see [03](03-job-state-machine.md)).

## 1.4 Environments

| Env | API URL | Notes |
| --- | ------- | ----- |
| local | `http://localhost:8000` | Local PostgreSQL + PostGIS install, Redis, `php artisan reverb:start`, MinIO or local `s3` disk optional (`FILESYSTEM_DISK=local` allowed), PayWay sandbox |
| staging | TBD | PayWay sandbox, FCM test project |
| production | TBD | PayWay production |

Local setup changes required in `api/.env.example`:

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=home_service
QUEUE_CONNECTION=redis
BROADCAST_CONNECTION=reverb
```

The first migration runs `CREATE EXTENSION IF NOT EXISTS postgis;`. Tests run against a separate `home_service_test` PostgreSQL database (SQLite is not supported because PostGIS is required).

## 1.5 Cross-cutting conventions

- All timestamps are stored as `timestamptz` in UTC and serialised as ISO 8601 with offset. The display timezone defaults to `Asia/Phnom_Penh`.
- Money is stored as `decimal(12,2)` USD. KHR is display-only: `amount × settings.khr_per_usd`, rounded to the nearest 100 riel.
- IDs are `bigint` internally. Jobs also have a human-readable `code` (`HS-000123`).
- Soft deletes on `users`, `services`, `subservices`, `rewards`.
- All user-facing strings are i18n keys (English only in v1) — NFR-20.

# 2. Data model (PostgreSQL + PostGIS)

Conventions: every table has `id bigserial PK`, `created_at`, `updated_at` unless noted. `geo` = `geography(Point,4326)` with a GiST index. Enums are stored as `varchar` + PHP backed enums (not native PG enums, so they are easy to change).

## 2.1 Providers

A **provider** is whoever offers services and owns offerings, service area, working hours, promotions and settlements:

- a **freelancer** → `technician_profiles` row with `type = freelancer`
- a **company** → `companies` row

These are linked polymorphically through `provider_type` ∈ {`technician`, `company`} and `provider_id` (Laravel morph map). Company employees (and the owner, when working) perform jobs, but their provider is the company.

## 2.2 Identity & accounts

### users
| Column | Type | Notes |
| ------ | ---- | ----- |
| role | varchar | `customer`, `technician`, `admin` |
| name, surname | varchar | |
| email | varchar unique (case-insensitive, `citext`) | one email = one role |
| email_verified_at | timestamptz null | |
| password | varchar null | null for social-only accounts |
| photo_path | varchar null | |
| locale | varchar default `en` | |
| status | varchar default `active` | `active`, `suspended` |
| points_balance | int default 0 | cached sum of unexpired points |
| last_login_at | timestamptz null | |
| deleted_at | timestamptz null | |

### social_accounts
`user_id FK`, `provider` (`facebook`, `apple`), `provider_user_id`; unique(`provider`, `provider_user_id`).

### user_phones
`user_id FK`, `phone` (E.164), `is_primary bool`. Customers have one phone; technicians can have several (TEC-08).

### email_verification_codes
`email`, `code_hash`, `purpose` (`verify`, `reset_password`), `expires_at`, `attempts`, `consumed_at`. Codes are 6 digits and expire after 15 min.

### device_tokens
`user_id FK`, `token unique`, `platform` (`ios`, `android`), `app` (`customer`, `technician`), `last_seen_at`. Deleted on logout (NFR-03).

### customer_addresses
`user_id FK`, `label`, `address_line`, `location geo`, `note null`, `is_default bool`.

## 2.3 Technicians & companies

### technician_profiles
| Column | Type | Notes |
| ------ | ---- | ----- |
| user_id | PK/FK users | |
| type | varchar | `freelancer`, `company_owner`, `company_employee` |
| company_id | FK null | set for owner and employee |
| approval_status | varchar | `pending`, `approved`, `rejected`. Employees are created `approved`. For owners this is the company's approval status. |
| rejection_reason | text null | |
| approved_at, approved_by | | |
| submitted_at | timestamptz | last (re)submission |
| is_active | bool default true | owner can deactivate an employee (TEC-53) |
| address_line, location geo, service_radius_km numeric(5,1) | | **freelancers only** (companies hold their own) |
| is_online | bool default false | |
| last_location geo null, last_location_at | | live location while `on_the_way` |
| rating_avg numeric(3,2), rating_count int, completed_jobs_count int | | denormalised |
| offers_90d int, accepts_90d int, rank_score numeric(6,4) | | ranking inputs, see [06](06-pricing-points-payment.md) |

### companies
`owner_user_id FK users`, `name`, `logo_path`, `description`, `phone`, `email`, `address_line`, `location geo`, `service_radius_km`, `rating_avg`, `rating_count`, `completed_jobs_count`, `offers_90d`, `accepts_90d`, `rank_score`.

### technician_documents
`user_id FK`, `company_id FK null`, `type` (`certificate`, `patent`, `company_profile`), `path` (private disk), `original_name`, `mime`, `size`.

### working_hours
`provider_type`, `provider_id`, `weekday smallint` (0 = Sunday … 6), `opens_at time`, `closes_at time`. Several rows per weekday are allowed; no row means closed that day. Times are in `Asia/Phnom_Penh`.

### technician_online_sessions
`user_id FK`, `started_at`, `ended_at null`. Opened when the technician goes online and closed when they go offline (or automatically after 12 h without a heartbeat). Powers TEC-62.

## 2.4 Catalog

### services
`name`, `icon_path`, `sort_order`, `is_active`, `deleted_at`.

### subservices
`service_id FK`, `name`, `description`, `unit` (`item`, `hour`, `sqm`, `visit`, …), `base_price decimal(12,2)`, `sort_order`, `is_active`, `deleted_at`.

### provider_subservices
`provider_type`, `provider_id`, `subservice_id FK`; unique(provider_type, provider_id, subservice_id).

### reasons
`type` (`job_reject`, `rating_low`, `customer_cancel`, `registration_reject`), `label`, `sort_order`, `is_active`.

## 2.5 Promotions

### promotions
`provider_type`, `provider_id`, `created_by FK users`, `title`, `description`, `image_path`, `starts_at`, `ends_at`, `status` (`pending`, `approved`, `rejected`, `deactivated`), `rejection_reason`, `reviewed_by`, `reviewed_at`.
A promotion is **active** when `status = approved AND now() BETWEEN starts_at AND ends_at`.

### promotion_items
`promotion_id FK`, `subservice_id FK`, `discount_percent numeric(5,2)` (0 < x ≤ 100).

## 2.6 Jobs

### jobs
| Column | Type | Notes |
| ------ | ---- | ----- |
| code | varchar unique | `HS-000123` |
| customer_id | FK users | |
| service_id | FK services | one main service per job (JOB-01) |
| status | varchar | see [03](03-job-state-machine.md) |
| reassign_reason | varchar null | `rejected`, `expired`, `price_declined`, `time_declined` when status = `needs_reassignment` |
| address_label, address_line, location geo | | snapshot of the address used |
| appointment_at | timestamptz | |
| remark | text null | |
| provider_type, provider_id | | current target provider |
| technician_id | FK users null | current assigned technician |
| current_assignment_id | FK job_assignments null | |
| promotion_id | FK null | promotion applied at booking |
| estimated_total | decimal | Σ line totals after promotion |
| proposed_total | decimal null | latest price proposal |
| agreed_total | decimal null | set on confirmation |
| points_redeemed | int default 0 | |
| points_discount | decimal default 0 | |
| final_total | decimal null | `agreed_total − points_discount` |
| payment_method | varchar null | `cash`, `payway` |
| payment_status | varchar default `unpaid` | `unpaid`, `pending`, `paid`, `refunded` |
| cancelled_by_role | varchar null | `customer`, `system`, `admin` |
| cancel_reason_id, cancel_note | | |
| confirmed_at, on_the_way_at, started_at, completed_at, paid_at, cancelled_at, alert_sent_at | timestamptz null | |

Indexes: (`customer_id`, `status`), (`technician_id`, `status`), (`provider_type`, `provider_id`, `status`), `appointment_at`.

### job_items
`job_id FK`, `subservice_id FK`, `name` (snapshot), `unit`, `unit_price`, `quantity numeric(8,2)`, `discount_percent numeric(5,2) default 0`, `line_total`.

### job_photos
`job_id FK`, `path`, `sort_order`. Max 5 (CUS-33).

### job_assignments
Each attempt to give the job to a provider or technician. This is the source of acceptance-rate statistics.

| Column | Type | Notes |
| ------ | ---- | ----- |
| job_id | FK | |
| level | varchar | `company` (owner must assign) or `technician` |
| provider_type, provider_id | | |
| technician_id | FK users null | null for `company` level |
| assigned_by | FK users | customer or company owner |
| status | varchar | `pending`, `assigned` (company level done), `accepted`, `price_proposed`, `time_proposed`, `rejected`, `expired`, `customer_declined`, `cancelled` |
| expires_at | timestamptz | `created_at + settings.response_timeout_minutes` |
| responded_at | timestamptz null | |
| reject_reason_id, reject_note | | |
| proposed_total | decimal null | |
| proposed_appointment_at | timestamptz null | |
| counts_for_ranking | bool default true | false when the customer cancels before a response |

### job_status_histories
`job_id`, `from_status`, `to_status`, `actor_id null`, `actor_role` (`customer`, `technician`, `owner`, `admin`, `system`), `note`, `meta jsonb`, `created_at`. Append-only (JOB-12).

## 2.7 Ratings

### ratings
`job_id unique FK`, `customer_id`, `technician_id`, `company_id null`, `stars smallint 1–5`, `description null`, `is_hidden bool default false`.

### rating_reason
(`rating_id`, `reason_id`) pivot. At least one row is required when stars < 5.

### rating_photos
`rating_id FK`, `path`. Max 5.

## 2.8 Payments & settlements

### payments
`job_id FK`, `method` (`cash`, `payway`), `amount decimal`, `currency` (`USD`), `status` (`pending`, `success`, `failed`, `cancelled`, `refunded`), `payway_tran_id unique null`, `payway_payload jsonb null`, `confirmed_by FK users null` (technician, for cash), `paid_at`, `settlement_id FK null`.

### settlements
`provider_type`, `provider_id`, `amount`, `reference`, `note`, `settled_at`, `created_by FK users`. Settles every linked PayWay payment (`payments.settlement_id`).

## 2.9 Points & rewards

### point_transactions
| Column | Notes |
| ------ | ----- |
| user_id | |
| type | `earn`, `redeem`, `expire`, `adjust`, `reward_hold`, `reward_refund` |
| points | signed int (+ earn/refund/adjust+, − redeem/expire/hold/adjust−) |
| remaining | int null — for `earn`/positive `adjust`/`reward_refund` lots: points not yet consumed |
| expires_at | timestamptz null — `created_at + 12 months` for positive lots |
| job_id, reward_redemption_id | FK null |
| note, created_by | |

Points are spent from the lot that expires first, with a lock on the user row. `users.points_balance` is updated in the same transaction.

### rewards
`name`, `description`, `image_path`, `points_cost`, `stock int null` (null = unlimited), `is_active`, `deleted_at`.

### reward_redemptions
`reward_id`, `user_id` (technician), `points`, `status` (`requested`, `approved`, `rejected`, `fulfilled`), `admin_note`, `processed_by`, `processed_at`.

## 2.10 System

| Table | Purpose |
| ----- | ------- |
| `settings` | `key` PK, `value jsonb`. Keys: `response_timeout_minutes` (15), `cancel_cutoff_hours` (2), `min_booking_lead_minutes` (60), `appointment_alert_minutes` (60), `points_earn_per_usd` (1), `points_redeem_per_usd` (100), `points_max_redeem_percent` (50), `technician_points_per_job` (10), `points_expiry_months` (12), `khr_per_usd` (4100), `ranking_prior_count` (10), `ranking_rating_weight` (0.7), `ranking_acceptance_weight` (0.3), `max_job_photos` (5) |
| `pages` | `slug` (`terms_customer`, `terms_technician`), `title`, `body` (HTML/Markdown), `updated_by` |
| `notifications` | Laravel database notifications (in-app inbox, NFR-04) |
| `personal_access_tokens` | Sanctum |
| `jobs`, `failed_jobs`, `cache` | Laravel queue/cache tables (the queue table is renamed `queue_jobs` to avoid clashing with the domain `jobs` table) |

> **Naming note:** the domain table `jobs` clashes with Laravel's default queue table `jobs`. We use Redis queues and rename the queue table to `queue_jobs` in `config/queue.php`, so the domain keeps the natural name. Alternative if this causes friction: rename the domain table to `bookings`.

## 2.11 Entity relationships (summary)

```
users 1─1 technician_profiles ─* companies (owner) 1─* technician_profiles (employees)
users 1─* customer_addresses, user_phones, device_tokens, point_transactions
provider(technician|company) 1─* provider_subservices *─1 subservices *─1 services
provider 1─* working_hours, promotions 1─* promotion_items, settlements
jobs *─1 users(customer)  jobs 1─* job_items, job_photos, job_assignments, job_status_histories, payments
jobs 1─0..1 ratings 1─* rating_photos, rating_reason
rewards 1─* reward_redemptions *─1 users(technician)
```

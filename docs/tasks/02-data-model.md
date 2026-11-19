# Tasks — 2. Data model

Spec: [`docs/spec/02-data-model.md`](../spec/02-data-model.md)

Each task covers migrations, Eloquent models (casts, relations), PHP enums and factories for its domain.

---

### DATA-01 · Enums
**Milestone:** M0 · **Component:** API · **Depends on:** ARCH-05 · **Refs:** spec 02, spec 03 §3.1
- [ ] `UserRole` (customer, technician, admin), `UserStatus`
- [ ] `TechnicianType`, `ApprovalStatus`
- [ ] `JobStatus` (11 values) with `isTerminal()` and `label()`, plus `ReassignReason`
- [ ] `AssignmentLevel`, `AssignmentStatus`
- [ ] `PaymentMethod`, `PaymentStatus`, `PromotionStatus`, `ReasonType`, `PointTransactionType`, `RedemptionStatus`, `DocumentType`, `SubserviceUnit`

**Acceptance criteria**
- Every enum is a string-backed PHP enum with a unit test for its helper methods

---

### DATA-02 · Identity & account tables
**Milestone:** M0 · **Component:** API · **Depends on:** ARCH-01, DATA-01 · **Refs:** spec 02 §2.2
- [ ] Modify the `users` migration: role, surname, `email citext unique`, nullable password, photo_path, locale, status, points_balance, last_login_at, soft deletes
- [ ] Migrations: `social_accounts`, `user_phones`, `email_verification_codes`, `device_tokens`, `customer_addresses` (`location geography(Point,4326)` + GiST index)
- [ ] Geography support: add `matanyadaev/laravel-eloquent-spatial` (or a custom `Point` cast) so `location` reads and writes as lat/lng
- [ ] Models + relations: `User` hasMany phones, addresses, deviceTokens, socialAccounts; hasOne technicianProfile
- [ ] Factories with Phnom Penh coordinates

**Acceptance criteria**
- A factory-created customer with addresses saves and reads `location` as lat/lng
- Email uniqueness is case-insensitive

---

### DATA-03 · Technician, company & availability tables
**Milestone:** M1 · **Component:** API · **Depends on:** DATA-02 · **Refs:** spec 02 §2.1, §2.3
- [ ] Migrations: `companies`, `technician_profiles` (user_id PK), `technician_documents`, `working_hours` (polymorphic provider), `technician_online_sessions`
- [ ] Models: `Company` (owner, members, documents, workingHours, offerings morph), `TechnicianProfile` (user, company, provider accessor → self for freelancer, company for others)
- [ ] `TechnicianProfile::provider()` and `effectiveLocation()` / `effectiveRadius()` / `effectiveWorkingHours()` helpers (employees and owners use the company's)
- [ ] Factories with states: freelancer, owner (+ company), employee, pending, approved, rejected, online

**Acceptance criteria**
- An employee's `provider()` returns its company, and the helpers return company values; unit-tested

---

### DATA-04 · Catalog, offerings & reasons
**Milestone:** M1 · **Component:** API · **Depends on:** DATA-03 · **Refs:** spec 02 §2.4
- [ ] Migrations: `services`, `subservices` (decimal base_price, unit, soft deletes), `provider_subservices` (unique), `reasons`
- [ ] Models + scopes: `active()`, `ordered()`
- [ ] Provider `offerings()` morphToMany on `TechnicianProfile` and `Company`

**Acceptance criteria**
- A provider can sync offered subservices; duplicates are rejected by the unique index

---

### DATA-05 · Promotions
**Milestone:** M5 · **Component:** API · **Depends on:** DATA-04 · **Refs:** spec 02 §2.5
- [ ] Migrations: `promotions`, `promotion_items` (check 0 < discount ≤ 100)
- [ ] Model scope `activeAt($time)` and relation `provider()` morphTo
- [ ] Factory states: pending, approved-active, expired

**Acceptance criteria**
- `Promotion::activeAt(now())` returns only approved promotions within their period

---

### DATA-06 · Jobs, items, photos, assignments, history
**Milestone:** M2 · **Component:** API · **Depends on:** DATA-04 · **Refs:** spec 02 §2.6
- [ ] Migration `jobs` with all columns and indexes from the spec; unique `code`
- [ ] Code generator `HS-000123` (from a PostgreSQL sequence)
- [ ] Migrations: `job_items`, `job_photos`, `job_assignments`, `job_status_histories` (append-only, no `updated_at`)
- [ ] Models: `Job` (casts for status enum, money, geography; relations customer, technician, provider morph, items, photos, assignments, currentAssignment, histories, payments, rating), `JobAssignment`, `JobStatusHistory`
- [ ] Factory for `Job` with a state per status

**Acceptance criteria**
- `Job::factory()->confirmed()->create()` produces a consistent job (assignment, agreed_total, confirmed_at)

---

### DATA-07 · Ratings
**Milestone:** M4 · **Component:** API · **Depends on:** DATA-06 · **Refs:** spec 02 §2.7
- [ ] Migrations: `ratings` (unique job_id, check stars 1–5), `rating_reason`, `rating_photos`
- [ ] Models + relations, `visible()` scope (not hidden)

**Acceptance criteria**
- A second rating for the same job fails at the DB level

---

### DATA-08 · Payments & settlements
**Milestone:** M4 · **Component:** API · **Depends on:** DATA-06 · **Refs:** spec 02 §2.8
- [ ] Migrations: `payments` (unique payway_tran_id, jsonb payload), `settlements`
- [ ] Models + relations; `Payment::unsettled()` scope

**Acceptance criteria**
- Factories create successful cash and PayWay payments linked to a job

---

### DATA-09 · Points & rewards
**Milestone:** M4 · **Component:** API · **Depends on:** DATA-02 · **Refs:** spec 02 §2.9
- [ ] Migrations: `point_transactions` (index user_id + expires_at where remaining > 0), `rewards`, `reward_redemptions`
- [ ] Models + relations

**Acceptance criteria**
- Tables and models exist; the logic is covered in BIZ-04

---

### DATA-10 · System tables: settings, pages, notifications
**Milestone:** M0 · **Component:** API · **Depends on:** ARCH-01 · **Refs:** spec 02 §2.10
- [ ] `settings` table (key PK, jsonb value) + `Settings` service with typed getters and cache (invalidate on update)
- [ ] Default settings seeder with every key and default value from the spec
- [ ] `pages` table + model
- [ ] `php artisan notifications:table` migration

**Acceptance criteria**
- `settings('response_timeout_minutes')` returns 15 after seeding; updating it clears the cache

---

### DATA-11 · Demo seeders
**Milestone:** M1 (extended each milestone) · **Component:** API · **Depends on:** DATA-02..DATA-10 · **Refs:** spec 10 §10.2
- [ ] `AdminSeeder`: one admin (credentials from env)
- [ ] `CatalogSeeder`: 5 services × 3–5 subservices with units and prices
- [ ] `ProviderSeeder`: 3 freelancers and 1 company with owner + 3 employees, approved, with hours, offerings, location and radius; 1 pending freelancer
- [ ] `CustomerSeeder`: 3 customers with Phnom Penh addresses
- [ ] `ReasonSeeder`, `PageSeeder` (placeholder terms)
- [ ] Later: `PromotionSeeder`, `RewardSeeder`, sample jobs in different statuses

**Acceptance criteria**
- `php artisan migrate:fresh --seed` gives a usable demo dataset for all three apps

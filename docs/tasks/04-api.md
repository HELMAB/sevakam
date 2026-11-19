# Tasks — 4. API

Spec: [`docs/spec/04-api.md`](../spec/04-api.md)

Every endpoint task includes: route, Form Request, controller (thin; calls an Action/Service), API Resource, Policy/authorization, and Pest feature tests (success, validation, authorization).

---

## Auth

### API-01 · Auth middleware, roles & token abilities
**Milestone:** M0 · **Component:** API · **Depends on:** DATA-02 · **Refs:** spec 04 §4.1
- [ ] Install Sanctum (`install:api`); issue tokens with abilities = role
- [ ] Middleware: `role:{role}`, `verified` (JSON 403 `email_not_verified`), `technician.approved`, `company.owner`, `active` (suspended → 403 `account_suspended`)
- [ ] `UserResource` and `MeResource` (role profile, approval status, type, company)

**Acceptance criteria**
- A customer token calling `/technician/*` gets 403; a suspended user gets 403 on every authenticated route

---

### API-02 · Customer registration & email verification
**Milestone:** M0 · **Component:** API · **Depends on:** API-01 · **Refs:** spec 04 §4.2, CUS-02, CUS-48
- [ ] `POST /auth/customer/register` (name, surname, email, phone, password rules)
- [ ] `EmailCodeService`: generate a 6-digit code, hash it, 15-min expiry, max 5 attempts, throttle resend (60 s)
- [ ] Mailable `VerificationCodeMail` (queued)
- [ ] `POST /auth/verify-email` → marks verified, returns a token
- [ ] `POST /auth/resend-code`

**Acceptance criteria**
- A wrong code 5 times locks the code; a correct code returns a token and `email_verified_at` is set

---

### API-03 · Technician registration
**Milestone:** M1 · **Component:** API · **Depends on:** API-02, DATA-03 · **Refs:** spec 04 §4.2, TEC-02
- [ ] `POST /auth/technician/register` multipart, `type` freelancer or company
- [ ] Freelancer: user + technician_profile (pending) + phones + location/radius + certificate/patent documents
- [ ] Company: user + company + owner profile (pending) + company documents/logo
- [ ] Sends the verification code; notifies admins (`admin.registration-submitted`)
- [ ] `POST /technician/registration/resubmit` (rejected → pending, `submitted_at`)

**Acceptance criteria**
- Both registration types create the correct records; documents are stored on the private disk

---

### API-04 · Login, logout, me, device tokens
**Milestone:** M0 · **Component:** API · **Depends on:** API-01 · **Refs:** spec 04 §4.2
- [ ] `POST /auth/login` with `app`; reject a role mismatch with a clear message; update `last_login_at`
- [ ] `POST /auth/logout` (revoke the current token + delete the given device token)
- [ ] `GET /auth/me`
- [ ] `POST /auth/device-tokens` (upsert by token)

**Acceptance criteria**
- A technician logging into the customer app gets 403 `wrong_app`

---

### API-05 · Forgot / reset password
**Milestone:** M0 · **Component:** API · **Depends on:** API-02 · **Refs:** CUS-06, TEC-07
- [ ] `POST /auth/forgot-password` (always returns 200, so it doesn't reveal which emails exist)
- [ ] `POST /auth/reset-password` (code + new password; revoke all tokens)

**Acceptance criteria**
- After a reset, old tokens no longer work

---

### API-06 · Social login (Facebook, Apple)
**Milestone:** M7 · **Component:** API · **Depends on:** API-04 · **Refs:** CUS-04/05, TEC-04/05
- [ ] Add `laravel/socialite` + the Apple provider; verify the Facebook access token and the Apple identity token (JWKS)
- [ ] `POST /auth/social`: find by social account → log in; else match the verified email → link; else create the user (email verified)
- [ ] Technician app: a new social user must complete technician registration (profile incomplete flag)
- [ ] Handle Apple private-relay emails and a name sent only on first sign-in

**Acceptance criteria**
- The same Facebook user logging in twice returns the same user; a role mismatch gets 403

---

## Public

### API-07 · Public endpoints
**Milestone:** M1 · **Component:** API · **Depends on:** DATA-04, DATA-10 · **Refs:** spec 04 §4.3
- [ ] `GET /public/config`, `/public/services`, `/public/services/{id}/subservices`, `/public/pages/{slug}`, `/public/reasons?type=`
- [ ] Cache responses (invalidate on admin update)

**Acceptance criteria**
- Inactive services and subservices are not returned

---

## Customer

### API-08 · Customer profile & addresses
**Milestone:** M1 · **Component:** API · **Depends on:** API-04 · **Refs:** CUS-07..09
- [ ] `GET/PATCH /customer/profile` (an email change → unverified + new code)
- [ ] `POST /customer/profile/photo`
- [ ] Addresses CRUD with lat/lng; only one default per customer; can't delete an address used by an active job (keep the job snapshot regardless)

**Acceptance criteria**
- A customer can't read or edit another customer's address (404)

---

### API-09 · Provider discovery endpoints
**Milestone:** M2 · **Component:** API · **Depends on:** BIZ-06, BIZ-07 · **Refs:** CUS-21, 24, 30, 31, 34, 35
- [ ] `GET /customer/companies/top`
- [ ] `GET /customer/companies/{id}` (offerings, hours, rating, active promotions)
- [ ] `GET /customer/providers/search` (type, subservice_ids, address, appointment_at, sort, limit)
- [ ] `GET /customer/technicians/nearby` (base locations for the map)
- [ ] `GET /customer/technicians/{id}` (public profile + recent visible ratings)
- [ ] Each result includes distance, rating, rank and the estimate including promotion

**Acceptance criteria**
- Results exclude offline, unapproved, out-of-radius, closed-at-that-time and missing-subservice providers (feature test per filter)

---

### API-10 · Customer job endpoints
**Milestone:** M2 · **Component:** API · **Depends on:** FLOW-03..FLOW-10 · **Refs:** spec 04 §4.4
- [ ] `POST /customer/jobs/estimate`
- [ ] `POST /customer/jobs` (multipart)
- [ ] `GET /customer/jobs?status=active|history`, `GET /customer/jobs/{id}` (`JobDetailResource`: items, assignment, proposals, timeline, technician card, last location if `on_the_way`, allowed actions list)
- [ ] `accept-price`, `decline-price`, `accept-time`, `decline-time`, `reassign`, `cancel`
- [ ] `JobPolicy` for customer ownership

**Acceptance criteria**
- `JobDetailResource.allowed_actions` matches the status table in spec 07 §7.3

---

### API-11 · Customer payments, rating, points, promotions, notifications
**Milestone:** M4/M5 · **Component:** API · **Depends on:** BIZ-03, BIZ-04, FLOW-09 · **Refs:** spec 04 §4.4
- [ ] `POST /customer/jobs/{id}/payments`, `GET /customer/payments/{id}`
- [ ] `POST /customer/jobs/{id}/rating` (once, only when `paid`; reasons required when < 5; ≤ 5 photos) → updates aggregates and ranking
- [ ] `GET /customer/points`, `/customer/points/transactions`
- [ ] `GET /customer/promotions`, `/customer/promotions/{id}`
- [ ] `GET /customer/notifications`, `POST /customer/notifications/read`

**Acceptance criteria**
- Rating a job that isn't paid returns 409; rating twice returns 409

---

## Technician & company

### API-12 · Technician profile, documents, settings
**Milestone:** M1 · **Component:** API · **Depends on:** API-03 · **Refs:** TEC-08..15
- [ ] `GET/PATCH /technician/profile` (phones array sync)
- [ ] Photo upload; documents list/upload/delete
- [ ] Freelancer only: `location-settings`, `working-hours` (validate ranges, no overlap), `subservices`
- [ ] Company: `GET/PATCH /company`, `/company/working-hours`, `/company/subservices`

**Acceptance criteria**
- An employee calling freelancer-only endpoints gets 403

---

### API-13 · Online status & heartbeat
**Milestone:** M3 · **Component:** API · **Depends on:** DATA-03 · **Refs:** TEC-20..22
- [ ] `POST /technician/status` → toggles `is_online`, opens/closes `technician_online_sessions`; broadcasts `technician.online-changed`
- [ ] `POST /technician/heartbeat` → updates `last_seen`
- [ ] Only approved and active technicians can go online

**Acceptance criteria**
- Going online then offline creates one closed session with correct timestamps

---

### API-14 · Technician job endpoints
**Milestone:** M2 · **Component:** API · **Depends on:** FLOW-05, FLOW-08 · **Refs:** spec 04 §4.5
- [ ] `GET /technician/jobs?tab=pending|ongoing|completed`, `GET /technician/jobs/{id}` (customer phone/address only when assigned — NFR-15)
- [ ] `accept`, `propose-price`, `propose-time`, `reject`, `start-travel`, `start-work`, `complete`, `confirm-cash`
- [ ] `POST /technician/jobs/{id}/location` (M3, see RT-07)

**Acceptance criteria**
- A technician who is not assigned gets 404 on job detail

---

### API-15 · Company owner endpoints
**Milestone:** M1 (employees) / M2 (jobs) · **Component:** API · **Depends on:** API-12, FLOW-04 · **Refs:** spec 04 §4.6
- [ ] Employees: list (with online status), create (approved and active immediately; verification email with temp password), show, update, activate, deactivate (revoke tokens)
- [ ] `GET /company/employees/{id}/jobs`, `/company/employees/{id}/online-sessions?from=&to=`
- [ ] `GET /company/jobs?status=`, `POST /company/jobs/{id}/assign`, `POST /company/jobs/{id}/reject`

**Acceptance criteria**
- A deactivated employee's tokens are revoked and their login returns 403

---

### API-16 · Technician points, rewards, promotions
**Milestone:** M5 · **Component:** API · **Depends on:** BIZ-04, BIZ-05, DATA-05 · **Refs:** spec 04 §4.5, §4.6
- [ ] `GET /technician/points`, `/technician/points/transactions`
- [ ] `GET /technician/rewards`, `POST /technician/rewards/{id}/redeem`, `GET /technician/reward-redemptions`
- [ ] Promotions (freelancer `/technician/promotions`, owner `/company/promotions`): list by status, create (multipart image, items only for offered subservices, starts < ends), show, deactivate

**Acceptance criteria**
- A promotion that includes a subservice the provider doesn't offer returns 422

---

## Admin

### API-17 · Admin: dashboard, approvals, users, companies
**Milestone:** M1 (approvals) / M6 (rest) · **Component:** API · **Depends on:** API-01 · **Refs:** spec 04 §4.7
- [ ] `php artisan admin:create` command
- [ ] Registrations: list pending, detail (signed document URLs), approve, reject (reason) → notifications
- [ ] Users: list/filter/search, detail, suspend (revoke tokens), reactivate, points adjustments
- [ ] Companies: list, detail with employees
- [ ] `GET /admin/dashboard?from=&to=` aggregates (BIZ-08)

**Acceptance criteria**
- Approving a company owner allows them and their future employees to go online

---

### API-18 · Admin: catalog, reasons, settings, pages
**Milestone:** M1 · **Component:** API · **Depends on:** DATA-04, DATA-10 · **Refs:** ADM-20..22, 50, 51
- [ ] CRUD services (icon upload, reorder endpoint), subservices (price, unit), reasons
- [ ] `GET/PUT /admin/settings` with validation per key
- [ ] `GET/PUT /admin/pages/{slug}` (sanitise HTML)

**Acceptance criteria**
- Changing a base price doesn't change existing job items (snapshot)

---

### API-19 · Admin: promotions, jobs, ratings, rewards
**Milestone:** M5/M6 · **Component:** API · **Depends on:** FLOW-10, DATA-05, DATA-07, DATA-09 · **Refs:** ADM-30, 31, 41..44
- [ ] Promotions: list by status, approve (schedules or publishes the push), reject (reason), deactivate
- [ ] Jobs: list with filters, detail with timeline, cancel, reassign, mark-paid, refund (note required)
- [ ] Ratings: list, hide/unhide (recompute aggregates)
- [ ] Rewards CRUD; redemptions approve/reject/fulfil

**Acceptance criteria**
- Hiding a rating recalculates the technician's `rating_avg` and `rank_score`

---

### API-20 · Admin: settlements & exports
**Milestone:** M6 · **Component:** API · **Depends on:** BIZ-03 · **Refs:** ADM-61..63
- [ ] `GET /admin/settlements/outstanding` grouped by provider
- [ ] `POST /admin/settlements` (provider + payment ids; amount must match the total)
- [ ] `GET /admin/settlements` history
- [ ] CSV exports (streamed): jobs, payments, settlements

**Acceptance criteria**
- A payment can't be included in two settlements

---

## Webhooks

### API-21 · ABA PayWay webhook
**Milestone:** M4 · **Component:** API · **Depends on:** BIZ-03 · **Refs:** spec 04 §4.8
- [ ] `POST /webhooks/payway` (no auth, excluded from CSRF/throttle)
- [ ] Verify the hash → check-transaction API → `MarkJobPaid`
- [ ] Idempotent on `tran_id`; log the raw payload

**Acceptance criteria**
- A forged pushback with a bad hash is rejected; duplicate pushbacks process once

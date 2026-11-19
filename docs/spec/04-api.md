# 4. API

## 4.1 Conventions

- Base URL: `/api/v1`. JSON only (`Accept: application/json`).
- Auth: Laravel Sanctum **bearer tokens** for the mobile apps and the admin SPA. Each token has abilities matching the role (`customer`, `technician`, `admin`). The login endpoint of each app rejects users with a different role.
- Route groups and middleware:

| Prefix | Middleware | Who |
| ------ | ---------- | --- |
| `/auth` | guest / throttle | all apps |
| `/public` | none | all |
| `/customer` | `auth:sanctum`, `role:customer`, `verified` | customer app |
| `/technician` | `auth:sanctum`, `role:technician`, `verified` | technician app (approval checked per route) |
| `/company` | + `company.owner` | company owners |
| `/admin` | `auth:sanctum`, `role:admin` | admin SPA |
| `/webhooks` | signature verification | ABA PayWay |

- Responses use API Resources. Single resource: `{ "data": {...} }`. Lists: `{ "data": [...], "meta": { current_page, per_page, total }, "links": {...} }`, `per_page` ≤ 50.
- Errors: `{ "message": "...", "errors": { field: [..] } }`. 401 unauthenticated, 403 forbidden / not approved, 404, 409 **invalid state transition** (`code: "invalid_transition"`), 422 validation, 429 throttled.
- Money is returned as strings (`"12.50"`) together with `currency: "USD"`. KHR conversion is done by the client using `/public/config`.
- Files are uploaded as `multipart/form-data`. Responses contain URLs (temporary signed URLs for private files).
- Rate limits: login/register/forgot-password 5/min per IP+email; general 120/min per user.

## 4.2 Auth (`/auth`)

| Method | Path | Body / notes |
| ------ | ---- | ------------ |
| POST | `/auth/customer/register` | name, surname, email, phone, password → sends email code |
| POST | `/auth/technician/register` | multipart: `type` (`freelancer`, `company`), personal fields, phones[], password, address_line, lat, lng, service_radius_km, certificates[], patent; for a company also company_name, company_phone, company_logo, company_profile_doc → `approval_status = pending` |
| POST | `/auth/verify-email` | email, code → token |
| POST | `/auth/resend-code` | email, purpose |
| POST | `/auth/login` | email, password, `app` (`customer`, `technician`, `admin`), device_name → `{ token, user }` |
| POST | `/auth/social` | `provider` (`facebook`, `apple`), `token` (access token / identity token), `app`, optional name for first Apple sign-in → creates or links the user; a technician created this way must still complete registration |
| POST | `/auth/forgot-password` | email → code |
| POST | `/auth/reset-password` | email, code, password |
| POST | `/auth/logout` | revoke token + delete the device token |
| GET | `/auth/me` | current user + role profile (`technician.approval_status`, `type`, `company`) |
| POST | `/auth/device-tokens` | token, platform |

## 4.3 Public (`/public`)

| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/public/config` | `khr_per_usd`, `min_booking_lead_minutes`, `cancel_cutoff_hours`, `max_job_photos`, `points_redeem_per_usd`, `points_max_redeem_percent`, Reverb connection info |
| GET | `/public/services` | active main services |
| GET | `/public/services/{id}/subservices` | |
| GET | `/public/pages/{slug}` | terms |
| GET | `/public/reasons?type=` | reason lists |

## 4.4 Customer (`/customer`)

| Method | Path | Req | Notes |
| ------ | ---- | --- | ----- |
| GET/PATCH | `/customer/profile` | CUS-07 | name, surname, phone, email (an email change requires re-verification) |
| POST | `/customer/profile/photo` | CUS-08 | |
| GET/POST | `/customer/addresses` | CUS-09 | label, address_line, lat, lng, note, is_default |
| PATCH/DELETE | `/customer/addresses/{id}` | | |
| GET | `/customer/points` | CUS-12 | balance + expiring soon |
| GET | `/customer/points/transactions` | CUS-12 | paginated |
| GET | `/customer/companies/top?service_id=&address_id=` | CUS-21 | ranked |
| GET | `/customer/companies/{id}` | | profile, offerings, rating, active promotions |
| GET | `/customer/providers/search` | CUS-30/31/34 | `subservice_ids[]`, `address_id` or `lat,lng`, `appointment_at`, `type` (`company`, `technician`), `sort` (`rank`, `distance`), `limit` (5 for top) → eligible providers/technicians with distance, rating and the price estimate including promotion |
| GET | `/customer/technicians/nearby` | CUS-35 | same filters → technicians with lat/lng for the map |
| GET | `/customer/technicians/{id}` | CUS-24 | public profile + recent ratings |
| POST | `/customer/jobs/estimate` | CUS-36 | service_id, items[{subservice_id, quantity}], provider (type, id) → line totals, promotion, estimated_total |
| POST | `/customer/jobs` | T1/T2 | multipart: service_id, items[], address_id, appointment_at, remark, photos[] (≤5), target {type: `company`/`technician`, id} |
| GET | `/customer/jobs?status=active\|history` | CUS-40/45 | |
| GET | `/customer/jobs/{id}` | CUS-40 | full detail, current assignment, proposals, timeline, technician last location if `on_the_way` |
| POST | `/customer/jobs/{id}/accept-price` | T10 | |
| POST | `/customer/jobs/{id}/decline-price` | T11 | |
| POST | `/customer/jobs/{id}/accept-time` | T12 | |
| POST | `/customer/jobs/{id}/decline-time` | T13 | |
| POST | `/customer/jobs/{id}/reassign` | T14 | target {type, id}, optional appointment_at |
| POST | `/customer/jobs/{id}/cancel` | T19 | reason_id, note |
| POST | `/customer/jobs/{id}/payments` | BR-50 | `method` (`cash`, `payway`), `points` (to redeem) → for cash: payment `pending` until the technician confirms; for PayWay: `{ payment_id, checkout_url, abapay_deeplink, qr_string }` |
| GET | `/customer/payments/{id}` | | poll the status |
| POST | `/customer/jobs/{id}/rating` | CUS-50..53 | multipart: stars, reason_ids[] (required if < 5), description, photos[] |
| GET | `/customer/promotions` | CUS-22 | active promotions |
| GET | `/customer/promotions/{id}` | CUS-23 | |
| GET | `/customer/notifications` | | inbox; POST `/customer/notifications/read` |

## 4.5 Technician (`/technician`) — all technician roles

| Method | Path | Req | Notes |
| ------ | ---- | --- | ----- |
| GET/PATCH | `/technician/profile` | TEC-08 | name, surname, email, phones[] |
| POST | `/technician/profile/photo` | TEC-09 | |
| GET/POST/DELETE | `/technician/documents` | TEC-11/12 | |
| POST | `/technician/registration/resubmit` | TEC-06 | after rejection |
| PATCH | `/technician/location-settings` | TEC-10 | freelancer only: address_line, lat, lng, service_radius_km |
| GET/PUT | `/technician/working-hours` | TEC-14 | freelancer only (owners use `/company/working-hours`) |
| GET/PUT | `/technician/subservices` | TEC-15 | freelancer only |
| POST | `/technician/status` | TEC-20 | `{ online: bool }` → opens/closes the session |
| POST | `/technician/heartbeat` | | every 5 min while online |
| GET | `/technician/jobs?tab=pending\|ongoing\|completed` | TEC-32 | |
| GET | `/technician/jobs/{id}` | TEC-33 | |
| POST | `/technician/jobs/{id}/accept` | T6 | |
| POST | `/technician/jobs/{id}/propose-price` | T7 | proposed_total, note |
| POST | `/technician/jobs/{id}/propose-time` | T8 | appointment_at, note |
| POST | `/technician/jobs/{id}/reject` | T9 | reason_id, note |
| POST | `/technician/jobs/{id}/start-travel` | T15 | |
| POST | `/technician/jobs/{id}/location` | | lat, lng — only while `on_the_way`, max 1 per 5 s |
| POST | `/technician/jobs/{id}/start-work` | T16 | |
| POST | `/technician/jobs/{id}/complete` | T17 | |
| POST | `/technician/jobs/{id}/confirm-cash` | T18 | |
| GET | `/technician/points`, `/technician/points/transactions` | TEC-18 | |
| GET | `/technician/rewards` | | catalog |
| POST | `/technician/rewards/{id}/redeem` | | holds the points |
| GET | `/technician/reward-redemptions` | | |
| GET | `/technician/promotions`, POST, GET `/{id}`, POST `/{id}/deactivate` | TEC-40..42 | freelancer only (owners use `/company/promotions`) |
| GET | `/technician/notifications` | | |

## 4.6 Company owner (`/company`)

| Method | Path | Req | Notes |
| ------ | ---- | --- | ----- |
| GET/PATCH | `/company` | TEC-13 | name, logo, description, phone, email, address_line, lat, lng, service_radius_km |
| GET/PUT | `/company/working-hours` | TEC-14 | |
| GET/PUT | `/company/subservices` | TEC-15 | |
| GET | `/company/jobs?status=` | TEC-31 | all company jobs |
| POST | `/company/jobs/{id}/assign` | T3 | technician_id (an employee or the owner) |
| POST | `/company/jobs/{id}/reject` | T4 | reason_id, note |
| GET | `/company/employees` | TEC-51 | with online status |
| POST | `/company/employees` | TEC-50 | name, surname, email, phones[], password, photo, certificates[] |
| GET/PATCH | `/company/employees/{id}` | TEC-52 | |
| POST | `/company/employees/{id}/activate`, `/deactivate` | TEC-53 | |
| GET | `/company/employees/{id}/jobs` | TEC-60 | |
| GET | `/company/employees/{id}/online-sessions?from=&to=` | TEC-62 | |
| CRUD | `/company/promotions` (+ `/{id}/deactivate`) | TEC-40..42 | |

## 4.7 Admin (`/admin`)

| Area | Endpoints | Req |
| ---- | --------- | --- |
| Auth | uses `/auth/login` with `app=admin` | ADM-01 |
| Dashboard | GET `/admin/dashboard?from=&to=` | ADM-60 |
| Approvals | GET `/admin/registrations?status=pending`, GET `/{userId}`, POST `/{userId}/approve`, POST `/{userId}/reject` (reason) | ADM-10/11 |
| Users | GET `/admin/users?role=&q=&status=`, GET `/{id}`, POST `/{id}/suspend`, `/{id}/reactivate`, POST `/{id}/points-adjustments` | ADM-12/40/52 |
| Companies | GET `/admin/companies`, GET `/{id}` (+ employees) | ADM-40 |
| Services | CRUD `/admin/services`, CRUD `/admin/subservices` | ADM-20/21 |
| Reasons | CRUD `/admin/reasons` | ADM-22 |
| Promotions | GET `/admin/promotions?status=`, POST `/{id}/approve`, `/{id}/reject`, `/{id}/deactivate` | ADM-30/31 |
| Jobs | GET `/admin/jobs` (filters), GET `/{id}` (timeline), POST `/{id}/cancel`, `/{id}/reassign`, `/{id}/mark-paid`, `/{id}/refund` | ADM-41..43 |
| Ratings | GET `/admin/ratings`, POST `/{id}/hide`, `/{id}/unhide` | ADM-44 |
| Rewards | CRUD `/admin/rewards`; GET `/admin/reward-redemptions`, POST `/{id}/approve`, `/{id}/reject`, `/{id}/fulfil` | — |
| Settings | GET/PUT `/admin/settings` | ADM-50 |
| Pages | GET/PUT `/admin/pages/{slug}` | ADM-51 |
| Settlements | GET `/admin/settlements/outstanding` (per provider), GET/POST `/admin/settlements` | ADM-61/62 |
| Exports | GET `/admin/exports/{report}.csv` | ADM-63 |

## 4.8 Webhooks

| Method | Path | Notes |
| ------ | ---- | ----- |
| POST | `/webhooks/payway` | ABA PayWay pushback. Verifies the hash, then calls the PayWay **check-transaction** API before marking success. Idempotent on `tran_id`. |

## 4.9 Example: create job

```http
POST /api/v1/customer/jobs
Content-Type: multipart/form-data

service_id=3
items[0][subservice_id]=12
items[0][quantity]=2
items[1][subservice_id]=14
items[1][quantity]=1
address_id=7
appointment_at=2026-12-01T09:00:00+07:00
remark=Second floor, ring twice
target[type]=technician
target[id]=58
photos[]=@ac.jpg
```

```json
{
  "data": {
    "id": 101, "code": "HS-000101", "status": "pending",
    "appointment_at": "2026-12-01T02:00:00Z",
    "items": [{ "subservice_id": 12, "name": "AC cleaning", "unit": "item", "unit_price": "15.00", "quantity": "2.00", "discount_percent": "10.00", "line_total": "27.00" }],
    "estimated_total": "42.00", "currency": "USD",
    "assignment": { "level": "technician", "technician": { "id": 58, "name": "…" }, "expires_at": "2026-11-19T03:15:00Z" },
    "promotion": { "id": 4, "title": "Cool December" }
  }
}
```

# 3. Job state machine

Implemented in `App\Enums\JobStatus` + one Action class per transition. Every transition runs in a DB transaction with `SELECT … FOR UPDATE` on the job row, writes a `job_status_histories` row, then dispatches events (broadcast + push) **after commit**.

## 3.1 Statuses

| Status | Waiting on | Terminal |
| ------ | ---------- | -------- |
| `pending_assignment` | Company owner | |
| `pending` | Technician | |
| `price_proposed` | Customer | |
| `time_proposed` | Customer | |
| `needs_reassignment` | Customer (`reassign_reason` explains why) | |
| `confirmed` | Appointment | |
| `on_the_way` | Technician | |
| `in_progress` | Technician | |
| `completed` | Customer payment | |
| `paid` | — (rating optional) | ✔ |
| `cancelled` | — | ✔ |

> Compared with `docs/pr/02-job-lifecycle.md`: `expired` and "needs new technician" are merged into `needs_reassignment`, with the cause stored in `reassign_reason`.

## 3.2 Transition table

| # | From | Action (actor) | To | Guards | Side effects |
| - | ---- | -------------- | -- | ------ | ------------ |
| T1 | — | `CreateJob` (customer) targeting **company** | `pending_assignment` | booking validation (§3.4) | company-level assignment, expires in 15 min; notify owner |
| T2 | — | `CreateJob` (customer) targeting **technician** | `pending` | booking validation; technician eligible (§3.5) | technician-level assignment; notify technician (+ owner if employee) |
| T3 | `pending_assignment` | `AssignTechnician` (owner) | `pending` | technician is an active, approved member of the company (owner included); eligible | company assignment → `assigned`; new technician assignment, expires in 15 min |
| T4 | `pending_assignment` | `RejectJob` (owner) | `needs_reassignment` (`rejected`) | reason required | |
| T5 | `pending_assignment`, `pending` | timeout (system) | `needs_reassignment` (`expired`) | `now ≥ expires_at` and no response yet | assignment → `expired`; notify customer |
| T6 | `pending` | `AcceptJob` (technician) | `confirmed` | — | `agreed_total = estimated_total`; `confirmed_at` |
| T7 | `pending` | `ProposePrice` (technician) | `price_proposed` | `proposed_total > 0` and ≠ estimate | `proposed_total`; notify customer |
| T8 | `pending` | `ProposeTime` (technician) | `time_proposed` | proposed time ≥ now + 1 h, inside working hours | notify customer |
| T9 | `pending` | `RejectJob` (technician) | `needs_reassignment` (`rejected`) | reason required | |
| T10 | `price_proposed` | `AcceptPrice` (customer) | `confirmed` | — | `agreed_total = proposed_total` (replaces any promotion, see [06](06-pricing-points-payment.md)) |
| T11 | `price_proposed` | `DeclinePrice` (customer) | `needs_reassignment` (`price_declined`) | — | assignment → `customer_declined` |
| T12 | `time_proposed` | `AcceptTime` (customer) | `confirmed` | proposed time still ≥ now + 1 h | `appointment_at = proposed_appointment_at`; `agreed_total = estimated_total` |
| T13 | `time_proposed` | `DeclineTime` (customer) | `needs_reassignment` (`time_declined`) | — | |
| T14 | `needs_reassignment` | `ReassignJob` (customer) → company / technician | `pending_assignment` / `pending` | booking validation with an optional new `appointment_at`; same subservices | new assignment; `estimated_total` recalculated (the promotion may change with the provider) |
| T15 | `confirmed` | `StartTravel` (technician) | `on_the_way` | appointment date is today (local) | start live location (see [05](05-realtime-notifications.md)) |
| T16 | `on_the_way` | `StartWork` (technician) | `in_progress` | — | stop live location |
| T17 | `in_progress` | `CompleteJob` (technician) | `completed` | — | `completed_at`; notify customer to pay |
| T18 | `completed` | payment success (`ConfirmCashPayment` by technician / PayWay callback) | `paid` | — | `paid_at`; award points (customer + technician); update stats; ask for rating |
| T19 | any non-terminal before `on_the_way` | `CancelJob` (customer) | `cancelled` | if `confirmed`: `now < appointment_at − 2 h` | open assignment → `cancelled` (`counts_for_ranking = false` if not yet responded); notify technician/owner |
| T20 | `needs_reassignment`, `pending_assignment`, `pending`, `price_proposed`, `time_proposed` | appointment time passed (system) | `cancelled` (`system`) | `now ≥ appointment_at` | notify customer |
| T21 | any non-terminal | `AdminCancel` / `AdminReassign` (admin) | `cancelled` / `pending*` | note required | ADM-43 |

Technicians cannot cancel a `confirmed` job in-app (JOB-10); they contact support, and admin uses T21.

## 3.3 Diagram

```
             ┌──────────────── T5 timeout / T4,T9 reject ───────────────┐
             │                                                          ▼
 T1 ► pending_assignment ─T3─► pending ─T7─► price_proposed ─T11─► needs_reassignment
 T2 ─────────────────────────►   │  └─T8─► time_proposed ──T13──►        │
                                 │            │T12        T10│           │ T14 (re-target)
                                 T6           ▼               ▼           ▼
                                 └──────────► confirmed ◄────────── (back to pending*)
                                                 │T15
                                              on_the_way ─T16─► in_progress ─T17─► completed ─T18─► paid
 T19/T20/T21: → cancelled
```

## 3.4 Booking validation (T1, T2, T14)

1. Customer's email is verified and the account is `active`.
2. `items` is not empty; all subservices are active and belong to `service_id`; `quantity > 0`.
3. `appointment_at ≥ now + settings.min_booking_lead_minutes` (60).
4. `appointment_at` falls inside the provider's `working_hours` (company hours for a company or its members).
5. The address location is within the provider's service radius (`ST_DWithin`).
6. The provider offers **every** selected subservice.
7. At most 5 photos.

## 3.5 Technician eligibility

The technician's account is `active`, the profile is `approved`, `is_active = true`, and `is_online = true`; for employees and owners, the company owner's profile is `approved`. The technician has no other job with an `appointment_at` within ±2 h that is in `confirmed`/`on_the_way`/`in_progress` *(soft check: shown as a warning to the owner on T3, enforced on T2)*.

## 3.6 Scheduled tasks

| Command | Schedule | Purpose |
| ------- | -------- | ------- |
| `ExpireJobAssignment` (queued, delayed to `expires_at`) | per assignment | T5. Idempotent: no-op if the assignment has already been answered. |
| `jobs:sweep-expired` | every minute | Safety net for T5 in case delayed jobs are lost. |
| `jobs:appointment-alerts` | every minute | `confirmed` jobs with `appointment_at − 60 min ≤ now` and `alert_sent_at` null → alert technician (TEC-38) and customer reminder. |
| `jobs:auto-cancel` | every 5 min | T20. |
| `technicians:close-stale-sessions` | hourly | Set offline when there has been no heartbeat for 12 h. |
| `points:expire` | daily 00:10 | Expire lots past `expires_at`. |
| `ranking:recalculate` | daily 01:00 | Recompute 90-day acceptance and `rank_score` (also updated incrementally). |
| `promotions:notify-started` | every 5 min | Push to customers when an approved promotion's `starts_at` arrives (approval before the start date just schedules it). |

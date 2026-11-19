# Tasks — 3. Job state machine

Spec: [`docs/spec/03-job-state-machine.md`](../spec/03-job-state-machine.md)

All transitions are Action classes in `app/Actions/Jobs/`. Every action: runs in a transaction, locks the job (`lockForUpdate`), checks the current status (else throws `InvalidTransitionException`), writes `job_status_histories`, and dispatches events after commit. Each task includes Pest tests for its happy path and invalid transitions.

---

### FLOW-01 · Transition infrastructure
**Milestone:** M2 · **Component:** API · **Depends on:** DATA-06 · **Refs:** spec 03 intro, §3.2
- [ ] `JobStatus::canTransitionTo()` map (allowed from → to)
- [ ] Base `JobTransition` helper: `transition(Job $job, JobStatus $to, Actor $actor, ?string $note, array $meta)` — lock, guard, update, write history
- [ ] `Actor` value object (user + role: customer, technician, owner, admin, system)
- [ ] `JobStatusChanged` domain event fired after commit (consumed by RT tasks)
- [ ] Test helper `assertJobTransitioned($job, $from, $to)`

**Acceptance criteria**
- An invalid transition throws and writes no history; a valid one writes exactly one history row

---

### FLOW-02 · Booking validation & technician eligibility
**Milestone:** M2 · **Component:** API · **Depends on:** FLOW-01, BIZ-06 · **Refs:** spec 03 §3.4, §3.5
- [ ] `BookingValidator`: verified + active customer; items not empty, active, belonging to the service; quantity > 0; lead time ≥ `min_booking_lead_minutes`; within working hours (timezone-aware; supports several ranges per day); address within the radius (PostGIS `ST_DWithin`); provider offers all subservices; ≤ `max_job_photos`
- [ ] `TechnicianEligibility`: active user, approved, `is_active`, online, company owner approved, no conflicting job within ±2 h (hard for T2, warning for T3)
- [ ] Return structured errors (field + i18n key) that map to 422

**Acceptance criteria**
- Unit/feature tests cover every rule individually (one failing case per rule)

---

### FLOW-03 · Create job (T1, T2)
**Milestone:** M2 · **Component:** API · **Depends on:** FLOW-02, BIZ-01 · **Refs:** spec 03 T1, T2
- [ ] `CreateJob` action: validate, snapshot the address, compute the estimate and snapshot items (with promotion), store photos, create the job
- [ ] Target company → status `pending_assignment` + company-level assignment
- [ ] Target technician → status `pending` + technician-level assignment
- [ ] Assignment `expires_at = now + response_timeout_minutes`; dispatch `ExpireJobAssignment` delayed to `expires_at`
- [ ] Fire `JobOffered` / `JobAssignmentRequested` events

**Acceptance criteria**
- Creating a job for a company and for a technician produces the correct status, assignment and delayed expiry job

---

### FLOW-04 · Owner assign / reject (T3, T4)
**Milestone:** M2 · **Component:** API · **Depends on:** FLOW-03 · **Refs:** spec 03 T3, T4
- [ ] `AssignTechnician`: the owner picks an employee or themselves; check membership + eligibility (conflict = warning); mark the company assignment `assigned`; create a technician assignment with a fresh 15 min
- [ ] `OwnerRejectJob`: reason required → `needs_reassignment` (`rejected`)
- [ ] Authorization: only the owner of the job's company

**Acceptance criteria**
- An employee from another company can't be assigned (422); a non-owner gets 403

---

### FLOW-05 · Technician responses (T6–T9)
**Milestone:** M2 · **Component:** API · **Depends on:** FLOW-03 · **Refs:** spec 03 T6–T9
- [ ] `AcceptJob` → `confirmed`, `agreed_total = estimated_total`, `confirmed_at`
- [ ] `ProposePrice` → `price_proposed`; validate > 0 and ≠ estimate
- [ ] `ProposeTime` → `time_proposed`; validate lead time + working hours
- [ ] `TechnicianRejectJob` → `needs_reassignment` (`rejected`) with reason_id/note
- [ ] Each response sets `assignment.responded_at` and status; only the assigned technician, only before `expires_at`
- [ ] Trigger a ranking stats update (BIZ-07)

**Acceptance criteria**
- A response after `expires_at` returns 409; each action leaves the job and assignment consistent

---

### FLOW-06 · Customer responses (T10–T13)
**Milestone:** M2 · **Component:** API · **Depends on:** FLOW-05 · **Refs:** spec 03 T10–T13
- [ ] `AcceptPrice` → `confirmed`, `agreed_total = proposed_total`
- [ ] `DeclinePrice` → `needs_reassignment` (`price_declined`), assignment `customer_declined`
- [ ] `AcceptTime` → `confirmed`, `appointment_at = proposed`; re-check lead time
- [ ] `DeclineTime` → `needs_reassignment` (`time_declined`)

**Acceptance criteria**
- Only the job's customer can act; accepting a time that is now less than 1 h away returns 422

---

### FLOW-07 · Reassign (T14)
**Milestone:** M2 · **Component:** API · **Depends on:** FLOW-06 · **Refs:** spec 03 T14
- [ ] `ReassignJob`: new target (company or technician), optional new `appointment_at`; re-run booking validation; recompute the estimate (promotion of the new provider); new assignment + expiry
- [ ] Previous technicians can't be targeted again for the same job *(nice to have: show a warning only)*

**Acceptance criteria**
- After reassignment the job has a new current assignment, and the history shows the full chain

---

### FLOW-08 · Job progress (T15–T17)
**Milestone:** M2 · **Component:** API · **Depends on:** FLOW-05 · **Refs:** spec 03 T15–T17
- [ ] `StartTravel` (only on the appointment's local date) → `on_the_way`, `on_the_way_at`
- [ ] `StartWork` → `in_progress`, `started_at`
- [ ] `CompleteJob` → `completed`, `completed_at`
- [ ] Only the assigned technician

**Acceptance criteria**
- `StartTravel` on another day returns 422; the full progression works in one test

---

### FLOW-09 · Payment completion (T18)
**Milestone:** M4 · **Component:** API · **Depends on:** FLOW-08, BIZ-03 · **Refs:** spec 03 T18
- [ ] `MarkJobPaid` (called by cash confirmation, the PayWay webhook and admin mark-paid): payment success, job `paid`, `paid_at`
- [ ] Award customer and technician points (BIZ-04); update `completed_jobs_count`; fire a rating request notification

**Acceptance criteria**
- Calling it twice (e.g. duplicate webhook) is idempotent: points are awarded once

---

### FLOW-10 · Cancellation (T19, T20, T21)
**Milestone:** M2 · **Component:** API · **Depends on:** FLOW-06 · **Refs:** spec 03 T19–T21, JOB-09
- [ ] `CustomerCancelJob`: allowed in pre-confirmation statuses anytime; in `confirmed` only if `now < appointment_at − cancel_cutoff_hours`; blocked from `on_the_way` onward; reason_id/note
- [ ] Open assignment → `cancelled`; `counts_for_ranking = false` if not yet responded
- [ ] `SystemAutoCancel` for T20
- [ ] `AdminCancelJob` and `AdminReassignJob` (note required) for T21
- [ ] Return held points if a payment is pending (edge case)

**Acceptance criteria**
- Cancelling 1 h 59 min before a confirmed appointment returns 409; 2 h 01 min succeeds

---

### FLOW-11 · Scheduled & queued tasks
**Milestone:** M2 (alerts in M3) · **Component:** API · **Depends on:** FLOW-03, FLOW-10 · **Refs:** spec 03 §3.6
- [ ] `ExpireJobAssignment` queued job (idempotent) → T5
- [ ] `jobs:sweep-expired` every minute (safety net)
- [ ] `jobs:appointment-alerts` every minute → alert + reminder, sets `alert_sent_at`
- [ ] `jobs:auto-cancel` every 5 min → T20
- [ ] `technicians:close-stale-sessions` hourly
- [ ] Register everything in `routes/console.php`; use `withoutOverlapping()`
- [ ] Tests with `$this->travel()`

**Acceptance criteria**
- An offer nobody answers becomes `needs_reassignment` (`expired`) after 15 min, even with the delayed job removed (sweep)

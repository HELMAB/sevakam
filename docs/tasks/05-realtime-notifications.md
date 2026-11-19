# Tasks — 5. Realtime & notifications

Spec: [`docs/spec/05-realtime-notifications.md`](../spec/05-realtime-notifications.md)

---

### RT-01 · Broadcast channels & authorization
**Milestone:** M3 · **Component:** API · **Depends on:** ARCH-03, DATA-06 · **Refs:** spec 05 §5.1
- [ ] `routes/channels.php`: `user.{id}`, `job.{id}` (customer, assigned technician, company owner, admin), `company.{id}` (owner), `admin`
- [ ] Feature tests for channel authorization (allowed and denied cases)

**Acceptance criteria**
- A technician who is not assigned cannot join `private-job.{id}`

---

### RT-02 · Broadcast events
**Milestone:** M3 · **Component:** API · **Depends on:** RT-01, FLOW-01 · **Refs:** spec 05 §5.1 events table
- [ ] Create `ShouldBroadcast` events: `JobOffered`, `JobAssignmentRequested`, `JobStatusChanged`, `JobPriceProposed`, `JobTimeProposed`, `JobOfferWithdrawn`, `TechnicianLocationUpdated`, `PaymentUpdated`, `TechnicianOnlineChanged`, `AdminRegistrationSubmitted`
- [ ] `broadcastAs()` names and minimal payloads as in the spec
- [ ] Dispatch from actions after commit (`ShouldDispatchAfterCommit`)
- [ ] Tests with `Event::fake` per transition

**Acceptance criteria**
- Each transition T1–T21 fires the expected events (data-driven test)

---

### RT-03 · FCM notification channel
**Milestone:** M3 · **Component:** API · **Depends on:** ARCH-06, DATA-02 · **Refs:** spec 05 §5.2
- [ ] `FcmChannel` + `toFcm()` contract; send to all of the user's tokens for the matching app
- [ ] Remove tokens on `UNREGISTERED` / `INVALID_ARGUMENT`
- [ ] Android high priority + `incoming_job` channel for `job_offered`; iOS `interruption-level: time-sensitive`
- [ ] Topic support (`customers`) for promotion broadcasts; subscribe customer tokens on registration
- [ ] Also store each notification in the `database` channel (inbox)

**Acceptance criteria**
- With the FCM client mocked, a notification is sent to every token, and invalid tokens are deleted

---

### RT-04 · Notification classes
**Milestone:** M3 (M4/M5 for payment/promotion/reward types) · **Component:** API · **Depends on:** RT-03 · **Refs:** spec 05 §5.2 table
- [ ] One `Notification` class per type in the spec table (job_offered … reward_redemption_updated)
- [ ] Data payload `{ type, job_id, id }` + i18n title/body
- [ ] Listeners mapping domain events → notifications
- [ ] `promotions:notify-started` command (topic push)
- [ ] `points_expiring` daily notification (nice to have)

**Acceptance criteria**
- `Notification::fake` tests assert the recipient and type for each transition

---

### RT-05 · Realtime client in Flutter apps
**Milestone:** M3 · **Component:** Customer app, Technician app · **Depends on:** RT-01, ARCH-07, ARCH-08 · **Refs:** spec 05 §5.1
- [ ] `RealtimeService` (Pusher protocol client) with bearer auth to `/broadcasting/auth`
- [ ] Subscribe to `private-user.{id}` after login; unsubscribe on logout
- [ ] `jobChannelProvider(jobId)` → stream of events used by the job detail screens
- [ ] Reconnect on app resume; refetch the job detail after reconnecting

**Acceptance criteria**
- A status change made from another device updates the open job detail screen without a manual refresh

---

### RT-06 · Push handling & deep links in Flutter apps
**Milestone:** M3 · **Component:** Customer app, Technician app · **Depends on:** ARCH-10, RT-04 · **Refs:** spec 05 §5.2
- [ ] Register the device token after login (`POST /auth/device-tokens`), refresh on token change, delete on logout
- [ ] Route on tap by `type` (job → `/jobs/:id`, offer → `/incoming/:id`, reminder → `/alert/:id`, promotion → `/promotions/:id`, …)
- [ ] Foreground: show an in-app banner (or trigger the popup for `job_offered`)
- [ ] Notification inbox screen (list, mark read)

**Acceptance criteria**
- Tapping each push type from a killed app opens the correct screen

---

### RT-07 · Live location (API + both apps)
**Milestone:** M3 · **Component:** API, Technician app, Customer app · **Depends on:** RT-02, FLOW-08 · **Refs:** spec 05 §5.4, JOB-14
- [ ] API: `POST /technician/jobs/{id}/location` (only `on_the_way` and the assigned technician; throttle 1 per 5 s) → `last_location` + `TechnicianLocationUpdated`
- [ ] Technician app: background location permission flow; `geolocator` stream (10 s / 50 m) started on Start travel, stopped on Start work or cancel; Android foreground service notification
- [ ] Customer app: Google Map on job detail while `on_the_way`, with the technician marker (animated), destination marker, distance, and "last updated" time
- [ ] Tests: API guard tests; manual device test checklist

**Acceptance criteria**
- The customer sees the marker move within ~10 s of the technician moving; updates stop after Start work

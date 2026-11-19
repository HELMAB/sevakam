# Tasks — 8. Technician app

Spec: [`docs/spec/08-technician-app.md`](../spec/08-technician-app.md) · Component: `app/technician_app`

Each feature task includes: models, repository, Riverpod notifiers, screens, loading/error/empty states, and tests. Roles: F = freelancer, E = employee, O = company owner. `(xlsx: N)` = original spreadsheet estimate.

---

### TAPP-01 · First screen, login, forgot password
**Milestone:** M0 · **Depends on:** ARCH-08, API-04, API-05 · **Refs:** TEC-01, 03, 07 (xlsx: 4 + 3 + 4)
- [ ] Splash → `/auth/me` → route by approval state and role
- [ ] Welcome with Login / Register
- [ ] Login (email/password), `wrong_app`/suspended/deactivated messages
- [ ] Forgot/reset password

**Acceptance criteria**
- An employee, a freelancer and an owner each land on their role's home layout

---

### TAPP-02 · Registration (freelancer / company)
**Milestone:** M1 · **Depends on:** TAPP-01, API-03 · **Refs:** TEC-02, 10–13 (xlsx: 10)
- [ ] Type chooser: Freelancer / Company
- [ ] Multi-step form with a progress indicator: account (email, password) → personal (name, surname, phones) → location (map pin, address, service radius slider) → documents (certificate(s), patent; camera/PDF via file_picker) → company info (name, logo, phone, company profile doc) for companies
- [ ] Keep the draft between steps; final review → submit (multipart with progress)
- [ ] Email verification code screen

**Acceptance criteria**
- Both types submit successfully and land on the pending-approval screen

---

### TAPP-03 · Waiting for approval / rejected & resubmit
**Milestone:** M1 · **Depends on:** TAPP-02, API-03 · **Refs:** TEC-06 (xlsx: 3)
- [ ] Pending screen with status illustration, pull-to-refresh, logout
- [ ] Rejected: show the reason, edit profile/documents, Resubmit
- [ ] Push `registration_approved` → refresh and enter the app

**Acceptance criteria**
- After admin approval, the app moves to Home without logging in again

---

### TAPP-04 · Social login
**Milestone:** M7 · **Depends on:** TAPP-01, API-06 · **Refs:** TEC-04, 05 (xlsx: 4 + 3)
- [ ] Facebook + Apple buttons (not for employees); a new social user continues into registration with prefilled name/email

**Acceptance criteria**
- A new Facebook user completes registration and reaches the pending screen

---

### TAPP-05 · Profile, documents, language, terms
**Milestone:** M1 · **Depends on:** API-12 · **Refs:** TEC-08, 09, 11, 12, 16, 17 (xlsx: 8 + 2 + 2 + 2 + 4 + 3)
- [ ] Edit name, surname, email, manage multiple phone numbers (add/remove/primary)
- [ ] Profile photo upload
- [ ] Documents screen: list, view, upload, delete certificates/patent
- [ ] Language (English), Terms (`terms_technician`)

**Acceptance criteria**
- Phone list changes persist and the primary phone is shown to customers

---

### TAPP-06 · Location, working hours & offered services (F, O)
**Milestone:** M1 · **Depends on:** API-12 · **Refs:** TEC-10, 14, 15 (xlsx: 5 + 2)
- [ ] Location & radius screen (map + slider), using company endpoints for owners
- [ ] Weekly working-hours editor (per day: closed / one or more ranges; copy to all days)
- [ ] Offered subservices: grouped by main service, checkboxes

**Acceptance criteria**
- Saved hours and offerings change which jobs the customer search returns (verified against the API)

---

### TAPP-07 · Company profile (O)
**Milestone:** M1 · **Depends on:** API-12 · **Refs:** TEC-13 (xlsx: 12)
- [ ] Company profile view/edit: name, logo, description, phone, email, address
- [ ] Shows approval status and the company documents list

**Acceptance criteria**
- Logo and description changes appear on the customer app's company profile

---

### TAPP-08 · Home: online/offline & waiting for jobs
**Milestone:** M3 · **Depends on:** API-13, RT-05 · **Refs:** TEC-20, 21, 30 (xlsx: 4 + 3 + 12)
- [ ] Large online/offline toggle with status colours; offline blocked/warned while a job is in progress
- [ ] Heartbeat timer every 5 min while online and in the foreground
- [ ] "Waiting for jobs" state; today's upcoming jobs list
- [ ] Owners: "Jobs to assign" card with count

**Acceptance criteria**
- The toggle state survives an app restart (read from `/auth/me`) and the server session opens/closes

---

### TAPP-09 · Incoming job popup
**Milestone:** M3 · **Depends on:** TAPP-08, RT-05, RT-06, API-14 · **Refs:** TEC-30, 33–35 (xlsx: 12 + 6 + 4 + 5)
- [ ] Full-screen route `/incoming/:jobId` opened by the `job.offered` event or a push tap; re-fetches the job on open
- [ ] Shows service, items, quantities, photos, address + distance, appointment, estimate, countdown ring
- [ ] Actions: Accept · Adjust price (inline input) · Propose time (inline picker within working hours) · Reject (reason sheet)
- [ ] Sound/vibration; Android full-screen intent via `flutter_local_notifications`
- [ ] Queue more offers (badge); "offer expired/withdrawn" handling

**Acceptance criteria**
- With the app in the background, a new offer rings and opens the popup; acting after expiry shows "Offer expired"

---

### TAPP-10 · Job lists & job detail with actions
**Milestone:** M2 (progress actions) · **Depends on:** API-14 · **Refs:** TEC-32, 33–37, 39 (xlsx: 7 + 6 + 4 + 4 + 5)
- [ ] Jobs tabs: Pending · Ongoing · Completed (paginated)
- [ ] Job detail: customer name/phone (call), address with "Open in Google Maps", items, photos, remark, price, timeline
- [ ] Actions by status: Accept / Propose price / Propose time / Reject (pending); Start travel (confirmed, appointment day); Start work; Complete; Confirm cash received
- [ ] Waiting states for `price_proposed` / `time_proposed`

**Acceptance criteria**
- A technician can take a job from `pending` to `paid` (cash) using only the app

---

### TAPP-11 · Appointment alert screen
**Milestone:** M3 · **Depends on:** RT-06, FLOW-11 · **Refs:** TEC-38 (xlsx: 5)
- [ ] `/alert/:jobId` full-screen reminder (time, address, customer) opened from the `appointment_reminder` push; buttons: View job, Start travel (if allowed)

**Acceptance criteria**
- The reminder push 60 min before the appointment opens the alert screen

---

### TAPP-12 · Live location sharing
**Milestone:** M3 · **Depends on:** RT-07 · **Refs:** TEC-39a
- [ ] See RT-07 (technician side): permission rationale screen, location stream service, foreground service notification, stop conditions

**Acceptance criteria**
- Location updates are sent only while the job is `on_the_way`

---

### TAPP-13 · Company: assign jobs (O)
**Milestone:** M2 · **Depends on:** API-15 · **Refs:** TEC-31
- [ ] Company jobs screen: pending-assignment list with countdown
- [ ] Assign sheet: employees (and "Myself") with online status, conflict warnings, eligibility errors
- [ ] Reject company job with a reason
- [ ] Realtime updates on `private-company.{id}`

**Acceptance criteria**
- Assigning an employee sends them the incoming-job popup

---

### TAPP-14 · Company: employee management (O)
**Milestone:** M1 (history screens M3) · **Depends on:** API-15 · **Refs:** TEC-50..53, 60, 62 (xlsx: 7 + 6 + 8 + 3 + 6 + 7)
- [ ] Employee list with active/online badges, search
- [ ] Create employee form (name, surname, email, phones, temp password, photo, certificates)
- [ ] Edit employee; activate/deactivate with confirmation
- [ ] Employee job history list
- [ ] Online/offline history: date-range picker, per-day timeline bars, total online hours

**Acceptance criteria**
- A deactivated employee is logged out on their next request and can't log in

---

### TAPP-15 · Promotions (F, O)
**Milestone:** M5 · **Depends on:** API-16 · **Refs:** TEC-40..42 (xlsx: 7 + 6 + 6 + 2)
- [ ] Promotion form: image picker, title, description, start/end dates, % per offered subservice (with a preview of discounted prices)
- [ ] List tabs: Pending · Active · Ended/Rejected (with reason)
- [ ] Detail + Deactivate

**Acceptance criteria**
- A submitted promotion appears as Pending, and as Active after admin approval

---

### TAPP-16 · Score & rewards
**Milestone:** M4 (points) / M5 (rewards) · **Depends on:** API-16 · **Refs:** TEC-18, TEC-19 (xlsx: 3 + 6)
- [ ] Points screen: balance, expiring soon, transactions
- [ ] Rewards catalog (image, cost, stock), redeem confirmation
- [ ] My redemptions with status

**Acceptance criteria**
- Redeeming deducts the balance immediately; a rejection refunds it

---

### TAPP-17 · Notifications inbox
**Milestone:** M3 · **Depends on:** RT-06 · **Refs:** NFR-04
- [ ] Same as CAPP-17 for the technician app

**Acceptance criteria**
- Tapping an inbox item opens the related job/promotion/redemption

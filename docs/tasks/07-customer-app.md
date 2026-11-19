# Tasks — 7. Customer app

Spec: [`docs/spec/07-customer-app.md`](../spec/07-customer-app.md) · Component: `app/customer_app`

Each feature task includes: freezed models, a repository (dio), Riverpod notifiers, screens/widgets, loading/error/empty states, and unit + widget tests for the notifiers and main screen. `(xlsx: N)` shows the original spreadsheet estimate for reference.

---

### CAPP-01 · First screen & welcome
**Milestone:** M0 · **Depends on:** ARCH-07 · **Refs:** CUS-01 (xlsx: 4)
- [ ] Splash: load the token → `/auth/me` → route to home, verify-email or welcome
- [ ] Welcome/intro (2–3 slides) with Login / Register buttons
- [ ] App icon and native splash

**Acceptance criteria**
- A cold start with a valid token lands on Home; with no token, on Welcome

---

### CAPP-02 · Register & verify email
**Milestone:** M0 · **Depends on:** CAPP-01, API-02 · **Refs:** CUS-02, CUS-48 (xlsx: 6)
- [ ] Register form: name, surname, email, phone (Cambodia +855 default), password + confirm; client validation; terms checkbox linking to terms
- [ ] Map server 422 errors onto fields
- [ ] Verify screen: 6-digit code input, resend with a 60 s countdown, error states

**Acceptance criteria**
- A new user can register, enter the emailed code and land on Home

---

### CAPP-03 · Login & forgot password
**Milestone:** M0 · **Depends on:** CAPP-01, API-04, API-05 · **Refs:** CUS-03, CUS-06 (xlsx: 3 + 4)
- [ ] Login: email/password, show/hide password, `wrong_app` and suspended messages
- [ ] Forgot password → code + new password screen
- [ ] Logout (Account) deletes the token and device token

**Acceptance criteria**
- A wrong password shows an inline error; a reset lets the user log in with the new password

---

### CAPP-04 · Social login (Facebook, Apple)
**Milestone:** M7 · **Depends on:** CAPP-03, API-06 · **Refs:** CUS-04, CUS-05 (xlsx: 4 + 3)
- [ ] `flutter_facebook_auth` and `sign_in_with_apple` setup (Android key hashes, iOS capabilities)
- [ ] Buttons on Login/Register → `POST /auth/social`
- [ ] Apple button shown on iOS (required when other social logins exist)

**Acceptance criteria**
- Both providers log in on real devices; cancelling the provider sheet returns quietly

---

### CAPP-05 · Profile, photo, language, terms
**Milestone:** M1 · **Depends on:** API-08, API-07 · **Refs:** CUS-07, 08, 10, 11 (xlsx: 8 + 2 + 4 + 3)
- [ ] Account tab: avatar, name, points summary, menu
- [ ] Edit profile (name, surname, phone, email; an email change triggers verification)
- [ ] Photo: camera/gallery picker, crop, upload with progress
- [ ] Language screen (English only; stored locale)
- [ ] Terms screen rendering `/public/pages/terms_customer`

**Acceptance criteria**
- Profile edits persist after restarting the app

---

### CAPP-06 · Manage addresses
**Milestone:** M1 · **Depends on:** API-08 · **Refs:** CUS-09 (xlsx: 6)
- [ ] Address list (default badge, swipe delete with confirmation)
- [ ] Address form: label chips (Home/Office/Other + custom), Google Map pin picker, "use my location", Places autocomplete search, address line, note, default toggle
- [ ] Location permission handling (manual search works if denied — NFR-42)

**Acceptance criteria**
- An address created via the map pin is saved with correct lat/lng and appears in the booking address picker

---

### CAPP-07 · Home: services, top companies, promotion banner
**Milestone:** M2 · **Depends on:** API-07, API-09 · **Refs:** CUS-20, CUS-21 (xlsx: 7 + 6)
- [ ] Main services grid (icons) with pull-to-refresh
- [ ] Top companies horizontal list (logo, rating, jobs) for the default address
- [ ] Active promotions carousel (M5)
- [ ] Address selector in the header

**Acceptance criteria**
- Tapping a service opens its subservices; tapping a company opens its profile

---

### CAPP-08 · Booking flow A: service → subservices → details → provider
**Milestone:** M2 · **Depends on:** CAPP-07, API-09, API-10 · **Refs:** CUS-30, 32, 33, 34, 35, 36 (xlsx: 10 + 8 + 3 + 10 + 4 + 8)
- [ ] `BookingDraft` notifier holding service, items, address, appointment time, photos, remark, target
- [ ] Subservice list: multi-select with a quantity stepper, unit and base price, running total
- [ ] "Add other subservice" from the same main service
- [ ] Details form: photos (≤ 5, compressed), remark, address picker, date picker + time slots (≥ 1 h ahead)
- [ ] Provider selection with tabs: Companies (top companies) · Top 5 technicians · Map (nearby markers, bottom sheet with the technician card)
- [ ] Unavailable-provider feedback (outside hours/radius) with an option to change the time
- [ ] Review screen: items, promotion discount, estimate in USD + KHR, address, time, target → submit (multipart with upload progress)
- [ ] On success → job detail

**Acceptance criteria**
- A complete booking to a technician and to a company works end to end against the seeded API

---

### CAPP-09 · Booking flow B (company first) & from a promotion
**Milestone:** M2 (promotion entry M5) · **Depends on:** CAPP-08 · **Refs:** CUS-31, CUS-23 (xlsx: 10)
- [ ] Company profile screen: header, rating, offered services, hours, reviews, active promotions, "Book" → service → subservices (only offered ones) → details → review
- [ ] Promotion "Book now" pre-fills the provider and promoted subservices

**Acceptance criteria**
- A company-first booking creates a job in `pending_assignment`

---

### CAPP-10 · Technician profile
**Milestone:** M2 · **Depends on:** API-09 · **Refs:** CUS-24 (xlsx: 8)
- [ ] Photo, name, company, rating & count, completed jobs, certificates, recent reviews (paginated)
- [ ] "Book this technician" entry when coming from discovery

**Acceptance criteria**
- The profile shows only visible (not hidden) reviews

---

### CAPP-11 · Job detail & status actions
**Milestone:** M2 (realtime M3) · **Depends on:** API-10, RT-05 · **Refs:** CUS-40..44 (xlsx: 10 + 7 + 4 + 5 + 3)
- [ ] Job detail: code, status chip, timeline, items/prices, photos, address, appointment, technician card (call button once confirmed)
- [ ] Action panel driven by `allowed_actions` (spec 07 §7.3), including countdown for pending
- [ ] Price proposal screen (estimate vs proposed, accept/decline)
- [ ] Time proposal screen (approve/decline)
- [ ] Reassign screen: reuses provider selection with an optional new time
- [ ] Cancel bottom sheet: reason list + note; hidden after the cutoff with an explanation
- [ ] Live updates via `private-job.{id}`

**Acceptance criteria**
- Every status in spec 07 §7.3 shows the correct actions (widget test per status)

---

### CAPP-12 · Job lists (active & history)
**Milestone:** M2 · **Depends on:** API-10 · **Refs:** CUS-45 (xlsx: 7)
- [ ] Jobs tab with Active / History tabs, infinite scroll, status chips, pull-to-refresh
- [ ] History filter: completed vs not completed

**Acceptance criteria**
- Cancelled and paid jobs appear under History; others under Active

---

### CAPP-13 · Payment
**Milestone:** M4 · **Depends on:** API-11, BIZ-03 · **Refs:** CUS-46
- [ ] Pay screen: agreed total (USD/KHR), points balance, redeem slider (respecting the max %), final total
- [ ] Method choice: Cash / ABA PayWay
- [ ] Cash: "Waiting for technician to confirm" state, updated via `payment.updated`
- [ ] PayWay: open the ABA deeplink (`url_launcher`); fall back to a WebView checkout or KHQR display; listen for/poll the payment status; success and failure screens
- [ ] Receipt view on paid jobs

**Acceptance criteria**
- A sandbox PayWay payment moves the job to `paid` and the app updates without restarting

---

### CAPP-14 · Rate technician
**Milestone:** M4 · **Depends on:** API-11 · **Refs:** CUS-50..53 (xlsx: 2 + 4 + 3 + 1)
- [ ] Star selector; when < 5, reason chips are required
- [ ] Photo attachments (≤ 5), description
- [ ] Prompt after payment, and a "Rate" button on paid unrated jobs

**Acceptance criteria**
- Submitting 3★ without a reason is blocked on the client

---

### CAPP-15 · Points (score)
**Milestone:** M4 · **Depends on:** API-11 · **Refs:** CUS-12 (xlsx: 3 + 6)
- [ ] Points screen: balance, "expiring in 30 days", transaction list (type icon, job link, +/−, date)

**Acceptance criteria**
- The balance matches the API after a payment earns points

---

### CAPP-16 · Promotions
**Milestone:** M5 · **Depends on:** API-11 · **Refs:** CUS-22, CUS-23 (xlsx: 8 + 6)
- [ ] Promotion list (image, provider, period, max discount)
- [ ] Promotion detail: image, title, description, discounted subservices with old/new price, Book now
- [ ] Push `promotion_published` opens the detail

**Acceptance criteria**
- An expired promotion no longer appears in the list

---

### CAPP-17 · Notifications inbox
**Milestone:** M3 · **Depends on:** RT-06 · **Refs:** NFR-04
- [ ] Inbox list with unread state and badge on the tab; tap → deep link; mark all read

**Acceptance criteria**
- The unread count updates when a new push arrives in the foreground

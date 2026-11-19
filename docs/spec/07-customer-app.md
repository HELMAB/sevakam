# 7. Customer app (`app/customer_app`)

## 7.1 Architecture (shared by both Flutter apps)

Layered, feature-first (UI → logic → data):

```
lib/
├── main.dart, app.dart                 MaterialApp.router, theme, l10n
├── core/
│   ├── config/                         env (API base URL, Reverb keys), flavors: dev/staging/prod
│   ├── network/                        dio client, auth interceptor, error mapping → AppException
│   ├── realtime/                       Echo/Pusher client, channel subscriptions
│   ├── push/                           firebase_messaging setup, tap routing by `type`
│   ├── storage/                        flutter_secure_storage (token)
│   ├── l10n/                           ARB files (en only in v1)
│   └── widgets/                        shared UI (buttons, price text USD/KHR, status chip, …)
├── features/<feature>/
│   ├── data/        models (freezed + json_serializable), repository (dio)
│   ├── application/ Riverpod providers / Notifiers (AsyncNotifier)
│   └── presentation/ screens, widgets
└── router/                             go_router config + auth/verification redirects
```

- State: `flutter_riverpod` (Notifier/AsyncNotifier, riverpod_generator).
- Navigation: `go_router` with redirect guards: unauthenticated → `/login`, unverified → `/verify-email`.
- HTTP: `dio` with a bearer-token interceptor; a 401 clears the session.
- Models: `freezed` + `json_serializable`; money as `Decimal`/`String`, shown through a `Price` widget (USD + KHR).
- Realtime: subscribe to `private-user.{id}` after login and to `private-job.{id}` on the job detail screen.
- Maps: `google_maps_flutter` and the Places API for address search.
- Payments: open the ABA deeplink with `url_launcher`; fall back to a `webview_flutter` checkout.
- Tests: unit tests for notifiers/repositories (mocked dio), widget tests for key screens.

## 7.2 Routes & screens

| Route | Screen | Req |
| ----- | ------ | --- |
| `/splash` | Splash / first screen | CUS-01 |
| `/welcome` | Intro → login / register | CUS-01 |
| `/login` | Email + password, Facebook, Apple | CUS-03..05 |
| `/register` | Registration form | CUS-02 |
| `/verify-email` | 6-digit code, resend | — |
| `/forgot-password`, `/reset-password` | | CUS-06 |
| `/home` (tab) | Main services grid, top companies, promotion banner | CUS-20, CUS-21 |
| `/services/:id` | Subservice list (multi-select + quantity) | CUS-30, CUS-32 |
| `/companies/:id` | Company profile → choose service → subservices | CUS-31 |
| `/book/details` | Job detail form: photos (≤5), quantities, remark, address, date/time (only allowed slots) | CUS-33 |
| `/book/provider` | Choose: company list / top 5 technicians / map tab | CUS-30, CUS-34, CUS-35 |
| `/book/review` | Summary + estimate (USD/KHR) + promotion → submit | CUS-36 |
| `/technicians/:id` | Technician profile | CUS-24 |
| `/jobs` (tab) | Active / history tabs | CUS-45 |
| `/jobs/:id` | Job detail: status timeline, technician card, live map when `on_the_way`; action panel by status | CUS-40 |
| `/jobs/:id/price-proposal` | Accept / decline proposed price | CUS-41 |
| `/jobs/:id/time-proposal` | Approve / decline new time | CUS-42 |
| `/jobs/:id/reassign` | Choose another provider (+ new time) | CUS-43 |
| `/jobs/:id/cancel` | Reason + confirm (hidden after the cutoff) | CUS-44 |
| `/jobs/:id/pay` | Method (cash / ABA PayWay), points slider, total → payment status | CUS-46 |
| `/jobs/:id/rate` | Stars, reasons (if < 5), photos, description | CUS-50..53 |
| `/promotions` | Promotion list | CUS-22 |
| `/promotions/:id` | Promotion detail → Book now | CUS-23 |
| `/notifications` | Inbox | NFR-04 |
| `/account` (tab) | Profile summary, points, settings | — |
| `/account/profile` | Edit name, phone, email, photo | CUS-07, CUS-08 |
| `/account/addresses`, `/account/addresses/edit` | List + map picker | CUS-09 |
| `/account/points` | Balance, expiring soon, transactions | CUS-12 |
| `/account/language` | Language (English) | CUS-10 |
| `/account/terms` | Terms & conditions | CUS-11 |

Bottom navigation: **Home · Jobs · Notifications · Account**.

## 7.3 Job detail action panel (by status)

| Status | Customer sees |
| ------ | ------------- |
| `pending_assignment` / `pending` | "Waiting for response" + countdown; Cancel |
| `price_proposed` | Proposed price vs estimate; Accept / Decline; Cancel |
| `time_proposed` | Proposed time; Approve / Decline; Cancel |
| `needs_reassignment` | Reason banner (rejected / no response / declined); Choose another technician; Cancel |
| `confirmed` | Appointment card; Cancel (until 2 h before) |
| `on_the_way` | Live map with the technician marker |
| `in_progress` | "Work in progress" |
| `completed` | Pay now |
| `paid` | Rate technician (if not rated yet); receipt |
| `cancelled` | Who cancelled + reason |

## 7.4 Booking flows

- **Flow A (service first):** Home → service → subservices → details → provider choice (Companies tab: top companies covering the address; Technicians tab: top 5; Map tab: nearby) → review → submit.
- **Flow B (company first):** Home → company → service → subservices → details → review → submit (target = company; the owner assigns).
- **From a promotion:** promotion → Book now → pre-selects the provider and promoted subservices → details → review.
- Changing the address or date after choosing a provider re-validates eligibility and the estimate.

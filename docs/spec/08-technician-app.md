# 8. Technician app (`app/technician_app`)

Same architecture as the customer app ([07 §7.1](07-customer-app.md#71-architecture-shared-by-both-flutter-apps)). Extra packages: `geolocator` (live location), `flutter_local_notifications` (full-screen incoming-job alert), `file_picker` (documents).

## 8.1 Role-based navigation

The role comes from `GET /auth/me` → `technician.type` and `approval_status`.

| Condition | App shows |
| --------- | --------- |
| `approval_status = pending` | Waiting-for-confirmation screen only (+ profile/document edit, logout) |
| `approval_status = rejected` | Rejection reason + edit & resubmit |
| `company_employee` | Home · Jobs · Score · Account |
| `freelancer` | Home · Jobs · Promotions · Account (Score inside Account) |
| `company_owner` | Home · Jobs · Company · Account (Company = employees, promotions, company jobs to assign) |

A deactivated employee (`is_active = false`) is logged out with a message.

## 8.2 Routes & screens

| Route | Screen | Roles | Req |
| ----- | ------ | ----- | --- |
| `/splash`, `/welcome` | First screen | all | TEC-01 |
| `/register/type` | Choose freelancer / company | F, O | TEC-02 |
| `/register/form` | Multi-step: account → personal → location & radius (map) → documents → (company info) | F, O | TEC-02, 10–13 |
| `/verify-email` | Code | F, O | — |
| `/login` | Email/password, Facebook, Apple (employees: email only) | all | TEC-03..05 |
| `/forgot-password` | | all | TEC-07 |
| `/pending-approval` | Waiting / rejected + resubmit | F, O | TEC-06 |
| `/home` | Online/offline toggle, status banner, today's jobs, "waiting for jobs" state | all | TEC-20, 21, 30 |
| `/incoming/:jobId` | **Full-screen popup**: service, items, address & distance, time, estimate, countdown; Accept / Adjust price / Propose time / Reject | F, E, O | TEC-30, 33–35 |
| `/jobs` | Tabs: Pending · Ongoing · Completed | all | TEC-32 |
| `/jobs/:id` | Detail + actions by status: Start travel, Arrived/Start work, Complete, Confirm cash; open in Google Maps; call customer | F, E, O | TEC-33..37, 39 |
| `/jobs/:id/propose-price` | Price input with the estimate shown | | TEC-33 |
| `/jobs/:id/propose-time` | Date/time picker (only within working hours, ≥ 1 h ahead) | | TEC-35 |
| `/jobs/:id/reject` | Reason list + note | | TEC-34 |
| `/alert/:jobId` | Appointment alert screen (opened from the reminder push) | F, E, O | TEC-38 |
| `/company/jobs` | Company jobs awaiting assignment → pick an employee (shows online status and conflicts) | O | TEC-31 |
| `/company/employees` | List with active/online badges | O | TEC-51 |
| `/company/employees/new`, `/:id/edit` | Create / update employee | O | TEC-50, 52, 53 |
| `/company/employees/:id/jobs` | Job history | O | TEC-60 |
| `/company/employees/:id/online` | Online-session timeline per day (date range) | O | TEC-62 |
| `/company/profile` | Company profile, location & radius | O | TEC-13, 10 |
| `/promotions` | Tabs: pending · active · ended | F, O | TEC-41 |
| `/promotions/new` | Image, title, description, period, % per offered subservice | F, O | TEC-40 |
| `/promotions/:id` | Detail + Deactivate | F, O | TEC-41, 42 |
| `/score` | Points, expiring soon, transactions; Rewards catalog → redeem; my redemptions | all | TEC-18 |
| `/account/profile` | Name, email, phones, photo | all | TEC-08, 09 |
| `/account/documents` | Certificates / patent | all | TEC-11, 12 |
| `/account/working-hours` | Weekly schedule editor | F, O | TEC-14 |
| `/account/services` | Choose offered subservices | F, O | TEC-15 |
| `/account/language`, `/account/terms` | | all | TEC-16, 17 |
| `/notifications` | Inbox | all | — |

F = freelancer, E = employee, O = company owner.

## 8.3 Online status & background behaviour

- Toggling online calls `POST /technician/status`; the app sends a heartbeat every 5 min while it is in the foreground. The server auto-closes sessions after 12 h without a heartbeat (FCM pushes still arrive while backgrounded).
- Going offline is blocked while a job is `on_the_way`/`in_progress` (warn only; it doesn't affect accepted jobs).
- Live location: on **Start travel**, request background location permission, then start a `geolocator` position stream (10 s / 50 m) and post to `/technician/jobs/{id}/location`. Stop on **Start work**, on cancellation, or when the app is killed (the customer then sees the last known position with a timestamp).

## 8.4 Incoming job handling

See [05 §5.3](05-realtime-notifications.md#53-incoming-job-popup-tec-30). Additional rules:
- Only one popup is shown at a time; further offers queue up as a badge on the Pending tab.
- When the countdown reaches 0, the popup closes with "Offer expired".
- **Adjust price** and **Propose time** are inline forms in the popup, so the technician answers within the window.

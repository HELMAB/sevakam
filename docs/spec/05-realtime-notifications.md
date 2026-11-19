# 5. Realtime & notifications

## 5.1 Realtime (Laravel Reverb)

Clients connect with the Pusher protocol (Flutter: `pusher_channels_flutter` / `laravel_echo`; admin: `laravel-echo` + `pusher-js`) and authorise private channels via `POST /broadcasting/auth` using the Sanctum bearer token.

### Channels (`routes/channels.php`)

| Channel | Who may join |
| ------- | ------------ |
| `private-user.{userId}` | that user |
| `private-job.{jobId}` | the job's customer, the assigned technician, the provider's company owner, admins |
| `private-company.{companyId}` | the company owner |
| `private-admin` | admins |

### Events

| Event (`broadcastAs`) | Channel(s) | Payload | Trigger |
| --------------------- | ---------- | ------- | ------- |
| `job.offered` | `user.{technicianId}` | job summary, `expires_at` | T2, T3, T14 → shows the full-screen incoming-job popup (TEC-30) |
| `job.assignment-requested` | `company.{id}` | job summary, `expires_at` | T1, T14 (company) |
| `job.status-changed` | `job.{id}`, `user.{customerId}` | `{ id, status, reassign_reason, … }` | every transition |
| `job.price-proposed` | `job.{id}` | `proposed_total` | T7 |
| `job.time-proposed` | `job.{id}` | `proposed_appointment_at` | T8 |
| `job.offer-withdrawn` | `user.{technicianId}` | `{ job_id }` | expiry or cancellation while the popup is open |
| `technician.location` | `job.{id}` | `{ lat, lng, heading, at }` | live location while `on_the_way` |
| `payment.updated` | `job.{id}` | `{ payment_id, status }` | PayWay callback / cash confirmation |
| `technician.online-changed` | `company.{id}` | `{ technician_id, is_online }` | TEC-51 live list |
| `admin.registration-submitted` | `admin` | `{ user_id }` | new or resubmitted registration |

Events are queued (`ShouldBroadcast`) and dispatched after the DB commit.

## 5.2 Push notifications (FCM)

Sent through a Laravel notification channel (`FcmChannel`) to all of the user's device tokens for the matching app. Invalid tokens are removed when FCM reports `UNREGISTERED`. Every push is also stored in `notifications` (in-app inbox).

Data payload: `{ "type": "<type>", "job_id": "…", "id": "…" }`. Apps route on `type` when the notification is tapped.

| Type | Recipient | When |
| ---- | --------- | ---- |
| `job_offered` | technician | new offer — high priority, custom sound, `android_channel_id = incoming_job` |
| `job_assignment_requested` | owner | company job awaiting assignment |
| `job_offer_expired` | technician / owner | they didn't respond in time |
| `job_price_proposed` | customer | T7 |
| `job_time_proposed` | customer | T8 |
| `job_needs_reassignment` | customer | T4, T5, T9 (rejected / expired) |
| `job_confirmed` | technician | T10, T12 (customer accepted) |
| `job_declined` | technician | T11, T13 |
| `job_cancelled` | technician / owner | T19, T20, T21 |
| `job_on_the_way` | customer | T15 |
| `job_started` / `job_completed` | customer | T16 / T17 |
| `appointment_reminder` | technician (opens the alert screen, TEC-38) and customer | 60 min before |
| `payment_received` | technician / customer | T18 |
| `rating_received` | technician | new rating |
| `registration_approved` / `registration_rejected` | technician | ADM-11 |
| `promotion_approved` / `promotion_rejected` | provider | ADM-30 |
| `promotion_published` | **all customers** (FCM topic `customers`) | approved promotion becomes active |
| `points_expiring` | customer / technician | 30 days before a lot expires *(nice to have)* |
| `reward_redemption_updated` | technician | approve / reject / fulfil |

## 5.3 Incoming job popup (TEC-30)

1. Foreground: the Reverb `job.offered` event opens the full-screen popup with a countdown to `expires_at`.
2. Background or terminated: the FCM `job_offered` push (high priority) is shown; tapping it opens the popup. On Android a full-screen intent is used when the permission is granted.
3. On open, the popup always re-fetches `GET /technician/jobs/{id}` so it never acts on a stale offer. If the offer was withdrawn, it shows "This job is no longer available".

## 5.4 Live location (on the way)

- The technician app sends `POST /technician/jobs/{id}/location` every **10 s** (or every 50 m moved) while the job is `on_the_way`. Background location permission is requested on the first `start-travel`.
- The API stores the position in `technician_profiles.last_location` (no history) and broadcasts `technician.location` on `private-job.{id}`.
- The customer's job detail screen shows a Google Map with the technician marker, the destination, and the straight-line distance (no route ETA in v1).
- Updates are rejected (409) when the job is not `on_the_way` or the sender is not the assigned technician.
- Privacy: the location is visible only on that job's channel and only during `on_the_way`.

# 1. Overview

## 1.1 Goal

A marketplace that connects **customers** who need home services (repair, cleaning, installation, …) with **technicians** — independent freelancers or employees of service companies. Customers book a service, agree on price and appointment time with a technician, pay (cash or ABA PayWay) and rate the work. The platform is operated through an **admin dashboard**.

## 1.2 Users & roles

| Role | App | Description |
| ---- | --- | ----------- |
| Customer | Customer app | Books services, manages addresses, pays, rates technicians, earns/redeems loyalty points. |
| Freelancer technician | Technician app | Independent technician. Registers, is approved by admin, receives and performs jobs. |
| Company owner | Technician app | Registers a company, is approved by admin. Manages employee technicians, assigns company jobs, creates promotions. May also perform jobs *(assumption)*. |
| Company employee | Technician app | Technician account created by a company owner. Active immediately (no admin approval). Receives jobs directly or assigned by the owner. |
| Admin | Admin dashboard | Approves technicians/companies, manages services & prices, monitors users/jobs, configures settings, views reports and settlements. |

## 1.3 Scope

### In scope (v1)
- Customer mobile app (Flutter, iOS + Android)
- Technician mobile app (Flutter, iOS + Android) — freelancers, company owners, employees
- Admin web dashboard (Vue 3)
- Backend REST API (Laravel) + realtime (WebSockets) + push notifications
- Cash and ABA PayWay payment, loyalty points, promotions, ratings

### Out of scope (v1)
- Platform commission on jobs
- Multiple languages content (UI is i18n-ready, English only)
- In-app chat between customer and technician *(assumption — not in spec)*
- Automatic payouts to technicians (settlement is manual by admin)

## 1.4 System components

| Component | Directory | Stack |
| --------- | --------- | ----- |
| Backend API | `api/` | Laravel 13, PHP 8.3, Pest, Laravel Reverb (WebSockets) |
| Admin dashboard | `admin/` | Vue 3, Vite |
| Customer app | `app/customer_app/` | Flutter |
| Technician app | `app/technician_app/` | Flutter |

External services:

| Purpose | Service |
| ------- | ------- |
| Push notifications | Firebase Cloud Messaging (FCM) |
| Realtime events | Laravel Reverb |
| Maps, geocoding, distance | Google Maps Platform |
| Online payment | ABA PayWay |
| Social login | Facebook Login, Sign in with Apple |

## 1.5 Glossary

| Term | Meaning |
| ---- | ------- |
| Main service | Top-level category, e.g. "Air conditioner". |
| Subservice | Bookable item under a main service, e.g. "AC cleaning", with an admin-defined base price and unit. |
| Job | A customer's booking: one main service, one or more subservices with quantities, an address, an appointment time, and an assigned technician. |
| Price proposal | A technician's adjusted price for a job, which the customer must accept or reject. |
| Time proposal | A technician's alternative appointment time, which the customer must approve or reject. |
| Score / points | Loyalty points earned on completed jobs and redeemable as a discount. |
| Service area | Radius around a technician's/company's location within which they accept jobs. |
| Settlement | Admin manually paying technicians/companies the money collected via ABA PayWay. |

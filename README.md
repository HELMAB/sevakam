# Home Service System

A monorepo for a home service platform: a backend API, an admin dashboard, and mobile apps for customers and technicians.

## Project structure

| Directory             | Description                  | Stack                     |
| --------------------- | ---------------------------- | ------------------------- |
| `api/`                | Backend REST API             | Laravel 13, PHP 8.3, Pest |
| `admin/`              | Admin dashboard              | Vue 3, Vite               |
| `app/customer_app/`   | Mobile app for customers     | Flutter (Dart 3.13+)      |
| `app/technician_app/` | Mobile app for technicians   | Flutter (Dart 3.13+)      |

## Prerequisites

- PHP 8.3+ and Composer
- Node.js and npm
- Flutter SDK (stable channel)
- SQLite (default database for local development)

## Getting started

### API (`api/`)

```bash
cd api
composer setup   # installs deps, creates .env, generates key, runs migrations, builds assets
composer dev     # starts the local development server
```

Run tests:

```bash
composer test
```

### Admin dashboard (`admin/`)

```bash
cd admin
npm install
npm run dev      # start Vite dev server
npm run build    # production build
```

### Mobile apps (`app/`)

```bash
cd app/customer_app      # or app/technician_app
flutter pub get
flutter run
```

Run tests:

```bash
flutter test
```

## Environment

Copy `api/.env.example` to `api/.env` and adjust values as needed (`composer setup` does this automatically). Never commit `.env` files.

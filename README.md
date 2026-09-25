# Yabera Suite

A booking-request website for a cozy studio at **Avida Towers Riala Tower 5, Cebu IT Park**.

Guests check availability and submit an internal **Request to Book**. Stays are confirmed only after the host approves them in the admin dashboard.

## Stack

- Frontend: React, TypeScript, Tailwind CSS (Vite)
- Backend: Spring Boot 3, REST API, Spring Security (JWT)
- Database: MySQL 8

## Run locally

### 1. MySQL

```bash
docker compose up -d
```

This starts MySQL on port `3306` with database `yabera_suite`, user `yabera`, password `claireandrea`.

### 2. API

Requires Java 17+ and Maven.

```bash
cd backend
mvn spring-boot:run
```

The API listens on [http://localhost:8080](http://localhost:8080).

Default host login:

- Username: `admin`
- Password: `yabera-admin-2026`

Change these with `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `JWT_SECRET`.

### 3. Website

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

- Home: `/`
- Booking: `/book`
- Host login: `/admin/login`

## Availability rules

- Nights are stored as `[check-in, check-out)` (checkout day is free for the next guest).
- `PENDING` requests hold dates so two guests cannot claim the same nights.
- `CONFIRMED` nights stay unavailable.
- `CANCELLED` / rejected bookings release nights.
- Manual blocks occupy nights immediately and appear as unavailable on the guest calendar.
- A unique constraint on occupied nights plus a database transaction prevents double booking.

## Project layout

```
backend/   Spring Boot API
frontend/  React app
```

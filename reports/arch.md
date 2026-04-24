# System Architecture — GraminServe

---

## Overview

GraminServe uses a **microservices-ready monolith** pattern:
- **NestJS** handles all business logic via a structured REST API.
- **Firebase** handles real-time synchronization, authentication, and storage.
- The architecture is designed to extract individual NestJS modules into separate microservices as traffic grows.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend (Web App)** | Angular | Admin & Super Admin dashboards |
| **Frontend (Customer/Pro)** | React | Mobile-responsive PWA |
| **Backend** | NestJS (Node.js) | Modular REST API |
| **Primary Database** | Firestore | User Profiles, Bookings, Service Listings |
| **Realtime Database** | Firebase RTDB | Chat messages, Live location tracking |
| **Authentication** | Firebase Auth | Phone OTP (primary), Email (secondary) |
| **File Storage** | Firebase Storage | ID documents, portfolio photos |
| **Payments** | Razorpay | UPI, Wallets, Cards, COD Escrow |

---

## Data Flow

### REST API Flow (Heavy Business Logic)

```
Client (Angular/React)
    │
    ▼ HTTPS REST Request
NestJS API Server
    │
    ├──▶ Firestore         (Bookings, Profiles, Services)
    ├──▶ Razorpay API      (Payment Orders & Webhooks)
    └──▶ Firebase Admin SDK (Token verification, Storage)
```

### Realtime Flow (Chat & Notifications)

```
Client (React)
    │
    ▼ Firebase SDK (direct connection)
Firebase RTDB
    └── /chats/{booking_id}/{message_id}
    └── /presence/{user_id}
```

### Admin Flow

```
Admin/Super Admin (Angular)
    │
    ▼ HTTPS REST Request
NestJS Admin SDK
    │
    ├──▶ Firestore         (User management, Verification)
    └──▶ Firebase Admin    (Custom Claims for RBAC)
```

---

## Deployment Topology

| Service | Platform | Notes |
|---|---|---|
| NestJS API | Render / Railway | Auto-deploy from `main` branch |
| Angular Admin | Firebase Hosting | Separate project |
| React Customer App | Firebase Hosting | PWA with offline support |
| Firestore & RTDB | Google Firebase | Managed, serverless |
| Firebase Storage | Google Firebase | Encrypted ID document storage |
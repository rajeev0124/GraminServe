# GraminServe

> **Connecting Rural and Urban India through Digital Service Excellence**

GraminServe is a hyper-local service marketplace that bridges the gap between skilled professionals and customers in rural and semi-urban India. It enables users to discover, book, chat with, and pay verified local professionals — all within a configurable GPS radius.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Customer & Professional App | React (Mobile-first PWA) |
| Admin & Super Admin Dashboard | Angular |
| Backend API | NestJS (Node.js + TypeScript) |
| Primary Database | Google Firestore |
| Realtime Chat & Presence | Firebase Realtime Database |
| Authentication | Firebase Auth (Phone OTP) |
| File Storage | Firebase Storage |
| Payments | Razorpay (UPI, Wallets, Cards, COD) |

---

## Project Structure

```
GraminServe/
├── README.md                   ← You are here
└── reports/                    ← Project documentation
    ├── project.md              ← Executive summary & full project overview
    ├── arch.md                 ← System architecture & data flow diagrams
    ├── features.md             ← Feature specifications
    ├── components.md           ← UI components & backend modules reference
    ├── common.md               ← Shared utilities, enums & helpers
    ├── global.md               ← Environment config & Firebase security rules
    └── test.md                 ← Testing strategy & CI/CD pipeline
```

---

## Documentation Index

| Document | Description |
|---|---|
| [Project Overview](./reports/project.md) | Executive summary, roles, roadmap, and budget |
| [Architecture](./reports/arch.md) | Tech stack, data flow, and deployment topology |
| [Features](./reports/features.md) | Detailed feature specs with technical notes |
| [Components](./reports/components.md) | All UI components and backend NestJS modules |
| [Common Utilities](./reports/common.md) | Shared enums, error handling, and geolocation helpers |
| [Global Config](./reports/global.md) | Environment variables and Firebase security rules |
| [Testing Strategy](./reports/test.md) | Unit, integration, and load testing approach |

---

## Getting Started

> ⚠️ Source code repositories for each app (NestJS API, Angular Admin, React Customer) will be linked here as development progresses.

### Prerequisites

- Node.js >= 18
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore, RTDB, Auth, and Storage enabled
- A Razorpay account (Test mode for development)

---

## License

Private & Proprietary — GraminServe © 2026
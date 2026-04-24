# GraminServe — Project Documentation

> **Connecting Rural and Urban India through Digital Service Excellence**

---

## 1. Executive Summary

**GraminServe** is a hyper-local service marketplace platform that bridges the gap between skilled professionals and customers. Unlike existing competitors that focus solely on major cities, GraminServe is designed to scale into villages and small towns across India.

### The Problem

In rural areas, finding a reliable plumber, electrician, or painter often depends entirely on word-of-mouth. There is no price transparency, no record of work quality, and no easy way to contact or verify professionals.

### The Solution

A mobile-first web application where:

- **Professionals** list their services, prices, and past work portfolios.
- **Users** find help within a specific radius (e.g., 2 km) using their GPS location.
- **Trust** is built through a rating system, verified profiles, and secure digital payments.

---

## 2. User Roles & Workflow

The platform operates with four distinct access levels:

| Role | Key Functions |
|---|---|
| **Customer** | Search services, view portfolios, chat with professionals, book services, pay via Razorpay or COD. |
| **Professional** | Create service profiles, set hourly/fixed rates, upload work samples, manage availability. |
| **Admin** | Local area managers who verify professional IDs and resolve local disputes. |
| **Super Admin** | Platform owners who manage commission rates, global analytics, and high-level security. |

---

## 3. Technical Specification

This architecture is designed for high performance and real-time responsiveness using a modern full-stack approach.

### 3.1 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Angular | Admin & Super Admin Dashboards |
| **Frontend** | React | Customer & Professional Mobile-responsive web |
| **Backend** | NestJS (Node.js) | Modular, scalable REST API |
| **Language** | TypeScript | Strict typing for fewer production bugs |
| **Primary DB** | Firestore (NoSQL) | User profiles, service listings, bookings |
| **Realtime DB** | Firebase RTDB | Low-latency chat system |
| **Auth** | Firebase Authentication | OTP/Phone login — essential for rural users |

### 3.2 Core Feature Logic

- **Geolocation Engine:** Uses geo-hashing logic to query professionals based on latitude/longitude within a defined radius.
- **Real-time Communication:** Implemented via WebSockets (Socket.io) or Firebase Watchers to allow instant negotiation between user and professional.
- **Payment Gateway:** Integrated with Razorpay to support UPI, Wallets, and Credit/Debit cards, with an escrow logic for COD verification.

---

## 4. API & Data Architecture

### Primary Modules

1. **Auth Module** — Manages JWT tokens and role-based access control (RBAC).
2. **Service Discovery Module** — Handles filtering logic: Category + Distance + Price.
3. **Booking Module** — State machine to track booking lifecycle.
4. **Chat Module** — Manages message persistence and "Read" receipts.

### Booking State Machine

```
Requested → Accepted → In-Progress → Completed
                ↓
            Cancelled
```

### Entity Relationship Diagram

```
[User]         1 <---> 1  [Professional Profile]
[User]         1 <---> N  [Bookings]
[Professional] 1 <---> N  [Bookings]
[Booking]      1 <---> 1  [Transaction]
[Booking]      1 <---> 1  [Chat Room]
```

---

## 5. Security & Verification

To ensure safety in remote areas, the following measures are implemented:

| Concern | Implementation |
|---|---|
| **ID Verification** | Mandatory upload of government-issued IDs for professionals (stored in encrypted Firebase Storage). |
| **Secure Payments** | No bank details stored on servers; all transactions handled by PCI-DSS compliant Razorpay. |
| **Privacy** | Professional phone numbers are only revealed after a booking request is initiated to prevent spam. |

---

## 6. Project Roadmap & Estimated Costs

### Development Phases

| Month | Milestone |
|---|---|
| Month 1 | UI/UX Design & Database Schema Design |
| Month 2 | Professional Onboarding & Auth System |
| Month 3 | Search, Discovery, and Geolocation Features |
| Month 4 | Chat System & Razorpay Integration |
| Month 5 | Beta Testing in local cluster (e.g., Chirala / Bapatla) |

### Operating Budget (Monthly Estimate)

| Service | Estimated Cost |
|---|---|
| Server / Cloud | ₹2,000 – ₹5,000 (scales with users) |
| Google Maps API | ₹1,500 per 1,000 requests |
| SMS / OTP | ₹0.20 per login attempt |

---

## 7. Conclusion

GraminServe is more than just an "Urban Company clone." It is a **localized infrastructure tool** designed to digitize the unorganized labor sector in India's heartland. By utilizing a NestJS/Angular/React stack, the platform ensures it can handle thousands of concurrent users while remaining easy to maintain and extend.

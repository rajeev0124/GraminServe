# Components Reference — GraminServe

This document describes the major UI components and backend modules that make up the GraminServe platform.

---

## Frontend Components (Angular — Admin & Super Admin)

### Dashboard Shell

| Component | Description |
|---|---|
| `AppShellComponent` | Root layout with sidebar navigation and header. |
| `SidebarComponent` | Role-aware navigation menu (Admin vs Super Admin). |
| `HeaderComponent` | Logged-in user info, notifications bell, logout. |

### Admin Features

| Component | Description |
|---|---|
| `ProfessionalVerificationComponent` | Lists unverified professionals; allows ID approval/rejection. |
| `DisputeResolutionComponent` | Lists open booking disputes with chat history preview. |
| `LocalAnalyticsComponent` | Charts for bookings, revenue, and top professionals in the area. |

### Super Admin Features

| Component | Description |
|---|---|
| `GlobalAnalyticsDashboardComponent` | Platform-wide KPIs: DAU, MAU, Revenue, GMV. |
| `CommissionRateManagerComponent` | Set and update the global commission percentage. |
| `UserManagementComponent` | View, suspend, or delete any user account. |

---

## Frontend Components (React — Customer & Professional)

### Shared

| Component | Description |
|---|---|
| `BottomNavBar` | Mobile-friendly tab bar: Home, Search, Bookings, Chat, Profile. |
| `LoadingSpinner` | Full-screen loader with GraminServe branding. |
| `ErrorToast` | Global error notification snackbar. |

### Customer Flow

| Component | Description |
|---|---|
| `ServiceSearchPage` | Radius selector (2km / 5km / 20km) + category filter grid. |
| `ProfessionalCard` | Thumbnail, rating, price range, distance badge. |
| `ProfessionalDetailPage` | Full profile, portfolio gallery, "Book Now" CTA. |
| `BookingConfirmationModal` | Date/time picker and payment method selector. |
| `ActiveBookingTracker` | Live status updates: Accepted → In-Progress → Completed. |
| `OTPReleaseModal` | Customer enters OTP to confirm job completion & release payout. |
| `ChatRoomPage` | RTDB-powered real-time chat with image sharing. |

### Professional Flow

| Component | Description |
|---|---|
| `OnboardingWizard` | Multi-step form: ID upload, service selection, pricing, coverage area. |
| `AvailabilityToggle` | Simple on/off switch to mark as available for new bookings. |
| `IncomingBookingCard` | Accept / Decline booking request with countdown timer. |
| `EarningsSummaryPage` | Payout history, pending amounts, and transaction breakdown. |
| `PortfolioUploader` | "Before vs After" photo uploader with caption support. |

---

## Backend Modules (NestJS)

| Module | Endpoint Prefix | Responsibility |
|---|---|---|
| `AuthModule` | `/auth` | Firebase token verification, JWT issuance, RBAC guards. |
| `UsersModule` | `/users` | CRUD for user profiles stored in Firestore. |
| `ProfessionalsModule` | `/professionals` | Service listing management, geohash indexing, availability. |
| `ServiceDiscoveryModule` | `/discover` | Geo-radius search, category + price filtering. |
| `BookingsModule` | `/bookings` | Booking lifecycle state machine, OTP generation. |
| `PaymentsModule` | `/payments` | Razorpay order creation, webhook handling, payout logic. |
| `ChatModule` | `/chat` | Firebase RTDB room creation, read-receipt management. |
| `AdminModule` | `/admin` | Verification queues, dispute management (Admin role only). |
| `SuperAdminModule` | `/super-admin` | Commission config, platform analytics, user management. |

---

## Shared / Common Modules

| Item | Description |
|---|---|
| `GeoHelper` | `calculateDistance()` using the Haversine formula; `encodeGeohash()` for Firestore queries. |
| `AppExceptionFilter` | Global NestJS exception filter that formats errors for Angular/React clients. |
| `RbacGuard` | Custom NestJS guard that reads the Firebase `customClaims.role` field. |
| `FirebaseAdminProvider` | Singleton Firebase Admin SDK initialization used across all modules. |

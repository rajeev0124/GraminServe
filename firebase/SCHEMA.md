# GraminServe — Database Schema Reference

> **Firestore** for persistent business data · **RTDB** for real-time chat · **Firebase Storage** for files

---

## 1. Firestore Collections

### 1.1 `/users/{uid}`

Stores the profile for every platform user — customer, professional, admin, or super admin.

| Field | Type | Description |
|---|---|---|
| `uid` | `string` | Firebase Auth UID (matches document ID) |
| `displayName` | `string` | Full name |
| `phoneNumber` | `string` | E.164 format (e.g., `+919876543210`) |
| `email` | `string \| null` | Optional email address |
| `photoURL` | `string \| null` | Firebase Storage avatar URL |
| `role` | `UserRole` | `CUSTOMER \| PROFESSIONAL \| ADMIN \| SUPER_ADMIN` |
| `isVerified` | `boolean` | `true` once admin has approved ID (professionals only) |
| `isAvailable` | `boolean` | Professional's availability toggle |
| `location.geopoint` | `GeoPoint` | Firebase `GeoPoint(lat, lng)` |
| `location.geohash` | `string` | Geo-encoded hash for radius query (precision 9) |
| `location.address` | `string` | Human-readable street address |
| `location.city` | `string` | City name |
| `location.state` | `string` | State name |
| `location.pincode` | `string` | 6-digit postal code |
| `averageRating` | `number` | Weighted average (professionals only), `0` for customers |
| `totalReviews` | `number` | Count of reviews received |
| `createdAt` | `Timestamp` | `FieldValue.serverTimestamp()` on creation |
| `updatedAt` | `Timestamp` | `FieldValue.serverTimestamp()` on every update |

---

### 1.2 `/services/{serviceId}`

A service listing created by a professional.
One professional can have multiple service documents (e.g., Plumbing + Electrical).

| Field | Type | Description |
|---|---|---|
| `serviceId` | `string` | Auto-generated Firestore document ID |
| `professionalId` | `string` | UID of the owning professional |
| `category` | `ServiceCategory` | See categories enum below |
| `title` | `string` | Short headline (e.g., "Expert Pipe Repair") |
| `description` | `string` | Detailed description (max 500 chars) |
| `pricingType` | `HOURLY \| FIXED` | Billing model |
| `price` | `number` | Amount in INR |
| `coverageRadius` | `number` | Metres: `2000 \| 5000 \| 20000` |
| `location.geopoint` | `GeoPoint` | Professional's base location |
| `location.geohash` | `string` | Geohash for bounding-box radius queries |
| `portfolioImages` | `string[]` | Firebase Storage URLs of "Before/After" photos |
| `isActive` | `boolean` | `false` when de-listed by admin or professional |
| `averageRating` | `number` | Aggregate from `/reviews` |
| `totalReviews` | `number` | Count of reviews for this service |
| `createdAt` | `Timestamp` | Server timestamp |
| `updatedAt` | `Timestamp` | Server timestamp |

**ServiceCategory enum:**
```
PLUMBING | ELECTRICAL | CARPENTRY | PAINTING | CLEANING |
APPLIANCE_REPAIR | MASONRY | LANDSCAPING | PEST_CONTROL | OTHER
```

**Geohash Radius Query Pattern (Firestore):**
```typescript
// Backend — ServiceDiscoveryModule
const bounds = geohashQueryBounds([lat, lng], radiusMetres);
const queries = bounds.map(b =>
  db.collection('services')
    .where('category',  '==', category)
    .where('isActive',  '==', true)
    .where('location.geohash', '>=', b[0])
    .where('location.geohash', '<=', b[1])
);
// Post-filter results by actual Haversine distance
```

---

### 1.3 `/bookings/{bookingId}`

Tracks the full lifecycle of a service booking from request to completion.

| Field | Type | Description |
|---|---|---|
| `bookingId` | `string` | Auto-generated Firestore document ID |
| `customerId` | `string` | UID of the customer (immutable after creation) |
| `professionalId` | `string` | UID of the professional (immutable after creation) |
| `serviceId` | `string` | Reference to `/services/{serviceId}` |
| `status` | `BookingStatus` | State machine value (see below) |
| `scheduledAt` | `Timestamp` | Agreed date/time of service |
| `address` | `string` | Service location address |
| `location.geopoint` | `GeoPoint` | GPS coordinates of the job site |
| `pricingType` | `HOURLY \| FIXED` | Agreed billing model |
| `agreedPrice` | `number` | Final agreed price in INR |
| `paymentMethod` | `UPI \| CARD \| WALLET \| COD` | Chosen payment method |
| `razorpayOrderId` | `string \| null` | Razorpay order ID after payment initiation |
| `razorpayPaymentId` | `string \| null` | Razorpay payment ID after successful payment |
| `otpCode` | `string \| null` | 6-digit completion OTP (set by backend on STARTED) |
| `note` | `string \| null` | Optional customer instructions |
| `createdAt` | `Timestamp` | Server timestamp |
| `updatedAt` | `Timestamp` | Server timestamp |

**Booking State Machine:**
```
PENDING ──► ACCEPTED ──► STARTED ──► COMPLETED
   │             │           │
   └─────────────┴───────────┴──────► CANCELLED
```

---

### 1.4 `/reviews/{reviewId}`

Immutable review written by a customer after a booking is completed.

| Field | Type | Description |
|---|---|---|
| `reviewId` | `string` | Auto-generated Firestore document ID |
| `bookingId` | `string` | Reference to the completed booking |
| `reviewerId` | `string` | UID of the customer who wrote the review |
| `revieweeId` | `string` | UID of the professional being reviewed |
| `serviceId` | `string` | Reference to the service that was performed |
| `rating` | `number` | Integer 1–5 |
| `comment` | `string` | Optional text review (max 500 chars) |
| `createdAt` | `Timestamp` | Server timestamp (immutable — no updatedAt) |

---

### 1.5 `/notifications/{uid}/items/{notificationId}`

Sub-collection of per-user notification items. Written by the NestJS backend via Admin SDK only.

| Field | Type | Description |
|---|---|---|
| `notificationId` | `string` | Auto-generated document ID |
| `type` | `string` | `BOOKING_ACCEPTED \| NEW_BOOKING \| PAYMENT_RELEASED \| OTP_PROMPT` |
| `title` | `string` | Short notification headline |
| `body` | `string` | Full notification message |
| `bookingId` | `string \| null` | Associated booking for deep linking |
| `read` | `boolean` | `false` on creation; client can set to `true` |
| `createdAt` | `Timestamp` | Server timestamp |

---

## 2. Firebase Realtime Database Structure

```json
{
  "chats": {
    "{booking_id}": {

      "participants": {
        "{customer_uid}":      true,
        "{professional_uid}":  true
      },

      "messages": {
        "{auto_push_id}": {
          "senderUid":  "string  — must equal auth.uid (enforced by RTDB rule)",
          "text":       "string | null  — max 2000 characters",
          "imageUrl":   "string | null  — Firebase Storage download URL",
          "timestamp":  "number  — ServerValue.TIMESTAMP (ms since epoch)",
          "read":       "boolean  — false on creation; updated by recipient"
        }
      }

    }
  },

  "presence": {
    "{uid}": {
      "online":    "boolean",
      "lastSeen":  "number  — ServerValue.TIMESTAMP"
    }
  }
}
```

**Security contract:**
- `participants` is written **once** by the NestJS Admin SDK when a booking transitions to `ACCEPTED`.
- Clients can never modify `participants` (RTDB rule: `.write: false` on that node).
- A user can read/write `messages` only if their UID is a key in `participants`.
- `senderUid` is validated against `auth.uid` in the RTDB rule to prevent impersonation.

---

## 3. Firebase Storage Buckets

| Path | Access | Max Size | Notes |
|---|---|---|---|
| `/id-documents/{uid}/{file}` | Write: owner · Read: Admin only | 5 MB | Government ID uploads for verification |
| `/portfolios/{professionalUid}/{file}` | Write: owner · Read: Public | 5 MB | Before/After work photos |
| `/chat-images/{bookingId}/{file}` | Write: authenticated · Read: authenticated | 5 MB | Images shared in chat |
| `/avatars/{uid}/{file}` | Write: owner · Read: Public | 2 MB | Profile photos |

---

## 4. Composite Index Summary

| Collection | Fields | Purpose |
|---|---|---|
| `services` | `category ASC, geohash ASC, isActive ASC` | Geohash radius discovery |
| `services` | `category ASC, isActive ASC, price ASC` | Cheapest-first sort |
| `services` | `category ASC, isActive ASC, averageRating DESC` | Top-rated sort |
| `bookings` | `customerId ASC, createdAt DESC` | Customer booking history |
| `bookings` | `professionalId ASC, status ASC, scheduledAt ASC` | Pro job queue |
| `reviews` | `revieweeId ASC, createdAt DESC` | Professional review feed |

---

## 5. Deployment

```bash
# From /firebase directory
firebase login
firebase use graminserve-prod

# Deploy rules and indexes atomically
firebase deploy --only firestore:rules,firestore:indexes,database,storage
```

> ⚠️ **Always run `firebase deploy --only` with specific targets** in CI so a partial failure does not silently skip rules updates.

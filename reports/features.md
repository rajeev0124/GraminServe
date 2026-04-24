# Platform Features — GraminServe

---

## Feature Overview

| # | Feature | Status |
|---|---|---|
| 1 | Dynamic Radius Search | 🔵 Planned |
| 2 | Real-time RTDB Chat | 🔵 Planned |
| 3 | Secure Payment & OTP Release | 🔵 Planned |
| 4 | Professional Portfolio | 🔵 Planned |
| 5 | Rating & Review System | 🔵 Planned |
| 6 | Push Notifications | 🔵 Planned |

---

## 1. Dynamic Radius Search

Users can toggle their search radius between **2 km**, **5 km**, and **20 km** to find professionals nearby.

**How it works:**
- The system queries Firestore using **Geohash** encoded coordinates.
- Each professional's location is stored as a geohash string in their profile document.
- A bounding-box query is performed to filter results within the selected radius.
- Results are then re-sorted by actual Haversine distance client-side.

---

## 2. Real-time RTDB Chat

A low-latency, WebSocket-like chat system backed by Firebase Realtime Database.

**RTDB Node Structure:**
```
/chats
  /{booking_id}
    /{message_id}
      sender_uid: string
      text: string
      image_url: string | null
      timestamp: number
      read: boolean
```

**Features:**
- Image sharing via Firebase Storage (compressed before upload).
- Online presence indicators using RTDB `/presence/{user_id}`.
- "Read" receipts updated when the recipient opens the chat room.

---

## 3. Secure Payment & OTP Release

An escrow-like flow that protects both customers and professionals.

**Payment Flow:**
1. Customer pays via Razorpay (UPI / Wallet / Card / COD).
2. Funds are held until the job is marked complete.
3. At job completion, the professional asks the customer to share an **OTP**.
4. Customer receives OTP via SMS and provides it in-app.
5. OTP verification triggers the payout release to the professional.

**Security:** Razorpay is PCI-DSS compliant. No raw card data ever touches GraminServe servers.

---

## 4. Professional Portfolio

Professionals can showcase their work quality directly on their profile.

- Upload **"Before vs After"** photo pairs for each completed job category.
- Add captions and the service category tag.
- Photos are stored in Firebase Storage under `/portfolios/{professional_uid}/`.
- Customers can browse the gallery on the Professional Detail page before booking.

---

## 5. Rating & Review System

After a booking is marked **Completed**, both parties can leave a rating.

- **Customer rates Professional:** 1–5 stars + optional text review.
- **Professional rates Customer:** A simple "Would work again?" flag.
- Ratings are aggregated into a **weighted average** stored on the Professional profile.
- Reviews are public; the rating is used to rank search results.

---

## 6. Push Notifications

Real-time alerts for critical booking events.

| Event | Recipient | Channel |
|---|---|---|
| New booking request | Professional | Push + In-App |
| Booking accepted | Customer | Push + In-App |
| Professional en route | Customer | Push |
| Job marked complete | Customer | Push (OTP prompt) |
| Payout released | Professional | In-App |
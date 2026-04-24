# Global Configurations — GraminServe

---

## Environment Variables

All secrets are managed through `.env` files and **never committed to version control**.

**`.env` Template:**
```env
# Firebase
FIREBASE_PROJECT_ID=graminseve-prod
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@graminserve-prod.iam.gserviceaccount.com

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Platform Config
COMMISSION_RATE=0.15
JWT_SECRET=your_jwt_secret
PORT=3000
```

> **Note:** `COMMISSION_RATE` defaults to `0.15` (15%). This value can be updated at runtime by the Super Admin via the Admin API without a redeployment.

---

## Security Rules (Firebase)

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Bookings: accessible only by the customer or the professional involved
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.customerId ||
         request.auth.uid == resource.data.professionalId);
    }

    // Service listings: publicly readable, writable only by the owner professional
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.uid == resource.data.professionalId;
    }
  }
}
```

### Firebase Realtime Database Rules

```json
{
  "rules": {
    "chats": {
      "$booking_id": {
        ".read": "auth != null && root.child('bookings').child($booking_id).child('participants').child(auth.uid).exists()",
        ".write": "auth != null && root.child('bookings').child($booking_id).child('participants').child(auth.uid).exists()"
      }
    },
    "presence": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

---

## CORS Configuration (NestJS)

```typescript
// main.ts
app.enableCors({
  origin: [
    'https://admin.graminserve.in',
    'https://app.graminserve.in',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```
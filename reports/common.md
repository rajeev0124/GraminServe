# Common Utilities & Constants — GraminServe

Shared code used across both the NestJS backend and TypeScript frontend packages.

---

## Shared Enums

### `BookingStatus`

```typescript
export enum BookingStatus {
  PENDING    = 'PENDING',
  ACCEPTED   = 'ACCEPTED',
  STARTED    = 'STARTED',
  COMPLETED  = 'COMPLETED',
  CANCELLED  = 'CANCELLED',
}
```

### `UserRole`

```typescript
export enum UserRole {
  CUSTOMER      = 'CUSTOMER',
  PROFESSIONAL  = 'PROFESSIONAL',
  ADMIN         = 'ADMIN',
  SUPER_ADMIN   = 'SUPER_ADMIN',
}
```

---

## Error Handling

A global `AppExceptionFilter` catches all NestJS errors and formats them into a consistent response shape for Angular/React clients.

**Standard Error Response Shape:**
```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "A human-readable description of what went wrong.",
  "timestamp": "2026-04-24T06:00:00.000Z"
}
```

The filter is registered globally in `main.ts`:
```typescript
app.useGlobalFilters(new AppExceptionFilter());
```

---

## Geolocation Helper

### `calculateDistance(lat1, lon1, lat2, lon2): number`

Uses the **Haversine formula** to compute the great-circle distance (in kilometers) between two GPS coordinates.

```typescript
/**
 * Returns distance in kilometers between two GPS points.
 */
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

**Usage:** Enforces the 2 km – 20 km search-radius logic after a Firestore geohash bounding-box query.
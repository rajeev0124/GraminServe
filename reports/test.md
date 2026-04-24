# Testing Strategy — GraminServe

---

## Overview

| Level | Framework | Scope |
|---|---|---|
| **Unit Tests** | Jest (NestJS), Jasmine (Angular) | Individual services and components |
| **Integration Tests** | Jest + Supertest | API endpoints + Firestore/Razorpay flows |
| **Load Tests** | k6 / Artillery | Concurrent RTDB chat and API throughput |
| **E2E Tests** | Playwright | Full customer booking journey |

---

## Unit Testing

### NestJS — Payment & Booking Services

```typescript
// bookings.service.spec.ts
describe('BookingsService', () => {
  it('should transition status from ACCEPTED to STARTED', async () => {
    const result = await service.updateStatus('booking123', BookingStatus.STARTED);
    expect(result.status).toBe(BookingStatus.STARTED);
  });

  it('should throw if transitioning to an invalid state', async () => {
    await expect(
      service.updateStatus('booking123', BookingStatus.PENDING)
    ).rejects.toThrow(InvalidStateTransitionException);
  });
});
```

### Angular — Component Rendering

```typescript
// professional-card.component.spec.ts
it('should display the professional name and rating', () => {
  component.professional = mockProfessional;
  fixture.detectChanges();
  const nameEl = fixture.nativeElement.querySelector('.pro-name');
  expect(nameEl.textContent).toContain(mockProfessional.name);
});
```

---

## Integration Testing

### Razorpay Webhook → Firestore Status Update

**Scenario:** Verify that a `payment.captured` webhook from Razorpay correctly updates the Firestore `BookingStatus` to `COMPLETED` and triggers the OTP generation.

**Acceptance Criteria:**

| Step | Expected Result |
|---|---|
| POST `/payments/webhook` with valid Razorpay signature | HTTP 200 response |
| Firestore `booking.status` | Updated to `COMPLETED` |
| Firestore `booking.otpCode` | A 6-digit OTP is generated and stored |
| SMS trigger | `OtpService.send()` is called once |

---

## Load Testing

### Concurrent RTDB Chat Simulation

**Tool:** k6 or Artillery

**Scenario:** Simulate **100 concurrent users** sending chat messages in a single village booking node to check RTDB latency under real conditions.

**Target Metrics:**

| Metric | Target |
|---|---|
| P95 message delivery latency | < 300 ms |
| Error rate | < 0.1% |
| Firestore read operations | < 500 / second |

---

## CI/CD Integration

Tests are run automatically on every pull request via **GitHub Actions**:

```yaml
# .github/workflows/test.yml
- name: Run Unit Tests
  run: npm run test -- --coverage

- name: Run Integration Tests
  run: npm run test:integration

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

> Merging to `main` is blocked if coverage drops below **80%**.
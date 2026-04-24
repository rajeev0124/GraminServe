import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@app/shared/shared.module';

// ── Core ──────────────────────────────────────────────────────────────────────
import { AuthModule } from '@app/modules/auth/auth.module';

// ── User domain ───────────────────────────────────────────────────────────────
import { UsersModule } from '@app/modules/users/users.module';
import { ProfessionalsModule } from '@app/modules/professionals/professionals.module';
import { ProfilesModule } from '@app/modules/profiles/profiles.module';

// ── Service marketplace ───────────────────────────────────────────────────────
import { ServicesModule } from '@app/modules/services/services.module';
import { BookingsModule } from '@app/modules/bookings/bookings.module';
import { PaymentsModule } from '@app/modules/payments/payments.module';

// ── Communication ─────────────────────────────────────────────────────────────
import { ChatModule } from '@app/modules/chat/chat.module';
import { NotificationsModule } from '@app/modules/notifications/notifications.module';

// ── Discovery & Quality ───────────────────────────────────────────────────────
import { GeolocationModule } from '@app/modules/geolocation/geolocation.module';
import { ReviewsModule } from '@app/modules/reviews/reviews.module';

// ── Platform management ───────────────────────────────────────────────────────
import { AdminModule } from '@app/modules/admin/admin.module';
import { AnalyticsModule } from '@app/modules/analytics/analytics.module';

@Module({
  imports: [
    // ── Config (global) ─────────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // ── Shared / Firebase Admin SDK (global) ─────────────────────────────────
    SharedModule,

    // ── Feature modules ──────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    ProfessionalsModule,
    ProfilesModule,
    ServicesModule,
    BookingsModule,
    PaymentsModule,
    ChatModule,
    NotificationsModule,
    GeolocationModule,
    ReviewsModule,
    AdminModule,
    AnalyticsModule,
  ],
})
export class AppModule {}

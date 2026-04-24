import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { App } from 'firebase-admin/app';
import { Auth } from 'firebase-admin/auth';
import { Firestore } from 'firebase-admin/firestore';
import { Database } from 'firebase-admin/database';
import { Storage } from 'firebase-admin/storage';

/**
 * Singleton Firebase Admin SDK wrapper.
 * Exported from SharedModule so every feature module can inject it.
 *
 * Initializes the Admin SDK once on application bootstrap using
 * environment variables; subsequent calls to getApp() return the
 * same app instance.
 */
@Injectable()
export class FirebaseService implements OnApplicationBootstrap {
  private readonly logger = new Logger(FirebaseService.name);
  private app!: App;

  constructor(private readonly config: ConfigService) {}

  onApplicationBootstrap(): void {
    if (admin.apps.length > 0) {
      this.app = admin.apps[0] as App;
      this.logger.log('Firebase Admin SDK — reusing existing app.');
      return;
    }

    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.config.getOrThrow<string>('FIREBASE_PROJECT_ID'),
        clientEmail: this.config.getOrThrow<string>('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.config
          .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${this.config.getOrThrow<string>('FIREBASE_PROJECT_ID')}-default-rtdb.firebaseio.com`,
    });

    this.logger.log('Firebase Admin SDK — initialized successfully.');
  }

  /** Firebase Authentication */
  auth(): Auth {
    return admin.auth(this.app);
  }

  /** Cloud Firestore */
  firestore(): Firestore {
    return admin.firestore(this.app);
  }

  /** Firebase Realtime Database */
  database(): Database {
    return admin.database(this.app);
  }

  /** Firebase Storage */
  storage(): Storage {
    return admin.storage(this.app);
  }
}

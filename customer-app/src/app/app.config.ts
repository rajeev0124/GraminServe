import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth }         from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideStorage, getStorage }   from '@angular/fire/storage';

import { routes }          from './app.routes';
import { environment }     from '@env/environment';
import { apiInterceptor }  from '@app/core/interceptors/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideAnimations(),

    // ── Firebase ────────────────────────────────────────────────────────────
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(()     => getAuth()),
    provideDatabase(() => getDatabase()),
    provideStorage(()  => getStorage()),
  ],
};

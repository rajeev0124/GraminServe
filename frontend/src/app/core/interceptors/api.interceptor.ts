import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';
import { environment } from '@env/environment';

/**
 * ApiInterceptor — Functional HTTP interceptor.
 *
 * Intercepts every outbound request whose URL starts with the NestJS API
 * base URL and attaches a fresh Firebase ID token as a Bearer token.
 *
 * Registration: add `apiInterceptor` to `withInterceptors([...])` in app.config.ts.
 */
export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const auth = inject(Auth);

  // Only intercept calls to our own NestJS backend
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  // If no user is signed in, pass the request unchanged
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return next(req);
  }

  // Fetch a fresh token (force-refresh = false; Firebase auto-refreshes when needed)
  return from(currentUser.getIdToken()).pipe(
    switchMap((token) => {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(authReq);
    }),
  );
};

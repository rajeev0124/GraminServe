// ── Firebase Client SDK config ─────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME.appspot.com',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
  databaseURL: 'https://REPLACE_ME-default-rtdb.firebaseio.com',
};

// ── NestJS API base URL ────────────────────────────────────────────────────
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/v1',
  firebase: firebaseConfig,
};

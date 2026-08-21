import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { environment } from '../../environments/environment';

/** Shared Firebase app (Auth + callable Functions). */
export function getFirebaseApp(): FirebaseApp {
  const existing = getApps()[0];
  if (existing) {
    return existing;
  }
  return initializeApp(environment.firebase);
}

export function hasValidFirebaseConfig(): boolean {
  const cfg = environment.firebase;
  return Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
}

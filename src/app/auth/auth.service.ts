import { Injectable, signal } from '@angular/core';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { environment } from '../../environments/environment';
import { getFirebaseApp, hasValidFirebaseConfig } from '../firebase/firebase-app';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'misconfigured';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth: Auth | null;
  private readonly readyPromise: Promise<void>;
  private resolveReady!: () => void;

  /** Current Firebase user (null when signed out). */
  readonly user = signal<User | null>(null);
  readonly status = signal<AuthStatus>('loading');
  readonly configError = signal<string | null>(null);

  constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });

    if (!hasValidFirebaseConfig()) {
      this.auth = null;
      this.status.set('misconfigured');
      this.configError.set(
        'Firebase web config incompleta en environment. Revisa docs/auth-setup.md.'
      );
      this.resolveReady();
      return;
    }

    this.auth = getAuth(getFirebaseApp());

    onAuthStateChanged(this.auth, (firebaseUser) => {
      this.user.set(firebaseUser);
      this.status.set(firebaseUser ? 'authenticated' : 'anonymous');
      this.resolveReady();
    });
  }

  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  isAuthenticated(): boolean {
    return this.user() !== null;
  }

  async login(email: string, password: string): Promise<void> {
    if (!this.auth) {
      throw new Error(this.configError() ?? 'Auth no configurado');
    }

    const credential = await signInWithEmailAndPassword(this.auth, email.trim(), password);
    const allowed = environment.allowedAdminEmail.trim().toLowerCase();
    if (allowed && credential.user.email?.toLowerCase() !== allowed) {
      await signOut(this.auth);
      throw new Error('Esta cuenta no está autorizada para el admin.');
    }
  }

  async logout(): Promise<void> {
    if (!this.auth) {
      return;
    }
    await signOut(this.auth);
  }

  /** ID token for diagnostics; callable Functions use the Auth session automatically. */
  async getIdToken(): Promise<string | null> {
    const current = this.auth?.currentUser ?? null;
    if (!current) {
      return null;
    }
    return current.getIdToken();
  }
}

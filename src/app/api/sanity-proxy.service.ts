import { Injectable, inject } from '@angular/core';
import { getFunctions, httpsCallable, type Functions } from 'firebase/functions';
import { environment } from '../../environments/environment';
import { getFirebaseApp, hasValidFirebaseConfig } from '../firebase/firebase-app';
import { AuthService } from '../auth/auth.service';

export type SanityPatchRequest = {
  action: 'patch';
  id: string;
  set?: Record<string, unknown>;
  unset?: string[];
};

export type SanityCreateOrReplaceRequest = {
  action: 'createOrReplace';
  document: {
    _id: string;
    _type: string;
    [key: string]: unknown;
  };
};

export type SanityDeleteRequest = {
  action: 'delete';
  id: string;
};

export type SanityPingRequest = {
  action: 'ping';
};

export type SanityWriteRequest =
  | SanityPingRequest
  | SanityPatchRequest
  | SanityCreateOrReplaceRequest
  | SanityDeleteRequest;

export type SanityWriteResponse = {
  ok: true;
  action: string;
  id: string;
  document?: unknown;
};

@Injectable({ providedIn: 'root' })
export class SanityProxyService {
  private readonly auth = inject(AuthService);
  private functions: Functions | null = null;

  private getFunctions(): Functions {
    if (!hasValidFirebaseConfig()) {
      throw new Error('Firebase no configurado');
    }
    if (!this.functions) {
      this.functions = getFunctions(getFirebaseApp(), environment.functionsRegion);
    }
    return this.functions;
  }

  /** Calls Cloud Function `sanityWrite` (Auth session required). */
  async write(payload: SanityWriteRequest): Promise<SanityWriteResponse> {
    await this.auth.whenReady();
    if (!this.auth.isAuthenticated()) {
      throw new Error('Debes iniciar sesión para escribir en Sanity.');
    }

    const callable = httpsCallable<SanityWriteRequest, SanityWriteResponse>(
      this.getFunctions(),
      'sanityWrite'
    );
    const result = await callable(payload);
    return result.data;
  }
}

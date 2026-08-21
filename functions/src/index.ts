import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import { createClient, type SanityClient } from '@sanity/client';

setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const sanityWriteToken = defineSecret('SANITY_WRITE_TOKEN');

const SANITY_PROJECT_ID = 'xm49cfca';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2025-01-01';

/** Document types the admin may write (aligned with portfolio studio schemas). */
const ALLOWED_TYPES = new Set([
  'siteSettings',
  'profile',
  'project',
  'experience',
  'course',
  'navigation',
]);

if (!admin.apps.length) {
  admin.initializeApp();
}

type PatchPayload = {
  action: 'patch';
  id: string;
  set?: Record<string, unknown>;
  unset?: string[];
};

type CreateOrReplacePayload = {
  action: 'createOrReplace';
  document: {
    _id: string;
    _type: string;
    [key: string]: unknown;
  };
};

type DeletePayload = {
  action: 'delete';
  id: string;
};

type PingPayload = {
  action: 'ping';
};

type SanityWritePayload = PingPayload | PatchPayload | CreateOrReplacePayload | DeletePayload;


function assertAuth(request: { auth?: { uid: string; token: { email?: string } } }): void {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
  }

  const allowed = (process.env.ALLOWED_ADMIN_EMAIL ?? '').trim().toLowerCase();
  const email = (request.auth.token.email ?? '').toLowerCase();
  if (allowed && email !== allowed) {
    throw new HttpsError('permission-denied', 'Cuenta no autorizada para el admin.');
  }
}

function sanityClient(token: string): SanityClient {
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    token,
    useCdn: false,
  });
}

function assertAllowedType(type: string): void {
  if (!ALLOWED_TYPES.has(type)) {
    throw new HttpsError(
      'invalid-argument',
      `Tipo de documento no permitido: ${type}. Permitidos: ${[...ALLOWED_TYPES].join(', ')}`
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parsePayload(data: unknown): SanityWritePayload {
  if (!isRecord(data) || typeof data['action'] !== 'string') {
    throw new HttpsError('invalid-argument', 'Payload inválido: falta action.');
  }

  const action = data['action'];

  if (action === 'ping') {
    return { action: 'ping' };
  }

  if (action === 'patch') {
    const id = data['id'];
    if (typeof id !== 'string' || !id.trim()) {
      throw new HttpsError('invalid-argument', 'patch requiere id.');
    }
    const set = data['set'];
    const unset = data['unset'];
    if (set !== undefined && !isRecord(set)) {
      throw new HttpsError('invalid-argument', 'set debe ser un objeto.');
    }
    if (unset !== undefined && (!Array.isArray(unset) || !unset.every((u) => typeof u === 'string'))) {
      throw new HttpsError('invalid-argument', 'unset debe ser string[].');
    }
    if (!set && (!unset || unset.length === 0)) {
      throw new HttpsError('invalid-argument', 'patch requiere set y/o unset.');
    }
    return {
      action: 'patch',
      id: id.trim(),
      set: set as Record<string, unknown> | undefined,
      unset: unset as string[] | undefined,
    };
  }

  if (action === 'createOrReplace') {
    const document = data['document'];
    if (!isRecord(document)) {
      throw new HttpsError('invalid-argument', 'createOrReplace requiere document.');
    }
    const id = document['_id'];
    const type = document['_type'];
    if (typeof id !== 'string' || !id.trim()) {
      throw new HttpsError('invalid-argument', 'document._id requerido.');
    }
    if (typeof type !== 'string' || !type.trim()) {
      throw new HttpsError('invalid-argument', 'document._type requerido.');
    }
    assertAllowedType(type);
    return {
      action: 'createOrReplace',
      document: {
        ...(document as Record<string, unknown>),
        _id: id.trim(),
        _type: type.trim(),
      },
    };
  }

  if (action === 'delete') {
    const id = data['id'];
    if (typeof id !== 'string' || !id.trim()) {
      throw new HttpsError('invalid-argument', 'delete requiere id.');
    }
    return { action: 'delete', id: id.trim() };
  }

  throw new HttpsError(
    'invalid-argument',
    'action debe ser ping | patch | createOrReplace | delete.'
  );
}

async function ensureTypeAllowedForId(client: SanityClient, id: string): Promise<void> {
  const existing = await client.fetch<{ _type?: string } | null>(
    `*[_id == $id][0]{ _type }`,
    { id }
  );
  if (!existing?._type) {
    throw new HttpsError(
      'not-found',
      `Documento ${id} no existe. Usa createOrReplace para crearlo.`
    );
  }
  assertAllowedType(existing._type);
}

/**
 * Authenticated Sanity write proxy.
 * Client: Firebase httpsCallable('sanityWrite').
 * Secrets: SANITY_WRITE_TOKEN (never in the Angular bundle).
 */
export const sanityWrite = onCall(
  {
    secrets: [sanityWriteToken],
    cors: [
      'http://localhost:4300',
      'https://cv-admin-panel.web.app',
      'https://cv-admin-panel.firebaseapp.com',
    ],
  },
  async (request) => {
    assertAuth(request);

    const token = sanityWriteToken.value();
    if (!token) {
      throw new HttpsError('failed-precondition', 'SANITY_WRITE_TOKEN no configurado.');
    }

    const payload = parsePayload(request.data);
    const client = sanityClient(token);

    try {
      if (payload.action === 'ping') {
        // Auth + token check only (no document mutation).
        await client.fetch('null');
        return { ok: true, action: 'ping', id: 'ping' };
      }

      if (payload.action === 'patch') {
        await ensureTypeAllowedForId(client, payload.id);
        let builder = client.patch(payload.id);
        if (payload.set) {
          builder = builder.set(payload.set);
        }
        if (payload.unset?.length) {
          builder = builder.unset(payload.unset);
        }
        const result = await builder.commit({ autoGenerateArrayKeys: true });
        return { ok: true, action: 'patch', id: payload.id, document: result };
      }

      if (payload.action === 'createOrReplace') {
        const result = await client.createOrReplace(payload.document);
        return {
          ok: true,
          action: 'createOrReplace',
          id: payload.document._id,
          document: result,
        };
      }

      await ensureTypeAllowedForId(client, payload.id);
      await client.delete(payload.id);
      return { ok: true, action: 'delete', id: payload.id };
    } catch (err) {
      if (err instanceof HttpsError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : 'Error al escribir en Sanity';
      console.error('sanityWrite failed', message);
      throw new HttpsError('internal', message);
    }
  }
);

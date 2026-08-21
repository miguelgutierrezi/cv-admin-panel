import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Stable Sanity slug.current / Angular id shape. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Local CV asset path accepted by portfolio content-validator. */
function isLocalAssetPath(value: string): boolean {
  return value.startsWith('assets/') || value.startsWith('/assets/');
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !!parsed.hostname;
  } catch {
    return false;
  }
}

/** Required slug: lowercase kebab-case. */
export function slugValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) {
      return { required: true };
    }
    if (!SLUG_RE.test(value)) {
      return { slug: true };
    }
    return null;
  };
}

/**
 * Required image/media URL: `assets/…`, `/assets/…`, or http(s).
 * Mirrors portfolio `parseUrl(..., { allowLocalAsset: true })`.
 */
export function assetOrHttpUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) {
      return { required: true };
    }
    if (isLocalAssetPath(value) || isHttpUrl(value)) {
      return null;
    }
    return { assetOrHttpUrl: true };
  };
}

/** Optional http(s) URL (empty allowed). */
export function optionalHttpUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) {
      return null;
    }
    if (isHttpUrl(value)) {
      return null;
    }
    return { httpUrl: true };
  };
}

/** Optional asset path or http(s) URL (empty allowed). */
export function optionalAssetOrHttpUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) {
      return null;
    }
    if (isLocalAssetPath(value) || isHttpUrl(value)) {
      return null;
    }
    return { assetOrHttpUrl: true };
  };
}

/** Required http(s) URL (social links, credentials when filled as required). */
export function httpUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) {
      return { required: true };
    }
    if (isHttpUrl(value)) {
      return null;
    }
    return { httpUrl: true };
  };
}

/**
 * Social / contact URL: http(s), tel:, or mailto:
 * Mirrors portfolio `parseUrl(..., { allowContactSchemes: true })`.
 */
export function socialUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) {
      return { required: true };
    }
    if (isHttpUrl(value) || isTelUrl(value) || isMailtoUrl(value)) {
      return null;
    }
    return { socialUrl: true };
  };
}

function isTelUrl(value: string): boolean {
  return /^tel:\+?[\d().\-\s]+$/i.test(value);
}

function isMailtoUrl(value: string): boolean {
  return /^mailto:[^\s]+$/i.test(value);
}

export function normalizeSlug(value: string): string {
  return value.trim().toLowerCase();
}

export function validationHint(errors: ValidationErrors | null | undefined): string | null {
  if (!errors) {
    return null;
  }
  if (errors['slug']) {
    return 'Usa slug kebab-case (ej. globant, platzi-react).';
  }
  if (errors['assetOrHttpUrl']) {
    return 'Usa assets/…, /assets/… o una URL http(s).';
  }
  if (errors['httpUrl']) {
    return 'URL inválida: debe ser http(s) con hostname.';
  }
  if (errors['socialUrl']) {
    return 'URL inválida: usa http(s), tel: o mailto:.';
  }
  return null;
}

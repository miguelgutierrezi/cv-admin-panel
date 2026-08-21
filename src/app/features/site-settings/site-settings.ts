import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import { AuthService } from '../../auth/auth.service';
import type { SiteSettingsDoc } from '../../models/cms.models';
import {
  optionalAssetOrHttpUrlValidator,
  slugValidator,
  socialUrlValidator,
  validationHint,
} from '../../shared/cms-validators';

type SocialDraft = {
  id: string;
  label: string;
  url: string;
  iconUrl: string;
};

type FormSnapshot = {
  name: string;
  brandHandle: string;
  emailsText: string;
  socialLinks: SocialDraft[];
};

@Component({
  selector: 'app-site-settings',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './site-settings.html',
  styleUrl: './site-settings.scss',
})
export class SiteSettingsPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly read = inject(SanityReadService);
  private readonly proxy = inject(SanityProxyService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  /** Bumps when dirty/pristine changes so statusLine recomputes. */
  private readonly formEpoch = signal(0);

  private documentId = 'siteSettings';
  private snapshot: FormSnapshot | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    brandHandle: ['', Validators.required],
    emailsText: ['', Validators.required],
    socialLinks: this.fb.array([this.createSocialGroup()]),
  });

  readonly statusLine = computed(() => {
    this.formEpoch();
    const status = this.form.dirty ? 'unsaved_changes' : 'synced';
    return `Status: ${status} • Document id: ${this.documentId} • Localized: ES / EN`;
  });

  /** Compact status for mobile Figma 62:496 */
  readonly statusLineShort = computed(() => {
    this.formEpoch();
    const status = this.form.dirty ? 'unsaved_changes' : 'synced';
    return `Status: ${status} • Doc: ${this.documentId}`;
  });

  readonly footerUser = computed(
    () => this.auth.user()?.email ?? 'miguel.gutierrez',
  );

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.formEpoch.update((n) => n + 1);
    });
  }

  get socialLinks(): FormArray {
    return this.form.controls.socialLinks;
  }

  async ngOnInit(): Promise<void> {
    try {
      const doc = await firstValueFrom(this.read.fetchSiteSettings());
      if (doc) {
        this.documentId = doc._id;
        this.patchForm(doc);
      }
      this.captureSnapshot();
      this.form.markAsPristine();
      this.formEpoch.update((n) => n + 1);
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.loading.set(false);
    }
  }

  socialChromeLabel(index: number): string {
    const value = this.socialLinks.at(index).getRawValue() as SocialDraft;
    const name = value.label.trim() || value.id.trim() || 'nuevo';
    return `Social Link Config • ${name}`;
  }

  removeLabel(index: number): string {
    const value = this.socialLinks.at(index).getRawValue() as SocialDraft;
    return value.label.trim() || value.id.trim() || 'enlace';
  }

  addSocial(): void {
    this.socialLinks.push(this.createSocialGroup());
    this.form.markAsDirty();
    this.formEpoch.update((n) => n + 1);
  }

  removeSocial(index: number): void {
    this.socialLinks.removeAt(index);
    this.form.markAsDirty();
    this.formEpoch.update((n) => n + 1);
  }

  discard(): void {
    if (!this.snapshot) {
      return;
    }
    this.message.set(null);
    this.error.set(null);
    this.applySnapshot(this.snapshot);
    this.form.markAsPristine();
    this.formEpoch.update((n) => n + 1);
  }

  async save(): Promise<void> {
    this.message.set(null);
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(this.describeInvalidForm());
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const emails = raw.emailsText
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    const socialLinks = raw.socialLinks.map((s) => ({
      id: s.id.trim(),
      label: s.label.trim(),
      url: s.url.trim(),
      ...(s.iconUrl.trim() ? { iconUrl: s.iconUrl.trim() } : {}),
    }));

    const socialIds = socialLinks.map((s) => s.id).filter(Boolean);
    if (new Set(socialIds).size !== socialIds.length) {
      this.error.set('Los id de socialLinks deben ser únicos.');
      this.saving.set(false);
      return;
    }

    const document: SiteSettingsDoc = {
      _id: this.documentId,
      _type: 'siteSettings',
      name: raw.name.trim(),
      brandHandle: raw.brandHandle.trim(),
      emails,
      socialLinks,
    };

    try {
      await this.proxy.write({
        action: 'createOrReplace',
        document: document as unknown as {
          _id: string;
          _type: string;
          [key: string]: unknown;
        },
      });
      this.captureSnapshot();
      this.form.markAsPristine();
      this.formEpoch.update((n) => n + 1);
      this.message.set('Site settings guardado en Sanity.');
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.saving.set(false);
    }
  }

  private createSocialGroup() {
    return this.fb.nonNullable.group({
      id: ['', [Validators.required, slugValidator()]],
      label: ['', Validators.required],
      url: ['', [Validators.required, socialUrlValidator()]],
      iconUrl: ['', optionalAssetOrHttpUrlValidator()],
    });
  }

  /** Prefer a concrete field hint over a generic “required” message. */
  private describeInvalidForm(): string {
    const top = this.form.controls;
    for (const [key, label] of [
      ['name', 'Nombre completo'],
      ['brandHandle', 'Brand handle'],
      ['emailsText', 'Emails'],
    ] as const) {
      const ctrl = top[key];
      if (ctrl.invalid) {
        return validationHint(ctrl.errors) ?? `Revisa el campo “${label}”.`;
      }
    }
    for (let i = 0; i < this.socialLinks.length; i++) {
      const group = this.socialLinks.at(i);
      for (const [key, label] of [
        ['id', 'ID'],
        ['label', 'Label'],
        ['url', 'URL'],
        ['iconUrl', 'Icon Ident'],
      ] as const) {
        const ctrl = group.get(key);
        if (ctrl?.invalid) {
          const hint = validationHint(ctrl.errors);
          return hint
            ? `Social link #${i + 1} · ${label}: ${hint}`
            : `Social link #${i + 1}: revisa “${label}”.`;
        }
      }
    }
    return 'Completa los campos requeridos.';
  }

  private patchForm(doc: SiteSettingsDoc): void {
    this.socialLinks.clear();
    const links = doc.socialLinks?.length
      ? doc.socialLinks
      : [{ id: '', label: '', url: '', iconUrl: '' }];
    for (const link of links) {
      const group = this.createSocialGroup();
      group.patchValue({
        id: link.id ?? '',
        label: link.label ?? '',
        url: link.url ?? '',
        iconUrl: link.iconUrl ?? '',
      });
      this.socialLinks.push(group);
    }
    this.form.patchValue({
      name: doc.name ?? '',
      brandHandle: doc.brandHandle ?? '',
      emailsText: (doc.emails ?? []).join('\n'),
    });
  }

  private captureSnapshot(): void {
    const raw = this.form.getRawValue();
    this.snapshot = {
      name: raw.name,
      brandHandle: raw.brandHandle,
      emailsText: raw.emailsText,
      socialLinks: raw.socialLinks.map((s) => ({ ...s })),
    };
  }

  private applySnapshot(snap: FormSnapshot): void {
    this.socialLinks.clear();
    for (const link of snap.socialLinks) {
      const group = this.createSocialGroup();
      group.patchValue(link);
      this.socialLinks.push(group);
    }
    this.form.patchValue({
      name: snap.name,
      brandHandle: snap.brandHandle,
      emailsText: snap.emailsText,
    });
  }

  private mapError(err: unknown): string {
    if (err instanceof FirebaseError) {
      return err.message;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'No se pudo guardar.';
  }
}

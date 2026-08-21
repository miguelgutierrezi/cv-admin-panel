import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import type { SiteSettingsDoc } from '../../models/cms.models';
import {
  httpUrlValidator,
  optionalAssetOrHttpUrlValidator,
  slugValidator,
} from '../../shared/cms-validators';

@Component({
  selector: 'app-site-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './site-settings.html',
  styleUrl: './site-settings.scss',
})
export class SiteSettingsPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly read = inject(SanityReadService);
  private readonly proxy = inject(SanityProxyService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  private documentId = 'siteSettings';

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    brandHandle: ['', Validators.required],
    emailsText: ['', Validators.required],
    socialLinks: this.fb.array([this.createSocialGroup()]),
  });

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
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.loading.set(false);
    }
  }

  addSocial(): void {
    this.socialLinks.push(this.createSocialGroup());
  }

  removeSocial(index: number): void {
    this.socialLinks.removeAt(index);
  }

  async save(): Promise<void> {
    this.message.set(null);
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
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
      url: ['', [Validators.required, httpUrlValidator()]],
      iconUrl: ['', optionalAssetOrHttpUrlValidator()],
    });
  }

  private patchForm(doc: SiteSettingsDoc): void {
    this.socialLinks.clear();
    const links = doc.socialLinks?.length ? doc.socialLinks : [{ id: '', label: '', url: '', iconUrl: '' }];
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

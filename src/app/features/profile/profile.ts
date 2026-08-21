import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import { AuthService } from '../../auth/auth.service';
import type { ProfileDoc } from '../../models/cms.models';
import { emptyLocalized, emptyLocalizedList } from '../../models/cms.models';
import { assetOrHttpUrlValidator } from '../../shared/cms-validators';

type ParagraphDraft = { es: string; en: string };

type FormSnapshot = {
  imageUrl: string;
  roleEs: string;
  roleEn: string;
  pitchEs: string;
  pitchEn: string;
  focusEs: string;
  focusEn: string;
  paragraphs: ParagraphDraft[];
};

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly read = inject(SanityReadService);
  private readonly proxy = inject(SanityProxyService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  private readonly formEpoch = signal(0);

  private documentId = 'profile';
  private snapshot: FormSnapshot | null = null;

  readonly form = this.fb.nonNullable.group({
    imageUrl: ['', [Validators.required, assetOrHttpUrlValidator()]],
    roleEs: ['', Validators.required],
    roleEn: ['', Validators.required],
    pitchEs: ['', Validators.required],
    pitchEn: ['', Validators.required],
    focusEs: ['', Validators.required],
    focusEn: ['', Validators.required],
    paragraphs: this.fb.array([this.createParagraphGroup()]),
  });

  readonly statusLine = computed(() => {
    this.formEpoch();
    const status = this.form.dirty ? 'unsaved_changes' : 'synced';
    return `Status: ${status} • Document id: ${this.documentId} • Localized: ES / EN`;
  });

  readonly footerUser = computed(
    () => this.auth.user()?.email ?? 'miguel.gutierrez',
  );

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.formEpoch.update((n) => n + 1);
    });
  }

  get paragraphs(): FormArray {
    return this.form.controls.paragraphs;
  }

  async ngOnInit(): Promise<void> {
    try {
      const doc = await firstValueFrom(this.read.fetchProfile());
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

  paragraphChromeLabel(index: number): string {
    const n = String(index + 1).padStart(2, '0');
    return `Paragraph Config • ${n}`;
  }

  addParagraph(): void {
    this.paragraphs.push(this.createParagraphGroup());
    this.form.markAsDirty();
    this.formEpoch.update((n) => n + 1);
  }

  removeParagraph(index: number): void {
    this.paragraphs.removeAt(index);
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
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const document: ProfileDoc = {
      _id: this.documentId,
      _type: 'profile',
      imageUrl: raw.imageUrl.trim(),
      role: { es: raw.roleEs.trim(), en: raw.roleEn.trim() },
      pitch: { es: raw.pitchEs.trim(), en: raw.pitchEn.trim() },
      paragraphs: raw.paragraphs.map((p) => ({ es: p.es.trim(), en: p.en.trim() })),
      focusAreas: {
        es: this.splitList(raw.focusEs),
        en: this.splitList(raw.focusEn),
      },
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
      this.message.set('Profile guardado en Sanity.');
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.saving.set(false);
    }
  }

  private createParagraphGroup() {
    return this.fb.nonNullable.group({
      es: ['', Validators.required],
      en: ['', Validators.required],
    });
  }

  private patchForm(doc: ProfileDoc): void {
    const role = doc.role ?? emptyLocalized();
    const pitch = doc.pitch ?? emptyLocalized();
    const focus = doc.focusAreas ?? emptyLocalizedList();
    this.paragraphs.clear();
    const paras = doc.paragraphs?.length ? doc.paragraphs : [emptyLocalized()];
    for (const p of paras) {
      this.paragraphs.push(
        this.fb.nonNullable.group({
          es: [p.es ?? '', Validators.required],
          en: [p.en ?? '', Validators.required],
        }),
      );
    }
    this.form.patchValue({
      imageUrl: doc.imageUrl ?? '',
      roleEs: role.es ?? '',
      roleEn: role.en ?? '',
      pitchEs: pitch.es ?? '',
      pitchEn: pitch.en ?? '',
      focusEs: (focus.es ?? []).join('\n'),
      focusEn: (focus.en ?? []).join('\n'),
    });
  }

  private captureSnapshot(): void {
    const raw = this.form.getRawValue();
    this.snapshot = {
      imageUrl: raw.imageUrl,
      roleEs: raw.roleEs,
      roleEn: raw.roleEn,
      pitchEs: raw.pitchEs,
      pitchEn: raw.pitchEn,
      focusEs: raw.focusEs,
      focusEn: raw.focusEn,
      paragraphs: raw.paragraphs.map((p) => ({ ...p })),
    };
  }

  private applySnapshot(snap: FormSnapshot): void {
    this.paragraphs.clear();
    for (const p of snap.paragraphs) {
      const group = this.createParagraphGroup();
      group.patchValue(p);
      this.paragraphs.push(group);
    }
    this.form.patchValue({
      imageUrl: snap.imageUrl,
      roleEs: snap.roleEs,
      roleEn: snap.roleEn,
      pitchEs: snap.pitchEs,
      pitchEn: snap.pitchEn,
      focusEs: snap.focusEs,
      focusEn: snap.focusEn,
    });
  }

  private splitList(text: string): string[] {
    return text
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
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

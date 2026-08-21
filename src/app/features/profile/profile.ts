import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import type { ProfileDoc } from '../../models/cms.models';
import { emptyLocalized, emptyLocalizedList } from '../../models/cms.models';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly read = inject(SanityReadService);
  private readonly proxy = inject(SanityProxyService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  private documentId = 'profile';

  readonly form = this.fb.nonNullable.group({
    imageUrl: ['', Validators.required],
    roleEs: ['', Validators.required],
    roleEn: ['', Validators.required],
    pitchEs: ['', Validators.required],
    pitchEn: ['', Validators.required],
    focusEs: ['', Validators.required],
    focusEn: ['', Validators.required],
    paragraphs: this.fb.array([this.createParagraphGroup()]),
  });

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
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.loading.set(false);
    }
  }

  addParagraph(): void {
    this.paragraphs.push(this.createParagraphGroup());
  }

  removeParagraph(index: number): void {
    this.paragraphs.removeAt(index);
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
        })
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

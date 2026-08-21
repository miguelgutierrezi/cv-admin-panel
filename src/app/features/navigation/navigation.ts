import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import { AuthService } from '../../auth/auth.service';
import { SECTION_IDS, emptyLocalized, type NavigationDoc } from '../../models/cms.models';

@Component({
  selector: 'app-navigation-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class NavigationPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly read = inject(SanityReadService);
  private readonly proxy = inject(SanityProxyService);
  private readonly auth = inject(AuthService);

  readonly sectionIds = SECTION_IDS;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  private documentId = 'navigation';

  readonly form = this.fb.nonNullable.group({
    items: this.fb.array([this.createItemGroup()]),
  });

  private snapshot: ReturnType<typeof this.form.getRawValue> | null = null;

  readonly footerUser = computed(
    () => this.auth.user()?.email ?? 'miguel.gutierrez',
  );

  get items(): FormArray {
    return this.form.controls.items;
  }

  async ngOnInit(): Promise<void> {
    try {
      const doc = await firstValueFrom(this.read.fetchNavigation());
      if (doc) {
        this.documentId = doc._id;
        this.patchForm(doc);
      }
      this.captureSnapshot();
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.loading.set(false);
    }
  }

  discard(): void {
    if (!this.snapshot) {
      return;
    }
    this.applySnapshot(this.snapshot);
    this.message.set(null);
    this.error.set(null);
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
    this.form.markAsDirty();
  }

  removeItem(index: number): void {
    if (this.items.length <= 1) {
      this.error.set('Navigation debe tener al menos un item.');
      return;
    }
    this.items.removeAt(index);
    this.form.markAsDirty();
    this.error.set(null);
  }

  async save(): Promise<void> {
    this.message.set(null);
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Completa los campos requeridos (section id y labels).');
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    type ItemRaw = { id: string; labelEs: string; labelEn: string };
    const rows = raw.items as ItemRaw[];
    const sectionIds = rows.map((item) => item.id);
    if (new Set(sectionIds).size !== sectionIds.length) {
      this.error.set('Cada section id en navigation debe ser único.');
      this.saving.set(false);
      return;
    }
    const document: NavigationDoc = {
      _id: this.documentId,
      _type: 'navigation',
      items: rows.map((item) => ({
        id: item.id,
        label: { es: item.labelEs.trim(), en: item.labelEn.trim() },
      })),
    };
    try {
      await this.proxy.write({
        action: 'createOrReplace',
        document: document as unknown as { _id: string; _type: string; [key: string]: unknown },
      });
      this.form.markAsPristine();
      this.captureSnapshot();
      this.message.set('Navigation guardada en Sanity.');
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.saving.set(false);
    }
  }

  private createItemGroup() {
    return this.fb.nonNullable.group({
      id: ['about' as (typeof SECTION_IDS)[number], Validators.required],
      labelEs: ['', Validators.required],
      labelEn: ['', Validators.required],
    });
  }

  private patchForm(doc: NavigationDoc): void {
    this.items.clear();
    const items = doc.items?.length ? doc.items : [{ id: 'about', label: emptyLocalized() }];
    for (const item of items) {
      this.items.push(
        this.fb.nonNullable.group({
          id: [item.id || 'about', Validators.required],
          labelEs: [item.label?.es ?? '', Validators.required],
          labelEn: [item.label?.en ?? '', Validators.required],
        }),
      );
    }
    this.form.markAsPristine();
  }

  private captureSnapshot(): void {
    this.snapshot = JSON.parse(
      JSON.stringify(this.form.getRawValue()),
    ) as ReturnType<typeof this.form.getRawValue>;
  }

  private applySnapshot(snap: NonNullable<typeof this.snapshot>): void {
    this.items.clear();
    for (const item of snap.items) {
      this.items.push(
        this.fb.nonNullable.group({
          id: [item.id, Validators.required],
          labelEs: [item.labelEs, Validators.required],
          labelEn: [item.labelEn, Validators.required],
        }),
      );
    }
    if (this.items.length === 0) {
      this.items.push(this.createItemGroup());
    }
    this.form.markAsPristine();
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

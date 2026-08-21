import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import { SECTION_IDS, emptyLocalized, type NavigationDoc } from '../../models/cms.models';

@Component({
  selector: 'app-navigation-page',
  imports: [ReactiveFormsModule],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class NavigationPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly read = inject(SanityReadService);
  private readonly proxy = inject(SanityProxyService);

  readonly sectionIds = SECTION_IDS;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  private documentId = 'navigation';

  readonly form = this.fb.nonNullable.group({
    items: this.fb.array([this.createItemGroup()]),
  });

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
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.loading.set(false);
    }
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
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
        })
      );
    }
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

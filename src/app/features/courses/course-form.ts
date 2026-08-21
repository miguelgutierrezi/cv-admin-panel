import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import { AuthService } from '../../auth/auth.service';
import { emptyLocalized, type CourseDoc } from '../../models/cms.models';
import {
  assetOrHttpUrlValidator,
  normalizeSlug,
  optionalHttpUrlValidator,
  slugValidator,
} from '../../shared/cms-validators';

type FormSnapshot = {
  slug: string;
  titleEs: string;
  titleEn: string;
  institution: string;
  dateEs: string;
  dateEn: string;
  imageUrl: string;
  credentialUrl: string;
  sortOrder: number;
};

@Component({
  selector: 'app-course-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './course-form.html',
  styleUrl: './course-form.scss',
})
export class CourseFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly read = inject(SanityReadService);
  private readonly proxy = inject(SanityProxyService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly isNew = signal(true);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  private readonly formEpoch = signal(0);

  private documentId = '';
  private snapshot: FormSnapshot | null = null;

  readonly form = this.fb.nonNullable.group({
    slug: ['', [Validators.required, slugValidator()]],
    titleEs: ['', Validators.required],
    titleEn: ['', Validators.required],
    institution: ['', Validators.required],
    dateEs: ['', Validators.required],
    dateEn: ['', Validators.required],
    imageUrl: ['', [Validators.required, assetOrHttpUrlValidator()]],
    credentialUrl: ['', optionalHttpUrlValidator()],
    sortOrder: [0, Validators.required],
  });

  readonly eyebrow = computed(() =>
    this.isNew() ? '> CREATING_INSTANCE' : '> EDITING_INSTANCE',
  );

  readonly pageTitle = computed(() => {
    this.formEpoch();
    if (this.isNew()) {
      return '// Nuevo course';
    }
    const title = this.form.controls.titleEs.value.trim();
    return title ? `// ${title}` : '// Editar course';
  });

  readonly crumbLabel = computed(() => {
    this.formEpoch();
    if (this.isNew()) {
      return 'Nuevo course';
    }
    const title = this.form.controls.titleEs.value.trim();
    const slug = this.form.controls.slug.value.trim();
    return title || slug || this.documentId || 'course';
  });

  readonly statusLine = computed(() => {
    this.formEpoch();
    const status = this.form.dirty ? 'unsaved_changes' : 'saved';
    const id =
      this.documentId ||
      (this.form.controls.slug.value.trim()
        ? `course-${normalizeSlug(this.form.controls.slug.value)}`
        : 'draft-course-new');
    return `Status: ${status} • Document id: ${id} • Localized: ES / EN`;
  });

  readonly footerUser = computed(
    () => this.auth.user()?.email ?? 'miguel.gutierrez',
  );

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.formEpoch.update((n) => n + 1);
    });
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') {
      this.isNew.set(true);
      this.captureSnapshot();
      this.loading.set(false);
      return;
    }
    this.isNew.set(false);
    this.documentId = id;
    try {
      const doc = await firstValueFrom(this.read.fetchCourseById(id));
      if (!doc) {
        this.error.set('Course no encontrado.');
      } else {
        this.patchForm(doc);
        this.captureSnapshot();
      }
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.loading.set(false);
    }
  }

  discard(): void {
    if (this.isNew() && !this.form.dirty) {
      void this.router.navigateByUrl('/courses');
      return;
    }
    if (!this.snapshot) {
      return;
    }
    this.applySnapshot(this.snapshot);
    this.message.set(null);
    this.error.set(null);
  }

  async save(): Promise<void> {
    this.message.set(null);
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Completa los campos requeridos.');
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const slug = normalizeSlug(raw.slug);
    const id = this.documentId || `course-${slug}`;
    const document: CourseDoc = {
      _id: id,
      _type: 'course',
      slug: { current: slug },
      title: { es: raw.titleEs.trim(), en: raw.titleEn.trim() },
      institution: raw.institution.trim(),
      date: { es: raw.dateEs.trim(), en: raw.dateEn.trim() },
      imageUrl: raw.imageUrl.trim(),
      sortOrder: Number(raw.sortOrder) || 0,
      ...(raw.credentialUrl.trim() ? { credentialUrl: raw.credentialUrl.trim() } : {}),
    };
    try {
      await this.proxy.write({
        action: 'createOrReplace',
        document: document as unknown as { _id: string; _type: string; [key: string]: unknown },
      });
      this.documentId = id;
      this.isNew.set(false);
      this.form.markAsPristine();
      this.captureSnapshot();
      this.message.set('Course guardado en Sanity.');
      await this.router.navigate(['/courses', id], { replaceUrl: true });
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(): Promise<void> {
    if (this.isNew() || !this.documentId) {
      return;
    }
    if (!confirm('¿Eliminar este course de Sanity?')) {
      return;
    }
    this.deleting.set(true);
    try {
      await this.proxy.write({ action: 'delete', id: this.documentId });
      await this.router.navigateByUrl('/courses');
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.deleting.set(false);
    }
  }

  private patchForm(doc: CourseDoc): void {
    const title = doc.title ?? emptyLocalized();
    const date = doc.date ?? emptyLocalized();
    this.form.patchValue({
      slug: doc.slug?.current ?? '',
      titleEs: title.es ?? '',
      titleEn: title.en ?? '',
      institution: doc.institution ?? '',
      dateEs: date.es ?? '',
      dateEn: date.en ?? '',
      imageUrl: doc.imageUrl ?? '',
      credentialUrl: doc.credentialUrl ?? '',
      sortOrder: doc.sortOrder ?? 0,
    });
    this.form.markAsPristine();
  }

  private captureSnapshot(): void {
    this.snapshot = { ...this.form.getRawValue() };
  }

  private applySnapshot(snap: FormSnapshot): void {
    this.form.patchValue(snap);
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

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import { emptyLocalized, type CourseDoc } from '../../models/cms.models';

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

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly isNew = signal(true);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  private documentId = '';

  readonly form = this.fb.nonNullable.group({
    slug: ['', Validators.required],
    titleEs: ['', Validators.required],
    titleEn: ['', Validators.required],
    institution: ['', Validators.required],
    dateEs: ['', Validators.required],
    dateEn: ['', Validators.required],
    imageUrl: ['', Validators.required],
    credentialUrl: [''],
    sortOrder: [0, Validators.required],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') {
      this.isNew.set(true);
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
      }
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.loading.set(false);
    }
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
    const slug = raw.slug.trim();
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
      this.message.set('Course guardado en Sanity.');
      await this.router.navigate(['/courses', id]);
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

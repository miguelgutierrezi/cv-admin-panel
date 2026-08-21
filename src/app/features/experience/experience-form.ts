import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import { AuthService } from '../../auth/auth.service';
import { emptyLocalized, emptyLocalizedList, type ExperienceDoc } from '../../models/cms.models';
import {
  assetOrHttpUrlValidator,
  normalizeSlug,
  slugValidator,
} from '../../shared/cms-validators';

@Component({
  selector: 'app-experience-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './experience-form.html',
  styleUrl: './experience-form.scss',
})
export class ExperienceFormPage implements OnInit {
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

  readonly form = this.fb.nonNullable.group({
    slug: ['', [Validators.required, slugValidator()]],
    company: ['', Validators.required],
    roleEs: ['', Validators.required],
    roleEn: ['', Validators.required],
    durationEs: ['', Validators.required],
    durationEn: ['', Validators.required],
    responsibilitiesEs: ['', Validators.required],
    responsibilitiesEn: ['', Validators.required],
    imageUrl: ['', [Validators.required, assetOrHttpUrlValidator()]],
    sortOrder: [0, Validators.required],
  });

  readonly eyebrow = computed(() =>
    this.isNew() ? '> NEW_DOCUMENT' : '> EDITING_DOCUMENT',
  );

  readonly pageTitle = computed(() => {
    this.formEpoch();
    if (this.isNew()) {
      return '// Nueva experience';
    }
    const company = this.form.controls.company.value.trim();
    return company ? `// ${company}` : '// Editar experience';
  });

  readonly crumbLabel = computed(() => {
    this.formEpoch();
    if (this.isNew()) {
      return 'New Experience';
    }
    const company = this.form.controls.company.value.trim();
    const slug = this.form.controls.slug.value.trim();
    return company || slug || this.documentId || 'experience';
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
      this.loading.set(false);
      return;
    }
    this.isNew.set(false);
    this.documentId = id;
    try {
      const doc = await firstValueFrom(this.read.fetchExperienceById(id));
      if (!doc) {
        this.error.set('Experience no encontrada.');
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
      this.error.set('Completa los campos requeridos.');
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const slug = normalizeSlug(raw.slug);
    const id = this.documentId || `experience-${slug}`;
    const document: ExperienceDoc = {
      _id: id,
      _type: 'experience',
      slug: { current: slug },
      company: raw.company.trim(),
      role: { es: raw.roleEs.trim(), en: raw.roleEn.trim() },
      duration: { es: raw.durationEs.trim(), en: raw.durationEn.trim() },
      responsibilities: {
        es: this.splitList(raw.responsibilitiesEs),
        en: this.splitList(raw.responsibilitiesEn),
      },
      imageUrl: raw.imageUrl.trim(),
      sortOrder: Number(raw.sortOrder) || 0,
    };
    try {
      await this.proxy.write({
        action: 'createOrReplace',
        document: document as unknown as { _id: string; _type: string; [key: string]: unknown },
      });
      this.documentId = id;
      this.isNew.set(false);
      this.form.markAsPristine();
      this.message.set('Experience guardada en Sanity.');
      await this.router.navigate(['/experience', id], { replaceUrl: true });
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
    if (!confirm('¿Eliminar esta experience de Sanity?')) {
      return;
    }
    this.deleting.set(true);
    try {
      await this.proxy.write({ action: 'delete', id: this.documentId });
      await this.router.navigateByUrl('/experience');
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.deleting.set(false);
    }
  }

  private patchForm(doc: ExperienceDoc): void {
    const role = doc.role ?? emptyLocalized();
    const duration = doc.duration ?? emptyLocalized();
    const responsibilities = doc.responsibilities ?? emptyLocalizedList();
    this.form.patchValue({
      slug: doc.slug?.current ?? '',
      company: doc.company ?? '',
      roleEs: role.es ?? '',
      roleEn: role.en ?? '',
      durationEs: duration.es ?? '',
      durationEn: duration.en ?? '',
      responsibilitiesEs: (responsibilities.es ?? []).join('\n'),
      responsibilitiesEn: (responsibilities.en ?? []).join('\n'),
      imageUrl: doc.imageUrl ?? '',
      sortOrder: doc.sortOrder ?? 0,
    });
    this.form.markAsPristine();
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

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import { AuthService } from '../../auth/auth.service';
import {
  FEATURE_ICONS,
  emptyLocalized,
  type ProjectDoc,
  type ProjectDetailDoc,
} from '../../models/cms.models';
import {
  assetOrHttpUrlValidator,
  normalizeSlug,
  optionalHttpUrlValidator,
  slugValidator,
} from '../../shared/cms-validators';

@Component({
  selector: 'app-project-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
})
export class ProjectFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly read = inject(SanityReadService);
  private readonly proxy = inject(SanityProxyService);
  private readonly auth = inject(AuthService);

  readonly icons = FEATURE_ICONS;
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
    title: ['', Validators.required],
    descriptionEs: ['', Validators.required],
    descriptionEn: ['', Validators.required],
    technologiesText: ['', Validators.required],
    technologyIconUrlsText: [''],
    repositoryUrl: ['', optionalHttpUrlValidator()],
    demoUrl: ['', optionalHttpUrlValidator()],
    imageUrl: ['', [Validators.required, assetOrHttpUrlValidator()]],
    featured: [false],
    sortOrder: [0, Validators.required],
    summaryEs: ['', Validators.required],
    summaryEn: ['', Validators.required],
    roleEs: ['', Validators.required],
    roleEn: ['', Validators.required],
    durationEs: ['', Validators.required],
    durationEn: ['', Validators.required],
    teamEs: ['', Validators.required],
    teamEn: ['', Validators.required],
    year: ['', Validators.required],
    clientEs: ['', Validators.required],
    clientEn: ['', Validators.required],
    body: this.fb.array([this.createLocalizedGroup()]),
    features: this.fb.array([]),
    gallery: this.fb.array([]),
  });

  readonly pageTitle = computed(() =>
    this.isNew() ? '// Nuevo project' : '// Editar project',
  );

  readonly crumbLabel = computed(() => {
    this.formEpoch();
    if (this.isNew()) {
      return 'nuevo';
    }
    const title = this.form.controls.title.value.trim();
    const slug = this.form.controls.slug.value.trim();
    return title || slug || this.documentId || 'project';
  });

  readonly statusLine = computed(() => {
    this.formEpoch();
    const status = this.form.dirty ? 'unsaved_changes' : 'saved';
    const id =
      this.documentId ||
      (this.form.controls.slug.value.trim()
        ? `project-${normalizeSlug(this.form.controls.slug.value)}`
        : 'new');
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

  get body(): FormArray {
    return this.form.controls.body;
  }

  get features(): FormArray {
    return this.form.controls.features;
  }

  get gallery(): FormArray {
    return this.form.controls.gallery;
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') {
      this.isNew.set(true);
      this.documentId = '';
      this.loading.set(false);
      return;
    }

    this.isNew.set(false);
    this.documentId = id;
    try {
      const doc = await firstValueFrom(this.read.fetchProjectById(id));
      if (!doc) {
        this.error.set('Project no encontrado.');
      } else {
        this.patchForm(doc);
        this.form.markAsPristine();
        this.formEpoch.update((n) => n + 1);
      }
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.loading.set(false);
    }
  }

  bodyChromeLabel(index: number): string {
    return `Body Paragraph · ${String(index + 1).padStart(2, '0')}`;
  }

  featureChromeLabel(index: number): string {
    const id = (this.features.at(index).getRawValue() as { id: string }).id?.trim();
    return `Feature Config · ${id || 'nuevo'}`;
  }

  galleryChromeLabel(index: number): string {
    const id = (this.gallery.at(index).getRawValue() as { id: string }).id?.trim();
    return `Gallery Item · ${id || 'nuevo'}`;
  }

  addBody(): void {
    this.body.push(this.createLocalizedGroup());
    this.form.markAsDirty();
    this.formEpoch.update((n) => n + 1);
  }

  removeBody(i: number): void {
    this.body.removeAt(i);
    this.form.markAsDirty();
    this.formEpoch.update((n) => n + 1);
  }

  addFeature(): void {
    this.features.push(this.createFeatureGroup());
    this.form.markAsDirty();
    this.formEpoch.update((n) => n + 1);
  }

  removeFeature(i: number): void {
    this.features.removeAt(i);
    this.form.markAsDirty();
    this.formEpoch.update((n) => n + 1);
  }

  addGallery(): void {
    this.gallery.push(this.createGalleryGroup());
    this.form.markAsDirty();
    this.formEpoch.update((n) => n + 1);
  }

  removeGallery(i: number): void {
    this.gallery.removeAt(i);
    this.form.markAsDirty();
    this.formEpoch.update((n) => n + 1);
  }

  async save(): Promise<void> {
    this.message.set(null);
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Completa los campos requeridos (incluye detail).');
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const slug = normalizeSlug(raw.slug);
    const id = this.documentId || `project-${slug}`;

    type LocPair = { es: string; en: string };
    type FeatureRaw = {
      id: string;
      icon: string;
      titleEs: string;
      titleEn: string;
      descriptionEs: string;
      descriptionEn: string;
    };
    type GalleryRaw = {
      id: string;
      imageUrl: string;
      titleEs: string;
      titleEn: string;
      captionEs: string;
      captionEn: string;
    };

    const bodyRows = raw.body as LocPair[];
    const featureRows = raw.features as FeatureRaw[];
    const galleryRows = raw.gallery as GalleryRaw[];

    const featureIds = featureRows.map((f) => f.id.trim()).filter(Boolean);
    if (new Set(featureIds).size !== featureIds.length) {
      this.error.set('Los id de features deben ser únicos.');
      this.saving.set(false);
      return;
    }
    const galleryIds = galleryRows.map((g) => g.id.trim()).filter(Boolean);
    if (new Set(galleryIds).size !== galleryIds.length) {
      this.error.set('Los id de gallery deben ser únicos.');
      this.saving.set(false);
      return;
    }

    const detail: ProjectDetailDoc = {
      summary: { es: raw.summaryEs.trim(), en: raw.summaryEn.trim() },
      role: { es: raw.roleEs.trim(), en: raw.roleEn.trim() },
      duration: { es: raw.durationEs.trim(), en: raw.durationEn.trim() },
      team: { es: raw.teamEs.trim(), en: raw.teamEn.trim() },
      year: raw.year.trim(),
      client: { es: raw.clientEs.trim(), en: raw.clientEn.trim() },
      body: bodyRows.map((p) => ({ es: p.es.trim(), en: p.en.trim() })),
      features: featureRows.map((f) => ({
        id: f.id.trim(),
        icon: f.icon,
        title: { es: f.titleEs.trim(), en: f.titleEn.trim() },
        description: { es: f.descriptionEs.trim(), en: f.descriptionEn.trim() },
      })),
      gallery: galleryRows.map((g) => ({
        id: g.id.trim(),
        imageUrl: g.imageUrl.trim(),
        title: { es: g.titleEs.trim(), en: g.titleEn.trim() },
        caption: { es: g.captionEs.trim(), en: g.captionEn.trim() },
      })),
    };

    const document: ProjectDoc = {
      _id: id,
      _type: 'project',
      slug: { current: slug },
      title: raw.title.trim(),
      description: { es: raw.descriptionEs.trim(), en: raw.descriptionEn.trim() },
      technologies: this.splitList(raw.technologiesText),
      technologyIconUrls: this.splitList(raw.technologyIconUrlsText),
      imageUrl: raw.imageUrl.trim(),
      featured: raw.featured,
      sortOrder: Number(raw.sortOrder) || 0,
      detail,
      ...(raw.repositoryUrl.trim() ? { repositoryUrl: raw.repositoryUrl.trim() } : {}),
      ...(raw.demoUrl.trim() ? { demoUrl: raw.demoUrl.trim() } : {}),
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
      this.documentId = id;
      this.isNew.set(false);
      this.form.markAsPristine();
      this.formEpoch.update((n) => n + 1);
      this.message.set('Project guardado en Sanity.');
      await this.router.navigate(['/projects', id], { replaceUrl: true });
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
    if (!confirm('¿Eliminar este project de Sanity?')) {
      return;
    }
    this.deleting.set(true);
    this.error.set(null);
    try {
      await this.proxy.write({ action: 'delete', id: this.documentId });
      await this.router.navigateByUrl('/projects');
    } catch (err) {
      this.error.set(this.mapError(err));
    } finally {
      this.deleting.set(false);
    }
  }

  private createLocalizedGroup() {
    return this.fb.nonNullable.group({
      es: ['', Validators.required],
      en: ['', Validators.required],
    });
  }

  private createFeatureGroup() {
    return this.fb.nonNullable.group({
      id: ['', [Validators.required, slugValidator()]],
      icon: ['code', Validators.required],
      titleEs: ['', Validators.required],
      titleEn: ['', Validators.required],
      descriptionEs: ['', Validators.required],
      descriptionEn: ['', Validators.required],
    });
  }

  private createGalleryGroup() {
    return this.fb.nonNullable.group({
      id: ['', [Validators.required, slugValidator()]],
      imageUrl: ['', [Validators.required, assetOrHttpUrlValidator()]],
      titleEs: ['', Validators.required],
      titleEn: ['', Validators.required],
      captionEs: ['', Validators.required],
      captionEn: ['', Validators.required],
    });
  }

  private patchForm(doc: ProjectDoc): void {
    const description = doc.description ?? emptyLocalized();
    const detail = doc.detail;
    this.body.clear();
    this.features.clear();
    this.gallery.clear();

    const body = detail?.body?.length ? detail.body : [emptyLocalized()];
    for (const p of body) {
      this.body.push(
        this.fb.nonNullable.group({
          es: [p.es ?? '', Validators.required],
          en: [p.en ?? '', Validators.required],
        }),
      );
    }

    const features = detail?.features?.length ? detail.features : [];
    for (const f of features) {
      const group = this.createFeatureGroup();
      group.patchValue({
        id: f.id ?? '',
        icon: (f.icon as (typeof FEATURE_ICONS)[number]) || 'code',
        titleEs: f.title?.es ?? '',
        titleEn: f.title?.en ?? '',
        descriptionEs: f.description?.es ?? '',
        descriptionEn: f.description?.en ?? '',
      });
      this.features.push(group);
    }

    const gallery = detail?.gallery?.length ? detail.gallery : [];
    for (const g of gallery) {
      const group = this.createGalleryGroup();
      group.patchValue({
        id: g.id ?? '',
        imageUrl: g.imageUrl ?? '',
        titleEs: g.title?.es ?? '',
        titleEn: g.title?.en ?? '',
        captionEs: g.caption?.es ?? '',
        captionEn: g.caption?.en ?? '',
      });
      this.gallery.push(group);
    }

    this.form.patchValue({
      slug: doc.slug?.current ?? '',
      title: doc.title ?? '',
      descriptionEs: description.es ?? '',
      descriptionEn: description.en ?? '',
      technologiesText: (doc.technologies ?? []).join('\n'),
      technologyIconUrlsText: (doc.technologyIconUrls ?? []).join('\n'),
      repositoryUrl: doc.repositoryUrl ?? '',
      demoUrl: doc.demoUrl ?? '',
      imageUrl: doc.imageUrl ?? '',
      featured: !!doc.featured,
      sortOrder: doc.sortOrder ?? 0,
      summaryEs: detail?.summary?.es ?? '',
      summaryEn: detail?.summary?.en ?? '',
      roleEs: detail?.role?.es ?? '',
      roleEn: detail?.role?.en ?? '',
      durationEs: detail?.duration?.es ?? '',
      durationEn: detail?.duration?.en ?? '',
      teamEs: detail?.team?.es ?? '',
      teamEn: detail?.team?.en ?? '',
      year: detail?.year ?? '',
      clientEs: detail?.client?.es ?? '',
      clientEn: detail?.client?.en ?? '',
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

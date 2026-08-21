import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import { AuthService } from '../../auth/auth.service';
import { DashboardFilterService } from '../../layout/dashboard-filter.service';
import type { CourseDoc } from '../../models/cms.models';

@Component({
  selector: 'app-courses-list',
  imports: [RouterLink],
  templateUrl: './courses-list.html',
  styleUrl: './courses-list.scss',
})
export class CoursesListPage implements OnInit {
  private readonly read = inject(SanityReadService);
  private readonly proxy = inject(SanityProxyService);
  private readonly auth = inject(AuthService);
  private readonly filter = inject(DashboardFilterService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly items = signal<CourseDoc[]>([]);

  readonly totalCount = computed(() => this.items().length);

  readonly visibleItems = computed(() => {
    const q = this.filter.query().trim().toLowerCase();
    const rows = this.items();
    if (!q) {
      return rows;
    }
    return rows.filter((item) => {
      const titleEs = (item.title?.es ?? '').toLowerCase();
      const titleEn = (item.title?.en ?? '').toLowerCase();
      const institution = (item.institution ?? '').toLowerCase();
      const slug = this.slugOf(item).toLowerCase();
      const id = item._id.toLowerCase();
      return (
        titleEs.includes(q) ||
        titleEn.includes(q) ||
        institution.includes(q) ||
        slug.includes(q) ||
        id.includes(q)
      );
    });
  });

  readonly statusLine = computed(() => {
    const matches = this.loading() ? 0 : this.visibleItems().length;
    return `Collection: courses-main • Query matches: ${matches} records found • Language: ES / EN`;
  });

  readonly footerUser = computed(
    () => this.auth.user()?.email ?? 'miguel.gutierrez',
  );

  async ngOnInit(): Promise<void> {
    try {
      this.items.set((await firstValueFrom(this.read.fetchCourses())) ?? []);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudieron cargar courses.');
    } finally {
      this.loading.set(false);
    }
  }

  slugOf(item: CourseDoc): string {
    return item.slug?.current ?? item._id;
  }

  titleOf(item: CourseDoc): string {
    return item.title?.es || item.title?.en || this.slugOf(item);
  }

  /** CDN docs are published; treat incomplete records as draft for list chrome. */
  isPublished(item: CourseDoc): boolean {
    if (item._id.startsWith('drafts.')) {
      return false;
    }
    const hasTitle = Boolean(item.title?.es?.trim() || item.title?.en?.trim());
    const hasInstitution = Boolean(item.institution?.trim());
    const hasImage = Boolean(item.imageUrl?.trim());
    return hasTitle && hasInstitution && hasImage;
  }

  async remove(item: CourseDoc): Promise<void> {
    const label = this.titleOf(item);
    if (!confirm(`¿Eliminar “${label}” de Sanity?`)) {
      return;
    }
    this.deletingId.set(item._id);
    this.actionError.set(null);
    try {
      await this.proxy.write({ action: 'delete', id: item._id });
      this.items.update((rows) => rows.filter((row) => row._id !== item._id));
    } catch (err) {
      this.actionError.set(this.mapError(err));
    } finally {
      this.deletingId.set(null);
    }
  }

  private mapError(err: unknown): string {
    if (err instanceof FirebaseError) {
      return err.message;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'No se pudo eliminar.';
  }
}

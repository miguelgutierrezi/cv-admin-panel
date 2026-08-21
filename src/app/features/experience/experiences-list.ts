import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import { AuthService } from '../../auth/auth.service';
import { DashboardFilterService } from '../../layout/dashboard-filter.service';
import type { ExperienceDoc } from '../../models/cms.models';

@Component({
  selector: 'app-experiences-list',
  imports: [RouterLink],
  templateUrl: './experiences-list.html',
  styleUrl: './experiences-list.scss',
})
export class ExperiencesListPage implements OnInit {
  private readonly read = inject(SanityReadService);
  private readonly proxy = inject(SanityProxyService);
  private readonly auth = inject(AuthService);
  private readonly filter = inject(DashboardFilterService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly items = signal<ExperienceDoc[]>([]);

  readonly totalCount = computed(() => this.items().length);

  readonly visibleItems = computed(() => {
    const q = this.filter.query().trim().toLowerCase();
    const rows = this.items();
    if (!q) {
      return rows;
    }
    return rows.filter((item) => {
      const company = (item.company ?? '').toLowerCase();
      const slug = this.slugOf(item).toLowerCase();
      const id = item._id.toLowerCase();
      const roleEs = (item.role?.es ?? '').toLowerCase();
      const roleEn = (item.role?.en ?? '').toLowerCase();
      return (
        company.includes(q) ||
        slug.includes(q) ||
        id.includes(q) ||
        roleEs.includes(q) ||
        roleEn.includes(q)
      );
    });
  });

  readonly statusLine = computed(() => {
    const matches = this.loading() ? 0 : this.visibleItems().length;
    return `Collection: experiences-main • Query matches: ${matches} records found • Language: ES / EN`;
  });

  readonly statusLineMobile = computed(() => {
    const matches = this.loading() ? 0 : this.visibleItems().length;
    if (this.totalCount() === 0) {
      return `Collection: experiences-main\nQuery matches: ${matches} records found\nLanguage: ES / EN`;
    }
    return `Collection: experiences-main\nQuery matches: ${matches} records • ES / EN`;
  });

  readonly footerUser = computed(
    () => this.auth.user()?.email ?? 'miguel.gutierrez',
  );

  async ngOnInit(): Promise<void> {
    try {
      this.items.set((await firstValueFrom(this.read.fetchExperiences())) ?? []);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudieron cargar experiences.');
    } finally {
      this.loading.set(false);
    }
  }

  slugOf(item: ExperienceDoc): string {
    return item.slug?.current ?? item._id;
  }

  roleLabel(item: ExperienceDoc): string {
    return item.role?.es || item.role?.en || '—';
  }

  async remove(item: ExperienceDoc): Promise<void> {
    const label = item.company || this.slugOf(item);
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

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { SanityReadService } from '../../api/sanity-read.service';
import { AuthService } from '../../auth/auth.service';
import { DashboardFilterService } from '../../layout/dashboard-filter.service';
import type { ProjectDoc } from '../../models/cms.models';

@Component({
  selector: 'app-projects-list',
  imports: [RouterLink],
  templateUrl: './projects-list.html',
  styleUrl: './projects-list.scss',
})
export class ProjectsListPage implements OnInit {
  private readonly read = inject(SanityReadService);
  private readonly proxy = inject(SanityProxyService);
  private readonly auth = inject(AuthService);
  private readonly filter = inject(DashboardFilterService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly projects = signal<ProjectDoc[]>([]);

  readonly totalCount = computed(() => this.projects().length);

  readonly visibleProjects = computed(() => {
    const q = this.filter.query().trim().toLowerCase();
    const rows = this.projects();
    if (!q) {
      return rows;
    }
    return rows.filter((p) => {
      const title = (p.title ?? '').toLowerCase();
      const slug = this.slugOf(p).toLowerCase();
      const id = p._id.toLowerCase();
      return title.includes(q) || slug.includes(q) || id.includes(q);
    });
  });

  readonly statusLine = computed(() => {
    const matches = this.loading() ? 0 : this.visibleProjects().length;
    return `Collection: projects-main • Query matches: ${matches} records found • Language: ES / EN`;
  });

  readonly footerUser = computed(
    () => this.auth.user()?.email ?? 'miguel.gutierrez',
  );

  async ngOnInit(): Promise<void> {
    try {
      const rows = await firstValueFrom(this.read.fetchProjects());
      this.projects.set(rows ?? []);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudieron cargar projects.');
    } finally {
      this.loading.set(false);
    }
  }

  slugOf(project: ProjectDoc): string {
    return project.slug?.current ?? project._id;
  }

  async remove(project: ProjectDoc): Promise<void> {
    const label = project.title || this.slugOf(project);
    if (!confirm(`¿Eliminar “${label}” de Sanity?`)) {
      return;
    }
    this.deletingId.set(project._id);
    this.actionError.set(null);
    try {
      await this.proxy.write({ action: 'delete', id: project._id });
      this.projects.update((rows) => rows.filter((p) => p._id !== project._id));
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

import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SanityReadService } from '../../api/sanity-read.service';
import type { ProjectDoc } from '../../models/cms.models';

@Component({
  selector: 'app-projects-list',
  imports: [RouterLink],
  templateUrl: './projects-list.html',
  styleUrl: './projects-list.scss',
})
export class ProjectsListPage implements OnInit {
  private readonly read = inject(SanityReadService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly projects = signal<ProjectDoc[]>([]);

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
}

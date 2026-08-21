import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SanityReadService } from '../../api/sanity-read.service';
import type { ExperienceDoc } from '../../models/cms.models';

@Component({
  selector: 'app-experiences-list',
  imports: [RouterLink],
  templateUrl: './experiences-list.html',
  styleUrl: './experiences-list.scss',
})
export class ExperiencesListPage implements OnInit {
  private readonly read = inject(SanityReadService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly items = signal<ExperienceDoc[]>([]);

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
}

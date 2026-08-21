import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SanityReadService } from '../../api/sanity-read.service';
import type { CourseDoc } from '../../models/cms.models';

@Component({
  selector: 'app-courses-list',
  imports: [RouterLink],
  templateUrl: './courses-list.html',
  styleUrl: './courses-list.scss',
})
export class CoursesListPage implements OnInit {
  private readonly read = inject(SanityReadService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly items = signal<CourseDoc[]>([]);

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
}

import { Injectable, signal } from '@angular/core';

/** Lightweight filter shared between shell search and home cards. */
@Injectable({ providedIn: 'root' })
export class DashboardFilterService {
  readonly query = signal('');

  setQuery(value: string): void {
    this.query.set(value);
  }
}

import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';
import { DashboardFilterService } from '../dashboard-filter.service';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export class AdminShell implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly filter = inject(DashboardFilterService);

  readonly portfolioUrl = environment.portfolioUrl;
  readonly brandHandle = 'miguel.gutierrez';
  readonly email = () => this.auth.user()?.email ?? '';
  readonly loggingOut = signal(false);
  /** Desktop Figma: `grep type_name...`; tablet portrait: `grep...`. */
  readonly searchPlaceholder = signal('grep type_name...');

  private mediaQuery: MediaQueryList | null = null;
  private readonly onViewportChange = (): void => {
    const tabletPortrait =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 1100px) and (min-width: 721px)').matches;
    this.searchPlaceholder.set(tabletPortrait ? 'grep...' : 'grep type_name...');
  };

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.mediaQuery = window.matchMedia('(max-width: 1100px) and (min-width: 721px)');
    this.onViewportChange();
    this.mediaQuery.addEventListener('change', this.onViewportChange);
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.onViewportChange);
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filter.setQuery(value);
  }

  async logout(): Promise<void> {
    this.loggingOut.set(true);
    try {
      await this.auth.logout();
      await this.router.navigateByUrl('/login');
    } finally {
      this.loggingOut.set(false);
    }
  }
}

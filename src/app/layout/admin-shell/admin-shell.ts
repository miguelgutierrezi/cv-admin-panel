import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
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
  readonly searchPlaceholder = signal('grep type_name...');
  readonly logoutLabel = signal('Logout');
  readonly searchWide = signal(false);
  readonly searchAriaLabel = signal('Filtrar content types');

  private mediaQuery: MediaQueryList | null = null;
  private currentPath = '/';

  private readonly onViewportChange = (): void => {
    this.applyChromeForRoute(this.currentPath);
  };

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        this.currentPath = e.urlAfterRedirects.split('?')[0] ?? '/';
        this.filter.setQuery('');
        this.applyChromeForRoute(this.currentPath);
      });
  }

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.currentPath = this.router.url.split('?')[0] ?? '/';
    this.mediaQuery = window.matchMedia('(max-width: 720px)');
    this.applyChromeForRoute(this.currentPath);
    this.mediaQuery.addEventListener('change', this.onViewportChange);
    window.addEventListener('resize', this.onViewportChange);
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.onViewportChange);
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onViewportChange);
    }
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

  private applyChromeForRoute(path: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    const mobile = window.matchMedia('(max-width: 720px)').matches;
    const tabletPortrait = window.matchMedia(
      '(max-width: 1100px) and (min-width: 721px) and (orientation: portrait)',
    ).matches;
    const onCoursesList = path === '/courses';
    const onCoursesForm = path.startsWith('/courses/');
    const onExperience = path === '/experience' || path.startsWith('/experience/');
    const onProjects = path === '/projects' || path.startsWith('/projects/');
    const onNavigation = path === '/navigation' || path.startsWith('/navigation/');
    const onHome = path === '/' || path === '';

    this.logoutLabel.set(mobile ? 'Exit' : 'Logout');
    this.searchWide.set(false);

    if (onNavigation || onCoursesForm) {
      this.searchPlaceholder.set('grep config_key...');
      this.searchAriaLabel.set(
        onNavigation ? 'Filtrar navigation' : 'Filtrar campos del course',
      );
      return;
    }

    if (onCoursesList) {
      this.searchPlaceholder.set('grep courses...');
      this.searchAriaLabel.set('Filtrar courses');
      return;
    }

    if (onExperience) {
      this.searchPlaceholder.set('grep experience...');
      this.searchAriaLabel.set('Filtrar experiences');
      return;
    }

    if (onProjects) {
      this.searchPlaceholder.set('grep project_name...');
      this.searchAriaLabel.set('Filtrar projects');
      return;
    }

    if (onHome && tabletPortrait) {
      this.searchPlaceholder.set('grep...');
      this.searchAriaLabel.set('Filtrar content types');
      return;
    }

    this.searchPlaceholder.set('grep type_name...');
    this.searchAriaLabel.set('Filtrar content types');
  }
}

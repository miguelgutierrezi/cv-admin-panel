import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export class AdminShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly portfolioUrl = environment.portfolioUrl;
  readonly email = () => this.auth.user()?.email ?? '';
  readonly loggingOut = signal(false);

  readonly nav: { path: string; label: string; exact: boolean }[] = [
    { path: '/', label: 'Inicio', exact: true },
    { path: '/site', label: 'Site settings', exact: false },
    { path: '/profile', label: 'Profile', exact: false },
    { path: '/projects', label: 'Projects', exact: false },
    { path: '/experience', label: 'Experience', exact: false },
    { path: '/courses', label: 'Courses', exact: false },
    { path: '/navigation', label: 'Navigation', exact: false },
  ];

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

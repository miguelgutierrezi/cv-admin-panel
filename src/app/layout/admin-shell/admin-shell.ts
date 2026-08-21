import { Component, inject, signal } from '@angular/core';
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
export class AdminShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly filter = inject(DashboardFilterService);

  readonly portfolioUrl = environment.portfolioUrl;
  readonly brandHandle = 'miguel.gutierrez';
  readonly email = () => this.auth.user()?.email ?? '';
  readonly loggingOut = signal(false);

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

import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly title = 'CV Admin Panel';
  readonly portfolioUrl = environment.portfolioUrl;
  readonly sanityProjectId = environment.sanity.projectId;
  readonly dataset = environment.sanity.dataset;
  readonly email = () => this.auth.user()?.email ?? '';
  readonly loggingOut = signal(false);

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

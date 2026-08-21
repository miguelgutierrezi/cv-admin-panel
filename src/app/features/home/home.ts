import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { environment } from '../../../environments/environment';
import { FirebaseError } from 'firebase/app';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly auth = inject(AuthService);
  private readonly proxy = inject(SanityProxyService);
  private readonly router = inject(Router);

  readonly title = 'CV Admin Panel';
  readonly portfolioUrl = environment.portfolioUrl;
  readonly sanityProjectId = environment.sanity.projectId;
  readonly dataset = environment.sanity.dataset;
  readonly email = () => this.auth.user()?.email ?? '';
  readonly loggingOut = signal(false);
  readonly probing = signal(false);
  readonly probeMessage = signal<string | null>(null);
  readonly probeError = signal<string | null>(null);

  async logout(): Promise<void> {
    this.loggingOut.set(true);
    try {
      await this.auth.logout();
      await this.router.navigateByUrl('/login');
    } finally {
      this.loggingOut.set(false);
    }
  }

  /**
   * Smoke: auth + callable + SANITY_WRITE_TOKEN (no document mutation).
   */
  async probeProxy(): Promise<void> {
    this.probing.set(true);
    this.probeMessage.set(null);
    this.probeError.set(null);

    try {
      await this.proxy.write({ action: 'ping' });
      this.probeMessage.set('Proxy OK: auth + Sanity token responden (ping).');
    } catch (err) {
      this.probeError.set(this.mapProbeError(err));
    } finally {
      this.probing.set(false);
    }
  }

  private mapProbeError(err: unknown): string {
    if (err instanceof FirebaseError) {
      return err.message;
    }
    if (err && typeof err === 'object' && 'message' in err) {
      return String((err as { message: unknown }).message);
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Error al llamar al proxy.';
  }
}

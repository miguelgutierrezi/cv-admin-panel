import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly auth = inject(AuthService);
  private readonly proxy = inject(SanityProxyService);

  readonly sanityProjectId = environment.sanity.projectId;
  readonly dataset = environment.sanity.dataset;
  readonly email = () => this.auth.user()?.email ?? '';
  readonly probing = signal(false);
  readonly probeMessage = signal<string | null>(null);
  readonly probeError = signal<string | null>(null);

  async probeProxy(): Promise<void> {
    this.probing.set(true);
    this.probeMessage.set(null);
    this.probeError.set(null);
    try {
      await this.proxy.write({ action: 'ping' });
      this.probeMessage.set('Proxy OK: auth + Sanity token responden (ping).');
    } catch (err) {
      this.probeError.set(this.mapError(err));
    } finally {
      this.probing.set(false);
    }
  }

  private mapError(err: unknown): string {
    if (err instanceof FirebaseError) {
      return err.message;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Error al llamar al proxy.';
  }
}

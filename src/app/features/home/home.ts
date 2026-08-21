import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { SanityProxyService } from '../../api/sanity-proxy.service';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';
import { DashboardFilterService } from '../../layout/dashboard-filter.service';

type ContentCard = {
  path: string;
  title: string;
  eyebrow: string;
  fields: string;
  description: string;
  icon: string;
};

const CARDS: ContentCard[] = [
  {
    path: '/site',
    title: 'Site Settings',
    eyebrow: 'Página única · Configuración',
    fields: '4 campos · Configuración general',
    description: 'Nombre, handle, emails y redes sociales del sitio.',
    icon: '/assets/dashboard/icon-folder.svg',
  },
  {
    path: '/profile',
    title: 'Profile',
    eyebrow: 'Página única · Datos personales',
    fields: '5 campos · Información personal',
    description: 'Imagen, rol, pitch, párrafos about y focus areas. Localizado ES/EN.',
    icon: '/assets/dashboard/icon-briefcase.svg',
  },
  {
    path: '/projects',
    title: 'Projects',
    eyebrow: 'Lista editable · Portfolio',
    fields: '10+ campos · Contenido detallado',
    description: 'Colección con case study: summary, features, gallery. La más compleja.',
    icon: '/assets/dashboard/icon-projects.svg',
  },
  {
    path: '/experience',
    title: 'Experiences',
    eyebrow: 'Lista editable · Historial',
    fields: '7 campos · Historial laboral',
    description: 'Company, role, duration, responsibilities. Localizado ES/EN.',
    icon: '/assets/dashboard/icon-file.svg',
  },
  {
    path: '/courses',
    title: 'Courses',
    eyebrow: 'Lista editable · Educación',
    fields: '7 campos · Formación académica',
    description: 'Título, institución, fecha, imagen y credencial URL.',
    icon: '/assets/dashboard/icon-cpu.svg',
  },
  {
    path: '/navigation',
    title: 'Navigation',
    eyebrow: 'Página única · Menú',
    fields: '1 campo · Enlaces del menú',
    description: 'Array de items con id (select) y label localizado ES/EN.',
    icon: '/assets/dashboard/icon-nav.svg',
  },
];

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly proxy = inject(SanityProxyService);
  private readonly filter = inject(DashboardFilterService);

  readonly brandHandle = 'miguel.gutierrez';
  readonly sanityProjectId = environment.sanity.projectId;
  readonly dataset = environment.sanity.dataset;
  readonly email = () => this.auth.user()?.email ?? '';
  readonly probing = signal(false);
  readonly probeOk = signal(false);
  readonly probeError = signal<string | null>(null);

  readonly cards = computed(() => {
    const q = this.filter.query().trim().toLowerCase();
    if (!q) {
      return CARDS;
    }
    return CARDS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.eyebrow.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.fields.toLowerCase().includes(q)
    );
  });

  readonly welcomeLine = computed(() => {
    const user = this.email() || this.brandHandle;
    return `Bienvenido, ${user} · 6 content types activos`;
  });

  async ngOnInit(): Promise<void> {
    await this.probeProxy();
  }

  async probeProxy(): Promise<void> {
    this.probing.set(true);
    this.probeError.set(null);
    try {
      await this.proxy.write({ action: 'ping' });
      this.probeOk.set(true);
    } catch (err) {
      this.probeOk.set(false);
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

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';
import { FirebaseError } from 'firebase/app';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly portfolioUrl = environment.portfolioUrl;
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly configError = this.auth.configError;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.auth.status() === 'misconfigured') {
      this.errorMessage.set(this.configError() ?? 'Auth no configurado');
      return;
    }

    this.submitting.set(true);
    const { email, password } = this.form.getRawValue();

    try {
      await this.auth.login(email, password);
      await this.router.navigateByUrl('/');
    } catch (err) {
      this.errorMessage.set(this.mapError(err));
    } finally {
      this.submitting.set(false);
    }
  }

  private mapError(err: unknown): string {
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-email':
          return 'Correo o contraseña incorrectos.';
        case 'auth/too-many-requests':
          return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
        case 'auth/operation-not-allowed':
          return 'Email/password no está habilitado en Firebase. Ver docs/auth-setup.md.';
        case 'auth/network-request-failed':
          return 'Error de red al contactar Firebase.';
        default:
          return err.message;
      }
    }

    if (err instanceof Error) {
      return err.message;
    }

    return 'No se pudo iniciar sesión.';
  }
}

import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'site',
        loadComponent: () =>
          import('./features/site-settings/site-settings').then((m) => m.SiteSettingsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.ProfilePage),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/projects-list').then((m) => m.ProjectsListPage),
      },
      {
        path: 'projects/new',
        loadComponent: () =>
          import('./features/projects/project-form').then((m) => m.ProjectFormPage),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./features/projects/project-form').then((m) => m.ProjectFormPage),
      },
      {
        path: 'experience',
        loadComponent: () =>
          import('./features/experience/experiences-list').then((m) => m.ExperiencesListPage),
      },
      {
        path: 'experience/new',
        loadComponent: () =>
          import('./features/experience/experience-form').then((m) => m.ExperienceFormPage),
      },
      {
        path: 'experience/:id',
        loadComponent: () =>
          import('./features/experience/experience-form').then((m) => m.ExperienceFormPage),
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/courses/courses-list').then((m) => m.CoursesListPage),
      },
      {
        path: 'courses/new',
        loadComponent: () =>
          import('./features/courses/course-form').then((m) => m.CourseFormPage),
      },
      {
        path: 'courses/:id',
        loadComponent: () =>
          import('./features/courses/course-form').then((m) => m.CourseFormPage),
      },
      {
        path: 'navigation',
        loadComponent: () =>
          import('./features/navigation/navigation').then((m) => m.NavigationPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

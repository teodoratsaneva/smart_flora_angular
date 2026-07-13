import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent)
  },
  {
    path: 'plants',
    loadComponent: () =>
      import('./features/plants/plant-list/plant-list.component')
        .then(m => m.PlantListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'plants/add',
    loadComponent: () =>
      import('./features/plants/plant-add/plant-add.component')
        .then(m => m.PlantAddComponent),
    canActivate: [authGuard]
  },
  {
    path: 'plants/:id',
    loadComponent: () =>
      import('./features/plants/plant-details/plant-details.component')
        .then(m => m.PlantDetailsComponent),
    canActivate: [authGuard]
  }
];

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',loadChildren: () => import ('./dashboard/dashboard.module').then(m => m.DashboardModule),canActivate: [AuthGuard]
  },
  {
    path: 'catalog', loadChildren: () => import ('./catalog/catalog.module').then(m => m.CatalogModule), canActivate: [AuthGuard] 
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  },
  { 
    path: 'notifications',
    loadChildren: () => import('./notifications/notifications.module').then(m => m.NotificationsModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

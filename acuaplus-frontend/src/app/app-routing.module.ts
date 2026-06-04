import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

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
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),canActivate: [AuthGuard, RoleGuard],
    data: {roles: ['admin']}
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

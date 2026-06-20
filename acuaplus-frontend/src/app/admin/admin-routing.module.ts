import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PendingSellersComponent } from './pending-sellers/pending-sellers.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'pending-sellers', component: PendingSellersComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
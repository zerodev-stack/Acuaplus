import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PendingSellersComponent } from './pending-sellers/pending-sellers.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    PendingSellersComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule {}
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SellerRoutingModule } from './seller-routing.module';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';
import { SellerProductListComponent } from './seller-product-list/seller-product-list.component';
import { SellerProductFormComponent } from './seller-product-form/seller-product-form.component';

@NgModule({
  declarations: [
    SellerDashboardComponent,
    SellerProductListComponent,
    SellerProductFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SellerRoutingModule,
  ],
})
export class SellerModule {}
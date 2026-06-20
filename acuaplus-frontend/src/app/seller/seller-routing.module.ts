import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';
import { SellerProductListComponent } from './seller-product-list/seller-product-list.component';
import { SellerProductFormComponent } from './seller-product-form/seller-product-form.component';

const routes: Routes = [
  { path: '', component: SellerDashboardComponent },
  { path: 'products', component: SellerProductListComponent },
  { path: 'products/new', component: SellerProductFormComponent },
  { path: 'products/:id/edit', component: SellerProductFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SellerRoutingModule {}
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../core/guards/role.guard';
import { OrderListComponent } from './order-list/orders-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { SellerOrdersComponent } from './seller-orders/seller-orders.component';

const routes: Routes = [
  {
    path: '',
    component: OrderListComponent
  },
  {
    path: 'seller',
    component: SellerOrdersComponent,
    canActivate: [RoleGuard],
    data: { roles: ['seller'] }
  },
  {
    path: ':id',
    component: OrderDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule {}
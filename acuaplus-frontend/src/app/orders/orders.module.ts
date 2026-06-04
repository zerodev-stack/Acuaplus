import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { SellerOrdersComponent } from './seller-orders/seller-orders.component';

@NgModule({
  declarations: [
    OrdersListComponent,
    OrderDetailComponent,
    SellerOrdersComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    OrdersRoutingModule
  ]
})
export class OrdersModule {}
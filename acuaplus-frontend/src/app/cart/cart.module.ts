import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule} from "@angular/forms";
import { CartRoutingModule } from './cart-routing.module';
import { CartPageComponent } from './cart-page/cart-page.component';



@NgModule({
  declarations: [
    CartPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CartRoutingModule
  ]
})
export class CartModule { }

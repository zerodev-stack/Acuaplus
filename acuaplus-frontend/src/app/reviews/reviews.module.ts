import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReviewsRoutingModule } from './reviews-routing.module';
import { ReviewsListComponent } from './reviews-list/reviews-list.component';
import { ReviewsFormComponent } from './reviews-form/reviews-form.component';


@NgModule({
  declarations: [
    ReviewsListComponent,
    ReviewsFormComponent
  ],
  imports: [
    CommonModule,
    ReviewsRoutingModule
  ]
})
export class ReviewsModule { }

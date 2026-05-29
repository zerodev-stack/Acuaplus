// src/app/notifications/notifications.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NotificationsListComponent } from './notifications-banner/notifications-banner.component';

const routes: Routes = [
  { path: '', component: NotificationsListComponent }
];

@NgModule({
  declarations: [NotificationsListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class NotificationsModule {}


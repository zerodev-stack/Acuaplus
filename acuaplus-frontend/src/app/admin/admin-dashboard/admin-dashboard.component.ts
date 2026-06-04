import { Component } from '@angular/core';
import { AuthService, User } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
   user: User | null;

constructor(private authService: AuthService, private router: Router){
  this.user = this.authService.currentUser;
}
logout():void {
  this.authService.logout();
}
goTo(path: string): void {
  this.router.navigate(['/admin, path']);
}
}

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'] || [];
    const user = this.authService.currentUser;

    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (!expectedRoles.includes(user.role)) {
     
      if (user.role === 'admin') this.router.navigate(['/admin']);
      else this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
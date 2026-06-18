import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) {}

 canActivate(): boolean {
  console.log('🛡️ AuthGuard ejecutado, isLoggedIn:', this.authService.isLoggedIn());
  if (this.authService.isLoggedIn()) {
    return true;
  }
  this.router.navigate(['/auth/login']);
  return false;
}
}
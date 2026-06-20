import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  user: User | null = null;
  loadingStats = true;

  stats = {
    products: 0,
    orders: 0,
    notifications: 0,
    unreadNotifications: 0
  };

  // Para mostrar errores si la API falla
  statsError = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUser;


    this.loadStats();
  }

  loadStats() {
    this.loadingStats = true;
    this.statsError = false;

    this.apiService.get<any>('/notifications?limit=1').subscribe({
      next: (res) => {
        this.stats.notifications = res.total || 0;
        this.stats.unreadNotifications = res.unreadCount || 0;
        this.loadingStats = false;
      },
      error: () => {
        this.statsError = true;
        this.loadingStats = false;
      }
    });


    if (this.user?.role === 'seller') {
      this.apiService.get<any>('/orders/seller?limit=1').subscribe({
        next: (res) => { this.stats.orders = res.total || 0; }
      });
      this.apiService.get<any>('/products?limit=1').subscribe({
        next: (res) => { this.stats.products = res.total || 0; }
      });
    }


    if (this.user?.role === 'buyer') {
      this.apiService.get<any>('/orders/mine?limit=1').subscribe({
        next: (res) => { this.stats.orders = res.total || 0; }
      });
    }
  }

  logout() {
    this.authService.logout();
  }

  // Saludo según la hora del día
  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }


  get roleLabel(): string {
    const labels: Record<string, string> = {
      buyer:  ' Comprador',
      seller: ' Vendedor',
      admin:  ' Administrador'
    };
    return labels[this.user?.role || ''] || '';
  }

 get firstName(): string {
  return this.user?.name?.split(' ')[0] ?? '';
 }
 goToCatalog(): void {
  if (this.user?.role === 'seller') {
    this.router.navigate(['/seller/products/new']);
  } else {
  this.router.navigate(['/catalog']);
}
 }
}
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { AuthService, User } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pending-sellers',
  templateUrl: './pending-sellers.component.html',
  styleUrls: ['./pending-sellers.component.css'],
})
export class PendingSellersComponent implements OnInit {
  sellers: User[] = [];
  loading = true;
  error = false;
  actionLoading: { [userId: number]: boolean } = {};
  actionSuccess: { [userId: number]: string } = {};

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.authService.currentUser;
  }

  ngOnInit(): void {
    console.log('Cargando vendedores pendientes de aprobación...');
    this.loadPendingSellers();
  }
  loadPendingSellers(): void {
    this.loading = true;
    this.error = false;

    console.log('Llamando al servicio getPendingSellers()');

    this.userService.getPendingSellers().subscribe({
      next: (res: any) => {
        console.log('Respuesta del backend:', res);
        this.sellers = Array.isArray(res) ? res : (res.data ?? []);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pending sellers:', err);
        this.error = true;
        this.loading = false;
      },
    });
  }

  approve(userId: number): void {
    this.actionLoading[userId] = true;
    this.userService.approveSeller(userId).subscribe({
      next: () => {
        this.actionSuccess[userId] = 'aprobado';
        this.actionLoading[userId] = false;

        setTimeout(() => {
          this.sellers = this.sellers.filter((s) => s.id !== userId);
        }, 1000);
      },
      error: () => {
        this.actionLoading[userId] = false;
      },
    });
  }

  suspend(userId: number): void {
    this.actionLoading[userId] = true;
    this.userService.suspendUser(userId).subscribe({
      next: () => {
        this.actionSuccess[userId] = 'suspendido';
        this.actionLoading[userId] = false;
        setTimeout(() => {
          this.sellers = this.sellers.filter((s) => s.id !== userId);
        }, 1000);
      },
      error: () => {
        this.actionLoading[userId] = false;
      },
    });
  }
  logout(): void {
    this.authService.logout();
  }
}

import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/services/auth.service';

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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadPendingSellers();
  }
  loadPendingSellers(): void {
    this.loading = true;
    this.error = false;
    this.userService.getPendingSellers().subscribe({
      next: (res) => {
        this.sellers = res.data;
        this.loading = false;
      },
      error: () => {
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
}

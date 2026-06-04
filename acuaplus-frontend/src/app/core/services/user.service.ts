import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from './auth.service';

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private api: ApiService) { }

  getPendingSellers(): Observable<{data: User[]}> {
    return this.api.get<{data: User[]}>('users/pending-sellers');
  }
  approveSeller(userId: number): Observable<any> {
    return this.api.patch(`users/${userId}/approve`, {});
  }
  suspendUser(userId: number): Observable<any> {
    return this.api.patch(`users/${userId}/suspend`, {});
  }
}

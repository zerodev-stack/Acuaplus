import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';

// Tipos que coinciden con tu API
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  status: string;
  avatar_url: string | null;
}

interface LoginResponse {
  data: {
    user: User;
    accessToken: string;
  };
}

interface RegisterResponse {
  data: {
    userId: number;
    role: string;
    status: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  // currentUser$ es un "stream" que cualquier componente puede escuchar
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {
    // Al iniciar la app, recupera el usuario guardado en localStorage
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUserSubject.next(JSON.parse(saved));
    }
  }

  login(email: string, password: string) {
    return this.api.post<LoginResponse>('auth/login', { email, password }).pipe(
      tap(response => {
        const { user, accessToken } = response.data;
        // Guardar token y usuario en localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  register(data: {
    name: string;
    email: string;
    password: string;
    role: 'buyer' | 'seller';
    phone?: string;
    business_name?: string;
    nit?: string;
  }) {
    return this.api.post<RegisterResponse>('auth/register', data);
  }

  logout() {
    // Llamar al endpoint de logout en la API
    this.api.post('auth/logout', {}).subscribe({
      complete: () => this.clearSession()
    });
  }

  clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
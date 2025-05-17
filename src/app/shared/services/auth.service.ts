import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  token: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private readonly token: string | null = null;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);


  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.currentUserSubject = new BehaviorSubject<any | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.token = localStorage.getItem('authToken');
    this.checkInitialAuthState();

  }

  // Get the current user value
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Add proper headers for all requests
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }



  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  login(credentials: { email: any; password: any }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/auth/login`,
      credentials,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    ).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(err => {
        console.error("Login error:", err);
        throw err;
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/auth/register`,
      userData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error(
          error.error?.message || 'Registration failed. Please try again.'
        ));
      })
    );
  }

  // Logout user
  logout(): void {
    this.clearUserData();
    this.currentUserSubject.next(null);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    return !!user && this.isTokenValid(user.token);
  }

  // Check if user has admin role
  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.includes('ADMIN') : false;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.includes(role) : false;
  }

  // Private helper methods
  private mapAuthResponseToUser(response: AuthResponse): User {
    return {
      id: response.id,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      roles: response.roles,
      token: response.token
    };
  }

  private storeUserData(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', user.token || '');
    this.currentUserSubject.next(user);
  }

  private clearUserData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  private isTokenValid(token?: string): boolean {
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      return false;
    }
  }



  private checkInitialAuthState(): void {
    const token = localStorage.getItem('authToken');
    this.isAuthenticatedSubject.next(!!token);
  }

  isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

}

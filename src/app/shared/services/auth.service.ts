import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isTokenValid());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  // ========== PUBLIC METHODS ========== //

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem('token')
  }

  public getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  public getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    return this.getHeaders().set('Authorization', `Bearer ${token}`);
  }

  public isAuthenticated(): boolean {
    return this.isTokenValid();
  }

  public isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  public login(credentials: { email: string; password: string }): Observable<User> {
    if (!credentials.email || !credentials.password) {
      return throwError(() => new Error('Email and password are required'));
    }

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`,
      credentials,
      {headers: this.getHeaders()}
    ).pipe(
      tap(response => {
        console.log('Login response:', response);
        console.log('Token type:', typeof response.token);
      }),
      map(response => {
        if (!response?.token) {
          throw new Error('Invalid server response - missing token');
        }

        // Verify token is a string
        if (typeof response.token !== 'string') {
          console.error('Received non-string token:', response.token);
          throw new Error('Invalid token format received from server');
        }

        return this.handleAuthResponse(response);
      }),
      catchError(error => this.handleAuthError(error, 'Login'))
    );
  }

  public register(registerData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }): Observable<User> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/register`,
      registerData,
      {headers: this.getHeaders()}
    ).pipe(
      map(response => {
        if (!response?.token) {
          throw new Error('Registration successful but no token received');
        }
        return this.handleAuthResponse(response);
      }),
      catchError(error => this.handleAuthError(error, 'Registration'))
    );
  }

  public logout(): void {
    this.clearUserData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  public isAdmin(): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.includes('ADMIN') : false;
  }

  public hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.includes(role) : false;
  }

  // ========== PRIVATE METHODS ========== //

  private handleAuthResponse(response: AuthResponse): User {
    const user: User = {
      id: response.id,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      roles: response.roles
    };

    this.storeUserData(user, response.token);
    return user;
  }

  private storeUserData(user: User, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));

    if (token) {
      localStorage.setItem('token', token);
      console.log('Token stored successfully');
    } else {
      console.error('Attempted to store invalid token:', token);
      throw new Error('Invalid token format');
    }

    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearUserData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    console.log('User data cleared from storage');
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem('currentUser');
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }

  private isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        console.log('Token expired');
        this.logout();
      }
      return !isExpired;
    } catch (e) {
      console.error('Token validation error:', e);
      return false;
    }
  }

  private handleAuthError(error: any, context: string): Observable<never> {
    console.error(`${context} error:`, error);

    let errorMessage = 'An error occurred';
    if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Invalid request';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }

}

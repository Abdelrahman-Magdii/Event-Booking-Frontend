import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import { Event } from '../models/event';
import {environment} from '../../../environments/environment';
import {Page} from '../models/page';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = `${environment.apiUrl}/events`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // or get from your AuthService
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('token',token);
    console.log('this.authService.getAuthHeaders()',this.authService.getAuthHeaders());
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authService.getAuthHeaders()}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Network error:', error.error);
      return throwError(() => new Error('Network error - please check your connection'));
    } else if (error.status === 403) {
      return throwError(() => new Error('Access denied - please login'));
    } else {
      console.error(`Backend error ${error.status}:`, error.error);
      return throwError(() => new Error('Server error - please try again later'));
    }
  }

  getEvents(page: number = 0, size: number = 10, sortField: string, sortDirection: string, searchQuery: string): Observable<Page<Event>> {
    console.log('Getting events...'+this.getHeaders());
    return this.http.get<Page<Event>>(this.apiUrl, {
      params: { page: page.toString(), size: size.toString() },
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }


  getEvent(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchEvents(query: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/search`, { params: { q: query } });
  }

  getEventsByCategory(category: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/category/${category}`);
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/upcoming`);
  }

  createEvent(userId: Number | null, eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}?userId=${userId}`, eventData);
  }

  updateEvent(eventId: string, eventData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${eventId}`, eventData);
  }

}

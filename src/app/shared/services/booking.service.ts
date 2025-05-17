import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import {environment} from '../../../environments/environment';

interface Booking {
  id: number;
  eventId: number;
  userId: number;
  bookingDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) { }

  getBookings(): Observable<Booking[]> {
    return this.http.get<{data: Booking[]}>(this.apiUrl, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'Unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Server error ${error.status}: ${error.message}`;
    }
    console.error(error);
    return throwError(() => new Error(errorMessage));
  }
}

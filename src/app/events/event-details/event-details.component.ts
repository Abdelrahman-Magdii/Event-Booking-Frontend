import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { EventService } from '../../shared/services/event.service';
import { Event } from '../../shared/models/event';
import { BookingService } from '../../shared/services/booking.service';
import { AuthService } from '../../shared/services/auth.service';
import {CurrencyPipe, DatePipe, NgIf, TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  // imports: [
  //   // RouterLink,
  //   // DatePipe,
  //   // TitleCasePipe,
  //   // CurrencyPipe,
  //   // NgIf
  // ],
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  isBooked = false;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private bookingService: BookingService,
    protected authService: AuthService
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(eventId);
      // this.checkIfBooked(eventId);
    } else {
      this.router.navigate(['/events']);
    }
  }

  loadEvent(eventId: string): void {
    this.eventService.getEvent(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Event not found or failed to load.';
        this.loading = false;
      }
    });
  }

  // checkIfBooked(eventId: string): void {
  //   if (this.authService.currentUserValue) {
  //     this.bookingService.getUserBookings().subscribe({
  //       next: (bookings) => {
  //         this.isBooked = bookings.some(b => b.eventId === eventId);
  //       },
  //       error: (error) => {
  //         console.error('Failed to check bookings:', error);
  //       }
  //     });
  //   }
  // }

  // bookEvent(): void {
  //   if (!this.event) return;
  //
  //   if (!this.authService.currentUserValue) {
  //     this.router.navigate(['/login'], { queryParams: { returnUrl: `/events/${this.event.id}` }});
  //     return;
  //   }
  //
  //   this.bookingService.createBooking(this.event.id).subscribe({
  //     next: () => {
  //       this.router.navigate(['/booking-confirm', this.event?.id]);
  //     },
  //     error: (error) => {
  //       console.error('Booking failed:', error);
  //       alert('Failed to book event. Please try again.');
  //     }
  //   });
  // }
}

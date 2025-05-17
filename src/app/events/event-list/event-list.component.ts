import { Component, OnInit } from '@angular/core';
import { EventService } from '../../shared/services/event.service';
import { Event } from '../../shared/models/event';
import { AuthService } from '../../shared/services/auth.service';
import { BookingService } from '../../shared/services/booking.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  imports: [
    NgIf,
    NgForOf,
    RouterLink,
    DatePipe
  ],
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  bookedEventIds: string[] = [];
  loading = true;
  error = '';

  constructor(
    private eventService: EventService,
    protected authService: AuthService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  // event-list.component.ts
  loadEvents(): void {
    this.loading = true;

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 403) {
          this.error = 'You need to be logged in to view events';
          // Optionally redirect to login
          // this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load events. Please try again later.';
        }
        this.loading = false;
      }
    });
  }

  isBooked(eventId: string): boolean {
    return this.bookedEventIds.includes(eventId);
  }
}

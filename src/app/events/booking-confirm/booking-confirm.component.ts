import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { EventService } from '../../shared/services/event.service';
import { Event } from '../../shared/models/event';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-booking-confirm',
  templateUrl: './booking-confirm.component.html',
  imports: [
    RouterLink,
    DatePipe
  ],
  styleUrls: ['./booking-confirm.component.css']
})
export class BookingConfirmComponent implements OnInit {
  event: Event | null = null;
  bookingId = this.generateBookingId();
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(eventId);
    } else {
      // Handle error - no event ID provided
    }
  }

  loadEvent(eventId: string): void {
    this.eventService.getEvent(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load event:', error);
        this.loading = false;
      }
    });
  }

  private generateBookingId(): string {
    return 'BK-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }
}

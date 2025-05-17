import { Component, OnInit } from '@angular/core';
import { EventService } from '../../shared/services/event.service';
import { Event } from '../../shared/models/event';
import { AuthService } from '../../shared/services/auth.service';
import { BookingService } from '../../shared/services/booking.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  imports: [
    NgIf,
    NgForOf,
    DatePipe
  ],
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  bookedEventIds: string[] = [];
  loading = true;
  error = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private eventService: EventService,
    protected authService: AuthService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(page: number = 0): void {
    this.loading = true;
    this.currentPage = page;

    this.eventService.getEvents(page).subscribe({
      next: (response) => {
        this.events = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 403) {
          this.error = 'You need to be logged in to view events';
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

  onPageChange(page: number): void {
    this.loadEvents(page);
  }


  getPageNumbers(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage + 1;
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let pages: number[] = [];

    pages.push(1);

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) {
      pages.push(-1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push(-1);
    }

    pages.push(totalPages);

    return pages;
  }
}

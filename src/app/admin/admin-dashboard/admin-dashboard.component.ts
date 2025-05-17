import { Component, OnInit } from '@angular/core';
import { EventService } from '../../shared/services/event.service';
import { Event } from '../../shared/models/event';
import {Router, RouterLink} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error = '';

  constructor(
    private eventService: EventService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load events. Please try again later.';
        this.loading = false;
      }
    });
  }

  editEvent(eventId: string): void {
    this.router.navigate(['/admin/events/edit', eventId]);
  }

  deleteEvent(eventId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this event?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventService.deleteEvent(eventId).subscribe({
          next: () => {
            this.loadEvents();
          },
          error: (error) => {
            console.error('Failed to delete event:', error);
            alert('Failed to delete event. Please try again.');
          }
        });
      }
    });
  }
}

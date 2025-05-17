import { Component, OnInit, ViewChild } from '@angular/core';
import { EventService } from '../../shared/services/event.service';
import { Event } from '../../shared/models/event';
import {Router, RouterLink} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {DatePipe, DecimalPipe, NgForOf, NgIf, UpperCasePipe} from '@angular/common';
import { Page } from '../../shared/models/page';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatButton, MatIconAnchor, MatIconButton} from '@angular/material/button';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [
    DatePipe,
    NgIf,
    MatProgressSpinnerModule,
    MatButton,
    MatTableModule,
    MatIconModule,
    MatPaginator,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    FormsModule,
    MatIconButton,
    RouterLink,
    NgForOf,
    DecimalPipe,
    UpperCasePipe,
    MatIconAnchor
  ]
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Event>;

  events: Event[] = [];
  loading = true;
  error = '';
  searchQuery = '';

  // Table columns
  displayedColumns: string[] = [
    'title',
    'date',
    'location',
    'capacity',
    'status',
    'actions'
  ];

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalEvents = 0;
  sortField = 'startTime';
  sortDirection = 'asc';

  constructor(
    private eventService: EventService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(page: number = 0): void {
    this.loading = true;
    this.error = '';
    this.currentPage = page;

    this.eventService.getEvents(
      page,
      this.pageSize,
      this.sortField,
      this.sortDirection,
      this.searchQuery
    ).subscribe({
      next: (response: Page<Event>) => {
        this.events = response.content;
        this.totalEvents = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 403) {
          this.error = 'You do not have permission to view events';
          this.snackBar.open(this.error, 'Close', { duration: 5000 });
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load events. Please try again later.';
          this.snackBar.open(this.error, 'Close', { duration: 5000 });
        }
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.loadEvents(event.pageIndex);
  }

  onSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this.sortField = sortState.active;
      this.sortDirection = sortState.direction;
    } else {
      this.sortField = 'startTime';
      this.sortDirection = 'asc';
    }
    this.loadEvents();
  }

  onSearch(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadEvents();
  }

  editEvent(eventId: string): void {
    this.router.navigate(['/admin/events/edit', eventId]);
  }

  deleteEvent(eventId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this event? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventService.deleteEvent(eventId).subscribe({
          next: () => {
            this.snackBar.open('Event deleted successfully', 'Close', { duration: 3000 });
            // Reload current page to maintain pagination position
            // If we're on a page that might now be empty, go back one page
            if (this.events.length === 1 && this.currentPage > 0) {
              this.loadEvents(this.currentPage - 1);
            } else {
              this.loadEvents(this.currentPage);
            }
          },
          error: (error) => {
            console.error('Failed to delete event:', error);
            this.snackBar.open('Failed to delete event. Please try again.', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  getStatusColor(event: Event): string {
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    if (!event.published) return 'draft';
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'completed';
  }
}

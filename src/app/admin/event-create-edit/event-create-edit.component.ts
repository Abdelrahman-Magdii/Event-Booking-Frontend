import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { EventService } from '../../shared/services/event.service';
import {DatePipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-event-create-edit',
  templateUrl: './event-create-edit.component.html',
  styleUrls: ['./event-create-edit.component.css'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    RouterLink
  ],
  providers: [DatePipe]
})
export class EventCreateEditComponent implements OnInit {
  eventForm: FormGroup;
  isEditMode = false;
  eventId: string | null = null;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private datePipe: DatePipe
  ) {
    this.eventForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      date: ['', Validators.required],
      venue: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      imageUrl: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.eventId;

    if (this.isEditMode) {
      this.loadEventForEdit();
    }
  }

  get imageUrl(): string {
    return this.eventForm.get('imageUrl')?.value || '';
  }

  loadEventForEdit(): void {
    if (!this.eventId) return;

    this.loading = true;
    this.eventService.getEvent(this.eventId).subscribe({
      next: (event) => {
        // Format date for datetime-local input
        const formattedDate = this.datePipe.transform(event.date, 'yyyy-MM-ddTHH:mm');

        this.eventForm.patchValue({
          ...event,
          date: formattedDate
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load event for editing.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      return;
    }

    this.loading = true;
    const eventData = {
      ...this.eventForm.value,
      date: new Date(this.eventForm.value.date)
    };

    if (this.isEditMode && this.eventId) {
      this.eventService.updateEvent(this.eventId, eventData).subscribe({
        next: () => {
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          this.error = 'Failed to update event. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.eventService.createEvent(eventData).subscribe({
        next: () => {
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          this.error = 'Failed to create event. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}

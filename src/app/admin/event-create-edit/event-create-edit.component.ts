import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../shared/services/event.service';
import { DatePipe, NgIf, NgFor } from '@angular/common';
import { Event } from '../../shared/models/event';

@Component({
  selector: 'app-event-create-edit',
  templateUrl: './event-create-edit.component.html',
  styleUrls: ['./event-create-edit.component.css'],
  imports: [ReactiveFormsModule, NgIf, NgFor, RouterLink],
  providers: [DatePipe],
  standalone: true
})
export class EventCreateEditComponent implements OnInit {
  eventForm: FormGroup;
  isEditMode = false;
  eventId: string | null = null;
  loading = false;
  error = '';

  categories = [
    { value: 'music', label: 'Music' },
    { value: 'sports', label: 'Sports' },
    { value: 'arts', label: 'Arts' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private datePipe: DatePipe
  ) {
    this.eventForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      categories: [[], Validators.required],
      tags: [],
      capacity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      published: [false]
    });
  }


  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.eventId;

    if (this.isEditMode) {
      this.loadEventForEdit();
    }
  }

  // Custom validator to ensure startTime < endTime
  startBeforeEndValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;

    if (!start || !end) return null;

    return new Date(start) < new Date(end) ? null : { startAfterEnd: true };
  }

  loadEventForEdit(): void {
    if (!this.eventId) return;

    this.loading = true;
    this.eventService.getEvent(this.eventId).subscribe({
      next: (event: Event) => {
        const formattedDate = this.datePipe.transform(event.startTime, 'yyyy-MM-ddTHH:mm');
        const formattedStartTime = this.datePipe.transform(event.startTime, 'yyyy-MM-ddTHH:mm');
        const formattedEndTime = this.datePipe.transform(event.endTime, 'yyyy-MM-ddTHH:mm');

        this.eventForm.patchValue({
          name: event.title,
          description: event.description,
          category: event.categories[0],
          date: formattedDate,
          price: event.price,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          capacity: event.capacity || 50,
          published: event.published || false,
          tags: event.tags?.join(', ') || 'workshop'
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load event for editing.';
        this.loading = false;
      }
    });
  }

  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.userId;
    } catch {
      return null;
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValues = this.eventForm.value;

    // Convert tags string to array of trimmed strings
    const tags = formValues.tags
      ? formValues.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
      : [];

    const eventData: Partial<Event> = {
      title: formValues.name,
      description: formValues.description,
      categories: formValues.category,
      price: formValues.price,
      startTime: new Date(formValues.startTime),
      endTime: new Date(formValues.endTime),
      capacity: formValues.capacity,
      published: formValues.published,
      tags: tags
    };

    const userId = this.getUserIdFromToken();

    if (this.isEditMode && this.eventId) {
      this.eventService.updateEvent(this.eventId, eventData).subscribe({
        next: () => {
          this.router.navigate(['/admin/dashboard']);
        },
        error: () => {
          this.error = 'Failed to update event. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.eventService.createEvent(userId, eventData).subscribe({
        next: () => {
          this.router.navigate(['/admin/dashboard']);
        },
        error: () => {
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

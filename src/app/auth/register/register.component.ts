import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf,
    RouterLink
  ],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  error = '';
  debugInfo = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+[0-9]{10,15}$/)]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  // Password match custom validator
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';
    this.debugInfo = '';

    // Extract registration data, omitting confirmPassword
    const { confirmPassword, ...registrationData } = this.registerForm.value;

    // Log the exact payload being sent
    console.log('Sending registration data:', JSON.stringify(registrationData));
    this.debugInfo = `Sending: ${JSON.stringify(registrationData)}`;

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        console.log('Registration success:', response);
        this.router.navigate(['/login'], {
          queryParams: { registered: 'success' }
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Registration error:', error);

        // Capture detailed error information
        let errorMsg = 'Registration failed. ';

        if (error.error) {
          console.log('Error details:', error.error);

          if (typeof error.error === 'string') {
            errorMsg += error.error;
          } else if (error.error.message) {
            errorMsg += error.error.message;

            // If there are additional details or field-specific errors
            if (error.error.details) {
              errorMsg += ` - ${error.error.details}`;
            }
          }

          // Add debugging info
          this.debugInfo += `\nReceived error: ${JSON.stringify(error.error)}`;
        } else {
          errorMsg += 'Please check your information and try again.';
        }

        this.error = errorMsg;
        this.loading = false;
      }
    });
  }
}

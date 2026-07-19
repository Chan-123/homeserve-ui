import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit {
  name = '';
  phone = '';
  email = '';
  password = '';
  roles = 'CUSTOMER';
  area = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  bookingDraft: any = null;
  selectedService: any = null;

  constructor(private auth: Auth, private router: Router) {}

    ngOnInit(): void {
    const nav = history.state;
    this.bookingDraft = nav?.bookingDraft || null;
    this.selectedService = nav?.selectedService || null;
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    const payload = {
      name: this.name,
      phone: this.phone,
      email: this.email,
      password: this.password,
      roles: this.roles,
      area: this.area
    };

    this.auth.register(payload).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.user.roles === 'ENGINEER') {
          this.successMessage = 'Engineer registration submitted. Wait for admin approval before login.';
          this.auth.logout();
          return;
        }

        this.router.navigate(['/customer/home'], {
          state: {
            bookingDraft: this.bookingDraft,
            selectedService: this.selectedService
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
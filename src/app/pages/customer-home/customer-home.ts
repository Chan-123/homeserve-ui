import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { BookingItem, BookingService } from '../../services/booking';

@Component({
  selector: 'app-customer-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-home.html',
  styleUrl: './customer-home.scss'
})
export class CustomerHome implements OnInit {
  category = 'ELECTRICAL';
  serviceType = 'SERVICE';
  applianceType = '';
  brand = '';
  model = '';
  longitude: number | null = 80.2707;
  latitude: number | null = 13.0827;

  loading = false;
  loadingBookings = false;
  errorMessage = '';
  successMessage = '';

  bookings: BookingItem[] = [];

  constructor(
    private auth: Auth,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  createBooking() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.bookingService.createBooking({
      category: this.category,
      serviceType: this.serviceType,
      applianceType: this.applianceType,
      brand: this.brand,
      model: this.model,
      longitude: this.longitude ?? undefined,
      latitude: this.latitude ?? undefined
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = res.message;
        this.applianceType = '';
        this.brand = '';
        this.model = '';
        this.loadBookings();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to create booking';
      }
    });
  }

  loadBookings() {
    this.loadingBookings = true;

    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings = res;
        this.loadingBookings = false;
      },
      error: () => {
        this.loadingBookings = false;
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
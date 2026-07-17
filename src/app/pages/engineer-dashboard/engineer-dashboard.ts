import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { BookingItem, BookingService } from '../../services/booking';
import { SocketService } from '../../services/socket';

@Component({
  selector: 'app-engineer-dashboard',
  imports: [CommonModule],
  templateUrl: './engineer-dashboard.html',
  styleUrl: './engineer-dashboard.scss'
})
export class EngineerDashboard implements OnInit {
  bookings: BookingItem[] = [];
  incomingRequests: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private bookingService: BookingService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.socketService.connect();
    this.loadBookings();

    this.socketService.incomingRequest$.subscribe((request) => {
      this.incomingRequests.unshift(request);
    });

    this.socketService.bookingStatusUpdated$.subscribe(() => {
      this.loadBookings();
    });
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings = res;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load bookings';
        this.loading = false;
      }
    });
  }

  respondToBooking(id: string, response: 'ACCEPT' | 'REJECT') {
    this.bookingService.respondToBooking(id, response).subscribe({
      next: () => {
        this.incomingRequests = this.incomingRequests.filter((b) => b.bookingId !== id);
        this.loadBookings();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to respond to booking');
      }
    });
  }

  updateStatus(id: string, status: 'ENGINEER_ENROUTE' | 'ARRIVED' | 'COMPLETED') {
    this.bookingService.updateBookingStatus(id, status).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update booking status');
      }
    });
  }

  logout() {
    this.socketService.disconnect();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
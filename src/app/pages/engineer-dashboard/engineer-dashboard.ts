import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { BookingItem, BookingService } from '../../services/booking';
import { SocketService } from '../../services/socket';
import { EngineerService } from '../../services/engineer';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-engineer-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './engineer-dashboard.html',
  styleUrl: './engineer-dashboard.scss'
})
export class EngineerDashboard implements OnInit {
  bookings: BookingItem[] = [];
  incomingRequests: any[] = [];
  loading = false;
  errorMessage = '';
  isOnline = false;
  statusLoading = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private bookingService: BookingService,
    private socketService: SocketService,
    private engineerService: EngineerService
  ) {}

  ngOnInit(): void {
    this.socketService.connect();
    this.loadBookings();
    this.loadProfile();

    this.socketService.incomingRequest$.subscribe((request) => {
      this.incomingRequests.unshift(request);
    });

    this.socketService.bookingStatusUpdated$.subscribe(() => {
      this.loadBookings();
    });
  }

  loadProfile() {
    this.engineerService.getMyProfile().subscribe({
      next: (profile) => {
        this.isOnline = profile.status === 'ONLINE';
      },
      error: () => {}
    });
  }

  toggleStatus() {
    this.statusLoading = true;
    const newStatus = this.isOnline ? 'OFFLINE' : 'ONLINE';

    this.engineerService.toggleStatus(newStatus).subscribe({
      next: () => {
        this.isOnline = newStatus === 'ONLINE';
        this.statusLoading = false;
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update status');
        this.statusLoading = false;
      }
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

    updateStatus(id: string, status: string) {
    this.bookingService.updateBookingStatus(id, status).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update booking status');
      }
    });
  }

    otpInputMap: { [bookingId: string]: string } = {};
  sparePartsMap: { [bookingId: string]: number } = {};

  verifyOtp(bookingId: string) {
    const otp = this.otpInputMap[bookingId];
    if (!otp || otp.length !== 4) {
      alert('Please enter the 4-digit OTP shared by the customer');
      return;
    }

    this.bookingService.verifyOtp(bookingId, otp).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to verify OTP');
      }
    });
  }

  submitDiagnosis(bookingId: string, outcome: 'RESOLVED' | 'PENDING_PARTS') {
    const spareParts = this.sparePartsMap[bookingId];

    this.bookingService.submitDiagnosis(bookingId, outcome, spareParts).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to submit diagnosis');
      }
    });
  }

  logout() {
    this.socketService.disconnect();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
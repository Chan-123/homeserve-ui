import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { BookingItem, BookingService } from '../../services/booking';
import { SocketService } from '../../services/socket';
import { ReviewService } from '../../services/review';

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

  bookings: BookingItem[] = [];
  loading = false;
  loadingBookings = false;
  successMessage = '';
  errorMessage = '';
  locationSearch = '';
  incomingDraft: any = null;
  incomingSelectedService: any = null;
  selectedServiceTitle = '';
  showDraftBanner = false;
  showConfirmBooking = false;

  ratingMap: { [bookingId: string]: number } = {};
  reviewTextMap: { [bookingId: string]: string } = {};
  submittedReviewIds: string[] = [];

  constructor(
    private auth: Auth,
    private router: Router,
    private bookingService: BookingService,
    private socketService: SocketService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const nav = history.state;
    this.incomingDraft = nav?.bookingDraft || null;
    this.incomingSelectedService = nav?.selectedService || null;

    if (this.incomingDraft) {
      this.applyIncomingDraft();
      this.showDraftBanner = true;
      this.showConfirmBooking = true;
      this.selectedServiceTitle = this.incomingSelectedService?.title || this.incomingDraft?.category || '';

      setTimeout(() => {
        this.scrollToBookingCard();
      }, 200);
    }

    this.socketService.connect();
    this.loadBookings();

    this.socketService.bookingStatusUpdated$.subscribe(() => {
      this.loadBookings();
    });

    this.loadMyReviews();
  }

    applyIncomingDraft() {
    const draft = this.incomingDraft;
    if (!draft) return;

    this.locationSearch = draft.locationSearch || '';
    this.category = (draft.category || this.category).toUpperCase();

    if (draft.serviceType === 'Installation') {
      this.serviceType = 'INSTALLATION';
    } else if (draft.serviceType === 'Service') {
      this.serviceType = 'SERVICE';
    } else if (draft.serviceType === 'ElectricianAssistance') {
      this.serviceType = 'ELECTRICIAN_ASSISTANCE';
    }

    this.applianceType = draft.applianceType || '';
    this.brand = draft.brand || '';
    this.model = draft.model || '';

    this.latitude = draft.latitude ? Number(draft.latitude) : this.latitude;
    this.longitude = draft.longitude ? Number(draft.longitude) : this.longitude;
  }

    scrollToBookingCard() {
    const el = document.getElementById('booking-card');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

    confirmDraftBooking() {
    this.showConfirmBooking = false;
    this.showDraftBanner = false;
    this.createBooking();
  }

    dismissDraft() {
    this.showConfirmBooking = false;
    this.showDraftBanner = false;
    this.incomingDraft = null;
    this.incomingSelectedService = null;
    this.selectedServiceTitle = '';
  }

  createBooking() {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    
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
        this.successMessage = res.message || 'Booking created successfully';
        this.loading = false;
        this.loadBookings();
        
        this.locationSearch = '';
        this.applianceType = '';
        this.brand = '';
        this.model = '';
        this.selectedServiceTitle = '';
        this.showConfirmBooking = false;
        this.showDraftBanner = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create booking';
        this.loading = false;
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

    loadMyReviews() {
    this.reviewService.getMyReviews().subscribe({
      next: (reviews) => {
        this.submittedReviewIds = reviews.map((item: any) => item.bookingId?._id || item.bookingId);
      },
      error: () => {}
    });
  }

  submitReview(bookingId: string) {
    const rating = this.ratingMap[bookingId];
    const reviewText = this.reviewTextMap[bookingId] || '';

    if (!rating || rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5');
      return;
    }

    this.reviewService.createReview({
      bookingId,
      rating,
      reviewText
    }).subscribe({
      next: () => {
        this.submittedReviewIds.push(bookingId);
        this.loadMyReviews();
        this.successMessage = 'Review submitted successfully';
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to submit review');
      }
    });
  }

  hasReviewed(bookingId: string): boolean {
    return this.submittedReviewIds.includes(bookingId);
  }

  logout() {
    this.socketService.disconnect();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
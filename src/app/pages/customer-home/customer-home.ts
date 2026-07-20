import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { BookingItem, BookingService } from '../../services/booking';
import { SocketService } from '../../services/socket';
import { ReviewService } from '../../services/review';
import { BookingFormComponent, BookingFormData } from '../../shared/booking-form/booking-form';

@Component({
  selector: 'app-customer-home',
  imports: [CommonModule, FormsModule, BookingFormComponent],
  templateUrl: './customer-home.html',
  styleUrl: './customer-home.scss'
})
export class CustomerHome implements OnInit {
  bookings: BookingItem[] = [];
  loading = false;
  loadingBookings = false;
  successMessage = '';
  errorMessage = '';
  showSuccessSplash = false;
  incomingDraft: any = null;
  incomingSelectedService: any = null;
  selectedServiceTitle = '';
  showDraftBanner = false;
  showConfirmBooking = false;
  selectedServiceIcon = '🛠️';
  draftData: BookingFormData | null = null;

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
      this.selectedServiceIcon = this.getServiceIcon(this.selectedServiceTitle);

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

    scrollToBookingCard() {
    const el = document.getElementById('booking-card');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  applyIncomingDraft() {
    const draft = this.incomingDraft;
    if (!draft) return;

    this.draftData = {
      locationSearch: draft.locationSearch || '',
      category: (draft.category || 'ELECTRICAL').toUpperCase(),
      serviceType: (draft.serviceType || 'SERVICE').toUpperCase(),
      applianceType: draft.applianceType || '',
      brand: draft.brand || '',
      model: draft.model || '',
      latitude: draft.latitude ? String(draft.latitude) : '',
      longitude: draft.longitude ? String(draft.longitude) : ''
    };

    this.selectedServiceTitle = this.incomingSelectedService?.title || this.draftData.category || '';
  }

    getServiceIcon(serviceName: string): string {
    const value = (serviceName || '').toLowerCase();

    if (value.includes('electrical')) return '⚡';
    if (value.includes('plumbing')) return '💧';
    if (value.includes('carpenter')) return '🪚';
    if (value.includes('appliance')) return '🛠️';
    if (value.includes('emergency')) return '🚨';

    return '🛠️';
  }

  confirmDraftBooking() {
    if (!this.draftData) return;
    this.showConfirmBooking = false;
    this.showDraftBanner = false;
    this.submitBookingForm(this.draftData);
  }

  dismissDraft() {
    this.showConfirmBooking = false;
    this.showDraftBanner = false;
    this.incomingDraft = null;
    this.incomingSelectedService = null;
    this.selectedServiceTitle = '';
    this.selectedServiceIcon = this.getServiceIcon('Electrical');
  }

  submitBookingForm(data: BookingFormData) {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const serviceTypeMap: { [key: string]: string } = {
      Installation: 'INSTALLATION',
      Service: 'SERVICE',
      ElectricianAssistance: 'ELECTRICIAN_ASSISTANCE',
      INSTALLATION: 'INSTALLATION',
      SERVICE: 'SERVICE',
      ELECTRICIAN_ASSISTANCE: 'ELECTRICIAN_ASSISTANCE'
    };

    this.bookingService.createBooking({
      category: data.category.toUpperCase(),
      serviceType: serviceTypeMap[data.serviceType] || 'SERVICE',
      applianceType: data.applianceType,
      brand: data.brand,
      model: data.model,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      latitude: data.latitude ? Number(data.latitude) : undefined
    }).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Booking created successfully';
        this.loading = false;
        this.loadBookings();

        this.showSuccessSplash = true;
        setTimeout(() => {
          this.showSuccessSplash = false;
        }, 2200);

        this.draftData = null;
        this.selectedServiceTitle = '';
        this.selectedServiceIcon = this.getServiceIcon('Electrical');
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
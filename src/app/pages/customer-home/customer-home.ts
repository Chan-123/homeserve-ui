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
  showSuccessSplash = false;
  incomingDraft: any = null;
  incomingSelectedService: any = null;
  selectedServiceTitle = '';
  showDraftBanner = false;
  showConfirmBooking = false;
  locating = false;
  detectedArea = '';
  selectedServiceIcon = '🛠️';

  applianceOptionsMap: { [key: string]: string[] } = {
    ELECTRICAL: [
      'Washing Machine',
      'Refrigerator',
      'Air Conditioner',
      'Fan',
      'Switch Board',
      'Motor',
      'Geyser'
    ],
    PLUMBING: [
      'Tap',
      'Pipe',
      'Wash Basin',
      'Shower',
      'Toilet',
      'Kitchen Sink',
      'Water Tank'
    ],
    CARPENTER: [
      'Door',
      'Window',
      'Cupboard',
      'Table',
      'Chair',
      'Bed',
      'Shelf'
    ]
  };

  serviceTypeOptionsMap: { [key: string]: string[] } = {
    ELECTRICAL: ['INSTALLATION', 'SERVICE', 'ELECTRICIAN_ASSISTANCE'],
    PLUMBING: ['INSTALLATION', 'SERVICE'],
    CARPENTER: ['INSTALLATION', 'SERVICE']
  };

  brandOptionsMap: { [key: string]: string[] } = {
    'Washing Machine': ['LG', 'Samsung', 'Whirlpool', 'IFB', 'Bosch'],
    'Refrigerator': ['LG', 'Samsung', 'Whirlpool', 'Godrej', 'Haier'],
    'Air Conditioner': ['Daikin', 'LG', 'Samsung', 'Voltas', 'Blue Star'],
    'Fan': ['Usha', 'Havells', 'Crompton', 'Orient'],
    'Geyser': ['Racold', 'V-Guard', 'Bajaj', 'Havells'],
    'Tap': ['Jaquar', 'Hindware', 'Parryware'],
    'Pipe': ['Ashirvad', 'Finolex', 'Supreme'],
    'Wash Basin': ['Jaquar', 'Hindware', 'Cera'],
    'Toilet': ['Parryware', 'Hindware', 'Cera'],
    'Door': ['Godrej', 'Greenply', 'CenturyPly'],
    'Window': ['Fenesta', 'Greenply'],
    'Cupboard': ['Godrej', 'Ikea', 'Nilkamal'],
    'Table': ['Ikea', 'Nilkamal', 'Durian'],
    'Chair': ['Ikea', 'Nilkamal', 'Durian'],
    'Bed': ['Wakefit', 'Durian', 'Ikea']
  };

  modelOptionsMap: { [key: string]: string[] } = {
    LG: ['LG123', 'LG456', 'LG789'],
    Samsung: ['SAM100', 'SAM220', 'SAM330'],
    Whirlpool: ['WH100', 'WH200'],
    IFB: ['IFB6KG', 'IFB7KG'],
    Bosch: ['BOSCHX1', 'BOSCHX2'],
    Daikin: ['DAI-1T', 'DAI-1.5T'],
    Voltas: ['VOLT125', 'VOLT183'],
    'Blue Star': ['BS-SPLIT-1', 'BS-WIN-2'],
    Usha: ['USHA-A1', 'USHA-A2'],
    Havells: ['HAV-G1', 'HAV-G2'],
    Crompton: ['CROM-AIR', 'CROM-HS'],
    Orient: ['ORI-56', 'ORI-48'],
    Racold: ['RAC-10L', 'RAC-15L'],
    'V-Guard': ['VG-10', 'VG-15'],
    Bajaj: ['BAJ-GL', 'BAJ-SH'],
    Jaquar: ['JQ-101', 'JQ-202'],
    Hindware: ['HW-11', 'HW-22'],
    Parryware: ['PW-10', 'PW-20'],
    Ashirvad: ['ASH-P1', 'ASH-P2'],
    Finolex: ['FIN-100', 'FIN-200'],
    Supreme: ['SUP-11', 'SUP-22'],
    Cera: ['CER-1', 'CER-2'],
    Godrej: ['GD-100', 'GD-200'],
    Greenply: ['GP-A1', 'GP-A2'],
    CenturyPly: ['CP-10', 'CP-20'],
    Fenesta: ['FEN-1', 'FEN-2'],
    Ikea: ['IK-100', 'IK-200'],
    Nilkamal: ['NK-10', 'NK-20'],
    Durian: ['DUR-1', 'DUR-2'],
    Wakefit: ['WF-78', 'WF-90'],
    Haier: ['HAI-11', 'HAI-22']
  };

  ratingMap: { [bookingId: string]: number } = {};
  reviewTextMap: { [bookingId: string]: string } = {};
  submittedReviewIds: string[] = [];

    get applianceOptions(): string[] {
    return this.applianceOptionsMap[this.category] || [];
  }

  get serviceTypeOptions(): string[] {
    return this.serviceTypeOptionsMap[this.category] || [];
  }

  get brandOptions(): string[] {
    return this.brandOptionsMap[this.applianceType] || [];
  }

  get modelOptions(): string[] {
    return this.modelOptionsMap[this.brand] || [];
  }

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

    if (this.latitude && this.longitude) {
      this.detectedArea = this.locationSearch || `Lat ${this.latitude}, Lng ${this.longitude}`;
    }

    this.onCategoryChange();
  }

    scrollToBookingCard() {
    const el = document.getElementById('booking-card');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

    useCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in this browser');
      return;
    }

    this.locating = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        this.latitude = Number(position.coords.latitude.toFixed(6));
        this.longitude = Number(position.coords.longitude.toFixed(6));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${this.latitude}&lon=${this.longitude}`
          );
          const data = await response.json();

          const address = data?.address || {};
          const areaName =
            address.suburb ||
            address.neighbourhood ||
            address.city_district ||
            address.village ||
            address.town ||
            address.city ||
            'Current Location Selected';

          this.locationSearch = areaName;
          this.detectedArea = data?.display_name || areaName;
        } catch {
          this.locationSearch = 'Current Location Selected';
          this.detectedArea = `Lat ${this.latitude}, Lng ${this.longitude}`;
        }

        this.locating = false;
      },
      () => {
        this.locating = false;
        alert('Unable to fetch current location');
      }
    );
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

    onCategoryChange() {
    const applianceOptions = this.applianceOptions;
    if (!applianceOptions.includes(this.applianceType)) {
      this.applianceType = '';
    }

    const serviceTypeOptions = this.serviceTypeOptions;
    if (!serviceTypeOptions.includes(this.serviceType)) {
      this.serviceType = serviceTypeOptions[0] || 'SERVICE';
    }

    this.brand = '';
    this.model = '';
    this.selectedServiceIcon = this.getServiceIcon(this.category);
    this.selectedServiceTitle = this.selectedServiceTitle || this.category;
  }

    onApplianceChange() {
    const brandOptions = this.brandOptions;
    if (!brandOptions.includes(this.brand)) {
      this.brand = '';
    }
    this.model = '';
  }

    onBrandChange() {
    const modelOptions = this.modelOptions;
    if (!modelOptions.includes(this.model)) {
      this.model = '';
    }
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
    this.selectedServiceIcon = this.getServiceIcon(this.category);
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

        this.showSuccessSplash = true;
        setTimeout(() => {
          this.showSuccessSplash = false;
        }, 2200);

        this.locationSearch = '';
        this.applianceType = '';
        this.brand = '';
        this.model = '';
        this.selectedServiceTitle = '';
        this.selectedServiceIcon = this.getServiceIcon(this.category);
        this.detectedArea = '';
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
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BookingFormData {
  locationSearch: string;
  category: string;
  serviceType: string;
  applianceType: string;
  brand: string;
  model: string;
  latitude: string;
  longitude: string;
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-form.html',
  styleUrl: './booking-form.scss'
})
export class BookingFormComponent implements OnInit, OnChanges {
  @Input() initialData: Partial<BookingFormData> | null = null;
  @Input() selectedServiceTitle = '';
  @Input() mode: 'draft' | 'booking' = 'draft';
  @Input() submitLabel = 'Continue';
  @Input() loading = false;
  @Input() categoryOptions: { value: string; label: string }[] = [
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Carpenter', label: 'Carpenter' }
  ];

  @Output() continueDraft = new EventEmitter<BookingFormData>();
  @Output() submitBooking = new EventEmitter<BookingFormData>();

  form: BookingFormData = {
    locationSearch: '',
    category: 'Electrical',
    serviceType: 'Service',
    applianceType: '',
    brand: '',
    model: '',
    latitude: '',
    longitude: ''
  };

  locating = false;
  detectedArea = '';

  applianceOptionsMap: { [key: string]: string[] } = {
    Electrical: ['Washing Machine', 'Refrigerator', 'Air Conditioner', 'Fan', 'Switch Board', 'Motor', 'Geyser'],
    Plumbing: ['Tap', 'Pipe', 'Wash Basin', 'Shower', 'Toilet', 'Kitchen Sink', 'Water Tank'],
    Carpenter: ['Door', 'Window', 'Cupboard', 'Table', 'Chair', 'Bed', 'Shelf'],
    ELECTRICAL: ['Washing Machine', 'Refrigerator', 'Air Conditioner', 'Fan', 'Switch Board', 'Motor', 'Geyser'],
    PLUMBING: ['Tap', 'Pipe', 'Wash Basin', 'Shower', 'Toilet', 'Kitchen Sink', 'Water Tank'],
    CARPENTER: ['Door', 'Window', 'Cupboard', 'Table', 'Chair', 'Bed', 'Shelf']
  };

  serviceTypeOptionsMap: { [key: string]: string[] } = {
    Electrical: ['Installation', 'Service', 'ElectricianAssistance'],
    Plumbing: ['Installation', 'Service'],
    Carpenter: ['Installation', 'Service'],
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

  ngOnInit() {
    this.applyInitialData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && !changes['initialData'].firstChange) {
      this.applyInitialData();
    }
  }

  private applyInitialData() {
    if (!this.initialData) return;
    this.form = { ...this.form, ...this.initialData };
    if (this.form.latitude && this.form.longitude && !this.detectedArea) {
      this.detectedArea = this.form.locationSearch || `Lat ${this.form.latitude}, Lng ${this.form.longitude}`;
    }
  }

  get applianceOptions(): string[] {
    return this.applianceOptionsMap[this.form.category] || [];
  }

  get serviceTypeOptions(): string[] {
    return this.serviceTypeOptionsMap[this.form.category] || [];
  }

  get brandOptions(): string[] {
    return this.brandOptionsMap[this.form.applianceType] || [];
  }

  get modelOptions(): string[] {
    return this.modelOptionsMap[this.form.brand] || [];
  }

  onCategoryChange() {
    if (!this.applianceOptions.includes(this.form.applianceType)) {
      this.form.applianceType = '';
      this.form.brand = '';
      this.form.model = '';
    }

    if (!this.serviceTypeOptions.includes(this.form.serviceType)) {
      this.form.serviceType = this.serviceTypeOptions[0] || 'Service';
    }

    if (this.form.brand && !this.brandOptions.includes(this.form.brand)) {
      this.form.brand = '';
      this.form.model = '';
    }

    if (this.form.model && !this.modelOptions.includes(this.form.model)) {
      this.form.model = '';
    }
  }

  onApplianceChange() {
    if (!this.brandOptions.includes(this.form.brand)) {
      this.form.brand = '';
      this.form.model = '';
    }
  }

  onBrandChange() {
    if (!this.modelOptions.includes(this.form.model)) {
      this.form.model = '';
    }
  }

  useCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in this browser');
      return;
    }

    this.locating = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        this.form.latitude = String(Number(position.coords.latitude.toFixed(6)));
        this.form.longitude = String(Number(position.coords.longitude.toFixed(6)));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${this.form.latitude}&lon=${this.form.longitude}`
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

          this.form.locationSearch = areaName;
          this.detectedArea = data?.display_name || areaName;
        } catch {
          this.form.locationSearch = 'Current Location Selected';
          this.detectedArea = `Lat ${this.form.latitude}, Lng ${this.form.longitude}`;
        }

        this.locating = false;
      },
      () => {
        this.locating = false;
        alert('Unable to fetch your current location');
      }
    );
  }

  handleSubmit() {
    if (this.mode === 'draft') {
      this.continueDraft.emit({ ...this.form });
    } else {
      this.submitBooking.emit({ ...this.form });
    }
  }
}
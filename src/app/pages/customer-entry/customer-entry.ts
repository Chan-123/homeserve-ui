import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type Category = 'Electrical' | 'Plumbing' | 'Carpenter';
type ServiceType = 'Installation' | 'Service' | 'ElectricianAssistance';

@Component({
  selector: 'app-customer-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-entry.html',
  styleUrl: './customer-entry.scss'
})
export class CustomerEntry {
  services = [
    {
      title: 'Electrical',
      subtitle: 'Wiring, switch board, washing machine service',
      category: 'Electrical' as Category,
      icon: 'bolt'
    },
    {
      title: 'Plumbing',
      subtitle: 'Leak fixes, tap service, pipe fitting',
      category: 'Plumbing' as Category,
      icon: 'droplet'
    },
    {
      title: 'Carpenter',
      subtitle: 'Door repair, fittings, furniture help',
      category: 'Carpenter' as Category,
      icon: 'hammer'
    },
    {
      title: 'Appliance Service',
      subtitle: 'Installation and service for home appliances',
      category: 'Electrical' as Category,
      icon: 'settings'
    },
    {
      title: 'Emergency Assistance',
      subtitle: 'Fast help for urgent home service issues',
      category: 'Electrical' as Category,
      icon: 'zap'
    }
  ];

  selectedService: any = null;
  showForm = false;
  showAuthPrompt = false;
  locating = false;
  detectedArea = '';

  applianceOptionsMap: { [key: string]: string[] } = {
    Electrical: [
      'Washing Machine',
      'Refrigerator',
      'Air Conditioner',
      'Fan',
      'Switch Board',
      'Motor',
      'Geyser'
    ],
    Plumbing: [
      'Tap',
      'Pipe',
      'Wash Basin',
      'Shower',
      'Toilet',
      'Kitchen Sink',
      'Water Tank'
    ],
    Carpenter: [
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
    Electrical: ['Installation', 'Service', 'ElectricianAssistance'],
    Plumbing: ['Installation', 'Service'],
    Carpenter: ['Installation', 'Service']
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

  form = {
    locationSearch: '',
    latitude: '',
    longitude: '',
    category: 'Electrical' as Category,
    serviceType: 'Service' as ServiceType,
    applianceType: '',
    brand: '',
    model: ''
  };

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

  constructor(private router: Router) {}

  scrollToServices() {
  const el = document.getElementById('services-section');
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

  selectService(service: any) {
    this.selectedService = service;
    this.form.category = service.category;
    this.showForm = true;
    this.showAuthPrompt = false;
    this.onCategoryChange();

    setTimeout(() => {
      const el = document.getElementById('request-panel');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

    onCategoryChange() {
    const applianceOptions = this.applianceOptions;
    if (!applianceOptions.includes(this.form.applianceType)) {
      this.form.applianceType = '';
    }

    const serviceTypeOptions = this.serviceTypeOptions as ServiceType[];
    if (!serviceTypeOptions.includes(this.form.serviceType)) {
      this.form.serviceType = serviceTypeOptions[0] || 'Service';
    }

    this.form.brand = '';
    this.form.model = '';
  }

  onApplianceChange() {
    const brandOptions = this.brandOptions;
    if (!brandOptions.includes(this.form.brand)) {
      this.form.brand = '';
    }
    this.form.model = '';
  }

  onBrandChange() {
    const modelOptions = this.modelOptions;
    if (!modelOptions.includes(this.form.model)) {
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
  continueToAuth() {
    if (
      !this.form.locationSearch ||
      !this.form.category ||
      !this.form.serviceType
    ) {
      alert('Please fill location, category and service type');
      return;
    }

    this.showAuthPrompt = true;

    setTimeout(() => {
      const el = document.getElementById('auth-panel');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  goToLogin() {
    this.router.navigate(['/login'], {
      state: {
        bookingDraft: this.form,
        selectedService: this.selectedService
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register'], {
      state: {
        bookingDraft: this.form,
        selectedService: this.selectedService
      }
    });
  }

  getIcon(icon: string): string {
    switch (icon) {
      case 'bolt':
        return '⚡';
      case 'droplet':
        return '💧';
      case 'hammer':
        return '🪚';
      case 'settings':
        return '🛠️';
      case 'zap':
        return '🚨';
      default:
        return '•';
    }
  }
}
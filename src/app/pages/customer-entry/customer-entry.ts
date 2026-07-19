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

    setTimeout(() => {
      const el = document.getElementById('request-panel');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  useCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in this browser');
      return;
    }

    this.locating = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.form.latitude = String(position.coords.latitude);
        this.form.longitude = String(position.coords.longitude);
        this.form.locationSearch = 'Current Location Selected';
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
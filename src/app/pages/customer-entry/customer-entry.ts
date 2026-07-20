import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingFormComponent, BookingFormData } from '../../shared/booking-form/booking-form';

type Category = 'Electrical' | 'Plumbing' | 'Carpenter';
type ServiceType = 'Installation' | 'Service' | 'ElectricianAssistance';

@Component({
  selector: 'app-customer-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, BookingFormComponent],
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

  draftData: BookingFormData | null = null;

  constructor(private router: Router) {}

  scrollToServices() {
  const el = document.getElementById('services-section');
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

  selectService(service: any) {
    this.selectedService = service;
    this.showForm = true;
    this.showAuthPrompt = false;
    this.draftData = {
      locationSearch: '',
      category: service.category,
      serviceType: 'Service',
      applianceType: '',
      brand: '',
      model: '',
      latitude: '',
      longitude: ''
    };

    setTimeout(() => {
      const el = document.getElementById('request-panel');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  continueToAuth(data: BookingFormData) {
    if (!data.locationSearch || !data.category || !data.serviceType) {
      alert('Please fill location, category and service type');
      return;
    }

    this.draftData = data;
    this.showAuthPrompt = true;

    setTimeout(() => {
      const el = document.getElementById('auth-panel');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  goToLogin() {
    this.router.navigate(['/login'], {
      state: {
        bookingDraft: this.draftData,
        selectedService: this.selectedService
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register'], {
      state: {
        bookingDraft: this.draftData,
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
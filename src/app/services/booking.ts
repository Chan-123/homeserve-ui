import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';

export interface BookingPayload {
  category: string;
  serviceType: string;
  applianceType?: string;
  brand?: string;
  model?: string;
  nameplateImage?: string;
  longitude?: number;
  latitude?: number;
}

export interface BookingItem {
  _id: string;
  customerId: any;
  engineerId?: any;
  category: string;
  serviceType: string;
  applianceType?: string;
  brand?: string;
  model?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient, private auth: Auth) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  createBooking(payload: BookingPayload): Observable<{ message: string; booking: BookingItem }> {
    return this.http.post<{ message: string; booking: BookingItem }>(
      this.baseUrl,
      payload,
      { headers: this.getHeaders() }
    );
  }

  getMyBookings(): Observable<BookingItem[]> {
    return this.http.get<BookingItem[]>(`${this.baseUrl}/my`, {
      headers: this.getHeaders()
    });
  }

  getBookingById(id: string): Observable<BookingItem> {
    return this.http.get<BookingItem>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders() }
    );
  }

  respondToBooking(id: string, response: 'ACCEPT' | 'REJECT'): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${id}/respond`,
      { response },
      { headers: this.getHeaders() }
    );
  }

  updateBookingStatus(
  id: string,
  status: 'ENGINEER_ENROUTE' | 'ARRIVED' | 'COMPLETED'
): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${id}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  cancelBooking(id: string): Observable<{ message: string; booking: BookingItem }> {
    return this.http.patch<{ message: string; booking: BookingItem }>(
      `${this.baseUrl}/${id}/cancel`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
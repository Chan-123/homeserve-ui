import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';

export interface ReviewPayload {
  bookingId: string;
  rating: number;
  reviewText: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private baseUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient, private auth: Auth) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  createReview(payload: ReviewPayload): Observable<any> {
    return this.http.post(this.baseUrl, payload, {
      headers: this.getHeaders()
    });
  }

  getMyReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my`, {
      headers: this.getHeaders()
    });
  }
}
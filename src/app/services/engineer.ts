import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';

export interface NearbyEngineer {
  _id: string;
  name: string;
  phone: string;
  category: string;
  skills: string[];
  status: string;
  availability: string;
  ratingAvg: number;
  ratingCount: number;
  distanceKm: number;
}

@Injectable({ providedIn: 'root' })
export class EngineerService {
  private baseUrl = `${environment.apiUrl}/engineers`;

  constructor(private http: HttpClient, private auth: Auth) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  findNearby(longitude: number, latitude: number, category?: string, skill?: string): Observable<NearbyEngineer[]> {
    let params: any = { longitude, latitude };
    if (category) params.category = category;
    if (skill) params.skill = skill;
    return this.http.get<NearbyEngineer[]>(`${this.baseUrl}/nearby`, { params });
  }

  updateLocation(longitude: number, latitude: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/location`,
      { longitude, latitude },
      { headers: this.getHeaders() }
    );
  }

  toggleStatus(status: 'ONLINE' | 'OFFLINE'): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`, { headers: this.getHeaders() });
  }
}
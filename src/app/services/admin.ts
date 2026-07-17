import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';

export interface PendingEngineer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  approvalStatus: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient, private auth: Auth) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  getPendingEngineers(): Observable<PendingEngineer[]> {
    return this.http.get<PendingEngineer[]>(`${this.baseUrl}/engineers/pending`, {
      headers: this.getHeaders()
    });
  }

  updateEngineerApproval(userId: string, approvalStatus: 'APPROVED' | 'REJECTED'): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/engineers/${userId}/approval`,
      { approvalStatus },
      { headers: this.getHeaders() }
    );
  }
}
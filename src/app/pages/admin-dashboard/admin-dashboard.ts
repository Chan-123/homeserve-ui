import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService, PendingEngineer } from '../../services/admin';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  engineers: PendingEngineer[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private adminService: AdminService,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPendingEngineers();
  }

  loadPendingEngineers() {
    this.loading = true;
    this.errorMessage = '';

    this.adminService.getPendingEngineers().subscribe({
      next: (res) => {
        this.engineers = res;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load engineers';
        this.loading = false;
      }
    });
  }

  updateApproval(userId: string, status: 'APPROVED' | 'REJECTED') {
    this.adminService.updateEngineerApproval(userId, status).subscribe({
      next: () => {
        this.engineers = this.engineers.filter(e => e._id !== userId);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update engineer status');
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
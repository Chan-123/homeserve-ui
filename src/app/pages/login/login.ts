import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  phone = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private auth: Auth, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.loading = true;

    this.auth.login(this.phone, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        const role = res.user.roles;
        if (role === 'ENGINEER') this.router.navigate(['/engineer/dashboard']);
        else if (role === 'ADMIN') this.router.navigate(['/admin']);
        else this.router.navigate(['/customer/home']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}
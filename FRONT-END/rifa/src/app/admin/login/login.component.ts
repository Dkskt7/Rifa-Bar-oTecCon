import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';  // <-- necessário para ngModel
import { CommonModule } from '@angular/common'; // <-- necessário para ngClass, ngIf, ngFor
@Component({
  selector: 'app-admin-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports:[FormsModule, CommonModule]
})
export class LoginComponent {
  user = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.user, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Falha no login';
      }
    });
  }
}

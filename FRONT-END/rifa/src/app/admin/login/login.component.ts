import { Component } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
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
redirectUrl: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit(){
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
  }
  goToHome() {
    this.router.navigate(['/home']);
    }
  submit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.user, this.password).subscribe({
      next: () => {
                sessionStorage.setItem('isAdminSession', 'true');
        this.loading = false;
        if (this.redirectUrl) {
          this.router.navigateByUrl(this.redirectUrl);
        } else {
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Falha no login';
      }
    });
  }
}

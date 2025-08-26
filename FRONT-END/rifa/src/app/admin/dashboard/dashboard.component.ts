import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';  // <-- necessário para ngModel
import { CommonModule } from '@angular/common'; // <-- necessário para ngClass, ngIf, ngFor
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports:[FormsModule, CommonModule]
})
export class DashboardComponent {
  input = ''; 
  message = '';
  loading = false;

  constructor(private api: ApiService) {}

  submit() {
    const nums = this.input.split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));

    if (!nums.length) {
      this.message = 'Digite números separados por vírgula';
      return;
    }

    this.loading = true;
    this.api.postAdminMarcados(nums).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = `Adicionados ${res.adicionados}. Total: ${res.total}`;
      },
      error: (err) => {
        this.loading = false;
        this.message = err.error?.error || 'Erro ao marcar';
      }
    });
  }
}

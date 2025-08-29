import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-planilha',
  templateUrl: './planilha.component.html',
  styleUrls: ['./planilha.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule] 
})
export class AdminPlanilhaComponent implements OnInit {
  usuarios: { nome: string; numeros: number[] }[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getUsuariosCompletos().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar usuários ou não autenticado.';
        this.loading = false;
      }
    });
  }
  goToHome() {
    this.router.navigate(['/home']);
    }
}

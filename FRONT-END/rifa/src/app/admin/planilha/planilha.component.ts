import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getUsuariosCompletos().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.loading = false;
        console.log("Usuários recebidos:", this.usuarios); // 👈 agora sim
      },
      error: (err) => {
        this.error = 'Erro ao carregar usuários ou não autenticado.';
        this.loading = false;
        console.error("Erro na API:", err); // 👈 debug de erro
      }
    });
  }
  
}

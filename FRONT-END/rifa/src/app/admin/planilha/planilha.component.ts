import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-admin-planilha',
  templateUrl: './planilha.component.html',
  styleUrls: ['./planilha.component.scss'],
  standalone:true
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
      },
      error: () => {
        this.error = 'Erro ao carregar usuários ou não autenticado.';
        this.loading = false;
      }
    });
  }
}

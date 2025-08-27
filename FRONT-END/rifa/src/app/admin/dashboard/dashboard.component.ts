import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class DashboardComponent implements OnInit {
  input = ''; // números separados por vírgula
  usuarioInput = ''; // input para novo usuário
  usuarios: string[] = []; // lista de usuários para combo
  usuarioSelecionado = ''; // usuário selecionado
  message = '';
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.api.getUsuarios().subscribe(res => {
      this.usuarios = res;
    });
  }

  submit() {
    const usuario = this.usuarioSelecionado || this.usuarioInput.trim();
    if (!usuario) {
      this.message = 'Digite ou selecione um usuário';
      return;
    }

    const numeros = this.input.split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));

    if (!numeros.length) {
      this.message = 'Digite números separados por vírgula';
      return;
    }

    this.loading = true;
    this.api.postAdminMarcados(usuario, numeros).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = `Usuário ${usuario}: adicionados ${res.adicionados}. Total: ${res.total}`;
        this.input = '';
        this.usuarioInput = '';
        this.usuarioSelecionado = '';
        this.loadUsuarios();
      },
      error: (err) => {
        this.loading = false;
        this.message = err.error?.error || 'Erro ao marcar';
      }
    });
  }
}

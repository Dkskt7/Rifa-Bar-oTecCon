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

  // Modal
  showModal = false;
  email = '';
  sending = false;
  sendMessage = '';

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

  openModal() {
    this.email = '';
    this.sendMessage = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  enviarPlanilha() {
    if (!this.email) return;
    this.sending = true;
    this.sendMessage = '';
    // Chamada real para enviar planilha
    this.api.sendPlanilhaEmail(this.email).subscribe({
      next: () => {
        this.sendMessage = '📧 Planilha enviada com sucesso!';
        this.sending = false;
      },
      error: () => {
        this.sendMessage = '❌ Falha ao enviar a planilha.';
        this.sending = false;
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class HomeComponent implements OnInit {
  numbers = Array.from({ length: 400 }, (_, i) => i + 1);
  marcados = new Set<number>();
  perRow = 15;
  currentPage = 0;
  pageSize = 50; // só para celulares/small
  paginatedNumbers: number[] = [];
  selectedNumbers: number[] = []; // <--- novo
  touchStartX = 0;
touchEndX = 0;

  constructor(private api: ApiService, private router : Router) { }

  ngOnInit() {
    this.calcCols();
    this.calcPagination();
    window.addEventListener('resize', () => {
      this.calcCols();
      this.calcPagination();
    });
    this.loadMarcados();
  
    const board = document.querySelector('.board-wrap') as HTMLElement | null;
    if (board) {
      board.addEventListener('touchstart', (e: Event) => this.onTouchStart(e as TouchEvent));
      board.addEventListener('touchend', (e: Event) => this.onTouchEnd(e as TouchEvent));
    }
  }
  handleSwipe() {
    const deltaX = this.touchEndX - this.touchStartX;
    const swipeThreshold = 50; // mínimo em px para considerar swipe
  
    if (deltaX > swipeThreshold) {
      this.prevPage(); // deslizou para a direita → anterior
    } else if (deltaX < -swipeThreshold) {
      this.nextPage(); // deslizou para a esquerda → próxima
    }
  }
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }
  
  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }
  
  getTotalPages(): number {
    return Math.ceil(this.numbers.length / this.pageSize);
  }
  
  calcCols() {
    const w = window.innerWidth;
    if (w <= 480) this.perRow = 5;
    else if (w < 768) this.perRow = 10;
    else this.perRow = 15;
  }

  calcPagination() {
    const w = window.innerWidth;
  
    if (w <= 480) {
      this.perRow = 5;
    } else if (w < 768) {
      this.perRow = 10;
    } else {
      this.perRow = 10;
    }
  
    if (w <= 768) {
      // Celulares/small: 10 linhas por página
      const linhasVisiveis = 10;
      this.pageSize = this.perRow * linhasVisiveis;
    } else {
      // Telas médias/grandes: 150 números por página
      this.pageSize = 100;
    }
  
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedNumbers = this.numbers.slice(start, end);
  }
  

  nextPage() {
    if ((this.currentPage + 1) * this.pageSize < this.numbers.length) {
      this.currentPage++;
      this.calcPagination();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.calcPagination();
    }
  }

  loadMarcados() {
    this.api.getMarcados().subscribe(arr => {
      this.marcados = new Set(arr);
    });
  }
  goToLogin() {
    this.router.navigate(['/admin/login']);
  }

  goToPlanilha() {
    // navega para login, depois o fluxo de autenticação leva para /admin/planilha
    this.router.navigate(['/admin/login'], { queryParams: { redirect: '/admin/planilha' } });
  }
  isSelected(n: number) {
    return this.marcados.has(n) || this.selectedNumbers.includes(n);
  }
  toggleNumber(n: number) {
    if (this.marcados.has(n)) return; // impede selecionar os já marcados

    const idx = this.selectedNumbers.indexOf(n);
    if (idx >= 0) {
      this.selectedNumbers.splice(idx, 1); // desseleciona
    } else {
      this.selectedNumbers.push(n); // seleciona
    }
  }

  comprarWhatsapp() {
    const numeros = this.selectedNumbers.join(',');
    const msg = `Olá! Gostaria de adquirir o(s) número(s) ${numeros} da rifa!`;
    const url = `https://wa.me/5511990095762?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }
}

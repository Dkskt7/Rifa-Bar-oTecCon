import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
    standalone: true,
    imports:[FormsModule, CommonModule]
})
export class HomeComponent implements OnInit {
  numbers = Array.from({ length: 400 }, (_, i) => i + 1);
  marcados = new Set<number>();
  perRow = 25;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.calcCols();
    window.addEventListener('resize', () => this.calcCols());
    this.loadMarcados();
  }

  calcCols() {
    const w = window.innerWidth;
    if (w <= 480) this.perRow = 5;
    else if (w < 768) this.perRow = 10;
    else this.perRow = 25;
  }

  loadMarcados() {
    this.api.getMarcados().subscribe(arr => {
      this.marcados = new Set(arr);
    });
  }

  isSelected(n: number) { return this.marcados.has(n); }
}

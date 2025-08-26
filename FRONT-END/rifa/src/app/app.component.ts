import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',      // deve bater com <app-root> no index.html
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `<router-outlet></router-outlet>`  // lugar onde as rotas vão renderizar
})
export class AppComponent {}

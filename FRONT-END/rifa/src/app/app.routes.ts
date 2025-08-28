import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './admin/login/login.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AdminGuard } from './auth.guard';
import { AdminPlanilhaComponent } from './admin/planilha/planilha.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'admin/login', component: LoginComponent },
  { path: 'admin/dashboard', component: DashboardComponent, canActivate: [AdminGuard] },
  { path: 'admin/planilha', component: AdminPlanilhaComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '/home' }
];

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from './api.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private api: ApiService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const redirectUrl = state.url; // rota que o usuário tentou acessar

    if (!sessionStorage.getItem('isAdminSession')) {
      // envia para login com query param redirect
      this.router.navigate(['/admin/login'], { queryParams: { redirect: redirectUrl } });
      return of(false);
    }

    return this.api.adminMe().pipe(
      map(res => {
        if (res.ok) return true;
        this.router.navigate(['/admin/login'], { queryParams: { redirect: redirectUrl } });
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/admin/login'], { queryParams: { redirect: redirectUrl } });
        return of(false);
      })
    );
  }
}

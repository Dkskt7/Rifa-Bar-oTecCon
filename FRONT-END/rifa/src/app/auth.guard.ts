import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ApiService } from './api.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private api: ApiService, private router: Router) {}

  canActivate() {
        if (!sessionStorage.getItem('isAdminSession')) {
      this.router.navigate(['/admin/login']);
      return of(false);
    }
    return this.api.adminMe().pipe(
      map(res => {
        if (res.ok) return true;
        this.router.navigate(['/admin/login']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/admin/login']);
        return of(false);
      })
    );
  }
}

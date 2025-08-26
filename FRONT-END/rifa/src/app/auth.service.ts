import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  logged$ = new BehaviorSubject<boolean>(false);

  constructor(private api: ApiService) {
    // checa sessão ao iniciar (persistence)
    this.api.adminMe().subscribe({
      next: r => this.logged$.next(!!r.ok),
      error: () => this.logged$.next(false)
    });
  }

  login(user: string, password: string) {
    return this.api.login(user, password).pipe(
      tap(() => this.logged$.next(true))
    );
  }

  logout() {
    return this.api.logout().pipe(
      tap(() => this.logged$.next(false))
    );
  }
}

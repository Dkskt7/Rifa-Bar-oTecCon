import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environments/environments';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMarcados(): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/marcados`);
  }

  login(user: string, password: string) {
    return this.http.post<{ ok: boolean }>(`${this.base}/login`, { user, password }, { withCredentials: true });
  }

  adminMe() {
    return this.http.get<{ ok: boolean }>(`${this.base}/admin/me`, { withCredentials: true });
  }

  postAdminMarcados(numeros: number[]) {
    return this.http.post(`${this.base}/admin/marcados`, { numeros }, { withCredentials: true });
  }

  logout() {
    return this.http.get(`${this.base}/admin/logout`, { withCredentials: true });
  }
}

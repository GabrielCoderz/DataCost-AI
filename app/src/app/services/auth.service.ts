import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _currentUser = new BehaviorSubject<any | null>(null);
  public currentUser$ = this._currentUser.asObservable();

  private readonly AUTH_API_URL = 'http://localhost:3333/api/v1/users';

  constructor() {
    this.loadUserFromLocalStorage();
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    console.log('AuthService: Tentando fazer login com:', payload);
    return this.http.post<LoginResponse>(`${this.AUTH_API_URL}/auth`, payload)
      .pipe(
        tap(response => {
          console.log('AuthService: Login bem-sucedido!', response);
          this.storeAuthData(response.token, response.name);
          console.log(response)
          this._currentUser.next(response.name);
          this.router.navigate(['/dashboard']);
        }),
        catchError(this.handleError)
      );
  }

  register(payload: any): Observable<any> {
    console.log('AuthService: Tentando registrar usuário:', payload);
    return this.http.post<any>(`${this.AUTH_API_URL}/create`, payload)
      .pipe(
        tap(response => {
          console.log('AuthService: Registro bem-sucedido!', response);
          this.router.navigate(['/login']);
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    console.log('AuthService: Fazendo logout...');
    this.clearAuthData();
    this._currentUser.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private storeAuthData(token: string, user: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  private loadUserFromLocalStorage(): void {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      try {
        const user: LoginResponse = JSON.parse(userString);
        this._currentUser.next(user);
      } catch (e) {
        console.error('Erro ao carregar usuário do localStorage:', e);
        this.clearAuthData();
      }
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      console.error(
        `Código de erro do backend: ${error.status}, ` +
        `Corpo do erro: ${JSON.stringify(error.error)}`
      );
      if (error.status === 401) {
        errorMessage = 'Credenciais inválidas. Por favor, tente novamente.';
      } else if (error.status === 403) {
        errorMessage = 'Acesso negado. Você não tem permissão para esta ação.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Erro ${error.status}: ${error.statusText || 'Erro no servidor'}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}

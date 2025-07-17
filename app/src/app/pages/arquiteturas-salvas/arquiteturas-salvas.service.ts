import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArquiteturasSalvasService {
  private _architectures = new BehaviorSubject<any[]>([]);

  public architectures$: Observable<any[]> = this._architectures.asObservable();

  private readonly apiUrl = 'http://localhost:3333/api/v1/tasks';

  constructor(private http: HttpClient) {
    this.fetchArchitectures()
  }

  private fetchArchitectures(): void {
    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any>(`${this.apiUrl}`, { headers }).pipe(
      tap(data => {
          this._architectures.next(data);
          console.log('Dados da API carregados com sucesso e populados no BehaviorSubject:', data);
        }),
        catchError(error => {
          console.error('Erro ao carregar dados da API:', error);
          this._architectures.next([]);
          return throwError(() => new Error('Falha ao carregar dados da API. Por favor, tente novamente.'));
        })
      ).subscribe();
  }

  getArchitectures() {
    return this.architectures$;
  }

  getOneArchitecture(id: string) {
    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap((data) => {
        console.log(data)
        // this._architectures.next(data);
      }),
      catchError(error => {
        console.error(`Erro ao capturar item com ID ${id} da API:`, error);
        return throwError(() => new Error(`Falha ao capturar item com ID ${id}.`));
      })
    );
  }

  deleteArchitecture(id: string) {
    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(() => {
        const currentItems = this._architectures.value;
        const updatedItems = currentItems.filter(item => item.id !== id);
        this._architectures.next(updatedItems);

        console.log(`Item com ID ${id} removido da lista local.`);
      }),
      catchError(error => {
        console.error(`Erro ao deletar item com ID ${id} da API:`, error);
        return throwError(() => new Error(`Falha ao deletar item com ID ${id}.`));
      })
    ).subscribe();
  }

}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ArquiteturasSalvasService {
  private readonly apiUrl = 'http://localhost:3333/api/v1/tasks';

  constructor(private http: HttpClient) { }

  getArchitectures() {
    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}`, { headers });
  }

}

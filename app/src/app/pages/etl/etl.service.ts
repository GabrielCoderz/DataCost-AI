import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface EtlInput {
  extract: {
    origin: string;
    frequency: string;
    size: string;
  };
  transform: {
    complexity: string;
    frequency: string;
    duration: string;
  };
  load: {
    storeLocation: string;
    needSQL: string;
    needVisualization: string;
  };
}

interface RecommendationAIRequest {
  prompt: string
}

interface SaveRecommendationRequest {
  extractData: string;
  transformData: string;
  loadData: string;
  responseAI: string;
}

@Injectable({
  providedIn: 'root'
})
export class EtlService {
  private readonly apiUrl = 'http://localhost:3333/api/v1/users';
  private readonly apiUrl2 = 'http://localhost:3333/api/v1/tasks';

  constructor(private http: HttpClient) {}

  getRecommendations(data: EtlInput): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  getRecommendationsAI(data: RecommendationAIRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recommendation/ai`, data);
  }

  saveRecommendations(data: SaveRecommendationRequest): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl2}`, data, { headers });
  }
}

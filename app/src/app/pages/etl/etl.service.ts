import { HttpClient } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class EtlService {
  private readonly apiUrl = 'http://localhost:3333/api/v1/users';

  constructor(private http: HttpClient) {}

  getRecommendations(data: EtlInput): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  getRecommendationsAI(data: RecommendationAIRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recommendation/ai`, data);
  }
}

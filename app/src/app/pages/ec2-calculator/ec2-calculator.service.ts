// src/app/ec2-pricing.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Options {
  instanceType?: string;
  memoryGiB: string;
  vcpus: string;
  os: string;
  region: string;
  hours: number;
}

export interface Ec2PriceRequest {
  serviceName: string;
  options: Options
}

export interface OptionsResponse {
  instanceType: string;
  memory: string;
  vcpu: string;
  operatingSystem: string;
  pricePerUnitUSD: string;
  regionName: string;
  unit: string;
}

export interface Ec2PriceResponse {
  currency: string;
  instanceDetails: OptionsResponse
  lowestPriceBRL: number;
  monthlyCostBRL: number;
  lowestPriceUSD: number;
  monthlyCostUSD: number;
  unit: string;
}

@Injectable({
  providedIn: 'root'
})
export class Ec2PricingService {
  // ATENÇÃO: Substitua esta URL pela URL do seu backend Node.js
  private apiUrl = 'http://localhost:3333/api/v1/users/pricing';

  constructor(private http: HttpClient) { }

  getEc2Price(request: Ec2PriceRequest): Observable<Ec2PriceResponse> {
    // Aqui você faria uma requisição POST para o seu backend Node.js
    // que por sua vez, usa a AWS SDK para buscar os preços.
    return this.http.post<Ec2PriceResponse>(this.apiUrl, request);
  }
}

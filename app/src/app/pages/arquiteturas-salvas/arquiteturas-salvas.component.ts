import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { Ec2CalculatorModalComponent } from '../../components/ec2-calculator-modal/ec2-calculator-modal.component';
import { ArquiteturasSalvasService } from './arquiteturas-salvas.service';
import { finalize, map, Observable, tap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ArchitectureResultsDisplayComponent } from '../../components/architecture-results-display/architecture-results-display.component';

@Component({
  selector: 'app-arquiteturas-salvas',
  templateUrl: './arquiteturas-salvas.component.html',
  styleUrls: ['./arquiteturas-salvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    Ec2CalculatorModalComponent,
    ArchitectureResultsDisplayComponent,
  ],
})
export class ArquiteturasSalvasComponent implements OnInit {
  // public savedArchitectures = []
  public savedArchitectures$!: Observable<any[]>;
  public isLoading: boolean = true;
  public details = false
  public results = {}

  constructor(private arquiteturasSalvasService: ArquiteturasSalvasService) { }

  ngOnInit() {
    this.isLoading = true;
    this.savedArchitectures$ = this.arquiteturasSalvasService.getArchitectures().pipe(
      map((architectures: any[]) => {
        return architectures.map(arch => {
          console.log(architectures)
          console.log(arch)
          // Faz o parse duplo para cada parte da arquitetura
          const extract = JSON.parse(arch.extractData);
          const transform = JSON.parse(arch.transformData);
          const load = JSON.parse(arch.loadData);

          const createdAt = arch.createdAt
          const id = arch.id

          const architectureName = arch.architectureName

          const response = JSON.parse(arch.response)

          const extractPrice = response.custoEstimado.porEtapa.extract
          const transformPrice = response.custoEstimado.porEtapa.transform
          const loadPrice = response.custoEstimado.porEtapa.load

          console.log(response)

          const totalPrice = extractPrice + transformPrice + loadPrice

          this.results = {
            architectureName,
            extractData: extract,
            transformData: transform,
            loadData: load,
            totalPrice,
            createdAt,
            ...response,
            id
          }

          return this.results
        })
      }),
      tap((data) => {
        console.log(data)
      }),
      finalize(() => this.isLoading = false)
    );
  }

  seeDetails(id: string) {
    this.arquiteturasSalvasService.getOneArchitecture(id).subscribe(data => {
      const extract = JSON.parse(data.extractData);
      const transform = JSON.parse(data.transformData);
      const load = JSON.parse(data.loadData);

      const createdAt = data.createdAt
      const id = data.id

      const architectureName = data.architectureName

      const response = JSON.parse(data.response)

      const extractPrice = response.custoEstimado.porEtapa.extract
      const transformPrice = response.custoEstimado.porEtapa.transform
      const loadPrice = response.custoEstimado.porEtapa.load

      const totalPrice = extractPrice + transformPrice + loadPrice

      this.results = {
        architectureName,
        extractData: extract,
        transformData: transform,
        loadData: load,
        totalPrice,
        createdAt,
        ...response,
        id
      }

      this.details = true
    })
  }

  deleteRecommendation(id: string) {
    if (confirm('Tem certeza que deseja excluir esta arquitetura do histórico?')) {
      this.arquiteturasSalvasService.deleteArchitecture(id);
    }
  }
}

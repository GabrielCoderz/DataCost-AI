// src/app/ec2-calculator/ec2-calculator.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // ReactiveFormsModule
import { Ec2PricingService, Ec2PriceRequest, Ec2PriceResponse } from './ec2-calculator.service';
import { CommonModule, NgIf, NgFor, CurrencyPipe, DecimalPipe } from '@angular/common'; // CommonModule para diretivas como *ngIf, *ngFor

// Angular Material Modules - Importados DIRETAMENTE no componente standalone
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-ec2-calculator',
  templateUrl: './ec2-calculator.component.html',
  styleUrls: ['./ec2-calculator.component.scss'],
  standalone: true, // Torna este componente standalone
  imports: [ // Importa todos os módulos que este componente usa
    CommonModule, // Para NgIf, NgFor, etc.
    ReactiveFormsModule, // Para formulários reativos
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    DecimalPipe // Para o pipe | number:'1.2-2'
  ]
})
export class Ec2CalculatorComponent implements OnInit {
  ec2Form!: FormGroup;
  isLoading = false;
  priceResult: Ec2PriceResponse | null = null;

  instanceTypes: string[] = [
    't3.micro', 't3.small', 't3.medium', 't3.large',
    'm5.large', 'm5.xlarge', 'm5.2xlarge',
    'c5.large', 'c5.xlarge'
  ];
  operatingSystems: string[] = ['Linux', 'Windows', 'RHEL', 'SUSE'];
  regionNames: string[] = [
    'US East (N. Virginia)',
    'US West (Oregon)',
    'South America (Sao Paulo)', // sa-east-1
    'Europe (Ireland)',
    'Asia Pacific (Singapore)'
  ];

  constructor(
    private fb: FormBuilder,
    private ec2PricingService: Ec2PricingService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.ec2Form = this.fb.group({
      vcpus: ['', Validators.required],
      memoryGiB: ['', Validators.required],
      operatingSystem: ['', Validators.required],
      regionName: ['', Validators.required],
      hoursPerMonth: [730, [Validators.required, Validators.min(1)]]
    });
  }

  calculatePrice(): void {
    if (this.ec2Form.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.priceResult = null;

    const request: Ec2PriceRequest = this.ec2Form.value;

    this.ec2PricingService.getEc2Price(request).subscribe({
      next: (response) => {
        this.priceResult = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao calcular preço:', err);
        this.isLoading = false;
        this.snackBar.open('Erro ao calcular preço. Verifique o console.', 'Fechar', { duration: 5000 });
      }
    });
  }
}

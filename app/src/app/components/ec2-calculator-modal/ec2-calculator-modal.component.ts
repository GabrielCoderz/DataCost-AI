import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Ec2PricingService, Ec2PriceRequest, Ec2PriceResponse } from '../../pages/ec2-calculator/ec2-calculator.service';
import { CommonModule, DecimalPipe } from '@angular/common'; // DecimalPipe para o pipe 'number'
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio'; // Para o radio group
import { Ec2ResultModalComponent, Ec2ResultModalData } from './ec2-result-modal/ec2-result-modal.component';

@Component({
  selector: 'app-ec2-calculator-modal',
  templateUrl: './ec2-calculator-modal.component.html', // Referência ao HTML
  styleUrls: ['./ec2-calculator-modal.component.scss'], // Referência ao SCSS
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatRadioModule, // Adicionado
    DecimalPipe, // Adicionado
  ],
})
export class Ec2CalculatorModalComponent implements OnInit {
  ec2Form!: FormGroup;
  isLoading = false;
  priceResult: Ec2PriceResponse | null = null;

  // Opções para os selects baseadas nas perguntas de engenharia de dados
  vcpusOptions: string[] = ['1', '2', '4', '8', '16', '32', '64'];
  memoryGiBOptions: string[] = ['1', '2', '4', '8', '16', '32', '64', '128'];
  operatingSystems: string[] = ['Linux', 'Windows', 'RHEL', 'SUSE'];
  regionNames: string[] = [
    'US East (N. Virginia)',
    'US West (Oregon)',
    'South America (Sao Paulo)', // sa-east-1
    'Europe (Ireland)',
    'Asia Pacific (Singapore)'
  ];
  usageFrequencies: { value: string; viewValue: string }[] = [
    { value: '730', viewValue: 'Contínua (24h/dia, ~730h/mês)' },
    { value: '320', viewValue: 'Horário Comercial (8h/dia, 5d/sem, ~160h/mês)' }, // Aprox.
    { value: '80', viewValue: 'Uso Irregular/Jobs Pontuais (ex: 80h/mês)' }
  ];
  interruptionTolerances: { value: 'yes' | 'no'; viewValue: string }[] = [
    { value: 'no', viewValue: 'Não (não pode ser interrompida)' },
    { value: 'yes', viewValue: 'Sim (pode ser interrompida, para economia)' }
  ];

  constructor(
    public dialogRef: MatDialogRef<Ec2CalculatorModalComponent>,
    private fb: FormBuilder,
    private ec2PricingService: Ec2PricingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.ec2Form = this.fb.group({
      vcpus: ['', Validators.required],
      memoryGiB: ['', Validators.required],
      operatingSystem: ['', Validators.required],
      regionName: ['', Validators.required],
      hoursPerMonth: [730, [Validators.required, Validators.min(1)]],
      // interruptionTolerance: ['no', Validators.required], // Padrão "não" tolerante
      // Campos que você não exibirá, mas usará para mapear o instanceType no backend
      // instanceType: [''], // Este será determinado no backend
    });

    // Atualiza hoursPerMonth quando usageFrequency muda
    // this.ec2Form.get('hoursPerMonth')?.disable(); // Começa desabilitado
    this.ec2Form.get('usageFrequency')?.valueChanges.subscribe(value => {
      if (value) {
        this.ec2Form.get('hoursPerMonth')?.setValue(parseInt(value, 10));
        this.ec2Form.get('hoursPerMonth')?.disable(); // Mantém desabilitado
      } else {
        this.ec2Form.get('hoursPerMonth')?.enable(); // Se selecionar "Custom", habilita
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  calculatePrice(): void {
    if (this.ec2Form.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.priceResult = null; // Limpa o resultado anterior

    // ATENÇÃO: A lógica para mapear vcpus, memoryGiB e tolerância para um 'instanceType'
    // deve ser feita no seu BACKEND NODE.JS.
    // Aqui estamos enviando os parâmetros que o usuário realmente preenche.
    const rawFormValues = this.ec2Form.getRawValue(); // Usa getRawValue para pegar valores de campos desabilitados
    console.log(rawFormValues)

    // Crie um request que o backend pode usar para sua lógica de recomendação
    const request: Ec2PriceRequest = {
      serviceName: 'ec2',
      options: {
        // operatingSystem: rawFormValues.operatingSystem,
        vcpus: rawFormValues.vcpus,
        memoryGiB: rawFormValues.memoryGiB,
        os: rawFormValues.operatingSystem,
        region: rawFormValues.regionName,
        hours: rawFormValues.hoursPerMonth
      }
      // Estes campos serão usados pelo backend para determinar o instanceType
      // e depois buscar o preço via AWS Pricing API.
      // instanceType: 'DETERMINED_BY_BACKEND', // Placeholder
      // regionName: rawFormValues.regionName,
      // hoursPerMonth: rawFormValues.hoursPerMonth,
      // Adicione outros campos do formulário se forem relevantes para a API de preços
      // interruptionTolerance: rawFormValues.interruptionTolerance
    };

    console.log(request)

    // Chamada ao serviço que se comunica com o backend
    this.ec2PricingService.getEc2Price(request).subscribe({
      next: (response) => {
        this.priceResult = response;
        this.isLoading = false;
        console.log(response)
        this.snackBar.open('Custo calculado com sucesso!', 'Fechar', { duration: 3000 });
        this.openResultModal(response, rawFormValues);
      },
      error: (err) => {
        console.error('Erro ao calcular preço:', err.error);
        this.isLoading = false;
        this.snackBar.open(`Erro: ${err.error.error}`, 'Fechar', { duration: 5000 });
      }
    });
  }

  // Novo método para abrir o modal de resultados
  private openResultModal(priceResponse: Ec2PriceResponse, formValues: any): void {
    console.log(priceResponse)
    // Coleta todos os dados necessários para o modal de resultados
    const resultData: Ec2ResultModalData = {
      monthlyCost: priceResponse.monthlyCostBRL,
      currency: priceResponse.currency,
      // basePriceUnit: priceResponse.basePriceUnit,
      instanceType: priceResponse.instanceDetails.instanceType || 'Desconhecido', // Garante que tem um valor
      vcpus: formValues.vcpus,
      memoryGiB: formValues.memoryGiB,
      operatingSystem: formValues.operatingSystem,
      regionName: formValues.regionName,
      hoursPerMonth: formValues.hoursPerMonth,
      interruptionTolerance: formValues.interruptionTolerance,
    };

    const resultDialogRef = this.dialog.open(Ec2ResultModalComponent, {
      width: '500px', // Largura do modal de resultados
      data: resultData, // Passa os dados para o modal de resultados
      disableClose: true, // Impedir que o modal de resultados feche clicando fora
    });

    resultDialogRef.afterClosed().subscribe(result => {
      if (result === 'goBack') {
        // Se o usuário clicou em "Voltar", não feche o modal da calculadora.
        // O modal da calculadora (this.dialogRef) já está aberto.
        console.log('Voltando ao modal da calculadora...');
      } else {
        // Se o usuário clicou em "Fechar" ou "Salvar", feche o modal da calculadora também.
        console.log('Fechando ambos os modais...');
        this.dialogRef.close();
      }
    });
  }
}

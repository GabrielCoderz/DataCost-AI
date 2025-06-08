import { Component, Inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

// Interface para os dados que o modal de resultados receberá
export interface Ec2ResultModalData {
  monthlyCost: number;
  currency: string;
  basePriceUnit?: string;
  instanceType: string; // Exibir o tipo de instância recomendado
  vcpus: number;
  memoryGiB: number;
  operatingSystem: string;
  regionName: string;
  hoursPerMonth: number;
  interruptionTolerance: string;
  // Você pode adicionar mais detalhes aqui, como preço por unidade em USD, etc.
}

@Component({
  selector: 'app-ec2-result-modal',
  templateUrl: './ec2-result-modal.component.html',
  styleUrls: ['./ec2-result-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    DecimalPipe, // Para formatar números
  ],
})
export class Ec2ResultModalComponent {
  constructor(
    public dialogRef: MatDialogRef<Ec2ResultModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Ec2ResultModalData, // Injeta os dados passados para o modal
    private snackBar: MatSnackBar
  ) {}

  onSave(): void {
    // Implementar a lógica para salvar o resultado (ex: no localStorage, ou enviar para um backend)
    console.log('Resultado a ser salvo:', this.data);
    this.snackBar.open('Resultado salvo com sucesso! (Funcionalidade de salvar a ser implementada)', 'Fechar', { duration: 3000 });
    // Opcional: Fechar o modal após salvar
    // this.dialogRef.close('saved');
  }

  onGoBack(): void {
    // Fecha este modal e indica ao modal anterior para não fechar, ou reabrir
    this.dialogRef.close('goBack'); // Passa um valor para indicar que o usuário quer voltar
  }

  onClose(): void {
    // Fecha o modal de resultados e não faz nada com o modal anterior
    this.dialogRef.close('closed');
  }
}

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Ec2CalculatorModalComponent } from '../../components/ec2-calculator-modal/ec2-calculator-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html', // Referência ao arquivo HTML
  styleUrls: ['./dashboard.component.scss'], // Referência ao arquivo SCSS
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    Ec2CalculatorModalComponent, // Importa o modal para poder usá-lo
  ],
})
export class DashboardComponent {
  constructor(public dialog: MatDialog) {}

  openEc2CalculatorModal(): void {
    const dialogRef = this.dialog.open(Ec2CalculatorModalComponent, {
      width: '450px', // Ajuste a largura conforme necessário
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('O modal foi fechado', result);
      // Aqui você pode processar os dados retornados pelo modal, se houver
    });
  }
}

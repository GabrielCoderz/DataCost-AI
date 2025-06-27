import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { Ec2CalculatorModalComponent } from '../../components/ec2-calculator-modal/ec2-calculator-modal.component';

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
    Ec2CalculatorModalComponent,
  ],
})
export class ArquiteturasSalvasComponent implements OnInit {
  public savedArchitectures = []

  constructor() { }

  ngOnInit() {
  }

}

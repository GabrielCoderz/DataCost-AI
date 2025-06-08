import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators, FormGroup } from '@angular/forms';
import { EtlService } from './etl.service';

@Component({
  selector: 'app-etl',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatCardModule,
    NgFor
  ],
  templateUrl: './etl.component.html',
  styleUrl: './etl.component.scss'
})
export class EtlComponent {
  etlForm: FormGroup;
  isLinear = false;
  results: any;

  constructor(private fb: FormBuilder, private etlService: EtlService) {
    this.etlForm = this.fb.group({
      extract: this.fb.group({
        origin: ['', Validators.required],
        frequency: ['', Validators.required],
        size: ['', Validators.required]
      }),
      transform: this.fb.group({
        complexity: ['', Validators.required],
        frequency: ['', Validators.required],
        duration: ['', Validators.required]
      }),
      load: this.fb.group({
        storeLocation: ['', Validators.required],
        needSQL: ['', Validators.required],
        needVisualization: ['', Validators.required]
      })
    });
  }

  onSubmit() {
    console.log(this.etlForm.value);
    this.etlService.getRecommendations(this.etlForm.value).subscribe({
      next: (result: any) => {
        this.results = result;
        console.log('Recomendações:', this.results);
      },
      error: (err: any) => {
        console.error('Erro ao buscar recomendações:', err);
      }
    });
  }
}

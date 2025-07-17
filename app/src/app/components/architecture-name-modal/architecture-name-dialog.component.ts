import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms'; // Necessário para ngModel

@Component({
  selector: 'app-architecture-name-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './architecture-name-dialog.component.html', // Aponta para o arquivo HTML
  styleUrls: ['./architecture-name-dialog.component.scss'] // Aponta para o arquivo SCSS
})
export class ArchitectureNameDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ArchitectureNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) { }

  onCancel(): void {
    this.dialogRef.close();
  }
}

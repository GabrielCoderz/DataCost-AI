import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router'; // Importar RouterModule

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html', // Usando arquivo HTML separado
  styleUrls: ['./navbar.component.scss'],  // Usando arquivo SCSS separado
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule // Essencial para usar routerLink e routerLinkActive
  ]
})
export class NavbarComponent { }

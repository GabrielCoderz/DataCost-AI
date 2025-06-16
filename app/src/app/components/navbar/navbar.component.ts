import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router'; // Importar RouterModule
import { AuthService } from '../../services/auth.service';

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
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);

  constructor() { }

  ngOnInit(): void {
    // Você pode se inscrever aqui para reagir a mudanças de autenticação
    // ou simplesmente usar o async pipe no template para o currentUser$
  }

  onLogout(): void {
    this.authService.logout();
  }
 }

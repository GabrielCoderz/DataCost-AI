import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para diretivas como *ngIf
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Importa módulos de Formulários Reativos
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule // Adiciona ReactiveFormsModule aqui para usar o formGroup
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(private fb: FormBuilder, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const data = this.loginForm.value;

      this.authService.login(data).subscribe({
        next: (response) => {
          console.log('Login bem-sucedido!', response);
        },
        error: (error) => {
          console.error('Erro no login:', error);
          this.toastr.error('Email/Senha incorretos.', 'Erro ao entrar.');
        }
      });

      this.loginForm.reset();
      this.email?.setValue('');
      this.password?.setValue('');

    } else {
      console.log('Formulário de Login Inválido!');
      this.markAllAsTouched(this.loginForm);
    }
  }

  // Método auxiliar para marcar todos os controles de um FormGroup como 'touched'
  // Isso é útil para exibir mensagens de erro quando o usuário tenta submeter um formulário inválido
  private markAllAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched(); // Marca o controle como "tocado"
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control); // Recursivamente marca sub-FormGroups
      }
    });
  }
}

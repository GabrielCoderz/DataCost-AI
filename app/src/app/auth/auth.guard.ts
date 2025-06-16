// src/app/auth/auth.guard.ts
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

// AuthGuard como uma função (CanActivateFn)
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  const authService = inject(AuthService); // Injeta o AuthService
  const router = inject(Router);       // Injeta o Router para redirecionamento

  // Usa o Observable currentUser$ do AuthService para verificar o status de autenticação
  return authService.currentUser$.pipe(
    take(1), // Garante que pegamos apenas o valor atual e completamos para evitar loops
    map(user => {
      console.log(user)
      if (user) {
        // Se o 'user' existe (está logado), permite o acesso à rota
        return true;
      } else {
        // Se o 'user' não existe (não está logado), redireciona para a página de login
        console.warn('Acesso negado: Usuário não autenticado. Redirecionando para login.');
        router.navigate(['/login']);
        return false; // Bloqueia o acesso à rota
      }
    })
  );
};

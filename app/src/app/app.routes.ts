import { Routes } from '@angular/router';
import { EtlComponent } from './pages/etl/etl.component';
import { Ec2CalculatorComponent } from './pages/ec2-calculator/ec2-calculator.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { authGuard } from './auth/auth.guard';


export const routes: Routes = [
  {
    path: 'recomendador',
    component: EtlComponent,
    canActivate: [authGuard]
  },
  {
    path: 'calculator',
    component: Ec2CalculatorComponent,
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

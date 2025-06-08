import { Routes } from '@angular/router';
import { EtlComponent } from './pages/etl/etl.component';
import { Ec2CalculatorComponent } from './pages/ec2-calculator/ec2-calculator.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';


export const routes: Routes = [
  {
    path: 'recomendador',
    component: EtlComponent
  },
  {
    path: 'calculator',
    component: Ec2CalculatorComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
];

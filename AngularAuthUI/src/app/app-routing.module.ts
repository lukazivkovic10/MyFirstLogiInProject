import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './componets/login/login.component';
import { SignupComponent } from './componets/signup/signup.component';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './componets/dashboard/dashboard.component';

const routes: Routes = [
  {path:'login', component: LoginComponent},
  {path:'signup', component: SignupComponent},
  {path: '', redirectTo: 'login', pathMatch: 'full' },
  {path: 'dashboard', component: DashboardComponent}
  //{path: 'dashboard', canActivate: [authGuard], component: DashboardComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

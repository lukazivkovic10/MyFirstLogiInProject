import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './componets/login/login.component';
import { SignupComponent } from './componets/signup/signup.component';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './componets/dashboard/dashboard.component';
import { UserListComponent } from './componets/user-list/user-list.component';
import { HomeComponent } from './componets/home/home.component';
import { FileDownloadComponent } from './componets/dashboard/file-download/file-download.component';

const routes: Routes = [
  {path:'login',canActivate: [authGuard], component: LoginComponent},
  {path:'signup',canActivate: [authGuard], component: SignupComponent},
  {path: '', redirectTo: 'home', pathMatch: 'full' },
  {path: 'dashboard', component: DashboardComponent},
  {path: 'user-list', component: UserListComponent},
  {path: 'download', component: FileDownloadComponent},
  {path: 'home', component: HomeComponent},
  { path: 'filedownload', component: FileDownloadComponent },
  //{path: 'dashboard', canActivate: [authGuard], component: DashboardComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

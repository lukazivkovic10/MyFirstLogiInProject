import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './componets/login/login.component';
import { SignupComponent } from './componets/signup/signup.component';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './componets/dashboard/dashboard.component';
import { UserListComponent } from './componets/user-list/user-list.component';
import { HomeComponent } from './componets/home/home.component';
import { FileDownloadComponent } from './componets/dashboard/file-download/file-download.component';
import { authloginGuard } from './guards/authlogin.guard';
import { UserDashboardComponent } from './componets/user-dashboard/user-dashboard.component';
import { UserSettingsComponent } from './componets/user-dashboard/user-settings/user-settings.component';
import { ViewGraphComponent } from './componets/dashboard/todo-card/analytics-modal/view-graph/view-graph.component';
import { AnalyticsModalComponent } from './componets/dashboard/todo-card/analytics-modal/analytics-modal.component';

const routes: Routes = [
  {path:'login', canActivate: [authGuard], component: LoginComponent},
  {path:'signup', canActivate: [authGuard], component: SignupComponent},
  {path: '', redirectTo: 'home', pathMatch: 'full' },
  {path: 'dashboard',canActivate: [authloginGuard], component: DashboardComponent},
  {path: 'dashboard/:email/profile',canActivate: [authloginGuard], component: UserDashboardComponent},
  {path: 'dashboard/:email/profile-settings',canActivate: [authloginGuard], component: UserSettingsComponent},
  {path: 'user-list', component: UserListComponent},
  {path: 'download', component: FileDownloadComponent},
  {path: 'home', component: HomeComponent},
  {path: 'filedownload', component: FileDownloadComponent },
  {path: 'analytics/:id', component: AnalyticsModalComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

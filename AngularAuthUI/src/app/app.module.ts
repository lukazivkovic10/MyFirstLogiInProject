//Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgToastModule } from 'ng-angular-popup';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Components
import { AppComponent } from './app.component';
import { LoginComponent } from './componets/login/login.component';
import { SignupComponent } from './componets/signup/signup.component';
import { DashboardComponent } from './componets/dashboard/dashboard.component';
import { HomeComponent } from './componets/home/home.component';
import { NavbarComponent } from './componets/nav-bar/navbar/navbar.component';
import { HeroComponent } from './componets/hero/hero.component';
import { ModelContentDeleteComponent } from './componets/dashboard/models/model-content-delete/model-content-delete.component';
import { ModelContentEditComponent } from './componets/dashboard/models/model-content-edit/model-content-edit.component';
import { ModelContentComponent } from './componets/dashboard/models/model-content/model-content.component';
import { SearchComponent } from './componets/dashboard/search/search.component';
import { ModelTagsComponent } from './componets/dashboard/models/model-tags/model-tags.component';
import { StackedGraphComponent } from './componets/home/graphs/stacked-graph/stacked-graph.component';
import { PercentageGraphComponent } from './componets/home/graphs/percentage-graph/percentage-graph.component';
import { TimelineChartComponent } from './componets/home/graphs/timeline-chart/timeline-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    HomeComponent,
    NavbarComponent,
    HeroComponent,
    ModelContentDeleteComponent,
    ModelContentEditComponent,
    ModelContentComponent,
    SearchComponent,
    ModelTagsComponent,
    StackedGraphComponent,
    PercentageGraphComponent,
    TimelineChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgToastModule,
    HttpClientModule,
    NgApexchartsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'signup',
        component: SignupComponent
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'home',
        component: HomeComponent
      }
    ]),
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

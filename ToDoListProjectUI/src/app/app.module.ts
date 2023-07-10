import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ListDisplayComponent } from './components/list-display/list-display.component';
import { ListSearchComponent } from './components/list-search/list-search.component';
import { ListComponent } from './components/list/list.component';
import { ModelContentComponent } from './components/list-display/models/model-content/model-content.component';
import { ModelContentEditComponent } from './components/list-display/models/model-content-edit/model-content-edit.component';
import { ModelContentDeleteComponent } from './components/list-display/models/model-content-delete/model-content-delete.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ListDisplayComponent,
    ListSearchComponent,
    ListComponent,
    ModelContentComponent,
    ModelContentEditComponent,
    ModelContentDeleteComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    RouterModule.forRoot([
      {
        path: 'home',
        component: HomeComponent
      }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

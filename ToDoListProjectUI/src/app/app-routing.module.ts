import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ListComponent } from './components/list/list.component';
import { ListDisplayComponent } from './components/list-display/list-display.component';
import { ListSearchComponent } from './components/list-search/list-search.component';

const routes: Routes = [
  {path: 'Home', component: HomeComponent},
  {path: 'List', component: ListComponent},
  {path: 'ListDisplay', component: ListDisplayComponent},
  {path: 'ListSearch', component: ListSearchComponent},
  {path: '', redirectTo: 'home', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

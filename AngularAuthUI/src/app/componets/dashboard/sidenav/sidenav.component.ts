import { Component, ElementRef, HostListener } from '@angular/core';
import { DashboardComponent } from '../dashboard.component';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  isExpanded = false;
  showFilter = false;
  barStatus: string = '';

  

  @HostListener('window:resize', ['$event'])
  onResize(vent: Event) {
    this.updateBarStatus();
  }

  updateBarStatus() {
    if (window.innerWidth > 1024) {
      return this.isExpanded ? 'fa-solid fa-caret-left fa-2x' : 'fa-solid fa-caret-right fa-2x';
    } else {
      return this.isExpanded ? 'fa-solid fa-xmark fa-2x' : 'fa-solid fa-bars fa-2x';
    }
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isExpanded = false;
    }
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }
  constructor(public DashComp: DashboardComponent, private elementRef: ElementRef ) 
  {
    this.updateBarStatus();
  }
}

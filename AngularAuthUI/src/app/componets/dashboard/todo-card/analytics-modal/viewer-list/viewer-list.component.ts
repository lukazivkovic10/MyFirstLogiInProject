import { Component, Input } from '@angular/core';
import { AnalyticsService } from 'src/app/services/AnalyticsServices/analytics.service';

interface User {
  email: string;
  viewedAt: Date;
}

@Component({
  selector: 'app-viewer-list',
  templateUrl: './viewer-list.component.html',
  styleUrls: ['./viewer-list.component.css']
})
export class ViewerListComponent {
  @Input() users: User[] = [];
  @Input() id: number = 0;

  constructor(private Analytics: AnalyticsService) {}

  ngOnInit() {
    this.Analytics.getUsersData(this.id).subscribe((response: User[]) => {
      this.users = response;
    });
  }
}

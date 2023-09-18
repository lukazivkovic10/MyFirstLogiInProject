import { Component } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { SignalRService } from './services/signal-r.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AngularAuthUI';
  constructor(
    private toast: NgToastService, private signalRService: SignalRService
  ) { this.signalRService.startConnection(); }

  ngOnInit()
  {
    this.sendNotification;
  }

  sendNotification() {
    const message = 'Hello, SignalR!';
    this.signalRService.sendNotification(message); // Send a notification to the hub
  }
}

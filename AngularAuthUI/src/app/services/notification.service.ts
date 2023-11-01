import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TokenServiceService } from './token-service.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notificationClick: EventEmitter<void> = new EventEmitter<void>();
  private baseUrl:string = "https://localhost:7023/api/Reminder/"

  constructor(private http : HttpClient, private router: Router, private tokenService: TokenServiceService) { }

  CreateNoti(createObj:any)
  {
    return this.http.post(`${this.baseUrl}UstvariReminder`, createObj, { headers: this.tokenService.getRequestHeaders() });
  }

  requestNotificationPermission(): Promise<NotificationPermission> {
    return new Promise<NotificationPermission>((resolve, reject) => {
      if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            resolve(permission);
          } else {
            reject(permission);
          }
        });
      } else {
        // Browser doesn't support Notifications API
        reject('Notifications not supported in this browser');
      }
    });
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, options);
      notification.onclick = (event) => {
        notification.onclick = (event) => {
          this.notificationClick.emit();

          window.focus();

        notification.close(); // Close the notification
      };
    }
  }
 }
}

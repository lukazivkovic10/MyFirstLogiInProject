import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection;

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7023/notificationHub') // SignalR hub URL
      .build();
   }

   startConnection() {
    this.hubConnection
    .start()
    .then(() => {
      console.log('SignalR connection started.');
    })
    .catch((err) => {
      console.error('Error starting SignalR connection: ' + err);
    });
  }

  addNotificationListener(callback: (message: string) => void) {
    this.hubConnection.on('ReceiveNotification', (message: string) => {
      callback(message);
    });
  }

  sendNotification(message: string) {
    this.hubConnection.invoke('SendNotification', message)
      .catch(error => console.error(error));
  }
}

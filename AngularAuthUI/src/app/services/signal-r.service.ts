import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection;

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.hubUrl) // SignalR hub URL
      .build();
   }

   startConnection() {
    this.hubConnection
    .start()
    .then(() => {
    })
    .catch((err) => {
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

import { Injectable } from '@angular/core';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    socket!: Socket;

    constructor() { 
        this.socket = io(environment.backendApiUrl, { autoConnect: false, withCredentials: true });

        this.events(this.socket);
    }

    connect(): void {
        if (!this.socket.connected)
            this.socket.connect();
    }

    disconnect(): void {
        if (this.socket.connected)
            this.socket.disconnect();
    }

    events(socket: Socket): void {
        if (!environment.production) {
            socket.onAny((event, ...args) => {

                console.log(event, args);
            });
        }
    }
}

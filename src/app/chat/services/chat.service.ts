import { Injectable } from '@angular/core';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    socket!: Socket;

    constructor() { 
        this.socket = io(environment.backendApiUrl, { autoConnect: false });

        this.events(this.socket);

        setTimeout(() => {
            this.disconnect();
        }, 5000);
    }

    connect(): void {
        this.socket.connect();
    }

    disconnect(): void {
        this.socket.disconnect();
    }

    events(socket: Socket): void {
        socket.on("welcome", (args) => {
            console.log(args);
        });
    }
}

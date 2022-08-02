import { Component } from '@angular/core';
import { ChatSocketService } from './chat/services/chat-socket.service';
import { ChatService } from './chat/services/chat.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    
    constructor(private chatService: ChatService,
                private chatSocket: ChatSocketService) {
        chatService.registerSocketEvents(chatSocket.socket);
    }

}

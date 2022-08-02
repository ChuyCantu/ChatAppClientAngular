import { Component } from '@angular/core';

import { ChatService } from '../../services/chat.service';
import { FriendRelation } from '../../interfaces/chat-events';

@Component({
    selector: 'app-main-panel',
    templateUrl: './main-panel.component.html',
    styleUrls: ['./main-panel.component.css']
})
export class MainPanelComponent {

    get activeChatFriendRelation(): FriendRelation | undefined {
        return this.chatService.activeChatFriendRelation;
    }

    constructor(private chatService: ChatService) { }

}

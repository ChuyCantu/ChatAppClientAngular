import { Component } from '@angular/core';

import { ChatService } from '../../services/chat.service';
import { FriendRelation } from '../../interfaces/chat-events';

@Component({
    selector: 'app-main-panel',
    templateUrl: './main-panel.component.html',
    styleUrls: ['./main-panel.component.css']
})
export class MainPanelComponent {

    get showChat(): boolean {
        return !!this.chatService.activeChatFriendRelation
            || this.chatService.chatsMetadata.size > 0;
            // If metadata is > 0, at least one chat has been activated before,
            // and we don't want to unload the chat screen because the emoji component
            // takes some time to load.
    }

    constructor(private chatService: ChatService) { }

}

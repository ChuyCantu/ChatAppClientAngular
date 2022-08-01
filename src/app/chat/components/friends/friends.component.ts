import { Component } from '@angular/core';

import { FriendRelation } from '../../interfaces/chat-events';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrls: ['./friends.component.css']
})
export class FriendsComponent {

    get friends(): FriendRelation[] {
        return this.chatService.friendRelations?.friends || [];
    }

    constructor(private chatService: ChatService) { }

}

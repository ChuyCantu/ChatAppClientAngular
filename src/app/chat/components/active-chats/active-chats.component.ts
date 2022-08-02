import { Component } from '@angular/core';
import { User } from '../../interfaces/chat-events';

import { ChatService, FriendID, Message } from '../../services/chat.service';

@Component({
    selector: 'app-active-chats',
    templateUrl: './active-chats.component.html',
    styleUrls: ['./active-chats.component.css']
})
export class ActiveChatsComponent {

    get messagesMap(): Map<FriendID, Message[]> {
        return this.chatService.messagesMap;
    }

    get activeChatUser(): number {
        return this.chatService.activeChatFriendRelation?.user.id || -1;
    }

    constructor(private chatService: ChatService) { }

    getUserData(userId: number): User {
        const friends = this.chatService.friendRelations?.friends;
        if (friends?.has(userId))
            return friends.get(userId)?.user!;
        else
            return {
                id: -1,
                username: ""
            };
    }

    getLastMessage(messages: Message[]): Message {
        if (messages.length >= 0) 
            return messages[messages.length - 1];
        else
            return {
                from: -1,
                to: -1,
                content: "-- invalid message --",
                sentAt: new Date()  
            };
    }
}

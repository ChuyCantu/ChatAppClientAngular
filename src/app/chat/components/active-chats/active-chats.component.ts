import { Component } from '@angular/core';
import { FriendID, Message, User } from '../../interfaces/chat-events';
import { AppOptionsService } from '../../services/app-options.service';

import { ChatService } from '../../services/chat.service';

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

    constructor(private chatService: ChatService,
                private appOptions: AppOptionsService) { }

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
                sentAt: new Date().toDateString()  
            };
    }

    getUnreadMessages(friendId: number): number {
        return this.chatService.chatsMetadata.get(friendId)?.unreadMessages || 0;
    }

    setActiveChat(friendId: number): void {
        this.chatService.setActiveChat(friendId);
        
        if (this.appOptions.isViewMobile)
            this.appOptions.closeSidePanel();
    }

    isFriendTyping(friendId: number): boolean {
        return this.chatService.chatsMetadata.get(friendId)?.typing || false;
    }
}

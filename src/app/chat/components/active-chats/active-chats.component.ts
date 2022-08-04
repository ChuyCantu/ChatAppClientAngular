import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';

import { AppOptionsService } from '../../services/app-options.service';
import { ChatService } from '../../services/chat.service';
import { FloatingElementComponent } from 'src/app/shared/components/floating-element/floating-element.component';
import { FriendID, FriendRelation, Message, User } from '../../interfaces/chat-events';

@Component({
    selector: 'app-active-chats',
    templateUrl: './active-chats.component.html',
    styleUrls: ['./active-chats.component.css']
})
export class ActiveChatsComponent implements AfterViewInit, OnDestroy {

    @ViewChild("floatingMenu") floatingMenu!: FloatingElementComponent;

    _outsideFloatingMenuClick = (e: Event) => this.hideFloatingMenu(e);

    private menuActionSelectedFriendId!: number;

    get messagesMap(): [FriendID, Message[]][] {
        return [...this.chatService.messagesMap].sort((a, b) => {
            const lastA = new Date(a[1][a[1].length - 1].sentAt);
            const lastB = new Date(b[1][b[1].length - 1].sentAt);
            if (lastA < lastB) return 1;
            else if (lastA > lastB) return -1;
            else return 0;
        });
    }

    // get messagesMap(): Map<FriendID, Message[]> {
    //     return this.chatService.messagesMap;
    // }

    get activeChatUser(): number {
        return this.chatService.activeChatFriendRelation?.user.id || -1;
    }

    constructor(private chatService: ChatService,
                private appOptions: AppOptionsService) { }

    ngAfterViewInit(): void {
        document.addEventListener("click", this._outsideFloatingMenuClick);
    }

    ngOnDestroy(): void {
        document.removeEventListener("click", this._outsideFloatingMenuClick);
    }

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

    showFloatingMenu(e: MouseEvent, friendId: number): void {
        e.stopPropagation();
        this.floatingMenu.show(e.target as HTMLElement);
        this.menuActionSelectedFriendId = friendId;
    }

    hideFloatingMenu(e: Event): void {
        if (this.floatingMenu.isVisible &&
            !this.floatingMenu.containerRef.nativeElement
                .contains(e.target as HTMLElement)) {
            this.floatingMenu.hide();
        }
    }

    // Floating Menu
    clearChat(): void {
        this.chatService.clearMessagesFrom(this.menuActionSelectedFriendId);
    }
}

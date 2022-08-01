import { Component, ElementRef, ViewChild } from '@angular/core';

import { ChatService } from '../../services/chat.service';
import { FriendRelation } from '../../interfaces/chat-events';

@Component({
    selector: 'app-add-friend',
    templateUrl: './add-friend.component.html',
    styleUrls: ['./add-friend.component.css']
})
export class AddFriendComponent {

    @ViewChild("searchInput") searchInputRef!: ElementRef<HTMLInputElement>;

    get pendingRequests(): FriendRelation[] {
        return this.chatService.friendRelations?.pendingRequests || [];
    }

    get friendRequests(): FriendRelation[] {
        return this.chatService.friendRelations?.friendRequests || [];
    }

    constructor(private chatService: ChatService) { }

    sendFriendRequestTo(): void {
        const username: string = this.searchInputRef.nativeElement.value;

        if (username) {
            this.chatService.sendFriendRequestTo(username);
            this.searchInputRef.nativeElement.value = "";
        }
    }

    acceptFriendRequest(friendRequest: FriendRelation): void {
        this.chatService.acceptFriendRequest(friendRequest);
    }

    rejectFriendRequest(friendRequest: FriendRelation): void {
        this.chatService.rejectFriendRequest(friendRequest);
    }

    cancelPendingRequest(pendingRequest: FriendRelation): void {
        this.chatService.cancelPendingRequest(pendingRequest);   
    }
}

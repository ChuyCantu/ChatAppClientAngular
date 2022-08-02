import { Component } from '@angular/core';
import Swal from 'sweetalert2';

import { FriendID, FriendRelation } from '../../interfaces/chat-events';
import { AppOptionsService, SidePanelTab } from '../../services/app-options.service';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrls: ['./friends.component.css']
})
export class FriendsComponent {

    get friends(): Map<FriendID, FriendRelation> {
        return this.chatService.friendRelations.friends;
    }

    constructor(private chatService: ChatService,
                private appOptions: AppOptionsService) { }

    openDeleteFriendConfirmation(friend: FriendRelation): void {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will delete this user from your friends!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteFriend(friend);
            }
        })

    }

    deleteFriend(friend: FriendRelation): void {
        this.chatService.deleteFriend(friend);
    }

    setActiveChat(friendId: number): void {
        this.chatService.setActiveChat(friendId);
        this.appOptions.setSidePanelTab(SidePanelTab.messages);

        if (window.innerWidth < this.appOptions.mobileMaxSize)
            this.appOptions.closeSidePanel();
    }
}

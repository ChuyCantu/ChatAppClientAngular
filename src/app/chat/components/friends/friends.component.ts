import { Component } from '@angular/core';
import Swal from 'sweetalert2';

import { FriendRelation } from '../../interfaces/chat-events';
import { ChatService, FriendID } from '../../services/chat.service';

@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrls: ['./friends.component.css']
})
export class FriendsComponent {

    get friends(): Map<FriendID, FriendRelation> {
        return this.chatService.friendRelations?.friends 
            || new Map<FriendID, FriendRelation>();
    }

    constructor(private chatService: ChatService) { }

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
}

import { Injectable } from '@angular/core';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

import { FriendRelation, FriendRelations, SendFriendRequestReply } from 'src/app/chat/interfaces/chat-events';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    get friendRelations(): FriendRelations | null {
        return this._friendRelations;
    }

    private _friendRelations: FriendRelations | null = null;
    private socket!: Socket;

    constructor() { 
        this.socket = io(environment.backendApiUrl, { autoConnect: false, withCredentials: true });

        this.events(this.socket);
    }

    connect(): void {
        if (!this.socket.connected)
            this.socket.connect();
    }

    disconnect(): void {
        if (this.socket.connected)
            this.socket.disconnect();
    }

    events(socket: Socket): void {
        if (!environment.production) {
            socket.onAny((event, ...args) => {

                console.log(event, args);
            });
        }

        socket.on("friend-relations-loaded", (friendRelations: FriendRelations) => {
            this._friendRelations = friendRelations;
        });

        socket.on("send-friend-request-reply", (reply: SendFriendRequestReply) => {
            if (reply.requestSent) {
                this._friendRelations?.pendingRequests.push(reply.friendRelation!);
            }
        });

        socket.on("new-friend-request", (friendRelation: FriendRelation) => {
            console.log("New friend request from", friendRelation.user.username);
            this._friendRelations?.friendRequests.push(friendRelation);
        });

        socket.on("friend-request-accepted", (friendRelation: FriendRelation) => {
            if (!this._friendRelations) return;

            console.log(friendRelation.user.username, "accepted your friend request");
            const pendingIdx = this._friendRelations.pendingRequests.findIndex((fr) => fr.id === friendRelation.id);
            if (pendingIdx >= 0) this._friendRelations.pendingRequests.splice(pendingIdx, 1);

            this._friendRelations.friends.push(friendRelation);
        });

        socket.on("friend-request-rejected", (friendRelation: FriendRelation) => {
            if (!this._friendRelations) return;

            console.log(friendRelation.user.username, "rejected your friend request");
            const pendingIdx = this._friendRelations.pendingRequests.findIndex((fr) => fr.id === friendRelation.id);
            if (pendingIdx >= 0) this._friendRelations.pendingRequests.splice(pendingIdx, 1);
        });

        socket.on("friend-request-canceled", (friendRelation: FriendRelation) => {
            if (!this._friendRelations) return;

            console.log(friendRelation.user.username, "rejected canceled their friend request");
            const requestIdx = this._friendRelations.friendRequests.findIndex((fr) => fr.id === friendRelation.id);
            if (requestIdx >= 0) this._friendRelations.friendRequests.splice(requestIdx, 1);
        });

        socket.on("friend-deleted", (friend: FriendRelation) => {
            if (!this._friendRelations) return;

            const friendIdx = this._friendRelations.friends.findIndex((fr) => fr.id === friend.id);
            if (friendIdx >= 0) this._friendRelations.friends.splice(friendIdx, 1);

            // TODO: Delete chat and messages if exist
        });
    }

    sendFriendRequestTo(username: string): void {
        this.socket.emit("send-friend-request", {
            to: username
        });
    }

    acceptFriendRequest(friendRequest: FriendRelation): void {
        this.socket.emit("accept-friend-request", friendRequest);
        
        if (!this._friendRelations) return;

        const requestIdx = this._friendRelations.friendRequests.findIndex((fr) => fr.id === friendRequest.id);
        if (requestIdx >= 0) this._friendRelations.friendRequests.splice(requestIdx, 1);

        this._friendRelations.friends.push(friendRequest);
    }

    rejectFriendRequest(friendRequest: FriendRelation): void {
        this.socket.emit("reject-friend-request", friendRequest);
        
        if (!this._friendRelations) return;

        const requestIdx = this._friendRelations.friendRequests.findIndex((fr) => fr.id === friendRequest.id);
        if (requestIdx >= 0) this._friendRelations.friendRequests.splice(requestIdx, 1);
    }

    cancelPendingRequest(pendingRequest: FriendRelation): void {
        this.socket.emit("cancel-pending-request", pendingRequest);

        if (!this._friendRelations) return;

        const pendingIdx = this._friendRelations.pendingRequests.findIndex((fr) => fr.id === pendingRequest.id);
        if (pendingIdx >= 0) this._friendRelations.pendingRequests.splice(pendingIdx, 1);
    }

    deleteFriend(friend: FriendRelation): void {
        this.socket.emit("delete-friend", friend);

        if (!this._friendRelations) return;

        const friendIdx = this._friendRelations.friends.findIndex((fr) => fr.id === friend.id);
        if (friendIdx >= 0) this._friendRelations.friends.splice(friendIdx, 1);

        // TODO: Delete chat and messages if exist
    }
}

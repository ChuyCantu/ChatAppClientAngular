import { Injectable } from '@angular/core';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

import { AuthService } from 'src/app/auth/services/auth.service';
import { FriendRelation, FriendRelationsResponse, SendFriendRequestReply } from 'src/app/chat/interfaces/chat-events';

export type Message = {
    from: number;
    to: number;
    content: string;
    sentAt: Date;
};

export type FriendID = number;

export type FriendRelations = {
    friends: Map<FriendID, FriendRelation>;
    pendingRequests: FriendRelation[];
    friendRequests: FriendRelation[];
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    private socket!: Socket;
    private _friendRelations: FriendRelations | undefined = undefined;
    private _messages = new Map<FriendID, Message[]>();
    private _activeChatFriend: FriendRelation | undefined = undefined;

    get friendRelations(): FriendRelations | undefined {
        return this._friendRelations;
    }

    get activeChatFriendRelation(): FriendRelation | undefined {
        return this._activeChatFriend;
    }

    constructor(private authService: AuthService) { 
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

        socket.on("friend-relations-loaded", (resp: FriendRelationsResponse) => {
            this._friendRelations = {
                friends: new Map<FriendID, FriendRelation>(),
                pendingRequests: resp.pendingRequests,
                friendRequests: resp.friendRequests
            };
            for (let friend of resp.friends) {
                this._friendRelations.friends.set(friend.user.id, friend);
            }

            // TODO: DELETE THIS
            for (let userRelation of this._friendRelations.friends.values()) {
                this.setActiveChat(userRelation.user.id);
                break;
            }
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

            // this._friendRelations.friends.push(friendRelation);
            this._friendRelations.friends.set(friendRelation.user.id, friendRelation);
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

            // const friendIdx = this._friendRelations.friends.findIndex((fr) => fr.id === friend.id);
            // if (friendIdx >= 0) this._friendRelations.friends.splice(friendIdx, 1);
            this._friendRelations.friends.delete(friend.user.id);

            // TODO: Delete chat and messages if exist
        });

        socket.on("new-friend-message", (message: Message) => {
            const friendId = message.from === this.authService.userId ? message.to : message.from;
            if (this._messages.has(friendId))
                this._messages.get(friendId)?.push(message);
            else
                this._messages.set(friendId, [ message ]);
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

        // this._friendRelations.friends.push(friendRequest);
        this._friendRelations.friends.set(friendRequest.user.id, friendRequest);
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

        // const friendIdx = this._friendRelations.friends.findIndex((fr) => fr.id === friend.id);
        // if (friendIdx >= 0) this._friendRelations.friends.splice(friendIdx, 1);
        this._friendRelations.friends.delete(friend.user.id);

        // TODO: Delete chat and messages if exist
    }

    sendMessage(to: number, content: string): void {
        this.socket.emit("send-friend-message", {
            to,
            content
        });
    }

    getMessagesFrom(friendId: number): Message[] {
        return this._messages.get(friendId) || [];
    }

    setActiveChat(friendId: number): void {
        this._activeChatFriend = this.friendRelations?.friends.get(friendId);
    }
}

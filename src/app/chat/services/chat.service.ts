import { Injectable } from '@angular/core';

import { Socket } from 'socket.io-client';

import { AuthService } from 'src/app/auth/services/auth.service';
import { FriendID, FriendRelation, FriendRelations, FriendRelationsResponse, Message, SendFriendRequestReply } from 'src/app/chat/interfaces/chat-events';
import { ChatSocketService, ClientToServerEvents, ServerToClientEvents } from './chat-socket.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    private _friendRelations: FriendRelations = { friends: new Map<FriendID, FriendRelation>(), pendingRequests: [], friendRequests: [] };
    private _messages = new Map<FriendID, Message[]>();
    private _activeChatFriend: FriendRelation | null = null;

    get friendRelations(): FriendRelations {
        return this._friendRelations;
    }

    get activeChatFriendRelation(): FriendRelation | null {
        return this._activeChatFriend;
    }

    get messagesMap(): Map<FriendID, Message[]> {
        return this._messages;
    }

    constructor(private authService: AuthService,
                private chatSocket: ChatSocketService) { 
        authService.onLogin.subscribe(() => {
            chatSocket.connect();
        });

        authService.onLogout.subscribe(() => {
            this.clearAll();
            chatSocket.disconnect();
        });
    }

    //! This should be called in the app.component so anything that depend on these events don't fail
    registerSocketEvents(socket: Socket<ServerToClientEvents, ClientToServerEvents>): void {
        console.log("Registering chat events...");

        socket.on("friend_relations_loaded", (resp: FriendRelationsResponse) => {
            this._friendRelations = {
                friends: new Map<FriendID, FriendRelation>(),
                pendingRequests: resp.pendingRequests,
                friendRequests: resp.friendRequests
            };
            for (let friend of resp.friends) {
                this._friendRelations.friends.set(friend.user.id, friend);
            }
        });

        socket.on("last_friends_message_loaded", (messages: Message[]) => {
            const myId: number = this.authService.userId;
            for (let message of messages) {
                const friendId = message.from === myId ? message.to : message.from;
                if (this._messages.has(friendId))
                    this._messages.get(friendId)?.push(message);
                else
                    this._messages.set(friendId, [message]);
            }
        });

        socket.on("send_friend_request_reply", (reply: SendFriendRequestReply) => {
            if (reply.requestSent) {
                this._friendRelations?.pendingRequests.push(reply.friendRelation!);
            }
        });

        socket.on("new_friend_request", (friendRelation: FriendRelation) => {
            console.log("New friend request from", friendRelation.user.username);
            this._friendRelations?.friendRequests.push(friendRelation);
        });

        socket.on("friend_request_accepted", (friendRelation: FriendRelation) => {
            if (!this._friendRelations) return;

            console.log(friendRelation.user.username, "accepted your friend request");
            const pendingIdx = this._friendRelations.pendingRequests.findIndex((fr) => fr.id === friendRelation.id);
            if (pendingIdx >= 0) this._friendRelations.pendingRequests.splice(pendingIdx, 1);

            this._friendRelations.friends.set(friendRelation.user.id, friendRelation);
        });

        socket.on("friend_request_rejected", (friendRelation: FriendRelation) => {
            if (!this._friendRelations) return;

            console.log(friendRelation.user.username, "rejected your friend request");
            const pendingIdx = this._friendRelations.pendingRequests.findIndex((fr) => fr.id === friendRelation.id);
            if (pendingIdx >= 0) this._friendRelations.pendingRequests.splice(pendingIdx, 1);
        });

        socket.on("friend_request_canceled", (friendRelation: FriendRelation) => {
            if (!this._friendRelations) return;

            console.log(friendRelation.user.username, "rejected canceled their friend request");
            const requestIdx = this._friendRelations.friendRequests.findIndex((fr) => fr.id === friendRelation.id);
            if (requestIdx >= 0) this._friendRelations.friendRequests.splice(requestIdx, 1);
        });

        socket.on("friend_deleted", (friend: FriendRelation) => {
            if (!this._friendRelations) return;

            this._friendRelations.friends.delete(friend.user.id);

            if (this._messages.has(friend.user.id))
                this._messages.delete(friend.user.id);

            if (this._activeChatFriend?.user.id === friend.user.id)
                this._activeChatFriend = null;
        });

        socket.on("new_friend_message", (message: Message) => {
            const friendId = message.from === this.authService.userId ? message.to : message.from;
            if (this._messages.has(friendId))
                this._messages.get(friendId)?.push(message);
            else
                this._messages.set(friendId, [ message ]);
        });

        socket.on("friend_messages_received", (messages: Message[]) => {
            if (messages.length === 0) return;

            let temp: Message[] = [];
            for (let i = messages.length - 1; i >= 0; --i) {
                const message = messages[i];
                temp.push(message);
            }

            const firstMsg = messages[0];
            const friendId = firstMsg.from === this.authService.userId ? firstMsg.to : firstMsg.from;
            if (this._messages.has(friendId))
                this._messages.set(friendId, temp.concat(this._messages.get(friendId)!))
            else
                this._messages.set(friendId, temp);
        });
    }

    sendFriendRequestTo(username: string): void {
        this.chatSocket.emit("send_friend_request", {
            to: username
        });
    }

    acceptFriendRequest(friendRequest: FriendRelation): void {
        this.chatSocket.emit("accept_friend_request", friendRequest);
        
        if (!this._friendRelations) return;

        const requestIdx = this._friendRelations.friendRequests.findIndex((fr) => fr.id === friendRequest.id);
        if (requestIdx >= 0) this._friendRelations.friendRequests.splice(requestIdx, 1);

        this._friendRelations.friends.set(friendRequest.user.id, friendRequest);
    }

    rejectFriendRequest(friendRequest: FriendRelation): void {
        this.chatSocket.emit("reject_friend_request", friendRequest);
        
        if (!this._friendRelations) return;

        const requestIdx = this._friendRelations.friendRequests.findIndex((fr) => fr.id === friendRequest.id);
        if (requestIdx >= 0) this._friendRelations.friendRequests.splice(requestIdx, 1);
    }

    cancelPendingRequest(pendingRequest: FriendRelation): void {
        this.chatSocket.emit("cancel_pending_request", pendingRequest);

        if (!this._friendRelations) return;

        const pendingIdx = this._friendRelations.pendingRequests.findIndex((fr) => fr.id === pendingRequest.id);
        if (pendingIdx >= 0) this._friendRelations.pendingRequests.splice(pendingIdx, 1);
    }

    deleteFriend(friend: FriendRelation): void {
        this.chatSocket.emit("delete_friend", friend);

        if (!this._friendRelations) return;

        this._friendRelations.friends.delete(friend.user.id);

        if (this._messages.has(friend.user.id))
            this._messages.delete(friend.user.id);

        if (this._activeChatFriend?.user.id === friend.user.id)
            this._activeChatFriend = null;
    }

    sendMessage(to: number, content: string): void {
        if (!to || to < 0) return;

        this.chatSocket.emit("send_friend_message", {
            to,
            content
        });
    }

    getMessagesFrom(friendId: number): Message[] {
        return this._messages.get(friendId) || [];
    }

    setActiveChat(friendId: number): void {
        if (this._activeChatFriend?.user.id === friendId) return; 

        this._activeChatFriend = this.friendRelations?.friends.get(friendId) || null;

        this.requestLastMessages(friendId);
    }

    clearActiveChat(): void {
        this._activeChatFriend = null;
    }

    requestLastMessages(friendId: number): void {
        if (friendId < 0 || !this.friendRelations?.friends.has(friendId)) return;

        this.chatSocket.emit("request_friend_messages", {
            friendId: friendId,
            offset: this._messages.get(friendId)?.length || 0,
            limit: 20
        });
    }

    clearFriendRelations():void {
        this._friendRelations.friends.clear();
        this._friendRelations.pendingRequests = [];
        this._friendRelations.friendRequests = [];
    }

    clearMessages():void {
        this._messages.clear();
    }

    clearActiveChatFriend():void {
        this._activeChatFriend = null;
    }

    clearAll(): void {
        this.clearFriendRelations();
        this.clearMessages();
        this.clearActiveChat();
    }
}

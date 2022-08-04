import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Socket } from 'socket.io-client';

import { AuthService } from 'src/app/auth/services/auth.service';
import { FriendID, FriendRelation, FriendRelations, FriendRelationsResponse, Message, SendFriendRequestReply } from 'src/app/chat/interfaces/chat-events';
import { ChatSocketService, ClientToServerEvents, ServerToClientEvents } from './chat-socket.service';

interface ChatMetadata {
    firstLoadDone: boolean;
    canLoadMoreMessages: boolean;
    unreadMessages: number;
    busyLoadingOldMessages: boolean;
    typing: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    onNewMessageReceived: Subject<void> = new Subject<void>();
    onFriendMessagesReceived: Subject<void> = new Subject<void>();
    onActiveChatChanged: Subject<void> = new Subject<void>();

    private _friendRelations: FriendRelations = { friends: new Map<FriendID, FriendRelation>(), pendingRequests: [], friendRequests: [] };
    private _messages = new Map<FriendID, Message[]>();
    private _chatsMetadata = new Map<FriendID, ChatMetadata>();
    private _activeChatFriend: FriendRelation | null = null;
    
    private readonly _maxMessagesPerRequest: number = 20;

    get friendRelations(): FriendRelations {
        return this._friendRelations;
    }

    get activeChatFriendRelation(): FriendRelation | null {
        return this._activeChatFriend;
    }

    get messagesMap(): Map<FriendID, Message[]> {
        return this._messages;
    }

    get chatsMetadata(): Map<FriendID, ChatMetadata> {
        return this._chatsMetadata;
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

        socket.on("friend_relations_loaded", async (resp: FriendRelationsResponse) => {
            this._friendRelations = {
                friends: new Map<FriendID, FriendRelation>(),
                pendingRequests: resp.pendingRequests,
                friendRequests: resp.friendRequests
            };
            for (let friend of resp.friends) {
                this._friendRelations.friends.set(friend.user.id, friend);
            }
        });

        socket.on("last_friends_message_loaded", async (messages: Message[], unreadMessages: { count: number, from: number, to: number }[]) => {
            const myId: number = this.authService.userId;
            for (let message of messages) {
                const friendId = message.from === myId ? message.to : message.from;
                if (this._messages.has(friendId))
                    this._messages.get(friendId)?.push(message);
                else
                    this._messages.set(friendId, [message]);
            }

            for (let message of unreadMessages) {
                const friendId = message.from === myId ? message.to : message.from;
                if (this._chatsMetadata.has(friendId)) {
                    if (this.activeChatFriendRelation?.user.id === friendId)
                        continue;
                    else
                        this._chatsMetadata.get(friendId)!.unreadMessages += message.count;
                }
                else {
                    this._chatsMetadata.set(friendId, {
                        firstLoadDone: false,
                        canLoadMoreMessages: true,
                        unreadMessages: message.count,
                        busyLoadingOldMessages: false,
                        typing: false
                    });
                }
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
                this.clearActiveChat();
        });

        socket.on("new_friend_message", (message: Message) => {
            const friendId = message.from === this.authService.userId ? message.to : message.from;
            if (this._messages.has(friendId))
                this._messages.get(friendId)?.push(message);
            else
                this._messages.set(friendId, [ message ]);

            if (this._chatsMetadata.has(friendId)) {
                if (this.activeChatFriendRelation?.user.id === friendId)
                    this._chatsMetadata.get(friendId)!.unreadMessages = 0;
                else
                    this._chatsMetadata.get(friendId)!.unreadMessages += 1;
            }
            else {
                this._chatsMetadata.set(friendId, {
                    firstLoadDone: false, 
                    canLoadMoreMessages: true, 
                    unreadMessages: 1, 
                    busyLoadingOldMessages: false,
                    typing: false
                });
            }

            this.onNewMessageReceived.next();
        });

        socket.on("friend_messages_received", async (friendId: number, messages: Message[]) => {
            if (this._chatsMetadata.has(friendId)) {
                const metadata = this._chatsMetadata.get(friendId);
                metadata!.canLoadMoreMessages = messages.length === this._maxMessagesPerRequest;
                metadata!.busyLoadingOldMessages = false;
            }
            // else { //* This should never happen since this events is called only on activated chats:
            //     this._chatsMetadata.set(friendId, {
            //         firstLoadDone: false, canLoadMoreMessages: true, 
            //         unreadMessages: 0, busyLoadingOldMessages:true, typing: false
            //     });
            // }

            if (messages.length === 0) return;

            // TODO: When read status is added in the backend, count unread messages and add the to the metadata
            let temp: Message[] = [];
            for (let i = messages.length - 1; i >= 0; --i) {
                const message = messages[i];
                temp.push(message);
            }

            if (this._messages.has(friendId))
                this._messages.set(friendId, temp.concat(this._messages.get(friendId)!))
            else
                this._messages.set(friendId, temp);

            this.onFriendMessagesReceived.next();
        });

        socket.on("friend_typing", (friendId: number, typing: boolean) => {
            if (this._chatsMetadata.has(friendId)) {
                const metadata = this._chatsMetadata.get(friendId);
                metadata!.typing = typing;
            }
            else {
                this._chatsMetadata.set(friendId, {
                    firstLoadDone: false,
                    canLoadMoreMessages: true,
                    unreadMessages: 0,
                    busyLoadingOldMessages: false,
                    typing: typing
                });
            }
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
        if (!friend) return;

        this.chatSocket.emit("delete_friend", friend);

        if (!this._friendRelations) return;

        this._friendRelations.friends.delete(friend.user.id);

        if (this._messages.has(friend.user.id))
            this._messages.delete(friend.user.id);

        if (this._activeChatFriend?.user.id === friend.user.id)
            this.clearActiveChat();
    }

    sendMessage(to: number, content: string): void {
        if (!to || to < 0) return;

        this.chatSocket.emit("send_friend_message", {
            to,
            content
        });
    }

    notifyTyping(to: number, typing: boolean): void {
        this.chatSocket.emit("notify_typing", to, typing);
    }

    getMessagesFrom(friendId: number): Message[] {
        return this._messages.get(friendId) || [];
    }

    setActiveChat(friendId: number): void {
        if (this._activeChatFriend?.user.id === friendId) return; 

        this._activeChatFriend = this.friendRelations?.friends.get(friendId) || null;

        if (this._chatsMetadata.has(friendId)) {
            const metadata = this._chatsMetadata.get(friendId);
            metadata!.unreadMessages = 0;

            if (!metadata!.firstLoadDone) {
                metadata!.firstLoadDone = true;
                this.requestPastMessages(friendId);    
            }
        }
        else {
            this._chatsMetadata.set(friendId, { 
                firstLoadDone: true, 
                canLoadMoreMessages: true, 
                unreadMessages: 0, 
                busyLoadingOldMessages: false,
                typing: false
            });
            this.requestPastMessages(friendId);
        }

        this.onActiveChatChanged.next();
    }

    clearActiveChat(): void {
        this._activeChatFriend = null;

        this.onActiveChatChanged.next();
    }

    requestPastMessages(friendId: number): void {
        if (friendId < 0 || !this.friendRelations?.friends.has(friendId)
            || (this._chatsMetadata.has(friendId) 
            && !this._chatsMetadata.get(friendId)?.canLoadMoreMessages)) 
            return;

        this.chatsMetadata.get(friendId)!.busyLoadingOldMessages = true;

        this.chatSocket.emit("request_friend_messages", {
            friendId: friendId,
            offset: this._messages.get(friendId)?.length || 0,
            limit: this._maxMessagesPerRequest
        });
    }

    clearFriendRelations(): void {
        this._friendRelations.friends.clear();
        this._friendRelations.pendingRequests = [];
        this._friendRelations.friendRequests = [];
    }

    clearMessages(): void {
        this._messages.clear();
    }

    clearMessagesFrom(friendId: number): void {
        if (this._activeChatFriend?.user.id === friendId)
            this.clearActiveChat();

        this._messages.delete(friendId);
    }

    clearAll(): void {
        this.clearFriendRelations();
        this.clearMessages();
        this.clearActiveChat();
    }
}

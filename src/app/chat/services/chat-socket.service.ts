import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { io, Socket } from 'socket.io-client';
import { EventNames } from "@socket.io/component-emitter";


import { FriendRelation, FriendRelationsResponse, Message, SendFriendRequestReply } from '../interfaces/chat-events';

export interface ServerToClientEvents {
    friend_relations_loaded: (resp: FriendRelationsResponse) => void;
    last_friends_message_loaded: (messages: Message[], unreadMessages: { count: number, from: number, to: number }[]) => void;
    send_friend_request_reply: (reply: SendFriendRequestReply) => void;
    new_friend_request: (friendRelation: FriendRelation) => void;
    friend_request_accepted: (friendRelation: FriendRelation) => void;
    friend_request_rejected: (friendRelation: FriendRelation) => void;
    friend_request_canceled: (friendRelation: FriendRelation) => void;
    friend_deleted: (friend: FriendRelation) => void;
    new_friend_message: (message: Message) => void;
    friend_messages_received: (friendId: number, messages: Message[]) => void;
    friend_typing: (friendId: number, typing: boolean) => void;
}

export interface ClientToServerEvents {
    send_friend_request: (data: { to: string }) => void;
    accept_friend_request: (friendRequest: FriendRelation) => void;
    reject_friend_request: (friendRequest: FriendRelation) => void;
    cancel_pending_request: (pendingRequest: FriendRelation) => void;
    delete_friend: (friend: FriendRelation) => void;
    send_friend_message: (data: { to: number, content: string }) => void;
    request_friend_messages: (data: { friendId: number, offset: number, limit: number }) => void;
    notify_typing: (to: number, typing: boolean) => void;
}

@Injectable({
    providedIn: 'root'
})
export class ChatSocketService {

    private _socket!: Socket<ServerToClientEvents, ClientToServerEvents>;

    // Useful to register events from outside of the service
    get socket(): Socket<ServerToClientEvents, ClientToServerEvents> {
        return this._socket;
    }

    constructor() { 
        this._socket = io(environment.backendApiUrl, { autoConnect: false, withCredentials: true });

        if (!environment.production) {
            this._socket.onAny((event, ...args) => {

                console.log(event, args);
            });
        }
    }

    connect(): void {
        if (!this._socket.connected)
            this._socket.connect();
    }

    disconnect(): void {
        if (this._socket.connected)
            this._socket.disconnect();
    }

    emit<Ev extends EventNames<ClientToServerEvents>>(
        ev: Ev, ...args: Parameters<ClientToServerEvents[Ev]>)
        : Socket<ServerToClientEvents, ClientToServerEvents> {
        
        return this._socket.emit(ev, ...args);
    }
}

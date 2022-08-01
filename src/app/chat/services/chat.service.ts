import { Injectable } from '@angular/core';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

import { FriendRelation, FriendRelations } from 'src/app/chat/interfaces/chat-events';

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

        socket.on("load-friend-relations", (friendRelations: FriendRelations) => {
            this._friendRelations = friendRelations;
        });

        socket.on("new-friend-request", ({ from }) => {
            console.log("New friend request from", from);
        });

        socket.on("friend-request-accepted", (friendRelation: FriendRelation) => {
            console.log("New friend request from", friendRelation);
        });

        socket.on("friend-request-rejected", (friendRelation: FriendRelation) => {
            console.log("New friend request from", friendRelation);
        });

        socket.on("friend-request-canceled", (friendRelation: FriendRelation) => {
            console.log("New friend request from", friendRelation);
        });
    }

    sendFriendRequestTo(username: string): void {
        this.socket.emit("send-friend-request", {
            to: username
        });

        // TODO: Add to user to the pending list
    }

    acceptFriendRequest(friendRequest: FriendRelation): void {
        this.socket.emit("accept-friend-request", friendRequest);
        
        // TODO: Delete from list
    }

    rejectFriendRequest(friendRequest: FriendRelation): void {
        this.socket.emit("reject-friend-request", friendRequest);
        
        // TODO: Delete from list
    }

    cancelPendingRequest(pendingRequest: FriendRelation): void {
        this.socket.emit("cancel-pending-request", pendingRequest);

        // TODO: Delete from list
    }
}

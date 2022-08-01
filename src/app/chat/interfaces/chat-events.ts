export interface SendFriendRequestReply {
    requestSent: boolean;
    msg?: string;
    friendRelation?: FriendRelation;
}

export interface FriendRelationsResponse {
    friends: FriendRelation[];
    pendingRequests: FriendRelation[];
    friendRequests: FriendRelation[];
}

export interface FriendRelation {
    id: number;
    user: User;
}

export interface User {
    id: number;
    username: string;
}
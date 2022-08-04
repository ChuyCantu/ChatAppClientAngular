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

export interface Message {
    id?: number;
    from: number;
    to: number;
    content: string;
    sentAt: string; //+ Date string
    readAt: string | null; //+ Date string
};

export interface FriendRelations {
    friends: Map<FriendID, FriendRelation>;
    pendingRequests: FriendRelation[];
    friendRequests: FriendRelation[];
}

export type FriendID = number;

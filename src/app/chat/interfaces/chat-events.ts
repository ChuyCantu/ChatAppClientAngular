export interface FriendRelations {
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
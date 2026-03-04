import type { Bookmark, Comment, Follow, Like, Post, Repost, Share } from "@prisma/client";

export interface userSafeSelect {
    id?: string,
    username?: string,
    firstname?: string,
    lastname?: string,
    phone_number?: string,   
    email?: string,          
    DOB?: string,            
    image_url?: string,
    createdAt?: string,
    posts?: Post[],
    followers?: Follow[],
    following?: Follow[],
    likes?: Like[],
    reposts?: Repost[],
    comments?: Comment[],
    sentShares?: Share[],
    receivedShares?: Share[],
    Bookmarks?: Bookmark[],
};

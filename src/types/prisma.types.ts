import type {
  Bookmark,
  Comment,
  Follow,
  Like,
  MediaType,
  Post,
  PostType,
  Repost,
  Share,
  View,
} from "@prisma/client";

export interface userSafeSelect {
  id?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  phone_number?: string;
  email?: string;
  DOB?: string;
  image_url?: string;
  createdAt?: string;
  posts?: Post[];
  followers?: Follow[];
  following?: Follow[];
  likes?: Like[];
  reposts?: Repost[];
  comments?: Comment[];
  sentShares?: Share[];
  receivedShares?: Share[];
  Bookmarks?: Bookmark[];
}

export interface userPostSelect {
  id: string;
  description: string;
  media?: Media[];
  type?: PostType;
  user?: userSafeSelect;
  userId: string;
  likes?: Like[];
  reposts?: Repost[];
  comments?: Comment[];
  shares?: Share[];
  bookmarks?: Bookmark[];
  views?: View[];
  Analytics?: Analytics;
}

export interface Analytics {
  id?: String;
  postId?: String;
  post?: userPostSelect;

  likeCount?: number;
  commentCount?: number;
  respostCount?: number;
  shareCount?: number;
  bookmarkCount?: number;
  viewCount?: number;
}

export interface userFollowSelect {
  id: string;
  followerId: string;
  follower: userSafeSelect;
  followingId: string;
  following: userSafeSelect;
  createdAt: string;
}

export interface Media {
  id: string;
  url?: string;
  type?: MediaType;
  postId: string;
  post: userPostSelect;
}

export interface userCommentSelect {
  id: string;
  userId: string;
  user: userSafeSelect;
  postId: string;
  post: userPostSelect;

  content: string;
  createdAt: string;
}

export interface userLikeSelect {
  id: string;
  userId: string;
  user: userSafeSelect;
  postId: string;
  post: userPostSelect;
  createdAt: string;
}

export interface userRepostSelect {
  id: string;
  userId: string;
  user: userSafeSelect;
  postId: string;
  post: userPostSelect;
  createdAt: string;
}
export interface userShareSelect {
  id: string;
  senderId: string;
  sender: userSafeSelect;
  receiverId: string;
  receiver: userSafeSelect;
  postId: string;
  post: userPostSelect;
  createdAt: string;
}   

export interface userBookmarkSelect {
  id: string;
  userId: string;
  user: userSafeSelect;
  postId: string;
  post: userPostSelect;
  createdAt: string;
}


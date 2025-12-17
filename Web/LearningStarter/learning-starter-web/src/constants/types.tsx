export type ApiResponse<T> = {
  data: T;
  errors: ApiError[];
  hasErrors: boolean;
};

export type ApiError = {
  property: string;
  message: string;
};

export type AnyObject = {
  [index: string]: any;
};

export type UserDto = {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  universityId: number;
  status: string;
  role: string;

};

export type UserCreateDto ={
  firstName: string;
  lastName: string;
  userName: string;
  password:string;
  email:string;
  universityId: number;
  status: string;

}
export type BlogGetDto =
{
  id: number;
  userId: number;
  categoryId : number;
  blogTitle: string;
  body: string;
  blogImageUrl?: string | null;
  likesCount: number;
  createdDate: string;
  updatedDate: string;
  likedUserIds: number[];
}

export type BlogCreateDto={
  userId: number;
  categoryId : number;
  blogTitle: string;
  body: string;
}

export type UniversitiesGetDto={
  id:number;
  name:string;
}

export type CategoriesGetDto={
  id:number;
  name:string;
}

export type ForumThreadGetDto = {
  id: number;
  userId: number;
  post: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  universityName?: string;
}

export type CommentGetDto = {
  id: number;
  userId: number;
  forumThreadId: number;
  body: string;
  parentCommentId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CommentWithUser = CommentGetDto & {
  userName?: string;
  universityName?: string;
  replies: CommentWithUser[];
};
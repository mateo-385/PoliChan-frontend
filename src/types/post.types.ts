export interface Post {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: Date
  likesCount: number
  commentsCount: number
  likedByCurrentUser?: boolean
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: Date
  likesCount: number
  likedByCurrentUser?: boolean
}

export interface CreatePostData {
  content: string
}

export interface CreateCommentData {
  postId: string
  content: string
}

export interface PostWithComments {
  post: Post
  comments: Comment[]
}

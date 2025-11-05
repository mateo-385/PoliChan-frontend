export interface Post {
  id: string
  userId: string
  content: string
  likesCount: number
  commentsCount?: number
  timestamps: {
    createdAt: { value: string }
    updatedAt: { value: string }
  }
  user?: {
    id: string
    firstName: string
    lastName: string
    userName?: string // API might send userName (camelCase)
    username?: string // or username (lowercase)
  }
  likedByCurrentUser?: boolean
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorUsername: string
  authorAvatar?: string
  content: string
  createdAt: Date
  likesCount: number
  likedByCurrentUser?: boolean
}

export interface CreatePostData {
  userId: string
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

export interface Post {
  id: string
  userId: string
  content: string
  likesCount: number
  likes: string[]
  commentsCount?: number
  timestamps: {
    createdAt: { value: string }
    updatedAt: { value: string }
  }
  user?: {
    id: string
    firstName: string
    lastName: string
    userName?: string
    username?: string
  }
  likedByCurrentUser?: boolean
}

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  likesCount: number
  likes: string[]
  timestamps: {
    createdAt: { value: string }
    updatedAt: { value: string }
  }
  user?: {
    id: string
    firstName: string
    lastName: string
    username: string
  }
  likedByCurrentUser?: boolean
}

export interface CreatePostData {
  userId: string
  content: string
}

export interface CreateCommentData {
  postId: string
  userId: string
  content: string
}

export interface PostWithComments {
  post: Post
  comments: Comment[]
}

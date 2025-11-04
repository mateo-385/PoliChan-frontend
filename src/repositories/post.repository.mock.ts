import type {
  Post,
  Comment,
  CreatePostData,
  CreateCommentData,
  PostWithComments,
} from '@/types/post.types'

// Mock posts database
const mockPosts: Post[] = [
  {
    id: '1',
    authorId: '1',
    authorName: 'Admin User',
    authorUsername: 'admin',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    content:
      '🎉 Welcome to PoliChan! This is a sample post to demonstrate the platform. Feel free to like, comment, and engage with the community!',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likesCount: 42,
    commentsCount: 15,
    likedByCurrentUser: false,
  },
  {
    id: '2',
    authorId: '2',
    authorName: 'Regular User',
    authorUsername: 'regularuser',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
    content:
      'Just finished a great coding session! 💻 Anyone else working on interesting projects today?',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    likesCount: 28,
    commentsCount: 8,
    likedByCurrentUser: false,
  },
  {
    id: '3',
    authorId: '1',
    authorName: 'Admin User',
    authorUsername: 'admin',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    content:
      "Quick reminder: Be kind and respectful to everyone in the community. Let's keep this a positive space for all! 🤝",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    likesCount: 56,
    commentsCount: 4,
    likedByCurrentUser: true,
  },
  {
    id: '4',
    authorId: '2',
    authorName: 'Regular User',
    authorUsername: 'regularuser',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
    content:
      'Does anyone have recommendations for learning React? Looking to improve my frontend skills! 🚀',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    likesCount: 19,
    commentsCount: 12,
    likedByCurrentUser: false,
  },
  {
    id: '5',
    authorId: '1',
    authorName: 'Admin User',
    authorUsername: 'admin',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    content:
      'Check out the new features we just released! Dark mode is now available. Toggle it from the sidebar. 🌙',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    likesCount: 83,
    commentsCount: 21,
    likedByCurrentUser: true,
  },
]

// Mock comments database
const mockComments: Comment[] = [
  {
    id: '1',
    postId: '1',
    authorId: '2',
    authorName: 'Regular User',
    authorUsername: 'regularuser',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
    content: 'This is awesome! Thanks for creating this platform! 🎉',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    likesCount: 5,
    likedByCurrentUser: false,
  },
  {
    id: '2',
    postId: '1',
    authorId: '1',
    authorName: 'Admin User',
    authorUsername: 'admin',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    content: "Thank you! We're excited to have you here! 🙌",
    createdAt: new Date(Date.now() - 55 * 60 * 1000), // 55 minutes ago
    likesCount: 3,
    likedByCurrentUser: false,
  },
  {
    id: '3',
    postId: '1',
    authorId: '2',
    authorName: 'Regular User',
    authorUsername: 'regularuser',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
    content: 'Looking forward to connecting with everyone! 😊',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    likesCount: 2,
    likedByCurrentUser: true,
  },
  {
    id: '4',
    postId: '2',
    authorId: '1',
    authorName: 'Admin User',
    authorUsername: 'admin',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    content: 'Working on some new features for the platform! Stay tuned! 🚀',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    likesCount: 8,
    likedByCurrentUser: true,
  },
  {
    id: '5',
    postId: '3',
    authorId: '2',
    authorName: 'Regular User',
    authorUsername: 'regularuser',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
    content: "Absolutely! Let's keep it positive! 💪",
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago
    likesCount: 4,
    likedByCurrentUser: false,
  },
  {
    id: '6',
    postId: '1',
    authorId: '2',
    authorName: 'Regular User',
    authorUsername: 'regularuser',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
    content: 'Haha! XD',
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago
    likesCount: 4,
    likedByCurrentUser: false,
  },
]

export class MockPostRepository {
  private currentUserId: string | null = null

  setCurrentUserId(userId: string | null): void {
    this.currentUserId = userId
  }

  async getAllPosts(): Promise<Post[]> {
    await this.delay(300)
    return [...mockPosts].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  async getPostById(postId: string): Promise<PostWithComments> {
    await this.delay(400)

    const post = mockPosts.find((p) => p.id === postId)
    if (!post) {
      throw new Error('Post not found')
    }

    const comments = mockComments
      .filter((c) => c.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    return { post, comments }
  }

  async createPost(data: CreatePostData): Promise<Post> {
    await this.delay(500)

    if (!this.currentUserId) {
      throw new Error('Not authenticated')
    }

    const newPost: Post = {
      id: String(mockPosts.length + 1),
      authorId: this.currentUserId,
      authorName: 'Current User',
      authorUsername: 'currentuser',
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.currentUserId}`,
      content: data.content,
      createdAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      likedByCurrentUser: false,
    }

    mockPosts.push(newPost)
    return newPost
  }

  async createComment(data: CreateCommentData): Promise<Comment> {
    await this.delay(500)

    if (!this.currentUserId) {
      throw new Error('Not authenticated')
    }

    const post = mockPosts.find((p) => p.id === data.postId)
    if (!post) {
      throw new Error('Post not found')
    }

    const newComment: Comment = {
      id: String(mockComments.length + 1),
      postId: data.postId,
      authorId: this.currentUserId,
      authorName: 'Current User',
      authorUsername: 'currentuser',
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.currentUserId}`,
      content: data.content,
      createdAt: new Date(),
      likesCount: 0,
      likedByCurrentUser: false,
    }

    mockComments.push(newComment)
    post.commentsCount++

    return newComment
  }

  async toggleLike(postId: string): Promise<Post> {
    await this.delay(300)

    if (!this.currentUserId) {
      throw new Error('Not authenticated')
    }

    const post = mockPosts.find((p) => p.id === postId)
    if (!post) {
      throw new Error('Post not found')
    }

    if (post.likedByCurrentUser) {
      post.likesCount--
      post.likedByCurrentUser = false
    } else {
      post.likesCount++
      post.likedByCurrentUser = true
    }

    return post
  }

  async toggleCommentLike(commentId: string): Promise<Comment> {
    await this.delay(300)

    if (!this.currentUserId) {
      throw new Error('Not authenticated')
    }

    const comment = mockComments.find((c) => c.id === commentId)
    if (!comment) {
      throw new Error('Comment not found')
    }

    if (comment.likedByCurrentUser) {
      comment.likesCount--
      comment.likedByCurrentUser = false
    } else {
      comment.likesCount++
      comment.likedByCurrentUser = true
    }

    return comment
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const mockPostRepository = new MockPostRepository()

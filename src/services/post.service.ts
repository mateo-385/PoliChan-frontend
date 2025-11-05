import { postRepository } from '@/repositories/post.repository'
// import { mockPostRepository as postRepository } from '@/repositories/post.repository.mock'
import type {
  Post,
  Comment,
  CreateCommentData,
  PostWithComments,
} from '@/types/post.types'

interface TimelineParams {
  limit?: number
  afterPostId?: string
}

class PostService {
  // Note: setCurrentUserId not needed - backend handles user context via JWT

  // ===== QUERIES (Read Operations) =====

  /**
   * Get timeline posts with infinite scroll support
   */
  async getTimelinePosts(params?: TimelineParams): Promise<Post[]> {
    const response = await postRepository.getTimelinePosts(params)
    return response.posts
  }

  /**
   * Get all posts (legacy method)
   */
  async getAllPosts(): Promise<Post[]> {
    return await postRepository.getAllPosts()
  }

  /**
   * Get most liked posts
   */
  async getMostLikedPosts(): Promise<Post[]> {
    return await postRepository.getMostLikedPosts()
  }

  /**
   * Get post by ID with comments
   */
  async getPostById(postId: string): Promise<PostWithComments> {
    return await postRepository.getPostById(postId)
  }

  /**
   * Get posts by user ID
   */
  async getPostsByUserId(userId: string): Promise<Post[]> {
    const response = await postRepository.getPostsByUserId(userId)
    return response.posts
  }

  // ===== COMMANDS (Write Operations) =====

  /**
   * Create a new post
   * Returns success message, not the post object
   * The post will appear in feed after refresh
   */
  async createPost(
    userId: string,
    content: string
  ): Promise<{ message: string }> {
    if (!content.trim()) {
      throw new Error('Post content cannot be empty')
    }
    return await postRepository.createPost({ userId, content })
  }

  /**
   * Create a comment on a post
   */
  async createComment(data: CreateCommentData): Promise<Comment> {
    if (!data.content.trim()) {
      throw new Error('Comment content cannot be empty')
    }
    return await postRepository.createComment(data)
  }

  /**
   * Like a post
   */
  async likePost(postId: string, userId: string): Promise<{ message: string }> {
    return await postRepository.likePost(postId, userId)
  }

  /**
   * Unlike a post
   */
  async unlikePost(
    postId: string,
    userId: string
  ): Promise<{ message: string }> {
    return await postRepository.unlikePost(postId, userId)
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    return await postRepository.deletePost(postId)
  }

  /**
   * Toggle like on a comment
   * Note: This endpoint is not yet implemented in the backend
   */
  async toggleCommentLike(commentId: string): Promise<Comment> {
    // Suppress unused parameter warning - this is a placeholder
    void commentId
    // TODO: Wait for backend implementation
    throw new Error('Comment likes not yet implemented in backend')
  }

  formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'just now'
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays}d ago`
    }

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}mo ago`
  }
}

export const postService = new PostService()

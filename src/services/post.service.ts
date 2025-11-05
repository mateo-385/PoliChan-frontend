import { postRepository } from '@/repositories/post.repository'
// import { mockPostRepository as postRepository } from '@/repositories/post.repository.mock'
import type {
  Post,
  Comment,
  CreatePostData,
  CreateCommentData,
  PostWithComments,
} from '@/types/post.types'

class PostService {
  setCurrentUserId(_userId: string | null): void {
    // Note: This might be needed for future features
    // Currently not used as backend handles user context via JWT
  }

  // ===== QUERIES (Read Operations) =====

  /**
   * Get timeline posts (main feed)
   */
  async getAllPosts(): Promise<Post[]> {
    return await postRepository.getTimelinePosts()
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
   * Note: This might need a new backend endpoint
   */
  async getPostsByUserId(userId: string): Promise<Post[]> {
    const allPosts = await postRepository.getTimelinePosts()
    return allPosts.filter((post) => post.authorId === userId)
  }

  // ===== COMMANDS (Write Operations) =====

  /**
   * Create a new post
   */
  async createPost(data: CreatePostData): Promise<Post> {
    if (!data.content.trim()) {
      throw new Error('Post content cannot be empty')
    }
    return await postRepository.createPost(data)
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
   * Toggle like on a post
   */
  async toggleLike(postId: string): Promise<{ liked: boolean }> {
    return await postRepository.toggleLike(postId)
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    return await postRepository.deletePost(postId)
  }

  /**
   * Toggle like on a comment
   * Note: This endpoint is not yet implemented in the new backend structure
   */
  async toggleCommentLike(_commentId: string): Promise<Comment> {
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

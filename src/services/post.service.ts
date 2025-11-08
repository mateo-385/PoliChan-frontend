import { postRepository } from '@/repositories/post.repository'
import { mentionsRepository } from '@/repositories/mentions.repository'
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

  /**
   * Fetch mentions for a post and attach to post object
   * Returns array of mentioned usernames
   */
  private async fetchAndAttachMentions(post: Post): Promise<Post> {
    try {
      const response = await mentionsRepository.getPostMentions(post.id)
      const usernames = [
        ...new Set(
          response.mentions
            .map((m) => m.mentionedUser?.username)
            .filter(Boolean) as string[]
        ),
      ]
      return {
        ...post,
        validMentions: usernames,
      }
    } catch {
      // Silently fail and return post without mentions - fallback to useMentions hook
      return post
    }
  }

  /**
   * Fetch mentions for multiple posts in parallel with timeout
   * If mentions take too long, return posts without mentions to prevent loading delay
   */
  private async attachMentionsToMultiplePosts(posts: Post[]): Promise<Post[]> {
    // Create a promise that resolves after 2 seconds (timeout)
    const timeoutPromise = new Promise<Post[]>((resolve) => {
      setTimeout(() => {
        // After 2 seconds, return posts with whatever mentions we have so far
        resolve(posts)
      }, 2000)
    })

    // Fetch all mentions in parallel
    const mentionsFetchPromise = Promise.all(
      posts.map((post) => this.fetchAndAttachMentions(post))
    )

    // Return whichever completes first: all mentions fetched OR 2 second timeout
    return Promise.race([mentionsFetchPromise, timeoutPromise])
  }

  // ===== QUERIES (Read Operations) =====

  /**
   * Get timeline posts with infinite scroll support
   * Mentions are fetched in parallel and attached to each post
   */
  async getTimelinePosts(params?: TimelineParams): Promise<Post[]> {
    const response = await postRepository.getTimelinePosts(params)
    // Fetch mentions for all posts in parallel (non-blocking)
    return this.attachMentionsToMultiplePosts(response.posts)
  }

  /**
   * Get all posts (legacy method)
   * Mentions are fetched in parallel and attached to each post
   */
  async getAllPosts(): Promise<Post[]> {
    const posts = await postRepository.getAllPosts()
    return this.attachMentionsToMultiplePosts(posts)
  }

  /**
   * Get most liked posts
   * Mentions are fetched in parallel and attached to each post
   */
  async getMostLikedPosts(): Promise<Post[]> {
    const posts = await postRepository.getMostLikedPosts()
    return this.attachMentionsToMultiplePosts(posts)
  }

  /**
   * Get post by ID with comments
   * Note: Comments currently don't have mentions styling
   */
  async getPostById(postId: string): Promise<PostWithComments> {
    return await postRepository.getPostById(postId)
  }

  /**
   * Get posts by user ID
   * Mentions are fetched in parallel and attached to each post
   */
  async getPostsByUserId(userId: string): Promise<Post[]> {
    const response = await postRepository.getPostsByUserId(userId)
    return this.attachMentionsToMultiplePosts(response.posts)
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
   * Like a comment
   */
  async likeComment(
    commentId: string,
    userId: string
  ): Promise<{ message: string }> {
    return await postRepository.likeComment(commentId, userId)
  }

  /**
   * Unlike a comment
   */
  async unlikeComment(
    commentId: string,
    userId: string
  ): Promise<{ message: string }> {
    return await postRepository.unlikeComment(commentId, userId)
  }

  /**
   * Toggle like on a comment (legacy - kept for backward compatibility)
   * @deprecated Use likeComment/unlikeComment instead for consistency with posts
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
      return 'ahora'
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `hace ${diffInMinutes}m`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `hace ${diffInHours}h`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `hace ${diffInDays}d`
    }

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
      return `hace ${diffInWeeks}sem`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    return `hace ${diffInMonths}mes`
  }
}

export const postService = new PostService()

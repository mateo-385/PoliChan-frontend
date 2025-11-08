import api from '@/lib/api'
import { handleError } from '@/lib/error-handler'
import type {
  Post,
  Comment,
  CreatePostData,
  CreateCommentData,
  PostWithComments,
} from '@/types/post.types'

// API response types
interface PostsResponse {
  posts: Post[]
  pagination: {
    limit: number
    offset?: number
    afterPostId?: string
    total: number
  }
}

interface TimelineParams {
  limit?: number
  afterPostId?: string
}

export class PostRepository {
  // ===== QUERIES (Read Operations) =====

  /**
   * Get post by ID
   * GET /api/posts/:postId
   */
  async getPostById(postId: string): Promise<PostWithComments> {
    try {
      const [postResponse, comments] = await Promise.all([
        api.get<Post>(`/posts/${postId}`),
        this.getPostComments(postId),
      ])
      return {
        post: postResponse.data,
        comments,
      }
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  /**
   * Get timeline posts with infinite scroll support
   * GET /api/posts/timeline
   */
  async getTimelinePosts(params?: TimelineParams): Promise<PostsResponse> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString())
      }
      if (params?.afterPostId) {
        queryParams.append('afterPostId', params.afterPostId)
      }

      const url = `/posts/timeline${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`
      const response = await api.get<PostsResponse>(url)
      return response.data
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  /**
   * Get all posts (legacy - for backward compatibility)
   * GET /api/posts
   */
  async getAllPosts(): Promise<Post[]> {
    try {
      const response = await api.get<PostsResponse>('/posts')
      return response.data.posts || []
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  /**
   * Get posts by user ID with pagination
   * GET /api/posts/user/:userId
   */
  async getPostsByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<PostsResponse> {
    try {
      const queryParams = new URLSearchParams()
      if (limit) queryParams.append('limit', limit.toString())
      if (offset) queryParams.append('offset', offset.toString())

      const url = `/posts/user/${userId}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`
      const response = await api.get<PostsResponse>(url)
      return response.data
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  /**
   * Get most liked posts
   * GET /api/posts/most-liked
   */
  async getMostLikedPosts(limit?: number): Promise<Post[]> {
    try {
      const queryParams = new URLSearchParams()
      if (limit) queryParams.append('limit', limit.toString())

      const url = `/posts/most-liked${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`
      const response = await api.get<PostsResponse>(url)
      return response.data.posts || []
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  // ===== COMMANDS (Write Operations) =====

  /**
   * Create a new post
   * POST /api/posts
   * Returns: { message: "Post creado exitosamente" }
   */
  async createPost(data: CreatePostData): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/posts', data)
      return response.data
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  /**
   * Like a post
   * POST /api/posts/:postId/like
   * Body: { userId: string }
   */
  async likePost(postId: string, userId: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `/posts/${postId}/like`,
        { userId }
      )
      return response.data
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  /**
   * Unlike a post
   * POST /api/posts/:postId/unlike
   * Body: { userId: string }
   */
  async unlikePost(
    postId: string,
    userId: string
  ): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `/posts/${postId}/unlike`,
        { userId }
      )
      return response.data
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  /**
   * Delete a post
   * DELETE /api/posts/:postId
   */
  async deletePost(postId: string): Promise<void> {
    try {
      await api.delete(`/posts/${postId}`)
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  /**
   * Create a comment on a post
   */
  async createComment(data: CreateCommentData): Promise<Comment> {
    try {
      const response = await api.post<Comment>(`/comments`, {
        postId: data.postId,
        userId: data.userId,
        content: data.content,
      })
      return response.data
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  /**
   * Get comments for a post
   */
  async getPostComments(postId: string): Promise<Comment[]> {
    try {
      const response = await api.get<Comment[]>(`/posts/${postId}/comments`)
      // Sort comments by creation date, newest first
      return response.data.sort((a, b) => {
        const dateA = new Date(a.timestamps.createdAt.value).getTime()
        const dateB = new Date(b.timestamps.createdAt.value).getTime()
        return dateB - dateA // Newest first
      })
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  /**
   * Like a comment
   * POST /api/comments/:commentId/like
   * Body: { userId: string }
   */
  async likeComment(
    commentId: string,
    userId: string
  ): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `/comments/${commentId}/like`,
        { userId }
      )
      return response.data
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }

  /**
   * Unlike a comment
   * POST /api/comments/:commentId/unlike
   * Body: { userId: string }
   */
  async unlikeComment(
    commentId: string,
    userId: string
  ): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `/comments/${commentId}/unlike`,
        { userId }
      )
      return response.data
    } catch (error: unknown) {
      throw new Error(handleError(error))
    }
  }
}

export const postRepository = new PostRepository()

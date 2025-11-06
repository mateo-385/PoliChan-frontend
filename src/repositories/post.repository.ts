import api from '@/lib/api'
import type {
  Post,
  Comment,
  CreatePostData,
  CreateCommentData,
  PostWithComments,
} from '@/types/post.types'
import { AxiosError } from 'axios'

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
      const response = await api.get<Post>(`/posts/${postId}`)
      return {
        post: response.data,
        comments: [], // TODO
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch post'
        throw new Error(errorMessage)
      }
      throw error
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
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch timeline'
        throw new Error(errorMessage)
      }
      throw error
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
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch posts'
        throw new Error(errorMessage)
      }
      throw error
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
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch user posts'
        throw new Error(errorMessage)
      }
      throw error
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
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch most liked posts'
        throw new Error(errorMessage)
      }
      throw error
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
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to create post'
        throw new Error(errorMessage)
      }
      throw error
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
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to like post'
        throw new Error(errorMessage)
      }
      throw error
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
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to unlike post'
        throw new Error(errorMessage)
      }
      throw error
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
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to delete post'
        throw new Error(errorMessage)
      }
      throw error
    }
  }

  /**
   * Create a comment on a post
   * Note: This endpoint might need to be updated when backend implements it
   */
  async createComment(data: CreateCommentData): Promise<Comment> {
    try {
      const response = await api.post<Comment>(
        `/posts/${data.postId}/comments`,
        {
          content: data.content,
        }
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to create comment'
        throw new Error(errorMessage)
      }
      throw error
    }
  }

  /**
   * Get comments for a post
   * Note: This endpoint might need to be updated when backend implements it
   */
  async getPostComments(postId: string): Promise<Comment[]> {
    try {
      const response = await api.get<Comment[]>(`/posts/${postId}/comments`)
      return response.data
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch comments'
        throw new Error(errorMessage)
      }
      throw error
    }
  }
}

export const postRepository = new PostRepository()

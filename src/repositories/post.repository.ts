import api from '@/lib/api'
import type {
  Post,
  Comment,
  CreatePostData,
  CreateCommentData,
  PostWithComments,
} from '@/types/post.types'
import { AxiosError } from 'axios'

export class PostRepository {
  // ===== QUERIES (Read Operations) =====

  /**
   * Get post by ID
   * GET /api/posts/:postId
   */
  async getPostById(postId: string): Promise<PostWithComments> {
    try {
      const response = await api.get<PostWithComments>(`/posts/${postId}`)
      return response.data
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
   * Get timeline posts (feed)
   * GET /api/posts/timeline
   */
  async getTimelinePosts(): Promise<Post[]> {
    try {
      const response = await api.get<Post[]>('/posts/timeline')
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
   * Get most liked posts
   * GET /api/posts/most-liked
   */
  async getMostLikedPosts(): Promise<Post[]> {
    try {
      const response = await api.get<Post[]>('/posts/most-liked')
      return response.data
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
   */
  async createPost(data: CreatePostData): Promise<Post> {
    try {
      const response = await api.post<Post>('/posts', data)
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
   * Like/unlike a post
   * POST /api/posts/:postId/like
   */
  async toggleLike(postId: string): Promise<{ liked: boolean }> {
    try {
      const response = await api.post<{ liked: boolean }>(
        `/posts/${postId}/like`
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to toggle like'
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

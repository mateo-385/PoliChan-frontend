import api from '@/lib/api'
import type {
  MentionsResponse,
  UserMentionsResponse,
  MarkMentionReadResponse,
} from '@/types/mentions.types'
import { AxiosError } from 'axios'

export class MentionsRepository {
  /**
   * Get mentions for a specific post
   * GET /api/posts/:postId/mentions
   */
  async getPostMentions(postId: string): Promise<MentionsResponse> {
    try {
      const response = await api.get<MentionsResponse>(
        `/posts/${postId}/mentions`
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch mentions'
        throw new Error(errorMessage)
      }
      throw error
    }
  }

  /**
   * Get current user's mention notifications
   * GET /api/mentions/user/me
   */
  async getUserMentions(): Promise<UserMentionsResponse> {
    try {
      const response = await api.get<UserMentionsResponse>('/mentions/user/me')
      return response.data
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch user mentions'
        throw new Error(errorMessage)
      }
      throw error
    }
  }

  /**
   * Mark a mention as read
   * POST /api/mentions/:mentionId/read
   */
  async markMentionAsRead(mentionId: string): Promise<MarkMentionReadResponse> {
    try {
      const response = await api.post<MarkMentionReadResponse>(
        `/mentions/${mentionId}/read`,
        {}
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to mark mention as read'
        throw new Error(errorMessage)
      }
      throw error
    }
  }

  /**
   * Get posts where user was mentioned
   * GET /api/users/:userId/mentioned
   */
  async getUserMentionedPosts(userId: string): Promise<MentionsResponse> {
    try {
      const response = await api.get<MentionsResponse>(
        `/users/${userId}/mentioned`
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch mentioned posts'
        throw new Error(errorMessage)
      }
      throw error
    }
  }

  /**
   * Delete a mention
   * DELETE /api/mentions/:mentionId
   */
  async deleteMention(mentionId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(
        `/mentions/${mentionId}`
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to delete mention'
        throw new Error(errorMessage)
      }
      throw error
    }
  }
}

export const mentionsRepository = new MentionsRepository()

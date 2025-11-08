import api from '@/lib/api'
import type { User } from '@/types/auth.types'
import { AxiosError } from 'axios'

export class UserRepository {
  /**
   * Search for users by username for autocomplete
   * GET /users/autocomplete?q=query&limit=10
   * Note: baseURL already includes /api prefix
   */
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      if (!query || query.trim().length === 0) {
        // If no query, return empty array
        return []
      }

      console.log('Searching users with query:', query)
      const response = await api.get<{ results: User[] }>(
        '/users/autocomplete',
        {
          params: {
            q: query.trim(),
            limit,
          },
        }
      )

      console.log('Search response:', response.data)
      return response.data.results || []
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('User search error:', error.message, error.response?.data)
      } else {
        console.error('User search error:', error)
      }
      return []
    }
  }

  /**
   * Get all users (for mention suggestions when no query)
   * Currently falls back to search with empty query or returns empty array
   * Note: baseURL already includes /api prefix
   */
  async getAllUsers(limit: number = 50): Promise<User[]> {
    try {
      console.log('Fetching all users with limit:', limit)
      // For now, return empty array as there's no dedicated getAllUsers endpoint
      // Autocomplete works when user types characters
      return []
    } catch (error: unknown) {
      console.error('Failed to fetch users:', error)
      return []
    }
  }
}

export const userRepository = new UserRepository()

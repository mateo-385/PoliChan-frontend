import api from '@/lib/api'
import { handleError } from '@/lib/error-handler'
import type { User } from '@/types/auth.types'

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

      const response = await api.get<{ results: User[] }>(
        '/users/autocomplete',
        {
          params: {
            q: query.trim(),
            limit,
          },
        }
      )

      return response.data.results || []
    } catch (error: unknown) {
      console.error('User search error:', error)
      return []
    }
  }

  /**
   * Get all users (for mention suggestions when no query)
   * Currently falls back to search with empty query or returns empty array
   * Note: baseURL already includes /api prefix
   */
  async getAllUsers(): Promise<User[]> {
    // For now, return empty array as there's no dedicated getAllUsers endpoint
    // Autocomplete works when user types characters
    return []
  }
}

export const userRepository = new UserRepository()

import { userRepository } from '@/repositories/user.repository'
import type { User } from '@/types/auth.types'

class UserService {
  /**
   * Search for users by username
   * @param query - The search query (partial username)
   * @param limit - Maximum number of results
   * @returns Array of matching users
   */
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    return userRepository.searchUsers(query, limit)
  }

  /**
   * Get all users for mention suggestions
   * @param limit - Maximum number of users to fetch
   * @returns Array of users
   */
  async getAllUsers(limit: number = 50): Promise<User[]> {
    return userRepository.getAllUsers(limit)
  }

  /**
   * Filter users based on search query
   * Performs client-side filtering on the full user list
   * Useful as fallback if search endpoint doesn't exist
   * @param query - The search query
   * @param users - Array of users to filter
   * @returns Filtered users matching the query
   */
  filterUsersByQuery(users: User[], query: string): User[] {
    if (!query || query.trim().length === 0) {
      return users
    }

    const lowerQuery = query.toLowerCase().trim()

    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      const username = user.username?.toLowerCase() || ''

      return fullName.includes(lowerQuery) || username.includes(lowerQuery)
    })
  }

  /**
   * Get mention suggestions based on current input
   * @param query - The text after @ symbol
   * @param currentUserId - ID of current user (to exclude from suggestions)
   * @returns Array of suggested users for mention
   */
  async getMentionSuggestions(
    query: string,
    currentUserId?: string
  ): Promise<User[]> {
    try {
      // Only search if there's a query
      if (!query || query.trim().length === 0) {
        return []
      }

      // Search for users
      let users = await this.searchUsers(query, 10)

      // Filter out current user from suggestions
      if (currentUserId) {
        users = users.filter((user) => user.id !== currentUserId)
      }

      return users
    } catch (error) {
      console.error('Error getting mention suggestions:', error)
      // Return empty array if there's an error
      return []
    }
  }
}

export const userService = new UserService()

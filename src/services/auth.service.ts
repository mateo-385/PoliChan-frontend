import { authRepository } from '@/repositories/auth.repository'
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
  ApiUser,
} from '@/types/auth.types'

class AuthService {
  private transformApiUserToUser(apiUser: ApiUser): User {
    return {
      id: apiUser.id,
      name: `${apiUser.firstName} ${apiUser.lastName}`,
      username: apiUser.userName,
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await authRepository.login(credentials)
    localStorage.setItem('auth_token', response.token)
    localStorage.setItem('user_id', response.user.id)
    return this.transformApiUserToUser(response.user)
  }

  async register(credentials: RegisterCredentials): Promise<void> {
    await authRepository.register(credentials)
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    await authRepository.logout()
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth_token')
      const userId = localStorage.getItem('user_id')
      if (!token || !userId) {
        return null
      }

      const response = await authRepository.getCurrentUser(userId)
      return this.transformApiUserToUser(response.user)
    } catch (error) {
      console.error('Failed to get current user:', error)
      // Only clear credentials if it's a 401 (unauthorized) or 404 (user not found)
      // Keep them for other errors (network issues, 500 errors, etc.)
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        if (
          errorMessage.includes('not found') ||
          errorMessage.includes('unauthorized')
        ) {
          console.warn('Invalid credentials, clearing localStorage')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_id')
        }
      }
      return null
    }
  }
}

export const authService = new AuthService()

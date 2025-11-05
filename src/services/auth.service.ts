import { authRepository } from '@/repositories/auth.repository'
// import { mockAuthRepository as authRepository } from '@/repositories/auth.repository.mock'
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
      name: apiUser.fullName,
      username: apiUser.userName,
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await authRepository.login(credentials)
    // Store JWT token in localStorage
    localStorage.setItem('auth_token', response.token)
    return this.transformApiUserToUser(response.user)
  }

  async register(credentials: RegisterCredentials): Promise<void> {
    // Register the user (returns a success message)
    await authRepository.register(credentials)
    // Don't auto-login, let the user go to login page
  }

  async logout(): Promise<void> {
    // Clear JWT token from localStorage
    localStorage.removeItem('auth_token')
    await authRepository.logout()
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return null
      }

      const response = await authRepository.getCurrentUser()
      return this.transformApiUserToUser(response.user)
    } catch {
      // Clear invalid token
      localStorage.removeItem('auth_token')
      return null
    }
  }
}

export const authService = new AuthService()

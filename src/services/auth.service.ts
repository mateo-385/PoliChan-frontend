// import { authRepository } from '@/repositories/auth.repository'
import { mockAuthRepository as authRepository } from '@/repositories/auth.repository.mock'
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
    return this.transformApiUserToUser(response.user)
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    const response = await authRepository.register(credentials)
    return this.transformApiUserToUser(response.user)
  }

  async logout(): Promise<void> {
    await authRepository.logout()
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await authRepository.getCurrentUser()
      return this.transformApiUserToUser(response.user)
    } catch {
      return null
    }
  }
}

export const authService = new AuthService()

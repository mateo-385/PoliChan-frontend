// import { authRepository } from '@/repositories/auth.repository'
import { mockAuthRepository as authRepository } from '@/repositories/auth.repository.mock'
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from '@/types/auth.types'

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await authRepository.login(credentials)
    return response
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await authRepository.register(credentials)
    return response
  }

  async logout(): Promise<void> {
    await authRepository.logout()
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await authRepository.getCurrentUser()
      return response.user
    } catch {
      return null
    }
  }
}

export const authService = new AuthService()

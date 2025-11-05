import api from '@/lib/api'
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  RegisterResponse,
} from '@/types/auth.types'
import { AxiosError } from 'axios'

export class AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/user/login', credentials)
      return response.data
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          'Login failed'
        throw new Error(errorMessage)
      }
      throw error
    }
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>(
        '/user/register',
        credentials
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          'Registration failed'
        throw new Error(errorMessage)
      }
      throw error
    }
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  }

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/auth/me')
    return response.data
  }
}

export const authRepository = new AuthRepository()

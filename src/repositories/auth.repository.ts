import api from '@/lib/api'
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  RegisterResponse,
  ApiUser,
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
    await api.post('/user/logout')
  }

  async getCurrentUser(userId: string): Promise<AuthResponse> {
    try {
      const response = await api.get(`/user/${userId}`)
      const data = response.data

      // Handle different response formats
      // Case 1: Response has both user and token (AuthResponse format)
      if (data.user && data.token) {
        return data as AuthResponse
      }

      // Case 2: Response is just the user object (ApiUser format)
      // In this case, we keep the existing token from localStorage
      if (data.id && data.firstName && data.lastName && data.userName) {
        const existingToken = localStorage.getItem('auth_token')
        return {
          token: existingToken || '',
          user: data as ApiUser,
        }
      }

      // Case 3: Response has user wrapped in data property
      if (data.data && data.data.id) {
        const existingToken = localStorage.getItem('auth_token')
        return {
          token: existingToken || '',
          user: data.data as ApiUser,
        }
      }

      throw new Error('Invalid response format from server')
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(
          'Get current user error:',
          error.response?.status,
          error.response?.data
        )
        if (error.response?.data) {
          const errorMessage =
            error.response.data.error ||
            error.response.data.message ||
            'Failed to get user'
          throw new Error(errorMessage)
        }
      }
      throw error
    }
  }
}

export const authRepository = new AuthRepository()

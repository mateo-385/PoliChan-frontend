import api from '@/lib/api'
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '@/types/auth.types'

export class AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      '/api/user/login',
      credentials
    )
    return response.data
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/users/', credentials)
    return response.data
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

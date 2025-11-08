import api from '@/lib/api'
import { handleError } from '@/lib/error-handler'
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  RegisterResponse,
  ApiUser,
} from '@/types/auth.types'

export class AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Debug: log outgoing credentials (avoid logging in production)
      console.debug('AuthRepository.login - sending credentials:', {
        // mask password partially for safety in logs
        userName: credentials.userName,
        password: credentials.password ? '••••' : undefined,
      })
      const response = await api.post<AuthResponse>('/user/login', credentials)
      return response.data
    } catch (error: unknown) {
      const userMessage = handleError(error)
      throw new Error(userMessage)
    }
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      // Debug: log outgoing registration payload (do not log real passwords in prod)
      console.debug('AuthRepository.register - sending payload:', {
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        userName: credentials.userName,
        password: credentials.password ? '••••' : undefined,
      })
      const response = await api.post<RegisterResponse>(
        '/user/register',
        credentials
      )
      return response.data
    } catch (error: unknown) {
      const userMessage = handleError(error)
      throw new Error(userMessage)
    }
  }

  async getCurrentUser(userId: string): Promise<AuthResponse> {
    try {
      const response = await api.get(`/user/${userId}`)
      const existingToken = localStorage.getItem('auth_token') || ''

      return {
        token: existingToken,
        user: response.data as ApiUser,
      }
    } catch (error: unknown) {
      const userMessage = handleError(error)
      throw new Error(userMessage)
    }
  }
}

export const authRepository = new AuthRepository()

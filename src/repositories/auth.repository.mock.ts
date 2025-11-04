import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ApiUser,
} from '@/types/auth.types'

const mockUsers: ApiUser[] = [
  {
    id: '1',
    fullName: 'Admin User',
    userName: 'admin',
  },
  {
    id: '2',
    fullName: 'Regular User',
    userName: 'regularuser',
  },
]

const MOCK_PASSWORD = 'password123'

export class MockAuthRepository {
  private currentUser: ApiUser | null = null

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await this.delay(500)

    const user = mockUsers.find((u) => u.userName === credentials.userName)

    if (!user || credentials.password !== MOCK_PASSWORD) {
      throw new Error('Invalid username or password')
    }

    this.currentUser = user
    return {
      message: 'Usuario autenticado exitosamente',
      user,
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await this.delay(500)

    const existingUser = mockUsers.find(
      (u) => u.userName === credentials.userName
    )
    if (existingUser) {
      throw new Error('User already exists with this username')
    }

    const newUser: ApiUser = {
      id: String(mockUsers.length + 1),
      fullName: `${credentials.firstName} ${credentials.lastName}`,
      userName: credentials.userName,
    }

    mockUsers.push(newUser)
    this.currentUser = newUser

    return {
      message: 'Usuario registrado exitosamente',
      user: newUser,
    }
  }

  async logout(): Promise<void> {
    await this.delay(200)
    this.currentUser = null
  }

  async getCurrentUser(): Promise<AuthResponse> {
    await this.delay(300)

    if (!this.currentUser) {
      throw new Error('Not authenticated')
    }

    return {
      message: 'Usuario obtenido exitosamente',
      user: this.currentUser,
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const mockAuthRepository = new MockAuthRepository()

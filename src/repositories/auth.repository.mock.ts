import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ApiUser,
} from '@/types/auth.types'

const mockUsers: ApiUser[] = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    userName: 'admin',
  },
  {
    id: '2',
    firstName: 'Regular',
    lastName: 'User',
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
      token: 'mock-jwt-token-' + user.id,
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
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      userName: credentials.userName,
    }

    mockUsers.push(newUser)
    this.currentUser = newUser

    return {
      token: 'mock-jwt-token-' + newUser.id,
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
      token: 'mock-jwt-token-' + this.currentUser.id,
      user: this.currentUser,
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const mockAuthRepository = new MockAuthRepository()

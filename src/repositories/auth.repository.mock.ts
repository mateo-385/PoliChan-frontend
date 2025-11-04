import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from '@/types/auth.types'

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    username: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
  {
    id: '2',
    name: 'Regular User',
    username: 'regularuser',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  },
]

const MOCK_PASSWORD = 'password123'

export class MockAuthRepository {
  private currentUser: User | null = null

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await this.delay(500)

    const user = mockUsers.find((u) => u.username === credentials.userName)

    if (!user || credentials.password !== MOCK_PASSWORD) {
      throw new Error('Invalid username or password')
    }

    this.currentUser = user
    return { user }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await this.delay(500)

    const existingUser = mockUsers.find(
      (u) => u.username === credentials.userName
    )
    if (existingUser) {
      throw new Error('User already exists with this username')
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      name: `${credentials.firstName} ${credentials.lastName}`,
      username: credentials.userName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.userName}`,
    }

    mockUsers.push(newUser)
    this.currentUser = newUser

    return { user: newUser }
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

    return { user: this.currentUser }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const mockAuthRepository = new MockAuthRepository()

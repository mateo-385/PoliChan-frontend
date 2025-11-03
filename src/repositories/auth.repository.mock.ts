import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from '@/types/auth.types'

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@polichan.com',
    name: 'Admin User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
  {
    id: '2',
    email: 'user@polichan.com',
    name: 'Regular User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  },
]

// Mock password: "password123" for all users
const MOCK_PASSWORD = 'password123'

export class MockAuthRepository {
  private currentUser: User | null = null

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate network delay
    await this.delay(500)

    const user = mockUsers.find((u) => u.email === credentials.email)

    if (!user || credentials.password !== MOCK_PASSWORD) {
      throw new Error('Invalid email or password')
    }

    this.currentUser = user
    return { user }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Simulate network delay
    await this.delay(500)

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === credentials.email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      email: credentials.email,
      name: credentials.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.name}`,
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

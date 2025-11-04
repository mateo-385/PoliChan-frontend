export interface User {
  id: string
  name: string
  username: string
  avatar?: string
}

export interface LoginCredentials {
  userName: string
  password: string
}

export interface RegisterCredentials {
  firstName: string
  lastName: string
  userName: string
  password: string
}

export interface AuthResponse {
  user: User
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

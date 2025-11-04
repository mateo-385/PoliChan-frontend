export interface User {
  id: string
  name: string
  username: string
  avatar?: string
}

export interface ApiUser {
  id: string
  userName: string
  fullName: string
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
  message: string
  user: ApiUser
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

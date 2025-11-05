export interface User {
  id: string
  name: string
  username: string
  avatar?: string
}

export interface ApiUser {
  id: string
  firstName: string
  lastName: string
  userName: string
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
  token: string
  user: ApiUser
}

export interface RegisterResponse {
  message: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

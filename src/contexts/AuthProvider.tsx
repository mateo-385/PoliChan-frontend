import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from '@/types/auth.types'
import { authService } from '@/services/auth.service'
import { postService } from '@/services/post.service'
import { AuthContext } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initAuth()
  }, [])

  useEffect(() => {
    // Sync user ID with post service whenever user changes
    postService.setCurrentUserId(user?.id || null)
  }, [user])

  const initAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      const user = await authService.login(credentials)
      setUser(user)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      await authService.register(credentials)
      // Don't set user, they need to login manually
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Refresh user error:', error)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

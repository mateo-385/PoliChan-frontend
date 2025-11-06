import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Spinner } from '../ui/spinner'

interface PublicRouteProps {
  children: ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-12" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />
  }

  return <>{children}</>
}

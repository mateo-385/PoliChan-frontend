import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthProvider'
import { WebSocketProvider } from '@/contexts/WebSocketProvider'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { PublicRoute } from '@/components/layout/PublicRoute'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { FeedPage } from '@/pages/FeedPage'
import { ProfilePage } from '@/pages/ProfilePage'

export function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route element={<ProtectedLayout />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </WebSocketProvider>
    </AuthProvider>
  )
}

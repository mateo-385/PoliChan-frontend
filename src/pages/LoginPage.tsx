import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { LoginForm } from '@/components/auth/LoginForm'
import type { LoginCredentials } from '@/types/auth.types'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (credentials: LoginCredentials) => {
    await login(credentials)
    navigate('/feed')
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="
        absolute inset-0 -z-10
        animate-gradient 
        bg-size-[400%_400%] 
        bg-linear-to-br
        from-gray-900
        via-slate-800
        to-indigo-950
      " />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm
          onSubmit={handleLogin}
          onNavigateToRegister={() => navigate('/register')}
        />
      </div>

    </div>
  )
}

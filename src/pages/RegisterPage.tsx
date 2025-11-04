import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { RegisterForm } from '@/components/auth/RegisterForm'
import type { RegisterCredentials } from '@/types/auth.types'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleRegister = async (credentials: RegisterCredentials) => {
    await register(credentials)
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
        <RegisterForm
          onSubmit={handleRegister}
          onNavigateToLogin={() => navigate('/login')}
        />
      </div>
    </div>
  )
}

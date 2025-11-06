import { useState } from 'react'
import type { LoginCredentials } from '@/types/auth.types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useIsMobile } from '@/hooks/use-mobile'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  onNavigateToRegister: () => void
}

export function LoginForm({ onSubmit, onNavigateToRegister }: LoginFormProps) {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useIsMobile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await onSubmit({ userName, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={
        isMobile
          ? 'w-full p-4 space-y-4 bg-card text-card-foreground rounded-lg shadow-md border'
          : 'w-full p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-md border'
      }
    >
      <div className="text-center">
        <h1 className={isMobile ? 'text-xl font-bold' : 'text-2xl font-bold'}>
          Iniciar Sesión
        </h1>
        <p
          className={
            isMobile ? 'text-sm text-muted-foreground' : 'text-muted-foreground'
          }
        >
          Bienvenido de nuevo a Poli-Chan
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={isMobile ? 'space-y-3' : 'space-y-4'}
      >
        <div
          className={
            isMobile
              ? 'grid w-full items-center gap-2'
              : 'grid w-full items-center gap-3'
          }
        >
          <Label htmlFor="userName" className={isMobile ? 'text-sm' : ''}>
            Nombre de usuario
          </Label>
          <Input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="usuario123"
            required
            maxLength={50}
            minLength={3}
            className={isMobile ? 'h-9 text-sm' : ''}
          />
        </div>

        <div
          className={
            isMobile
              ? 'grid w-full items-center gap-2'
              : 'grid w-full items-center gap-3'
          }
        >
          <Label htmlFor="password" className={isMobile ? 'text-sm' : ''}>
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              maxLength={100}
              className={isMobile ? 'pr-10 h-9 text-sm' : 'pr-10'}
            />
          </div>
        </div>

        {error && (
          <div
            className={
              isMobile
                ? 'p-2 text-xs text-destructive bg-destructive/10 rounded-md border border-destructive/20'
                : 'p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20'
            }
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className={isMobile ? 'w-full h-9 text-sm' : 'w-full'}
        >
          {isLoading && <Spinner className="size-4 mr-2" />}
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className={isMobile ? 'text-center text-xs' : 'text-center text-sm'}>
        <span className="text-muted-foreground">¿No tienes una cuenta? </span>
        <Button
          variant="link"
          onClick={onNavigateToRegister}
          className="p-0 h-auto"
        >
          Regístrate
        </Button>
      </div>
    </div>
  )
}

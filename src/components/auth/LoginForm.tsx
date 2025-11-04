import { useState } from 'react'
import type { LoginCredentials } from '@/types/auth.types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Eye, EyeOff } from 'lucide-react'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  onNavigateToRegister: () => void
}

export function LoginForm({ onSubmit, onNavigateToRegister }: LoginFormProps) {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="w-full p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-md border">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
        <p className="text-muted-foreground">Bienvenido de nuevo a PoliChan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid w-full items-center gap-3">
          <Label htmlFor="userName">Nombre de usuario</Label>
          <Input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="usuario123"
            required
          />
        </div>

        <div className="grid w-full items-center gap-3">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Spinner className="size-4 mr-2" />}
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className="text-center text-sm">
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

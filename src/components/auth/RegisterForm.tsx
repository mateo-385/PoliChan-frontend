import { useState } from 'react'
import type { RegisterCredentials } from '@/types/auth.types'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useIsMobile } from '@/hooks/use-mobile'

interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>
  onNavigateToLogin: () => void
}

export function RegisterForm({
  onSubmit,
  onNavigateToLogin,
}: RegisterFormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useIsMobile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)

    try {
      await onSubmit({ firstName, lastName, userName, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
          Crear Cuenta
        </h1>
        <p
          className={
            isMobile ? 'text-sm text-muted-foreground' : 'text-muted-foreground'
          }
        >
          Únete a Poli-Chan
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={isMobile ? 'space-y-3' : 'space-y-4'}
      >
        <div
          className={
            isMobile ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-2 gap-4'
          }
        >
          <div
            className={
              isMobile
                ? 'grid w-full items-center gap-2'
                : 'grid w-full items-center gap-3'
            }
          >
            <Label htmlFor="firstName" className={isMobile ? 'text-sm' : ''}>
              Nombre
            </Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nombre"
              required
              minLength={2}
              maxLength={50}
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
            <Label htmlFor="lastName" className={isMobile ? 'text-sm' : ''}>
              Apellido
            </Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido"
              required
              minLength={2}
              maxLength={50}
              className={isMobile ? 'h-9 text-sm' : ''}
            />
          </div>
        </div>

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
          <InputGroup>
            <InputGroupAddon>
              <span>@</span>
            </InputGroupAddon>
            <InputGroupInput
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="usuario123"
              required
              minLength={3}
              maxLength={50}
              className={isMobile ? 'h-9 text-sm' : ''}
            />
          </InputGroup>
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

        <div
          className={
            isMobile
              ? 'grid w-full items-center gap-2'
              : 'grid w-full items-center gap-3'
          }
        >
          <Label
            htmlFor="confirmPassword"
            className={isMobile ? 'text-sm' : ''}
          >
            Confirmar Contraseña
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isLoading ? 'Creando cuenta...' : 'Registrarse'}
        </Button>
      </form>

      <div className={isMobile ? 'text-center text-xs' : 'text-center text-sm'}>
        <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
        <Button
          variant="link"
          onClick={onNavigateToLogin}
          className="p-0 h-auto"
        >
          Inicia sesión
        </Button>
      </div>
    </div>
  )
}

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'

interface UserRegisteredNotificationProps {
  userName: string
  firstName: string
  lastName: string
  onClose?: () => void
}

export function UserRegisteredNotification({
  userName,
  firstName,
  lastName,
  onClose,
}: UserRegisteredNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  const fullName = `${firstName} ${lastName}`

  return (
    <Alert className="fixed top-4 right-4 z-50 w-96">
      <UserPlus className="h-4 w-4" />
      <AlertTitle>
        ¡Bienvenido <span className="font-bold">@{userName} </span>! 🎉
      </AlertTitle>
      <AlertDescription>{fullName} se unió a PoliChan</AlertDescription>
      <button
        onClick={() => {
          setIsVisible(false)
          onClose?.()
        }}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </Alert>
  )
}

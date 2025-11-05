import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { websocketService } from '@/services/websocket.service'
import { WebSocketContext } from './WebSocketContext'
import type {
  WebSocketMessage,
  UserRegisteredMessage,
} from '@/types/websocket.types'
import { UserRegisteredNotification } from '@/components/notifications/UserRegisteredNotification'
import { useAuth } from '@/hooks/use-auth'

interface WebSocketProviderProps {
  children: ReactNode
}

interface NotificationData {
  id: string
  userName: string
  firstName: string
  lastName: string
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const { user } = useAuth()

  useEffect(() => {
    websocketService.connect()

    const unsubscribe = websocketService.onMessage((data) => {
      console.log('WebSocket message received:', data)

      if (data.type === 'user-registered') {
        const message = data as UserRegisteredMessage
        console.log('New user registered:', message.data)

        if (user && message.data.userName === user.username) {
          console.log('Skipping notification for current user')
          return
        }

        setNotifications((prev) => [
          ...prev,
          {
            id: message.data.userId,
            userName: message.data.userName,
            firstName: message.data.firstName,
            lastName: message.data.lastName,
          },
        ])
      }
    })

    const intervalId = setInterval(() => {
      setIsConnected(websocketService.isConnected())
    }, 1000)

    return () => {
      clearInterval(intervalId)
      unsubscribe()
      websocketService.disconnect()
    }
  }, [user])

  const sendMessage = useCallback((data: WebSocketMessage) => {
    websocketService.send(data)
  }, [])

  const handleCloseNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }, [])

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage }}>
      {children}
      {/* Render notifications */}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-3 pointer-events-none">
        {notifications.map((notif, index) => (
          <div
            key={notif.id}
            className="pointer-events-auto"
            style={{ marginTop: `${index * 120}px` }}
          >
            <UserRegisteredNotification
              userName={notif.userName}
              firstName={notif.firstName}
              lastName={notif.lastName}
              onClose={() => handleCloseNotification(notif.id)}
            />
          </div>
        ))}
      </div>
    </WebSocketContext.Provider>
  )
}

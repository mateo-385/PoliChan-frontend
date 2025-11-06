import { useEffect } from 'react'
import { websocketService } from '@/services/websocket.service'
import { useWebSocket } from '@/hooks/use-websocket'

export function WebSocketStatus() {
  const { isConnected } = useWebSocket()

  useEffect(() => {
    const unsubscribe = websocketService.onMessage(() => {
      // TODO: Add toast notifications for WebSocket events
    })

    return unsubscribe
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
          isConnected
            ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
            : 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
        }`}
      >
        <div
          className={`h-2 w-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  )
}

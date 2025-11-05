import { createContext } from 'react'
import type { WebSocketMessage } from '@/types/websocket.types'

export interface WebSocketContextType {
  isConnected: boolean
  sendMessage: (data: WebSocketMessage) => void
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
)

import type { WebSocketMessage } from '@/types/websocket.types'

type WebSocketMessageHandler = (data: WebSocketMessage) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private messageHandlers: Set<WebSocketMessageHandler> = new Set()
  private isConnecting = false

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    this.isConnecting = true
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws'

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.isConnecting = false
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket message received:', data)

          // Notify all registered handlers
          this.messageHandlers.forEach((handler) => handler(data))
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnecting = false
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnecting = false
        this.ws = null
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      this.isConnecting = false
      this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      )
      setTimeout(() => this.connect(), this.reconnectDelay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.reconnectAttempts = this.maxReconnectAttempts // Prevent auto-reconnect
  }

  send(data: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  onMessage(handler: WebSocketMessageHandler) {
    this.messageHandlers.add(handler)

    // Return cleanup function
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const websocketService = new WebSocketService()

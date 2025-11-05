// WebSocket message types
export interface WebSocketMessage {
  type: string
  data?: unknown
  [key: string]: unknown
}

export interface UserRegisteredMessage extends WebSocketMessage {
  type: 'user-registered'
  data: {
    userId: string
    userName: string
    firstName: string
    lastName: string
  }
}

// Add more message types as your backend implements them

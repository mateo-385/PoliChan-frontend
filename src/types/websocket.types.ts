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

export interface PostCreatedMessage extends WebSocketMessage {
  type: 'post-created'
  data: {
    postId: string
    userId: string
    content: string
    ocurredAt: string
  }
}

export interface PostLikedMessage extends WebSocketMessage {
  type: 'like-created'
  data: {
    postId: string
    userId: string
    acurredAt: number
  }
}

export interface PostUnlikedMessage extends WebSocketMessage {
  type: 'post-unliked'
  data: {
    postId: string
    userId: string
    acurredAt: number
  }
}

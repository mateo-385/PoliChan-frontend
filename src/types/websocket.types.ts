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

export interface PostLikeRemovedMessage extends WebSocketMessage {
  type: 'like-removed'
  data: {
    postId: string
    userId: string
    occurredAt: string
  }
}

export interface CommentCreatedMessage extends WebSocketMessage {
  type: 'comment-created'
  data: {
    commentId: string
    postId: string
    userId: string
    content: string
    likesCount: number
    occurredAt: string
  }
  timestamp: string
}

export interface CommentUpdatedMessage extends WebSocketMessage {
  type: 'comment-updated'
  data: {
    commentId: string
    postId: string
    userId: string
    content: string
    likesCount: number
    occurredAt: string
  }
  timestamp: string
}

export interface CommentLikedMessage extends WebSocketMessage {
  type: 'comment-liked'
  data: {
    commentId: string
    postId: string
    userId: string
    occurredAt: string
  }
  timestamp: string
}

export interface CommentUnlikedMessage extends WebSocketMessage {
  type: 'comment-unliked'
  data: {
    commentId: string
    postId: string
    userId: string
    occurredAt: string
  }
  timestamp: string
}

/**
 * Mentions feature types
 */

export interface Mention {
  id: string
  postId: string
  mentionedUserId: string
  mentionerUserId: string
  mentionedUser?: {
    id: string
    firstName: string
    lastName: string
    username: string
  }
  mentionerUser?: {
    id: string
    firstName: string
    lastName: string
    username: string
  }
  createdAt: string
  read?: boolean
}

export interface MentionsResponse {
  mentions: Mention[]
  total: number
}

export interface UserMentionsResponse {
  mentions: Mention[]
  unreadCount: number
}

export interface MarkMentionReadResponse {
  message: string
  mentionId: string
  read: boolean
}

/**
 * Parsed mention from content text
 * Used for rendering mentions with styling
 */
export interface ParsedMention {
  username: string
  userId?: string
  startIndex: number
  endIndex: number
}

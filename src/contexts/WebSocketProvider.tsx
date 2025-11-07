import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { websocketService } from '@/services/websocket.service'
import { WebSocketContext } from './WebSocketContext'
import type {
  WebSocketMessage,
  UserRegisteredMessage,
  PostCreatedMessage,
  PostLikedMessage,
  PostUnlikedMessage,
  CommentCreatedMessage,
  CommentLikedMessage,
  CommentUnlikedMessage,
} from '@/types/websocket.types'
import { UserRegisteredNotification } from '@/components/notifications/UserRegisteredNotification'
import { CommentNotification } from '@/components/notifications/CommentNotification'
import { useAuth } from '@/hooks/use-auth'
import { useIsMobile } from '@/hooks/use-mobile'

interface WebSocketProviderProps {
  children: ReactNode
}

interface NotificationData {
  id: string
  type: 'user-registered'
  userName: string
  firstName: string
  lastName: string
}

interface CommentNotificationData {
  id: string
  type: 'comment-created'
  userName: string
  postId: string
}

type UnifiedNotification = NotificationData | CommentNotificationData

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [notificationQueue, setNotificationQueue] = useState<
    UnifiedNotification[]
  >([])
  const [visibleNotifications, setVisibleNotifications] = useState<
    UnifiedNotification[]
  >([])
  const [dismissingIds, setDismissingIds] = useState<string[]>([])
  const { user } = useAuth()
  const isMobile = useIsMobile()

  useEffect(() => {
    websocketService.connect()

    const intervalId = setInterval(() => {
      setIsConnected(websocketService.isConnected())
    }, 1000)

    return () => {
      clearInterval(intervalId)
      websocketService.disconnect()
    }
  }, [])

  useEffect(() => {
    const maxVisible = isMobile ? 2 : 3

    if (dismissingIds.length > 0) return

    if (
      notificationQueue.length > 0 &&
      visibleNotifications.length < maxVisible
    ) {
      const timer = setTimeout(() => {
        const [next, ...rest] = notificationQueue
        setNotificationQueue(rest)
        setVisibleNotifications((prev) => [...prev, next])
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [notificationQueue, visibleNotifications, isMobile, dismissingIds])

  const addNotification = useCallback((notification: UnifiedNotification) => {
    setNotificationQueue((prev) => {
      const existsInQueue = prev.some((n) => n.id === notification.id)
      if (existsInQueue) return prev

      return [...prev, notification]
    })

    setVisibleNotifications((prev) => {
      const existsInVisible = prev.some((n) => n.id === notification.id)
      if (existsInVisible) {
        return prev
      }
      return prev
    })
  }, [])

  useEffect(() => {
    const unsubscribe = websocketService.onMessage((data) => {
      if (data.type === 'user-registered') {
        const message = data as UserRegisteredMessage

        if (user && message.data.userName === user.username) {
          return
        }

        addNotification({
          id: message.data.userId,
          type: 'user-registered',
          userName: message.data.userName,
          firstName: message.data.firstName,
          lastName: message.data.lastName,
        })
      }

      if (data.type === 'post-created') {
        const message = data as PostCreatedMessage

        if (user && message.data.userId === user.id) {
          return
        }

        try {
          const evt = new CustomEvent('post-created', { detail: message.data })
          window.dispatchEvent(evt)
        } catch {
          // Ignore dispatch errors
        }
      }

      if (data.type === 'like-created') {
        const message = data as PostLikedMessage

        try {
          const evt = new CustomEvent('like-created', { detail: message.data })
          window.dispatchEvent(evt)
        } catch {
          // Ignore dispatch errors
        }
      }

      if (data.type === 'like-deleted') {
        const message = data as PostUnlikedMessage

        try {
          const evt = new CustomEvent('like-deleted', { detail: message.data })
          window.dispatchEvent(evt)
        } catch {
          // Ignore dispatch errors
        }
      }

      if (data.type === 'comment-created') {
        const message = data as CommentCreatedMessage

        try {
          const evt = new CustomEvent('comment-created', {
            detail: message.data,
          })
          window.dispatchEvent(evt)
        } catch {
          // Ignore dispatch errors
        }

        if (user && message.data.userId !== user.id) {
          import('@/services/post.service').then(({ postService }) => {
            postService
              .getPostById(message.data.postId)
              .then((postData) => {
                if (postData.post.userId === user.id) {
                  const newComment = postData.comments.find(
                    (c) => c.id === message.data.commentId
                  )

                  if (newComment?.user) {
                    const fullName = `${newComment.user.firstName} ${newComment.user.lastName}`
                    addNotification({
                      id: `comment-${message.data.commentId}`,
                      type: 'comment-created',
                      userName: fullName,
                      postId: message.data.postId,
                    })
                  } else {
                    addNotification({
                      id: `comment-${message.data.commentId}`,
                      type: 'comment-created',
                      userName: 'Someone',
                      postId: message.data.postId,
                    })
                  }
                }
              })
              .catch(() => {
                // Ignore errors - don't show notification if we can't verify
              })
          })
        }
      }

      if (data.type === 'comment-liked') {
        const message = data as CommentLikedMessage

        try {
          const evt = new CustomEvent('comment-like-created', {
            detail: {
              commentId: message.data.commentId,
              userId: message.data.userId,
            },
          })
          window.dispatchEvent(evt)
        } catch {
          // Ignore dispatch errors
        }
      }

      if (data.type === 'comment-unliked') {
        const message = data as CommentUnlikedMessage

        try {
          const evt = new CustomEvent('comment-like-deleted', {
            detail: {
              commentId: message.data.commentId,
              userId: message.data.userId,
            },
          })
          window.dispatchEvent(evt)
        } catch {
          // Ignore dispatch errors
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [user, addNotification])

  const sendMessage = useCallback((data: WebSocketMessage) => {
    websocketService.send(data)
  }, [])

  const handleDismissNotification = useCallback((id: string) => {
    setDismissingIds((prev) => [...prev, id])

    setTimeout(() => {
      setVisibleNotifications((prev) => prev.filter((notif) => notif.id !== id))
      setDismissingIds((prev) => prev.filter((dismissId) => dismissId !== id))
    }, 300)
  }, [])

  const handleSeePost = useCallback((postId: string) => {
    const evt = new CustomEvent('open-post-modal', { detail: { postId } })
    window.dispatchEvent(evt)
  }, [])

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        {visibleNotifications.map((notif, index) => {
          const isDismissing = dismissingIds.includes(notif.id)
          return (
            <div
              key={notif.id}
              className={`pointer-events-auto absolute left-1/2 -translate-x-1/2 ${
                isDismissing
                  ? 'animate-out fade-out duration-300'
                  : 'animate-in fade-in duration-300'
              }`}
              style={{
                top: `${index * (isMobile ? 70 : 80)}px`,
                transition: 'top 0.3s ease-out',
              }}
            >
              {notif.type === 'user-registered' && (
                <UserRegisteredNotification
                  userName={notif.userName}
                  firstName={notif.firstName}
                  lastName={notif.lastName}
                  onClose={() => handleDismissNotification(notif.id)}
                />
              )}
              {notif.type === 'comment-created' && (
                <CommentNotification
                  userName={notif.userName}
                  postId={notif.postId}
                  onSeePost={handleSeePost}
                  onDismiss={() => handleDismissNotification(notif.id)}
                />
              )}
            </div>
          )
        })}
      </div>
    </WebSocketContext.Provider>
  )
}

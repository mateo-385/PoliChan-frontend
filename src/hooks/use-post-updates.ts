import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface UsePostUpdatesOptions {
  onNewPost: () => void
  onPostLiked: (postId: string, userId: string) => void
  onPostUnliked: (postId: string, userId: string) => void
  onCommentCreated?: (postId: string, commentId: string, userId: string) => void
}

/**
 * Hook to listen to WebSocket post update events
 * Handles: post-created, like-created, like-deleted, comment-created
 */
export function usePostUpdates({
  onNewPost,
  onPostLiked,
  onPostUnliked,
  onCommentCreated,
}: UsePostUpdatesOptions) {
  const { user } = useAuth()

  // Listen for new posts from other users
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const custom = e as CustomEvent
        const payload = custom.detail as {
          postId: string
          userId: string
        }

        if (!payload || !payload.postId) return

        // Ignore posts created by current user
        if (user && payload.userId === user.id) return

        onNewPost()
      } catch {
        // Ignore invalid post-created events
      }
    }

    window.addEventListener('post-created', handler as EventListener)
    return () =>
      window.removeEventListener('post-created', handler as EventListener)
  }, [user, onNewPost])

  // Listen for likes
  useEffect(() => {
    const handleLike = (e: Event) => {
      try {
        const custom = e as CustomEvent
        const payload = custom.detail as {
          postId: string
          userId: string
        }

        if (!payload || !payload.postId) return

        onPostLiked(payload.postId, payload.userId)
      } catch {
        // Ignore invalid like-created events
      }
    }

    window.addEventListener('like-created', handleLike as EventListener)
    return () =>
      window.removeEventListener('like-created', handleLike as EventListener)
  }, [onPostLiked])

  // Listen for unlikes
  useEffect(() => {
    const handleUnlike = (e: Event) => {
      try {
        const custom = e as CustomEvent
        const payload = custom.detail as {
          postId: string
          userId: string
        }

        if (!payload || !payload.postId) return

        onPostUnliked(payload.postId, payload.userId)
      } catch {
        // Ignore invalid like-deleted events
      }
    }

    window.addEventListener('like-deleted', handleUnlike as EventListener)
    return () =>
      window.removeEventListener('like-deleted', handleUnlike as EventListener)
  }, [onPostUnliked])

  // Listen for new comments
  useEffect(() => {
    if (!onCommentCreated) return

    const handleComment = (e: Event) => {
      try {
        const custom = e as CustomEvent
        const payload = custom.detail as {
          commentId: string
          postId: string
          userId: string
        }

        if (!payload || !payload.postId || !payload.commentId) return

        onCommentCreated(payload.postId, payload.commentId, payload.userId)
      } catch {
        // Ignore invalid comment-created events
      }
    }

    window.addEventListener('comment-created', handleComment as EventListener)
    return () =>
      window.removeEventListener(
        'comment-created',
        handleComment as EventListener
      )
  }, [onCommentCreated])
}

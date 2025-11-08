import { Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { postService } from '@/services/post.service'
import { mentionsRepository } from '@/repositories/mentions.repository'
import { getAvatarColor, getInitials } from '@/lib/avatar'
import { useLike } from '@/hooks/use-like'
import { useAuth } from '@/hooks/use-auth'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Comment } from '@/types/post.types'
import { MentionText } from './MentionText'

interface CommentCardProps {
  comment: Comment
}

// Comment card with real-time like synchronization

export function CommentCard({ comment }: CommentCardProps) {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [validMentions, setValidMentions] = useState<string[]>([])

  const { isLiked, count, toggleLike, setCount } = useLike({
    initialLiked: comment.likedByCurrentUser ?? false,
    initialCount: comment.likesCount,
    onLike: async () => {
      if (user) {
        await postService.likeComment(comment.id, user.id)
      }
    },
    onUnlike: async () => {
      if (user) {
        await postService.unlikeComment(comment.id, user.id)
      }
    },
  })

  // Listen for like/unlike events from WebSocket (other users only)
  useEffect(() => {
    const handleLikeCreated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        commentId: string
        userId: string
      }>
      // Only update if it's for this comment and NOT from current user
      if (
        customEvent.detail.commentId === comment.id &&
        customEvent.detail.userId !== user?.id
      ) {
        setCount((prev: number) => prev + 1)
      }
    }

    const handleLikeDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<{
        commentId: string
        userId: string
      }>
      // Only update if it's for this comment and NOT from current user
      if (
        customEvent.detail.commentId === comment.id &&
        customEvent.detail.userId !== user?.id
      ) {
        setCount((prev: number) => Math.max(0, prev - 1))
      }
    }

    window.addEventListener('comment-like-created', handleLikeCreated)
    window.addEventListener('comment-like-deleted', handleLikeDeleted)

    return () => {
      window.removeEventListener('comment-like-created', handleLikeCreated)
      window.removeEventListener('comment-like-deleted', handleLikeDeleted)
    }
    // setCount and setIsLiked are stable setState functions and don't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment.id, user?.id])

  // Fetch valid mentions for this comment
  useEffect(() => {
    const fetchMentions = async () => {
      try {
        // Comments might not have a mentions endpoint, so we'll get mentions for the post instead
        const response = await mentionsRepository.getPostMentions(
          comment.postId
        )
        // Extract unique usernames from mentions
        const usernames = [
          ...new Set(
            response.mentions
              .map((m) => m.mentionedUser?.username)
              .filter(Boolean) as string[]
          ),
        ]
        setValidMentions(usernames)
      } catch (error) {
        console.error('Failed to fetch mentions:', error)
        setValidMentions([])
      }
    }

    fetchMentions()
  }, [comment.postId])

  const firstName = comment.user?.firstName || ''
  const lastName = comment.user?.lastName || ''
  const username = comment.user?.username || 'unknown'
  const commentInitials = getInitials(firstName, lastName)
  const authorName = `${firstName} ${lastName}`.trim() || 'Unknown User'

  return (
    <div
      className={
        isMobile ? 'pt-3 bg-card rounded-lg p-3' : 'pt-4 bg-card rounded-lg p-4'
      }
    >
      <div
        className={
          isMobile ? 'flex items-center gap-1.5' : 'flex items-center gap-2'
        }
      >
        <div
          className={
            isMobile
              ? 'size-7 flex items-center justify-center rounded-full font-semibold text-xs text-white shrink-0'
              : 'size-8 flex items-center justify-center rounded-full font-semibold text-sm text-white shrink-0'
          }
          style={{
            backgroundColor: getAvatarColor(comment.userId),
          }}
        >
          {commentInitials}
        </div>
        <h4
          className={
            isMobile
              ? 'font-semibold text-sm truncate'
              : 'font-semibold truncate'
          }
        >
          {authorName}
        </h4>
        <span
          className={
            isMobile
              ? 'text-muted-foreground text-xs truncate'
              : 'text-muted-foreground text-sm'
          }
        >
          @{username}
        </span>
        <span
          className={
            isMobile
              ? 'text-muted-foreground text-xs'
              : 'text-muted-foreground text-sm'
          }
        >
          ·{' '}
          {postService.formatTimeAgo(
            new Date(comment.timestamps.createdAt.value)
          )}
        </span>
      </div>
      <p
        className={
          isMobile
            ? 'mt-1.5 text-foreground text-xs leading-relaxed whitespace-pre-wrap break-all'
            : 'mt-2 text-foreground text-sm leading-relaxed whitespace-pre-wrap break-all'
        }
      >
        <MentionText content={comment.content} validMentions={validMentions} />
      </p>
      <div
        className={
          isMobile
            ? 'flex items-center gap-3 mt-1.5 text-xs text-muted-foreground'
            : 'flex items-center gap-4 mt-2 text-xs text-muted-foreground'
        }
      >
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 hover:text-red-400 transition-colors ${
            isLiked ? 'text-red-500' : ''
          }`}
        >
          <Heart
            className={isMobile ? 'size-3' : 'size-4'}
            fill={isLiked ? 'currentColor' : 'none'}
          />
          {count}
        </button>
      </div>
    </div>
  )
}

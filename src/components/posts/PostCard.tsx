import { Heart, MessageCircle } from 'lucide-react'
import { postService } from '@/services/post.service'
import type { Post } from '@/types/post.types'
import { getAvatarColor, getInitials } from '@/lib/avatar'
import { useIsMobile } from '@/hooks/use-mobile'
import { useLike } from '@/hooks/use-like'
import { useAuth } from '@/hooks/use-auth'

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onClick?: (postId: string) => void
  showActions?: boolean
}

export function PostCard({
  post,
  onLike,
  onClick,
  showActions = true,
}: PostCardProps) {
  const isMobile = useIsMobile()
  const { user } = useAuth()

  const { isLiked, count, toggleLike } = useLike({
    initialLiked: post.likedByCurrentUser ?? false,
    initialCount: post.likesCount,
    onLike: async () => {
      if (user) {
        await postService.likePost(post.id, user.id)
        if (onLike) onLike(post.id)
      }
    },
    onUnlike: async () => {
      if (user) {
        await postService.unlikePost(post.id, user.id)
        if (onLike) onLike(post.id)
      }
    },
  })

  const handlePostClick = () => {
    if (onClick) {
      onClick(post.id)
    }
  }

  if (!post.user) {
    return null
  }

  const authorName = `${post.user.firstName} ${post.user.lastName}`
  const authorUsername = post.user.userName || post.user.username || 'unknown'
  const createdAt = new Date(post.timestamps.createdAt.value)
  const avatarColor = getAvatarColor(post.user.id)
  const initials = getInitials(post.user.firstName, post.user.lastName)

  return (
    <div
      className={
        isMobile
          ? 'bg-card rounded-lg shadow border p-3 cursor-pointer hover:border-primary/50 transition-colors'
          : 'bg-card rounded-lg shadow border p-5 cursor-pointer hover:border-primary/50 transition-colors'
      }
      onClick={handlePostClick}
    >
      <div
        className={
          isMobile ? 'flex items-start gap-2' : 'flex items-start gap-4'
        }
      >
        <div
          className={
            isMobile
              ? 'size-8 flex items-center justify-center rounded-full font-bold shrink-0 text-white text-sm'
              : 'size-10 flex items-center justify-center rounded-full font-bold shrink-0 text-white'
          }
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <div className="flex-1  ">
          <div
            className={
              isMobile
                ? 'flex items-center gap-1 text-xs'
                : 'flex items-center gap-2'
            }
          >
            <h3
              className={
                isMobile
                  ? 'font-semibold truncate text-sm'
                  : 'font-semibold truncate'
              }
            >
              {authorName}
            </h3>
            <span
              className={
                isMobile
                  ? 'text-muted-foreground text-xs truncate'
                  : 'text-muted-foreground text-sm truncate'
              }
            >
              @{authorUsername}
            </span>
            <span
              className={
                isMobile
                  ? 'text-muted-foreground text-xs shrink-0'
                  : 'text-muted-foreground text-sm shrink-0'
              }
            >
              · {postService.formatTimeAgo(createdAt)}
            </span>
          </div>
          <p
            className={
              isMobile
                ? 'mt-1 text-sm text-foreground whitespace-pre-wrap break-all'
                : 'mt-2 text-foreground whitespace-pre-wrap break-all'
            }
          >
            {post.content}
          </p>
          {showActions && (
            <div
              className={
                isMobile
                  ? 'flex items-center gap-4 mt-2 text-xs text-muted-foreground cursor-pointer'
                  : 'flex items-center gap-6 mt-4 text-sm text-muted-foreground cursor-pointer'
              }
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (onClick) onClick(post.id)
                }}
                className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
              >
                <MessageCircle className={isMobile ? 'size-4' : 'size-5'} />
                <span>{post.commentsCount}</span>
              </button>
              <button
                onClick={toggleLike}
                className={`flex items-center gap-1.5 cursor-pointer hover:text-red-400 transition-colors ${
                  isLiked ? 'text-red-500' : ''
                }`}
              >
                <Heart
                  style={{
                    width: isMobile ? '16px' : '22px',
                    height: isMobile ? '16px' : '22px',
                  }}
                  className={`transition-all ${
                    isLiked ? 'fill-current scale-110' : 'scale-100'
                  }`}
                />
                <span>{count}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

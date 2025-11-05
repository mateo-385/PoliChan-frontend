import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { postService } from '@/services/post.service'
import type { Post } from '@/types/post.types'
import { getAvatarUrl, getAvatarColor, getInitials } from '@/lib/avatar'

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
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onLike) {
      onLike(post.id)
    }
  }

  const handlePostClick = () => {
    if (onClick) {
      onClick(post.id)
    }
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (!post.user) {
    return null
  }

  const authorName = `${post.user.firstName} ${post.user.lastName}`
  // Handle both userName (camelCase) and username (lowercase) from API
  const authorUsername = post.user.userName || post.user.username || 'unknown'
  const createdAt = new Date(post.timestamps.createdAt.value)
  const avatarUrl = getAvatarUrl(post.user.id)
  const avatarColor = getAvatarColor(post.user.id)
  const initials = getInitials(post.user.firstName, post.user.lastName)

  return (
    <div
      className="bg-card rounded-lg shadow border p-6 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={handlePostClick}
    >
      <div className="flex items-start gap-4">
        <img
          src={avatarUrl}
          alt={authorName}
          className="size-10 rounded-full shrink-0"
          style={{ backgroundColor: avatarColor }}
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div
          className="size-10 items-center justify-center rounded-full font-bold shrink-0 hidden text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{authorName}</h3>
            <span className="text-muted-foreground text-sm truncate">
              @{authorUsername}
            </span>
            <span className="text-muted-foreground text-sm shrink-0">
              · {postService.formatTimeAgo(createdAt)}
            </span>
          </div>
          <p className="mt-2 text-foreground whitespace-pre-wrap wrap-break-word">
            {post.content}
          </p>
          {showActions && (
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (onClick) onClick(post.id)
                }}
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <MessageCircle className="size-4" />
                <span>{post.commentsCount}</span>
              </button>
              <button
                onClick={handleLikeClick}
                className={`flex items-center gap-1.5 hover:text-primary transition-colors ${
                  post.likedByCurrentUser ? 'text-red-500' : ''
                }`}
              >
                <Heart
                  className={`size-4 ${
                    post.likedByCurrentUser ? 'fill-current' : ''
                  }`}
                />
                <span>{post.likesCount}</span>
              </button>
              <button
                onClick={handleShareClick}
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Share2 className="size-4" />
                <span>Compartir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

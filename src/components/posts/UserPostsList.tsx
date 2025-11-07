import { MessageCircle, Heart } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { postService } from '@/services/post.service'
import type { Post } from '@/types/post.types'
import { getAvatarColor, getInitials } from '@/lib/avatar'
import { useIsMobile } from '@/hooks/use-mobile'

interface UserPostsListProps {
  posts: Post[]
  isLoading: boolean
  onPostClick: (postId: string) => void
}

export function UserPostsList({
  posts,
  isLoading,
  onPostClick,
}: UserPostsListProps) {
  const isMobile = useIsMobile()
  if (isLoading) {
    return (
      <div className={isMobile ? 'space-y-2' : 'space-y-4'}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={
              isMobile ? 'p-3 border rounded-md' : 'p-4 border rounded-md'
            }
          >
            <div
              className={
                isMobile
                  ? 'flex items-center gap-1.5 mb-1.5'
                  : 'flex items-center gap-2 mb-2'
              }
            >
              <Skeleton className={isMobile ? 'h-3 w-20' : 'h-4 w-24'} />
              <Skeleton className={isMobile ? 'h-3 w-16' : 'h-4 w-20'} />
            </div>
            <div className="space-y-2">
              <Skeleton className={isMobile ? 'h-3 w-full' : 'h-4 w-full'} />
              <Skeleton className={isMobile ? 'h-3 w-3/4' : 'h-4 w-3/4'} />
            </div>
            <div
              className={
                isMobile
                  ? 'flex items-center gap-3 mt-2'
                  : 'flex items-center gap-4 mt-3'
              }
            >
              <Skeleton className={isMobile ? 'h-3 w-16' : 'h-4 w-20'} />
              <Skeleton className={isMobile ? 'h-3 w-12' : 'h-4 w-16'} />
              <Skeleton className={isMobile ? 'h-3 w-20' : 'h-4 w-24'} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div
        className={
          isMobile
            ? 'text-center py-6 text-sm text-muted-foreground'
            : 'text-center py-8 text-muted-foreground'
        }
      >
        Aún no hay publicaciones
      </div>
    )
  }

  return (
    <div className={isMobile ? 'space-y-2' : 'space-y-4'}>
      {posts
        .filter((post) => post.user)
        .map((post) => (
          <div
            key={post.id}
            className={
              isMobile
                ? 'p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer'
                : 'p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer'
            }
            onClick={() => onPostClick(post.id)}
          >
            <div
              className={
                isMobile
                  ? 'flex items-center gap-1.5 mb-1.5'
                  : 'flex items-center gap-2 mb-2'
              }
            >
              <div
                className={
                  isMobile
                    ? 'size-7 flex items-center justify-center rounded-full font-semibold text-xs text-white'
                    : 'size-8 flex items-center justify-center rounded-full font-semibold text-sm text-white'
                }
                style={{ backgroundColor: getAvatarColor(post.user!.id) }}
              >
                {getInitials(post.user!.firstName, post.user!.lastName)}
              </div>
              <span
                className={
                  isMobile
                    ? 'font-semibold truncate text-sm'
                    : 'font-semibold truncate max-w-80'
                }
              >{`${post.user!.firstName} ${post.user!.lastName}`}</span>
              <span
                className={
                  isMobile
                    ? 'text-muted-foreground text-xs'
                    : 'text-muted-foreground text-sm'
                }
              >
                @{post.user!.userName || post.user!.username || 'unknown'}
              </span>
            </div>
            <p
              className={
                isMobile
                  ? 'text-sm text-foreground whitespace-pre-wrap break-all'
                  : 'text-foreground whitespace-pre-wrap break-all'
              }
            >
              {post.content}
            </p>
            <div
              className={
                isMobile
                  ? 'flex items-center gap-3 mt-2 text-xs text-muted-foreground'
                  : 'flex items-center gap-4 mt-3 text-sm text-muted-foreground'
              }
            >
              <span className="flex items-center gap-1.5">
                <MessageCircle className={isMobile ? 'size-3.5' : 'size-4'} />
                {post.commentsCount}
              </span>
              <span className="flex items-center gap-1.5">
                <Heart
                  className={`${isMobile ? 'size-3.5' : 'size-4'} ${
                    post.likedByCurrentUser ? 'fill-current text-red-500' : ''
                  }`}
                />
                {post.likesCount}
              </span>
              <span className="ml-auto">
                {postService.formatTimeAgo(
                  new Date(post.timestamps.createdAt.value)
                )}
              </span>
            </div>
          </div>
        ))}
    </div>
  )
}

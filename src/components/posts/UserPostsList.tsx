import { MessageCircle, Heart } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { postService } from '@/services/post.service'
import type { Post } from '@/types/post.types'
import { getAvatarColor, getInitials } from '@/lib/avatar'

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
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex items-center gap-4 mt-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aún no hay publicaciones
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts
        .filter((post) => post.user)
        .map((post) => (
          <div
            key={post.id}
            className="p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onPostClick(post.id)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="size-8 flex items-center justify-center rounded-full font-semibold text-sm text-white"
                style={{ backgroundColor: getAvatarColor(post.user!.id) }}
              >
                {getInitials(post.user!.firstName, post.user!.lastName)}
              </div>
              <span className="font-semibold truncate w-96">{`${
                post.user!.firstName
              } ${post.user!.lastName}`}</span>
              <span className="text-muted-foreground text-sm ">
                @{post.user!.userName || post.user!.username || 'unknown'}
              </span>
            </div>
            <p className="text-foreground whitespace-pre-wrap">
              {post.content}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MessageCircle className="size-4" />
                {post.commentsCount}
              </span>
              <span className="flex items-center gap-1.5">
                <Heart
                  className={`size-4 ${
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

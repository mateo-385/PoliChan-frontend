import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { UserPostsList } from '@/components/posts'
import { useUserPosts } from '@/hooks/use-posts'
import { ModalPost } from '@/components/posts/ModalPost'
import { getInitials, getAvatarColor } from '@/lib/avatar'
import { useIsMobile } from '@/hooks/use-mobile'

export function ProfilePage() {
  const { user } = useAuth()
  const { posts: userPosts, isLoading } = useUserPosts(user?.id)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId)
    setIsModalOpen(true)
  }

  const initials = user ? getInitials(user.firstName, user.lastName) : '?'
  const avatarColor = user ? getAvatarColor(user.id) : '#3B82F6'

  return (
    <div className={isMobile ? 'px-0 pt-3 pb-4' : 'p-6'}>
      <div className={isMobile ? 'space-y-3' : 'space-y-6'}>
        <div className="bg-card rounded-lg shadow border">
          <div
            className={
              isMobile
                ? 'h-24 bg-linear-to-r from-primary/20 to-primary/10 rounded-t-lg'
                : 'h-32 bg-linear-to-r from-primary/20 to-primary/10 rounded-t-lg'
            }
          />
          <div className={isMobile ? 'px-3 pb-4' : 'px-6 pb-6'}>
            <div
              className={
                isMobile
                  ? 'flex items-end gap-3 -mt-12'
                  : 'flex items-end gap-6 -mt-16'
              }
            >
              <Avatar
                className={
                  isMobile
                    ? 'size-24 border-background'
                    : 'size-32 border-background'
                }
              >
                <AvatarFallback
                  className={
                    isMobile
                      ? 'text-white text-3xl font-bold'
                      : 'text-white text-5xl font-bold'
                  }
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className={isMobile ? 'flex-1 pt-14' : 'flex-1 pt-20'}>
                <h2
                  className={
                    isMobile
                      ? 'text-xl font-bold truncate'
                      : 'text-3xl font-bold truncate w-96'
                  }
                >{`${user?.firstName} ${user?.lastName}`}</h2>
                <p
                  className={
                    isMobile
                      ? 'text-sm text-muted-foreground'
                      : 'text-muted-foreground'
                  }
                >
                  @{user?.username}
                </p>
              </div>
            </div>

            <div
              className={isMobile ? 'mt-4 pt-4 border-t' : 'mt-8 pt-6 border-t'}
            >
              <div className="text-center">
                <div
                  className={
                    isMobile ? 'text-xl font-bold' : 'text-2xl font-bold'
                  }
                >
                  {userPosts.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Publicaciones
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={
            isMobile
              ? 'bg-card rounded-lg shadow border p-3'
              : 'bg-card rounded-lg shadow border p-6'
          }
        >
          <h3
            className={
              isMobile
                ? 'text-lg font-semibold mb-3'
                : 'text-xl font-semibold mb-4'
            }
          >
            Publicaciones
          </h3>
          <UserPostsList
            posts={userPosts}
            isLoading={isLoading}
            onPostClick={handlePostClick}
          />
        </div>
      </div>

      <ModalPost
        postId={selectedPostId!}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

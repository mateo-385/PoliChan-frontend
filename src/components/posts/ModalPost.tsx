import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { postService } from '@/services/post.service'
import type { PostWithComments } from '@/types/post.types'
import { DialogOverlay } from '@radix-ui/react-dialog'
import { useEffect, useState, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, MessageCircle } from 'lucide-react'
import { PostSubmissionForm } from '@/components/posts'
import { useAuth } from '@/hooks/use-auth'
import { getAvatarColor, getInitials } from '@/lib/avatar'

type ModalPostProps = {
  isOpen: boolean
  onClose: () => void
  postId: string
}

export function ModalPost({ isOpen, onClose, postId }: ModalPostProps) {
  const [postData, setPostData] = useState<PostWithComments | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadPost = useCallback(async () => {
    if (!postId) return

    try {
      setIsLoading(true)
      setError(null)

      const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 400))

      const [data] = await Promise.all([
        postService.getPostById(postId),
        minDelayPromise,
      ])

      const postWithLikedStatus = {
        ...data,
        post: {
          ...data.post,
          likedByCurrentUser: user ? data.post.likes.includes(user.id) : false,
        },
      }

      setPostData(postWithLikedStatus)
    } catch (err) {
      setError('Error al cargar la publicación')
      console.error('Error loading post:', err)
    } finally {
      setIsLoading(false)
    }
  }, [postId, user])

  useEffect(() => {
    if (isOpen && postId) {
      loadPost()
    }
  }, [isOpen, loadPost, postId])

  const handleToggleLike = async () => {
    if (!postId || !postData || !user) return

    try {
      const isLiked = postData.post.likedByCurrentUser || false

      if (isLiked) {
        await postService.unlikePost(postId, user.id)
      } else {
        await postService.likePost(postId, user.id)
      }

      setPostData({
        ...postData,
        post: {
          ...postData.post,
          likes: isLiked
            ? postData.post.likes.filter((id) => id !== user.id)
            : [...postData.post.likes, user.id],
          likedByCurrentUser: !isLiked,
          likesCount: isLiked
            ? postData.post.likesCount - 1
            : postData.post.likesCount + 1,
        },
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al dar me gusta a la publicación'
      )
      await loadPost()
    }
  }

  const handleToggleCommentLike = async (commentId: string) => {
    if (!postData) return

    try {
      const updatedComment = await postService.toggleCommentLike(commentId)
      setPostData({
        ...postData,
        comments: postData.comments.map((c) =>
          c.id === commentId ? updatedComment : c
        ),
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al dar me gusta al comentario'
      )
    }
  }

  const handleCommentSubmitted = async () => {
    if (!postData) return

    try {
      const updatedData = await postService.getPostById(postId)

      setPostData({
        ...postData,
        post: {
          ...postData.post,
          commentsCount: updatedData.post.commentsCount,
        },
        comments: updatedData.comments,
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al actualizar los comentarios'
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <DialogContent className="max-w-2xl w-full max-h-[80vh] p-0 ">
          <DialogTitle className="sr-only">Publicación</DialogTitle>
          <DialogDescription className="sr-only">
            Vista detallada de la publicación y sus comentarios
          </DialogDescription>
          <ScrollArea className="h-[80vh] flex flex-col p-6 gap-4">
            {error && <p className="text-red-500">{error}</p>}
            {isLoading ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="size-12 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                      <div className="flex items-center gap-6 pt-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-24 w-full rounded-md" />
                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>

                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 bg-primary/5 rounded-lg space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              postData &&
              postData.post &&
              postData.post.user && (
                <>
                  <DialogHeader className="flex-row mb-2 gap-3 ">
                    <div
                      className="size-12 flex items-center justify-center rounded-full font-bold text-lg shrink-0 text-white "
                      style={{
                        backgroundColor: getAvatarColor(postData.post.user.id),
                      }}
                    >
                      {getInitials(
                        postData.post.user.firstName,
                        postData.post.user.lastName
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col ">
                        <h3 className="font-semibold truncate w-96 ">
                          {`${postData.post.user.firstName} ${postData.post.user.lastName}`}
                          <span className="text-muted-foreground text-sm">
                            {' '}
                            ·{' '}
                            {postService.formatTimeAgo(
                              new Date(postData.post.timestamps.createdAt.value)
                            )}
                          </span>
                        </h3>

                        <span className="text-muted-foreground text-sm">
                          @
                          {postData.post.user.userName ||
                            postData.post.user.username ||
                            'unknown'}
                        </span>
                      </div>
                    </div>
                  </DialogHeader>

                  <p className="mt-3 text-foreground text-base leading-relaxed whitespace-pre-wrap">
                    {postData.post.content}
                  </p>

                  <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="size-5" />
                      {postData.post.commentsCount}
                    </span>
                    <button
                      onClick={handleToggleLike}
                      className={`flex items-center gap-1 cursor-pointer hover:text-red-500 transition-colors ${
                        postData.post.likedByCurrentUser ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart
                        className="size-5"
                        fill={
                          postData.post.likedByCurrentUser
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                      {postData.post.likesCount}
                    </button>
                  </div>

                  <div className="my-4">
                    <PostSubmissionForm
                      onPostCreated={handleCommentSubmitted}
                      onSubmit={async (content) => {
                        await postService.createComment({
                          postId: postId,
                          content,
                        })
                      }}
                      placeholder="Escribe un comentario..."
                      buttonText="Comentar"
                      buttonTextSubmitting="Comentando..."
                    />
                  </div>

                  {postData.comments.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      Aún no hay comentarios. ¡Sé el primero en comentar!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {postData.comments.map((comment) => {
                        const [firstName = '', lastName = ''] =
                          comment.authorName.split(' ')
                        const commentInitials = getInitials(firstName, lastName)
                        return (
                          <div
                            key={comment.id}
                            className="pt-4  bg-card  rounded-lg p-4"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="size-8 flex items-center justify-center rounded-full font-semibold text-sm text-white"
                                style={{
                                  backgroundColor: getAvatarColor(
                                    comment.authorId
                                  ),
                                }}
                              >
                                {commentInitials}
                              </div>
                              <h4 className="font-semibold">
                                {comment.authorName}
                              </h4>
                              <span className="text-muted-foreground text-sm">
                                @{comment.authorUsername}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                · {postService.formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="mt-2 text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                              {comment.content}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <button
                                onClick={() =>
                                  handleToggleCommentLike(comment.id)
                                }
                                className={`flex items-center gap-1 hover:text-primary transition-colors ${
                                  comment.likedByCurrentUser
                                    ? 'text-red-500'
                                    : ''
                                }`}
                              >
                                <Heart
                                  className="size-3"
                                  fill={
                                    comment.likedByCurrentUser
                                      ? 'currentColor'
                                      : 'none'
                                  }
                                />
                                {comment.likesCount}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )
            )}
          </ScrollArea>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
}

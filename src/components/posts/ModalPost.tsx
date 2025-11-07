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
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, RefreshCw } from 'lucide-react'
import { PostSubmissionForm } from '@/components/posts'
import { CommentCard } from '@/components/posts/CommentCard'
import { useAuth } from '@/hooks/use-auth'
import { useLike } from '@/hooks/use-like'
import { getAvatarColor, getInitials } from '@/lib/avatar'
import { useIsMobile } from '@/hooks/use-mobile'

type ModalPostProps = {
  isOpen: boolean
  onClose: () => void
  postId: string
}

export function ModalPost({ isOpen, onClose, postId }: ModalPostProps) {
  const [postData, setPostData] = useState<PostWithComments | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newCommentId, setNewCommentId] = useState<string | null>(null)
  const [hasNewComments, setHasNewComments] = useState(false)
  const [isLoadingNewComments, setIsLoadingNewComments] = useState(false)
  const { user } = useAuth()
  const isMobile = useIsMobile()

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
        comments: data.comments.map((comment) => ({
          ...comment,
          likedByCurrentUser: user ? comment.likes.includes(user.id) : false,
        })),
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

  useEffect(() => {
    if (!isMobile || !isOpen) return

    window.history.pushState({ modalOpen: true }, '')

    const handlePopState = (event: PopStateEvent) => {
      if (isOpen) {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      if (window.history.state?.modalOpen) {
        window.history.back()
      }
    }
  }, [isMobile, isOpen, onClose])

  useEffect(() => {
    if (!isOpen || !postId) return

    const handleCommentCreated = (event: Event) => {
      const customEvent = event as CustomEvent
      const commentData = customEvent.detail

      if (commentData.postId === postId && commentData.userId !== user?.id) {
        setHasNewComments(true)
      }
    }

    window.addEventListener('comment-created', handleCommentCreated)

    return () => {
      window.removeEventListener('comment-created', handleCommentCreated)
    }
  }, [isOpen, postId, user?.id])

  const { isLiked, count, toggleLike } = useLike({
    initialLiked: postData?.post.likedByCurrentUser ?? false,
    initialCount: postData?.post.likesCount ?? 0,
    onLike: async () => {
      if (user) {
        await postService.likePost(postId, user.id)
      }
    },
    onUnlike: async () => {
      if (user) {
        await postService.unlikePost(postId, user.id)
      }
    },
  })

  const handleCommentSubmitted = async () => {
    if (!postData) return

    try {
      const updatedData = await postService.getPostById(postId)

      const processedComments = updatedData.comments.map((comment) => ({
        ...comment,
        likedByCurrentUser: user ? comment.likes.includes(user.id) : false,
      }))

      const previousCommentIds = new Set(postData.comments.map((c) => c.id))
      const newComment = processedComments.find(
        (c) => !previousCommentIds.has(c.id)
      )

      if (newComment) {
        setNewCommentId(newComment.id)
        setTimeout(() => setNewCommentId(null), 1000)
      }

      setPostData({
        ...postData,
        post: {
          ...postData.post,
          commentsCount: updatedData.post.commentsCount,
        },
        comments: processedComments,
      })
      setHasNewComments(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al actualizar los comentarios'
      )
    }
  }

  const loadNewComments = async () => {
    setIsLoadingNewComments(true)
    try {
      await handleCommentSubmitted()
    } finally {
      setIsLoadingNewComments(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay
        className={
          isMobile
            ? 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2'
            : 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'
        }
      >
        <DialogContent
          className={
            isMobile
              ? 'max-w-full w-full h-screen p-0 [&>button]:top-14 [&>button]:right-6'
              : 'max-w-2xl w-full max-h-[80vh] p-0'
          }
        >
          <DialogTitle className="sr-only">Publicación</DialogTitle>
          <DialogDescription className="sr-only">
            Vista detallada de la publicación y sus comentarios
          </DialogDescription>
          <ScrollArea
            className={
              isMobile
                ? 'h-screen flex flex-col pt-12 px-3 pb-3 gap-2'
                : 'h-[80vh] flex flex-col p-6 gap-4'
            }
          >
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
                  <DialogHeader
                    className={
                      isMobile ? 'flex-row mb-1 gap-2' : 'flex-row mb-2 gap-3'
                    }
                  >
                    <div
                      className={
                        isMobile
                          ? 'size-10 flex items-center justify-center rounded-full font-bold text-base shrink-0 text-white'
                          : 'size-12 flex items-center justify-center rounded-full font-bold text-lg shrink-0 text-white'
                      }
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
                        <h3
                          className={
                            isMobile
                              ? 'font-semibold truncate text-sm'
                              : 'font-semibold truncate w-96'
                          }
                        >
                          {`${postData.post.user.firstName} ${postData.post.user.lastName}`}
                          <span
                            className={
                              isMobile
                                ? 'text-muted-foreground text-xs'
                                : 'text-muted-foreground text-sm'
                            }
                          >
                            {' '}
                            ·{' '}
                            {postService.formatTimeAgo(
                              new Date(postData.post.timestamps.createdAt.value)
                            )}
                          </span>
                        </h3>

                        <span
                          className={
                            isMobile
                              ? 'text-muted-foreground text-xs text-left'
                              : 'text-muted-foreground text-sm text-left'
                          }
                        >
                          @
                          {postData.post.user.userName ||
                            postData.post.user.username ||
                            'unknown'}
                        </span>
                      </div>
                    </div>
                  </DialogHeader>
                  <p
                    className={
                      isMobile
                        ? 'mt-2 text-foreground text-sm leading-relaxed whitespace-pre-wrap'
                        : 'mt-3 text-foreground text-base leading-relaxed whitespace-pre-wrap'
                    }
                  >
                    {postData.post.content}
                  </p>
                  <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="size-5" />
                      {postData.post.commentsCount}
                    </span>
                    <button
                      onClick={toggleLike}
                      className={`flex items-center gap-1 cursor-pointer hover:text-red-500 transition-colors ${
                        isLiked ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart
                        className="size-5"
                        fill={isLiked ? 'currentColor' : 'none'}
                      />
                      {count}
                    </button>
                  </div>
                  <div className="mt-4 relative">
                    <PostSubmissionForm
                      onPostCreated={handleCommentSubmitted}
                      onSubmit={async (content) => {
                        if (!user) return
                        await postService.createComment({
                          postId: postId,
                          userId: user.id,
                          content,
                        })
                      }}
                      placeholder="Escribe un comentario..."
                      buttonText="Comentar"
                      buttonTextSubmitting="Comentando..."
                    />
                  </div>
                  {hasNewComments && (
                    <div className="flex justify-center align-middle my-2">
                      <Button
                        onClick={loadNewComments}
                        disabled={isLoadingNewComments}
                        className="shadow-lg hover:shadow-xl rounded-full cursor-pointer"
                        size={isMobile ? 'sm' : 'default'}
                      >
                        <RefreshCw
                          className={isLoadingNewComments ? 'animate-spin' : ''}
                        />
                        {isLoadingNewComments
                          ? 'Cargando...'
                          : 'Nuevos comentarios'}
                      </Button>
                    </div>
                  )}
                  {!hasNewComments && <div className="h-3"></div>}
                  {postData.comments.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      Aún no hay comentarios. ¡Sé el primero en comentar!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {postData.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={
                            comment.id === newCommentId
                              ? 'animate-in fade-in slide-in-from-top-2 duration-500'
                              : ''
                          }
                        >
                          <CommentCard comment={comment} />
                        </div>
                      ))}
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

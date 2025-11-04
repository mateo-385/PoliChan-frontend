import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { postService } from '@/services/post.service'
import type { PostWithComments } from '@/types/post.types'
import { DialogOverlay } from '@radix-ui/react-dialog'
import { useEffect, useState, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { PostSubmissionForm } from '@/components/posts'

type ModalPostProps = {
  isOpen: boolean
  onClose: () => void
  postId: string
}

export default function ModalPost({ isOpen, onClose, postId }: ModalPostProps) {
  const [postData, setPostData] = useState<PostWithComments | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPost = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await postService.getPostById(postId)
      setPostData(data)
    } catch {
      setError('Failed to load post')
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (isOpen) {
      loadPost()
    }
  }, [isOpen, loadPost])

  const handleToggleLike = async () => {
    if (!postId || !postData) return

    try {
      const updatedPost = await postService.toggleLike(postId)
      setPostData({
        ...postData,
        post: updatedPost,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post')
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
      setError(err instanceof Error ? err.message : 'Failed to like comment')
    }
  }

  const handleCommentSubmitted = async () => {
    if (!postData) return

    try {
      // Only fetch updated post data to get the new comments
      const updatedData = await postService.getPostById(postId)

      // Update only comments and comment count, preserve the rest of the post data
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
        err instanceof Error ? err.message : 'Failed to refresh comments'
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <DialogContent className="max-w-2xl w-full max-h-[80vh] p-0">
          <ScrollArea className="h-[80vh] flex flex-col p-6 gap-4">
            {error && <p className="text-red-500">{error}</p>}
            {isLoading ? (
              <div className="space-y-6">
                {/* Post Skeleton */}
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

                {/* Comment Form Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-24 w-full rounded-md" />
                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>

                {/* Comments Skeleton */}
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
              postData && (
                <>
                  <DialogHeader className="flex-row mb-2">
                    {postData.post.authorAvatar ? (
                      <img
                        src={postData.post.authorAvatar}
                        alt={postData.post.authorName}
                        className="size-12 rounded-full mr-2"
                      />
                    ) : (
                      <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full font-bold text-lg">
                        {postData.post.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <h3 className="font-semibold">
                          {postData.post.authorName}
                          <span className="text-muted-foreground text-sm">
                            {' '}
                            ·{' '}
                            {postService.formatTimeAgo(postData.post.createdAt)}
                          </span>
                        </h3>

                        <span className="text-muted-foreground text-sm">
                          @{postData.post.authorUsername}
                        </span>
                      </div>
                    </div>
                  </DialogHeader>

                  <p className="mt-3 text-foreground text-base leading-relaxed whitespace-pre-wrap">
                    {postData.post.content}
                  </p>

                  <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="size-4" />
                      {postData.post.commentsCount}
                    </span>
                    <button
                      onClick={handleToggleLike}
                      className={`flex items-center gap-1 hover:text-primary transition-colors ${
                        postData.post.likedByCurrentUser ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart
                        className="size-4"
                        fill={
                          postData.post.likedByCurrentUser
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                      {postData.post.likesCount}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Share2 className="size-4" />
                      Share
                    </button>
                  </div>

                  {/* Add Comment */}
                  <div className="my-4">
                    <PostSubmissionForm
                      onPostCreated={handleCommentSubmitted}
                      onSubmit={async (content) => {
                        await postService.createComment({
                          postId: postId,
                          content,
                        })
                      }}
                    />
                  </div>

                  {/* Comments List */}
                  {postData.comments.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {postData.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="pt-4  bg-card  rounded-lg p-4"
                        >
                          <div className="flex items-center gap-2">
                            {comment.authorAvatar ? (
                              <img
                                src={comment.authorAvatar}
                                alt="img"
                                className="w-8 border p-1 rounded-full"
                              />
                            ) : (
                              <div className="bg-muted flex w-8 h-8 items-center justify-center rounded-full font-semibold text-sm">
                                {comment.authorName.charAt(0).toUpperCase()}
                              </div>
                            )}
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
                                comment.likedByCurrentUser ? 'text-red-500' : ''
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

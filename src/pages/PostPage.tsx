import { useParams } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { postService } from '@/services/post.service'
import type { PostWithComments } from '@/types/post.types'
import { Skeleton } from '@/components/ui/skeleton'

export function PostPage() {
  const { id } = useParams<{ id: string }>()
  const [postData, setPostData] = useState<PostWithComments | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentContent, setCommentContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadPost = useCallback(async () => {
    if (!id) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await postService.getPostById(id)
      setPostData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPost()
  }, [loadPost])

  const handleSubmitComment = async () => {
    if (!id || !commentContent.trim() || isSubmitting || !postData) return

    try {
      setIsSubmitting(true)
      const newComment = await postService.createComment({
        postId: id,
        content: commentContent,
      })
      setCommentContent('')
      // Update state with new comment without full reload
      setPostData({
        ...postData,
        comments: [...postData.comments, newComment],
        post: {
          ...postData.post,
          commentsCount: postData.post.commentsCount + 1,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleLike = async () => {
    if (!id || !postData) return

    try {
      const updatedPost = await postService.toggleLike(id)
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-card rounded-lg shadow border p-6">
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
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow border p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-md" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !postData) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive">
          {error || 'Post not found'}
        </div>
      </div>
    )
  }

  const { post, comments } = postData

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        {/* Post */}
        <div className="bg-card rounded-lg shadow border p-6">
          <div className="flex items-start gap-4">
            {post.authorAvatar ? (
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="size-12 rounded-full"
              />
            ) : (
              <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full font-bold text-lg">
                {post.authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{post.authorName}</h3>
                <span className="text-muted-foreground text-sm">
                  · {postService.formatTimeAgo(post.createdAt)}
                </span>
              </div>
              <p className="mt-3 text-foreground text-base leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="size-4" />
                  {post.commentsCount}
                </span>
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 hover:text-primary transition-colors ${
                    post.likedByCurrentUser ? 'text-red-500' : ''
                  }`}
                >
                  <Heart
                    className={`size-4 ${
                      post.likedByCurrentUser ? 'fill-current' : ''
                    }`}
                  />
                  {post.likesCount}
                </button>
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Share2 className="size-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-card rounded-lg shadow border p-6">
          <h3 className="font-semibold text-lg mb-4">Comments</h3>

          {/* Add Comment */}
          <div className="mb-6">
            <textarea
              className="w-full bg-background border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Write a comment..."
              rows={3}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmitComment}
                disabled={!commentContent.trim() || isSubmitting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-3 py-3 border-t first:border-t-0"
                >
                  {comment.authorAvatar ? (
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="size-8 rounded-full"
                    />
                  ) : (
                    <div className="bg-muted flex size-8 items-center justify-center rounded-full font-semibold text-sm">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.authorName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        · {postService.formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <button
                        onClick={() => handleToggleCommentLike(comment.id)}
                        className={`flex items-center gap-1 hover:text-primary transition-colors ${
                          comment.likedByCurrentUser ? 'text-red-500' : ''
                        }`}
                      >
                        <Heart
                          className={`size-3 ${
                            comment.likedByCurrentUser ? 'fill-current' : ''
                          }`}
                        />
                        {comment.likesCount}
                      </button>
                      <button className="hover:text-primary transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

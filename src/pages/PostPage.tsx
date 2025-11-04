import { useParams } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { postService } from '@/services/post.service'
import type { PostWithComments } from '@/types/post.types'

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
    if (!id || !commentContent.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      await postService.createComment({
        postId: id,
        content: commentContent,
      })
      setCommentContent('')
      await loadPost() // Reload post to get updated comments
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
                <span>💬 {post.commentsCount} Comments</span>
                <button
                  onClick={handleToggleLike}
                  className={`hover:text-primary transition-colors ${
                    post.likedByCurrentUser ? 'text-red-500' : ''
                  }`}
                >
                  {post.likedByCurrentUser ? '❤️' : '🤍'} {post.likesCount}
                </button>
                <button className="hover:text-primary transition-colors">
                  🔗 Share
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
                        className={`hover:text-primary transition-colors ${
                          comment.likedByCurrentUser ? 'text-red-500' : ''
                        }`}
                      >
                        {comment.likedByCurrentUser ? '❤️' : '🤍'}{' '}
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

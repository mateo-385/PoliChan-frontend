import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { postService } from '@/services/post.service'
import type { Post } from '@/types/post.types'

export function FeedPage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await postService.getAllPosts()
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      await postService.createPost({ content: newPostContent })
      setNewPostContent('')
      await loadPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleLike = async (postId: string) => {
    try {
      const updatedPost = await postService.toggleLike(postId)
      setPosts(posts.map((p) => (p.id === postId ? updatedPost : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post')
    }
  }

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`)
  }

  return (
    <div className="p-6   ">
      <div className="mb-5">
        <h2 className="text-3xl font-bold tracking-tight">Feed</h2>
        <p className="text-muted-foreground">
          Discover what's happening in your community
        </p>
      </div>

      <div className=" mx-auto space-y-4">
        {/* Create Post */}
        <div className="bg-card rounded-lg shadow border p-4">
          <textarea
            className="w-full bg-background border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="What's on your mind?"
            rows={3}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() || isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg shadow border p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="size-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-card rounded-lg shadow border p-8 text-center">
            <p className="text-muted-foreground">
              No posts yet. Be the first to share something!
            </p>
          </div>
        ) : (
          /* Posts List */
          posts.map((post) => (
            <div key={post.id} className="bg-card rounded-lg shadow border p-6">
              <div className="flex items-start gap-4">
                {post.authorAvatar ? (
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="size-10 rounded-full"
                  />
                ) : (
                  <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full font-bold">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{post.authorName}</h3>
                    <span className="text-muted-foreground text-sm">
                      · {postService.formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  <p
                    className="mt-2 text-foreground whitespace-pre-wrap cursor-pointer hover:text-foreground/80"
                    onClick={() => handlePostClick(post.id)}
                  >
                    {post.content}
                  </p>
                  <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                    <button
                      onClick={() => handlePostClick(post.id)}
                      className="hover:text-primary transition-colors"
                    >
                      💬 {post.commentsCount} Comments
                    </button>
                    <button
                      onClick={() => handleToggleLike(post.id)}
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
          ))
        )}
      </div>
    </div>
  )
}
